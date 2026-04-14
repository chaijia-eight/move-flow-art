import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Link2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName = user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
            Hey, {firstName}
          </h1>
          <p className="text-muted-foreground">
            Stop repeating your mistakes. Drill what actually happened.
          </p>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate("/connect")}
            className="p-6 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-all"
          >
            <Link2 className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Connect Your Account</h3>
            <p className="text-sm text-muted-foreground">
              Link Chess.com or Lichess to import your games and find your weak spots.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate("/decks")}
            className="p-6 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-all"
          >
            <Layers className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Your Decks</h3>
            <p className="text-sm text-muted-foreground">
              View your drill decks — auto-generated from games or built manually.
            </p>
          </motion.div>
        </div>

        {/* Today's drills placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-8 text-center"
        >
          <Zap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-semibold text-foreground mb-1">Today's Drills</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your account to get personalized drill recommendations based on your real games.
          </p>
          <Button variant="outline" onClick={() => navigate("/connect")} className="gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
