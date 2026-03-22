import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface CaptureEffectProps {
  active: boolean;
}

export default function CaptureEffect({ active }: CaptureEffectProps) {
  const { currentTheme } = useTheme();
  if (!active) return null;

  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const distance = 20 + Math.random() * 25;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const size = 3 + Math.random() * 4;

    return (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: i % 3 === 0
            ? currentTheme.accentColor
            : i % 3 === 1
            ? "hsl(42, 90%, 65%)"
            : "hsl(0, 0%, 90%)",
        }}
        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        animate={{ x, y, opacity: 0, scale: 0.2 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
    );
  });

  return (
    <>
      {/* Flash ring */}
      <motion.div
        className="absolute inset-0 z-30 pointer-events-none rounded-sm"
        style={{ border: `2px solid ${currentTheme.accentColor}` }}
        initial={{ opacity: 0.9, scale: 0.8 }}
        animate={{ opacity: 0, scale: 1.3 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      {/* Particles */}
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
        {particles}
      </div>
    </>
  );
}
