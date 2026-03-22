import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, Sun, Moon, Palette, Trash2, LogIn, LogOut, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settingsStore";

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading, signUp, signIn, signOut } = useAuth();
  const { setDarkMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleResetProgress = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    localStorage.removeItem("chess-line-progress");
    setConfirmReset(false);
    window.location.reload();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    const { error } = authMode === "signup"
      ? await signUp(email, password)
      : await signIn(email, password);

    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else if (authMode === "signup") {
      setAuthSuccess("Check your email to confirm your account.");
      setEmail("");
      setPassword("");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, hsl(38 60% 55% / 0.06), transparent 50%), radial-gradient(ellipse at 70% 100%, hsl(345 45% 35% / 0.04), transparent 50%)",
        }}
      />

      <header className="relative z-10 px-6 pt-12 pb-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground text-sm mb-4 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">Settings</h1>
        </motion.div>
      </header>

      <main className="relative z-10 px-6 pb-16 max-w-2xl mx-auto space-y-6">
        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-4 h-4" />
                Account
              </CardTitle>
              <CardDescription>
                {user ? `Signed in as ${user.email}` : "Sign in to sync your progress across devices."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : user ? (
                <Button variant="outline" onClick={signOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <form onSubmit={handleAuth} className="space-y-3">
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => { setAuthMode("signin"); setAuthError(null); setAuthSuccess(null); }}
                      className={`text-sm px-3 py-1 rounded-md transition-colors ${authMode === "signin" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode("signup"); setAuthError(null); setAuthSuccess(null); }}
                      className={`text-sm px-3 py-1 rounded-md transition-colors ${authMode === "signup" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Create Account
                    </button>
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {authError && <p className="text-sm text-destructive">{authError}</p>}
                  {authSuccess && <p className="text-sm text-primary">{authSuccess}</p>}
                  <Button type="submit" disabled={authLoading} className="gap-2">
                    {authMode === "signup" ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    {authLoading ? "Loading..." : authMode === "signup" ? "Create Account" : "Sign In"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sound */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Sound Effects
              </CardTitle>
              <CardDescription>Toggle move and capture sounds.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Enable sounds</span>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(v) => updateSetting("soundEnabled", v)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Board Theme */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-4 h-4" />
                Board Theme
              </CardTitle>
              <CardDescription>Choose how the board looks during study.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Follow opening theme</span>
                <Switch
                  checked={settings.boardThemeFollowOpening}
                  onCheckedChange={(v) => updateSetting("boardThemeFollowOpening", v)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {settings.boardThemeFollowOpening
                  ? "Board colors adapt to each opening's unique theme."
                  : "Board uses the default Italian Game theme for all openings."}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dark/Light Mode */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Appearance
              </CardTitle>
              <CardDescription>Toggle between dark and light mode.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Dark mode</span>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(v) => updateSetting("darkMode", v)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reset Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <Trash2 className="w-4 h-4" />
                Reset Progress
              </CardTitle>
              <CardDescription>Clear all mastery and attempt data. This cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleResetProgress}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {confirmReset ? "Confirm Reset — Are you sure?" : "Reset All Progress"}
              </Button>
              {confirmReset && (
                <Button
                  variant="ghost"
                  onClick={() => setConfirmReset(false)}
                  className="ml-2 text-sm"
                >
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
