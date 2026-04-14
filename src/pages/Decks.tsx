import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Decks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-serif font-bold text-foreground">Your Decks</h1>
          <Button onClick={() => navigate("/decks/build")} className="gap-2">
            <Plus className="w-4 h-4" />
            New Deck
          </Button>
        </div>

        {/* Tabs placeholder */}
        <div className="flex gap-1 mb-6 border-b border-border">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-foreground">
            From Games
          </button>
          <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Your Builds
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground text-lg mb-2">No decks yet</p>
          <p className="text-muted-foreground/70 text-sm mb-6">
            Connect your Chess.com or Lichess account to auto-generate drill decks from your games.
          </p>
          <Button variant="outline" onClick={() => navigate("/connect")} className="gap-2">
            Connect Account
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
