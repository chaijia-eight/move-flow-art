import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { platform, username } = body;

    if (!platform || !username) {
      return new Response(JSON.stringify({ error: "platform and username required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["chesscom", "lichess"].includes(platform)) {
      return new Response(JSON.stringify({ error: "Invalid platform" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate username exists on platform
    if (platform === "chesscom") {
      const checkRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`, {
        headers: { "User-Agent": "ArcChess/1.0" },
      });
      if (!checkRes.ok) {
        return new Response(JSON.stringify({ error: "Chess.com username not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const checkRes = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, {
        headers: { Accept: "application/json" },
      });
      if (!checkRes.ok) {
        return new Response(JSON.stringify({ error: "Lichess username not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Upsert profile
    const profileField = platform === "chesscom" ? "chesscom_username" : "lichess_username";
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        { user_id: user.id, [profileField]: username, last_sync_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (profileError) {
      console.error("Profile upsert error:", profileError);
      return new Response(JSON.stringify({ error: "Failed to save profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch games from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const games: any[] = [];

    if (platform === "chesscom") {
      // Chess.com: get archives, then fetch recent months
      const archivesRes = await fetch(
        `https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/games/archives`,
        { headers: { "User-Agent": "ArcChess/1.0" } }
      );
      if (!archivesRes.ok) throw new Error("Failed to fetch Chess.com archives");
      const { archives } = await archivesRes.json();

      // Filter to last 2 months of archives
      const recentArchives = (archives || []).slice(-2);

      for (const archiveUrl of recentArchives) {
        const gamesRes = await fetch(archiveUrl, {
          headers: { "User-Agent": "ArcChess/1.0" },
        });
        if (!gamesRes.ok) continue;
        const { games: monthGames } = await gamesRes.json();

        for (const g of monthGames || []) {
          const playedAt = new Date(g.end_time * 1000);
          if (playedAt < thirtyDaysAgo) continue;

          const isWhite = g.white?.username?.toLowerCase() === username.toLowerCase();
          const opponent = isWhite ? g.black?.username : g.white?.username;
          const result = isWhite ? g.white?.result : g.black?.result;

          games.push({
            user_id: user.id,
            platform: "chesscom",
            game_id: g.url || `${g.end_time}`,
            opponent: opponent || "Unknown",
            result: result || "unknown",
            played_at: playedAt.toISOString(),
            pgn: g.pgn || null,
            time_control: g.time_control || null,
          });
        }
      }
    } else {
      // Lichess: fetch games as NDJSON
      const sinceMs = thirtyDaysAgo.getTime();
      const lichessRes = await fetch(
        `https://lichess.org/api/games/user/${encodeURIComponent(username)}?since=${sinceMs}&max=200&pgnInJson=true&opening=true`,
        {
          headers: {
            Accept: "application/x-ndjson",
          },
        }
      );

      if (!lichessRes.ok) throw new Error("Failed to fetch Lichess games");

      const text = await lichessRes.text();
      const lines = text.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        const g = JSON.parse(line);
        const isWhite = g.players?.white?.user?.name?.toLowerCase() === username.toLowerCase();
        const opponent = isWhite
          ? g.players?.black?.user?.name
          : g.players?.white?.user?.name;

        let result = "unknown";
        if (g.winner === "white") result = isWhite ? "win" : "loss";
        else if (g.winner === "black") result = isWhite ? "loss" : "win";
        else if (g.status === "draw" || g.status === "stalemate") result = "draw";

        games.push({
          user_id: user.id,
          platform: "lichess",
          game_id: g.id,
          opponent: opponent || "Anonymous",
          result,
          played_at: new Date(g.createdAt).toISOString(),
          pgn: g.pgn || null,
          time_control: g.clock ? `${g.clock.initial}+${g.clock.increment}` : g.speed || null,
        });
      }
    }

    // Upsert games (skip duplicates)
    let inserted = 0;
    for (const game of games) {
      const { error } = await supabase.from("user_games").upsert(game, {
        onConflict: "user_id,platform,game_id",
        ignoreDuplicates: true,
      });
      if (!error) inserted++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        username,
        platform,
        gamesFound: games.length,
        gamesInserted: inserted,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("fetch-games error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
