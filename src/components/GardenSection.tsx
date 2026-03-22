import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Sprout } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GardenCard from "./GardenCard";
import { t } from "@/lib/i18n";
import { getLineProgress } from "@/lib/progressStore";

export default function GardenSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: customLines = [] } = useQuery({
    queryKey: ["custom-lines", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("custom_lines")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <section>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-primary" />
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {t("yourGarden")}
          </h2>
        </div>
        <div className="flex-1 h-px bg-border/50" />
      </motion.div>

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center"
        >
          <Sprout className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-3">{t("signInToSync")}</p>
          <button
            onClick={() => navigate("/settings")}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("signIn")}
          </button>
        </motion.div>
      )}

      {user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customLines.map((line: any, i: number) => (
            <GardenCard
              key={line.id}
              line={line}
              index={i}
              onPractice={() => navigate(`/garden/${line.id}/practice`)}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: customLines.length * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/garden/new")}
            className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/30 hover:bg-card/60 cursor-pointer transition-colors min-h-[160px] flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {t("createNewLine")}
            </span>
          </motion.div>
        </div>
      )}

      {user && customLines.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground text-center mt-4"
        >
          {t("gardenEmpty")}
        </motion.p>
      )}
    </section>
  );
}
