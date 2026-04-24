/**
 * Lightweight analytics logger for Phase 11 paywall data collection.
 *
 * Events tracked (Phase 8):
 *   - deep_dive_consumed       — user finished/closed a Deep Dive
 *   - streak_break             — user's daily streak reset to 0/1 from >1
 *   - weakness_trend_view      — user opened the weakness trends view (Me page)
 *   - creator_publish          — creator published a piece of content
 *   - session_length           — emitted on tab close with ms spent in app
 *
 * All events are best-effort: failures are logged and swallowed so they
 * never break the user flow.
 */
import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEventName =
  | "deep_dive_consumed"
  | "streak_break"
  | "weakness_trend_view"
  | "creator_publish"
  | "session_length";

/** Per-tab session id, generated lazily. */
let sessionId: string | null = null;
function getSessionId(): string {
  if (sessionId) return sessionId;
  try {
    const existing = sessionStorage.getItem("ac_session_id");
    if (existing) {
      sessionId = existing;
      return existing;
    }
  } catch {
    /* sessionStorage may be unavailable */
  }
  const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  sessionId = id;
  try {
    sessionStorage.setItem("ac_session_id", id);
  } catch {
    /* ignore */
  }
  return id;
}

export async function trackEvent(
  name: AnalyticsEventName,
  properties: Record<string, unknown> = {},
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // Anonymous events not stored (RLS would reject anyway).

    const { error } = await supabase.from("analytics_events").insert([
      {
        user_id: user.id,
        event_name: name,
        properties: properties as never,
        session_id: getSessionId(),
      },
    ]);
    if (error) console.warn("[analytics] insert failed", name, error.message);
  } catch (e) {
    console.warn("[analytics] track threw", name, e);
  }
}

/* ----------------------------- Session length ----------------------------- */

let sessionStart: number | null = null;
let sessionListenerInstalled = false;

/**
 * Call once on app boot. Starts a session timer and flushes a `session_length`
 * event when the tab is hidden/closed.
 */
export function initSessionTracking(): void {
  if (sessionListenerInstalled) return;
  sessionListenerInstalled = true;
  sessionStart = Date.now();

  const flush = () => {
    if (sessionStart == null) return;
    const durationMs = Date.now() - sessionStart;
    sessionStart = Date.now(); // reset so visibility toggles split sessions
    // Best-effort fire-and-forget — pagehide can't await async work.
    void trackEvent("session_length", { duration_ms: durationMs });
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
    else sessionStart = Date.now();
  });
  window.addEventListener("pagehide", flush);
}