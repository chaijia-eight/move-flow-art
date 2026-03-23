import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Heart, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-10 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            About BookChess
          </h1>

          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            A different way to learn chess openings.
          </p>
        </motion.div>

        {/* Main description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-6 text-foreground/85 leading-relaxed text-[1.05rem]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          <p>
            BookChess is a chess opening trainer built around one idea:{" "}
            <em>learning should feel like reading a beautiful book, not grinding a treadmill.</em>
          </p>



          <p>
            Each opening is presented as a living tree of ideas. You play through the
            main lines move by move, receiving gentle feedback when you stray and
            encouragement when you find the right path. The app recognises transpositions,
            suggests alternatives, and lets you wander between variations organically —
            the way a curious player naturally would.
          </p>

          <p>
            When you're ready, challenge yourself to play a line from memory.
            Mark it as mastered when it feels second nature. Your garden of openings
            grows quietly in the background, a personal map of everything you've learned.
          </p>
        </motion.div>



        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-16 text-center"
        >
          <Button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start Exploring
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
