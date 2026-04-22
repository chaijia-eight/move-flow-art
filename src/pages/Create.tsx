import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function Create() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6">
          <Plus className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-foreground">Create</h1>
        <p className="text-muted-foreground leading-relaxed">
          The Blitz puzzle editor and Deep Dive builder ship in Phase 7+.
          For now this is a placeholder so the route exists.
        </p>
      </motion.div>
    </div>
  );
}