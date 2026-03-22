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
            There are no streaks to maintain, no hearts to lose, no leagues to climb.
            Just you, the board, and the elegant logic of opening theory — explored
            at your own pace, in your own time.
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

        {/* Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 space-y-8"
        >
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Design Principles
          </h2>

          <div className="grid gap-6">
            {[
              {
                icon: Heart,
                title: "Zero Pressure",
                description:
                  "No daily goals, no punishments for missing a day. Your progress waits patiently for you.",
              },
              {
                icon: Compass,
                title: "Organic Exploration",
                description:
                  "Play a move the app doesn't expect? It'll tell you what opening you've stumbled into and offer to explore it.",
              },
              {
                icon: BookOpen,
                title: "Deep, Not Wide",
                description:
                  "Each opening is a rich tree with 10+ lines covering main theory, common alternatives, and instructive mistakes.",
              },
              {
                icon: Sparkles,
                title: "Beautiful by Default",
                description:
                  "Every opening has its own colour theme, typography, and atmosphere. Learning should be a sensory pleasure.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 items-start p-4 rounded-xl bg-card border border-border/50"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
