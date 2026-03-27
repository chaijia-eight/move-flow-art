import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  duration: number;
  xDrift: number;
}

const COLORS = [
  "hsl(45, 100%, 55%)",   // gold
  "hsl(35, 100%, 60%)",   // amber
  "hsl(15, 90%, 55%)",    // orange
  "hsl(200, 80%, 60%)",   // sky blue
  "hsl(140, 70%, 50%)",   // green
  "hsl(280, 70%, 60%)",   // purple
  "hsl(350, 80%, 60%)",   // rose
  "hsl(60, 90%, 55%)",    // yellow
];

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 40 + Math.random() * 20, // cluster around center
    y: 30 + Math.random() * 10,
    rotation: Math.random() * 720 - 360,
    scale: 0.5 + Math.random() * 0.8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.3,
    duration: 0.8 + Math.random() * 0.6,
    xDrift: (Math.random() - 0.5) * 60,
  }));
}

interface ConfettiBurstProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function ConfettiBurst({ trigger, onComplete }: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setParticles(createParticles(40));
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: 1,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              top: `${p.y + 50 + Math.random() * 30}%`,
              left: `${p.x + p.xDrift}%`,
              opacity: [1, 1, 0],
              scale: p.scale,
              rotate: p.rotation,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute"
            style={{ width: 10, height: 10 }}
          >
            {Math.random() > 0.5 ? (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: p.color }}
              />
            ) : (
              <div
                className="w-full h-full rounded-sm"
                style={{ backgroundColor: p.color, width: 8, height: 12 }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
