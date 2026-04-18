/**
 * Fetch a single game's PGN from a Chess.com or Lichess URL.
 * Both APIs are public (no auth needed for individual games).
 */

export async function fetchPgnFromUrl(url: string): Promise<string> {
  const trimmed = url.trim();

  // Lichess: https://lichess.org/<id>  (id is 8 chars; full game id can be 12)
  const lichessMatch = trimmed.match(/lichess\.org\/(?:embed\/)?([a-zA-Z0-9]{8,12})/);
  if (lichessMatch) {
    const id = lichessMatch[1].slice(0, 8);
    const res = await fetch(`https://lichess.org/game/export/${id}?clocks=false&evals=false`, {
      headers: { Accept: "application/x-chess-pgn" },
    });
    if (!res.ok) throw new Error(`Lichess fetch failed (${res.status})`);
    return await res.text();
  }

  // Chess.com: https://www.chess.com/game/live/<id> or /game/daily/<id>
  const ccMatch = trimmed.match(/chess\.com\/(?:game|analysis)\/(live|daily)\/(\d+)/);
  if (ccMatch) {
    const id = ccMatch[2];
    // Chess.com's callback API (used by their own site) returns a JSON with PGN.
    const res = await fetch(`https://www.chess.com/callback/live/game/${id}`);
    if (!res.ok) throw new Error(`Chess.com fetch failed (${res.status})`);
    const json = await res.json();
    const pgn: string | undefined = json?.game?.pgnHeaders
      ? buildPgnFromCallback(json.game)
      : json?.game?.pgn;
    if (!pgn) throw new Error("Could not parse Chess.com response");
    return pgn;
  }

  throw new Error("URL not recognized. Paste a Lichess or Chess.com game link.");
}

function buildPgnFromCallback(game: any): string {
  const headers = game.pgnHeaders ?? {};
  const moveList: string = game.moveList ?? "";
  // Chess.com encodes moves in their own format on callback; if a `pgn` field
  // is present we'd have used it. Fall back to bare move text if needed.
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `[${k} "${v}"]`)
    .join("\n");
  return `${headerLines}\n\n${moveList}`;
}
