import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayerCharacter } from "@/hooks/usePlayerCharacter";
import { VAULT_ITEMS, getRarityColor, type VaultItem } from "@/data/rpgData";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function Vault() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { character, spendEmbers } = usePlayerCharacter();

  const { data: unlocks } = useQuery({
    queryKey: ["player-unlocks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("player_unlocks" as any)
        .select("*")
        .eq("user_id", user!.id);
      return (data || []) as any[];
    },
  });

  const ownedIds = new Set((unlocks || []).map((u: any) => u.unlock_id));

  const handlePurchase = async (item: VaultItem) => {
    if (!user || !character) return;
    if (character.embers < item.cost) {
      toast({ title: "Not enough Embers", description: `You need ${item.cost - character.embers} more.`, variant: "destructive" });
      return;
    }

    try {
      await spendEmbers.mutateAsync(item.cost);
      await supabase.from("player_unlocks" as any).insert({
        user_id: user.id,
        unlock_type: item.type,
        unlock_id: item.id,
      } as any);
      queryClient.invalidateQueries({ queryKey: ["player-unlocks"] });
      toast({ title: "Unlocked!", description: `${item.name} is now yours.` });
    } catch {
      toast({ title: "Error", description: "Failed to purchase.", variant: "destructive" });
    }
  };

  const grouped: Record<string, VaultItem[]> = {};
  for (const item of VAULT_ITEMS) {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  }

  const typeLabels: Record<string, string> = {
    theme: "🎨 Board Themes",
    piece_set: "♟️ Piece Sets",
    title: "📜 Titles",
    cosmetic: "✨ Cosmetics",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">The Vault</h1>
            <p className="text-sm text-muted-foreground">Spend your hard-earned Embers</p>
          </div>
          <div className="text-lg font-bold text-orange-400">🔥 {character?.embers ?? 0}</div>
        </div>

        {Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {typeLabels[type] || type}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => {
                const owned = ownedIds.has(item.id);
                return (
                  <motion.div
                    key={item.id}
                    whileHover={!owned ? { y: -2 } : undefined}
                    className={`p-4 rounded-xl border transition-all ${
                      owned
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        <p className={`text-xs mt-1 ${getRarityColor(item.rarity)}`}>
                          {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                        </p>
                      </div>
                      {owned ? (
                        <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePurchase(item)}
                          disabled={!character || character.embers < item.cost}
                          className="shrink-0"
                        >
                          {item.cost > 0 ? `${item.cost} 🔥` : "Free"}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
