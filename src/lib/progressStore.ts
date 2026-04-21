// Stub module retained during the Smart Feed pivot.
// The user_progress / user_focus tables were dropped, so these helpers are
// no-ops. They exist so legacy callers (Settings reset button, AuthContext
// previously) compile until they're rewritten for the new feed schema.
export async function clearAllProgress(): Promise<void> {
  // No-op: legacy progress storage was removed.
}

export async function syncProgressFromCloud(): Promise<void> {
  // No-op
}
