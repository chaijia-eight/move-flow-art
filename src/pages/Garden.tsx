import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Trash2, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import UpgradeModal from "@/components/UpgradeModal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import type { OpeningNode } from "@/data/openings";

function countLines(nodes: OpeningNode[]): number {
  if (nodes.length === 0) return 0;
  let total = 0;
  for (const node of nodes) {
    if (node.children.length === 0) {
      total += 1;
    } else {
      total += countLines(node.children);
    }
  }
  return total;
}

export default function Garden() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { maxStudies } = useSubscription();
  const queryClient = useQueryClient();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: repertoires, isLoading } = useQuery({
    queryKey: ["user-repertoires", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_repertoires")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this repertoire?")) return;
    await supabase.from("user_repertoires").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["user-repertoires", user?.id] });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-serif font-bold text-foreground">{t("yourGarden")}</h1>
          </div>
          <Button
            onClick={() => {
              if (repertoires && repertoires.length >= maxStudies) {
                setShowUpgrade(true);
                return;
              }
              navigate("/garden/build");
            }}
            className="gap-2"
          >
            {repertoires && repertoires.length >= maxStudies && !Number.isFinite(maxStudies) ? null : (
              repertoires && repertoires.length >= maxStudies ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />
            )}
            {t("createRepertoire")}
          </Button>
        </div>

        {/* Auth gate */}
        {!user && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Sign in to build your repertoire.</p>
          </div>
        )}

        {/* Loading */}
        {user && isLoading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* Empty */}
        {user && !isLoading && (!repertoires || repertoires.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg mb-6">{t("gardenEmpty")}</p>
            <Button onClick={() => navigate("/garden/build")} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("createRepertoire")}
            </Button>
          </motion.div>
        )}

        {/* Repertoire grid */}
        {repertoires && repertoires.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {repertoires.map((rep, i) => {
              const tree = (rep.tree || []) as unknown as OpeningNode[];
              const lineCount = countLines(tree);
              const isWhite = rep.side === "w";

              return (
                <motion.div
                  key={rep.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4, boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.2)" }}
                  className="rounded-xl overflow-hidden border border-border bg-card cursor-pointer"
                  onClick={() => navigate(`/garden/build/${rep.id}`)}
                >
                  <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-foreground truncate mb-1">
                      {rep.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
                      {isWhite ? "White" : "Black"} · {lineCount} {t("repertoireLines")}
                    </p>

                    <div className="flex items-center justify-end pt-3 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={(e) => handleDelete(e, rep.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
