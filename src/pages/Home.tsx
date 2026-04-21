import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-foreground">ArcChess is being rebuilt</h1>
        <p className="text-muted-foreground leading-relaxed">
          We're shipping the new Smart Feed: short puzzles personalised to the
          mistakes in your real games. Phase 1 (database) is live. The feed
          itself ships in Phase 3.
        </p>
      </motion.div>
    </div>
  );
}
