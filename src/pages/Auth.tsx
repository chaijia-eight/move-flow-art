import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/lib/i18n";

export default function Auth() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <img src="/favicon.png" alt="ArcChess" className="w-14 h-14 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">ArcChess</h1>
          <p className="text-sm text-muted-foreground mt-1">Master your openings</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-4 h-4" />
              {authMode === "signup" ? t("createAccount") : t("signIn")}
            </CardTitle>
            <CardDescription>
              {authMode === "signup"
                ? "Create an account to get started"
                : "Sign in to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-3">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode("signin"); setAuthError(null); setAuthSuccess(null); }}
                  className={`text-sm px-3 py-1 rounded-md transition-colors ${
                    authMode === "signin"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("signIn")}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setAuthError(null); setAuthSuccess(null); }}
                  className={`text-sm px-3 py-1 rounded-md transition-colors ${
                    authMode === "signup"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("createAccount")}
                </button>
              </div>
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {authError && <p className="text-sm text-destructive">{authError}</p>}
              {authSuccess && <p className="text-sm text-primary">{authSuccess}</p>}
              <Button type="submit" disabled={authLoading} className="w-full gap-2">
                {authMode === "signup" ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {authLoading ? t("loading") : authMode === "signup" ? t("createAccount") : t("signIn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
