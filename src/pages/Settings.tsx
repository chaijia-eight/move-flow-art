import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, Sun, Moon, Trash2, LogIn, LogOut, UserPlus, Mail, Globe, Crown, CreditCard, KeyRound, Copy, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSubscription, FREE_DAILY_LINES } from "@/contexts/SubscriptionContext";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settingsStore";
import { t, tf } from "@/lib/i18n";

function AuthCard() {
  const { user, loading, signUp, signIn, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

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
      setAuthSuccess(t("checkEmail"));
      setEmail("");
      setPassword("");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-4 h-4" />
          {t("account")}
        </CardTitle>
        <CardDescription>
          {user ? `${t("signedInAs")} ${user.email}` : t("signInToSync")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : user ? (
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            {t("signOut")}
          </Button>
        ) : (
          <form onSubmit={handleAuth} className="space-y-3">
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => { setAuthMode("signin"); setAuthError(null); setAuthSuccess(null); }}
                className={`text-sm px-3 py-1 rounded-md transition-colors ${authMode === "signin" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t("signIn")}
              </button>
              <button type="button" onClick={() => { setAuthMode("signup"); setAuthError(null); setAuthSuccess(null); }}
                className={`text-sm px-3 py-1 rounded-md transition-colors ${authMode === "signup" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t("createAccount")}
              </button>
            </div>
            <input type="email" placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="password" placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            {authSuccess && <p className="text-sm text-primary">{authSuccess}</p>}
            <Button type="submit" disabled={authLoading} className="gap-2">
              {authMode === "signup" ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {authLoading ? t("loading") : authMode === "signup" ? t("createAccount") : t("signIn")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function SubscriptionCard() {
  const { user } = useAuth();
  const { isPro, subscriptionEnd, loading, dailyLinesUsed, practiceUsedToday, startCheckout, openCustomerPortal } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (!user) return null;

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      await startCheckout();
    } catch (e) {
      console.error("Checkout error:", e);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const linesUsedFn = tf<(used: number, max: number) => string>("linesUsedToday");

  return (
    <Card className={isPro ? "border-primary/40" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="w-4 h-4" />
          {t("subscription")}
        </CardTitle>
        <CardDescription>
          {isPro ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              {t("proPlan")} — {t("proPlanPrice")}
              {subscriptionEnd && (
                <span className="text-xs text-muted-foreground ml-1">
                  (until {new Date(subscriptionEnd).toLocaleDateString()})
                </span>
              )}
            </span>
          ) : (
            <span>{t("freePlan")} — {t("freeFeatures")}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : isPro ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("proFeatures")}</p>
            <Button variant="outline" onClick={openCustomerPortal} className="gap-2">
              <CreditCard className="w-4 h-4" />
              {t("manageSubscription")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{linesUsedFn(dailyLinesUsed, FREE_DAILY_LINES)}</p>
              <p>{practiceUsedToday ? "✗ " + t("practiceUsedToday") : "✓ Practice available"}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-foreground mb-1">{t("proPlan")} — {t("proPlanPrice")}</p>
              <p className="text-xs text-muted-foreground mb-2">{t("proFeatures")}</p>
              <Button onClick={handleUpgrade} disabled={checkoutLoading} className="gap-2 w-full">
                <Crown className="w-4 h-4" />
                {checkoutLoading ? t("loading") : t("upgradeToPro")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeveloperCodeCard() {
  const { user } = useAuth();
  const { isPro, refreshSubscription } = useSubscription();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!user || isPro) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("redeem-code", {
        body: { code: code.trim() },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
        setCode("");
        await refreshSubscription();
      } else {
        setStatus("error");
        setErrorMsg(data?.error || t("invalidCode"));
      }
    } catch (e) {
      setStatus("error");
      setErrorMsg(t("invalidCode"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="w-4 h-4" />
          {t("developerCode")}
        </CardTitle>
        <CardDescription>{t("enterCodeDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRedeem} className="flex gap-2">
          <input
            type="text"
            placeholder={t("enterCode")}
            value={code}
            onChange={(e) => { setCode(e.target.value); setStatus("idle"); }}
            maxLength={30}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" disabled={status === "loading" || !code.trim()} className="gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            {status === "loading" ? t("loading") : t("redeem")}
          </Button>
        </form>
        {status === "success" && (
          <p className="text-sm text-primary mt-2">✓ {t("codeRedeemed")}</p>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive mt-2">{errorMsg}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setDarkMode } = useTheme();
  const { refreshSubscription } = useSubscription();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [confirmReset, setConfirmReset] = useState(false);

  // Handle checkout success redirect
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
    if (key === "darkMode") setDarkMode(value as boolean);
    if (key === "language") window.location.reload();
  };

  const handleResetProgress = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    localStorage.removeItem("chess-line-progress");
    setConfirmReset(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 30% 0%, hsl(38 60% 55% / 0.06), transparent 50%), radial-gradient(ellipse at 70% 100%, hsl(345 45% 35% / 0.04), transparent 50%)" }} />

      <header className="relative z-10 px-6 pt-12 pb-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground text-sm mb-4 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("back")}
          </button>
          <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">{t("settings")}</h1>
        </motion.div>
      </header>

      <main className="relative z-10 px-6 pb-16 max-w-2xl mx-auto space-y-6">
        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Globe className="w-4 h-4" />{t("language")}</CardTitle>
              <CardDescription>{t("selectLanguage")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {(["en", "zh"] as const).map((lang) => (
                  <button key={lang} onClick={() => updateSetting("language", lang)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      settings.language === lang ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-secondary"
                    }`}>
                    {lang === "en" ? t("english") : t("chinese")}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AuthCard />
        </motion.div>

        {/* Subscription */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <SubscriptionCard />
        </motion.div>

        {/* Developer Code */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
          <DeveloperCodeCard />
        </motion.div>

        {/* Sound */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {t("soundEffects")}
              </CardTitle>
              <CardDescription>{t("toggleSounds")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{t("enableSounds")}</span>
                <Switch checked={settings.soundEnabled} onCheckedChange={(v) => updateSetting("soundEnabled", v)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dark/Light Mode */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {t("appearance")}
              </CardTitle>
              <CardDescription>{t("toggleDarkLight")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{t("darkMode")}</span>
                <Switch checked={settings.darkMode} onCheckedChange={(v) => updateSetting("darkMode", v)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reset Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <Trash2 className="w-4 h-4" />{t("resetProgress")}
              </CardTitle>
              <CardDescription>{t("clearAllData")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleResetProgress} className="gap-2">
                <Trash2 className="w-4 h-4" />
                {confirmReset ? t("confirmResetMsg") : t("resetAllProgress")}
              </Button>
              {confirmReset && (
                <Button variant="ghost" onClick={() => setConfirmReset(false)} className="ml-2 text-sm">{t("cancel")}</Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
