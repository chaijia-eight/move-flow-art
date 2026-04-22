import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Me() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6">
          <User className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold mb-1 text-foreground">
          {user?.email ?? "Your profile"}
        </h1>
        <p className="text-muted-foreground leading-relaxed mt-3">
          Profile, collections, and weakness trends arrive in Phase 5+. This page
          exists so the nav route is wired up.
        </p>
      </motion.div>
    </div>
  );
}