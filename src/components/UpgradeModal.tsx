import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { t } from "@/lib/i18n";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason: "lines" | "practice";
}

export default function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const { startCheckout } = useSubscription();
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await startCheckout();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-4 shadow-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {reason === "lines" ? t("dailyLimitReached") : t("practiceUsedToday")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {reason === "lines" ? t("upgradeToLearnMore") : t("upgradeToPracticeMore")}
            </p>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
              <p className="text-sm font-medium text-foreground">{t("proPlan")} — {t("proPlanPrice")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("proFeatures")}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t("cancel")}
              </Button>
              <Button onClick={handleUpgrade} disabled={loading} className="flex-1 gap-2">
                <Crown className="w-4 h-4" />
                {loading ? t("loading") : t("upgradeToPro")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
