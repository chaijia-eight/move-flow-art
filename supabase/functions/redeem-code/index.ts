import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hardcoded permanent codes (legacy)
const VALID_CODES: Record<string, string> = {
  "rabbit281877": "pro",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ success: false, error: "No code provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const trimmedCode = code.trim();

    // 1. Check redeem_codes table for single-use codes
    const { data: redeemCode } = await supabaseClient
      .from("redeem_codes")
      .select("id, redeemed_by")
      .eq("code", trimmedCode)
      .maybeSingle();

    if (redeemCode) {
      if (redeemCode.redeemed_by) {
        return new Response(JSON.stringify({ success: false, error: "Code already used" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Mark code as redeemed
      const { error: updateError } = await supabaseClient
        .from("redeem_codes")
        .update({ redeemed_by: user.id, redeemed_at: new Date().toISOString() })
        .eq("id", redeemCode.id);

      if (updateError) throw new Error(`Failed to redeem: ${updateError.message}`);

      // Grant 1 month of pro
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error: insertError } = await supabaseClient
        .from("user_entitlements")
        .insert({
          user_id: user.id,
          entitlement: "pro",
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) throw new Error(`Failed to save entitlement: ${insertError.message}`);

      return new Response(JSON.stringify({ success: true, entitlement: "pro", expires_at: expiresAt.toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2. Fall back to hardcoded permanent codes
    const entitlement = VALID_CODES[trimmedCode];
    if (!entitlement) {
      return new Response(JSON.stringify({ success: false, error: "Invalid code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Insert permanent entitlement (no expires_at)
    const { error: insertError } = await supabaseClient
      .from("user_entitlements")
      .upsert(
        { user_id: user.id, entitlement },
        { onConflict: "user_id,entitlement" }
      );

    if (insertError) throw new Error(`Failed to save: ${insertError.message}`);

    return new Response(JSON.stringify({ success: true, entitlement }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
