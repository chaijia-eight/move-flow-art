import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Star, Shuffle, Shield, Eye, Trophy, TreePine, PenTool, Layers, AlertTriangle, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const steps = [
  {
    icon: BookOpen,
    title: "Pick an opening",
    description:
      "From the home screen, choose an opening you'd like to learn. Each card shows your progress and how many lines it contains.",
  },
  {
    icon: Eye,
    title: "Study the lines",
    description:
      "Play through each line move by move. The board shows you the correct moves; if you make a mistake, you'll see the right answer and can try again.",
  },
  {
    icon: Star,
    title: "Focus on what matters",
    description:
      "Tap the ★ on any opening card to add it to your Focus list — a shortcut on the home screen so you can jump straight in.",
  },
  {
    icon: Shuffle,
    title: "Practice from memory",
    description:
      "Once you've studied at least one line, Practice mode picks a random line for you to play without hints. A great way to test yourself.",
  },
  {
    icon: Shield,
    title: "Play against it",
    description:
      "Switch sides and face the opening as the opponent. The computer plays the moves you've been studying — can you find the best responses?",
  },
  {
    icon: AlertTriangle,
    title: "Learn secret traps",
    description:
      "Some openings include hidden trap lines. Study them to punish common mistakes your opponents might make in real games.",
  },
  {
    icon: Trophy,
    title: "Master every line",
    description:
      "A line is mastered after several correct attempts in a row. Track your mastery across all openings from the stats on the home screen.",
  },
  {
    icon: TreePine,
    title: "Build your own repertoire",
    description:
      "Head to the Garden to create a custom repertoire. Enter moves on the board to build your own opening tree, then study it just like the curated content.",
  },
  {
    icon: Layers,
    title: "Organise with chapters",
    description:
      "Split your repertoire into chapters — start from the initial position, import a PGN, or pull in a line you've already learned.",
  },
  {
    icon: PenTool,
    title: "Annotate your moves",
    description:
      "Add NAG symbols (brilliant, blunder, etc.) and written notes to any move. Draw arrows and highlight squares on the board to mark key ideas.",
  },
  {
    icon: GitBranch,
    title: "Explore the visual tree",
    description:
      "Toggle the tree view to see your entire repertoire as a branching diagram. Click any node to jump straight to that position.",
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
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
            How to use ArcChess
          </h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            A step-by-step guide to learning chess openings with ArcChess.
          </p>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                className="flex gap-4 items-start rounded-xl border border-border bg-card p-5"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    <span className="text-muted-foreground mr-1.5">{i + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-14 text-center"
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
