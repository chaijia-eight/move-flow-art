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
  yDrift: number;
}

const COLORS = [
  "hsl(45, 100%, 55%)",
  "hsl(35, 100%, 60%)",
  "hsl(15, 90%, 55%)",
  "hsl(200, 80%, 60%)",
  "hsl(140, 70%, 50%)",
  "hsl(280, 70%, 60%)",
  "hsl(350, 80%, 60%)",
  "hsl(60, 90%, 55%)",
];

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.random() * Math.PI * 2);
    const speed = 20 + Math.random() * 35;
    return {
      id: i,
      x: 50,
      y: 45,
      rotation: Math.random() * 1080 - 540,
      scale: 0.4 + Math.random() * 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.4,
      duration: 1.2 + Math.random() * 1.0,
      xDrift: Math.cos(angle) * speed,
      yDrift: Math.sin(angle) * speed + 15,
    };
  });
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
      setParticles(createParticles(80));
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
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
            left: `${p.x + p.xDrift}%`,
            top: `${p.y + p.yDrift}%`,
            opacity: [1, 1, 0.8, 0],
            scale: [0, p.scale, p.scale, p.scale * 0.5],
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="absolute"
          style={{ width: 10, height: 10 }}
        >
          {p.id % 3 === 0 ? (
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: p.color }}
            />
          ) : p.id % 3 === 1 ? (
            <div
              className="rounded-sm"
              style={{ backgroundColor: p.color, width: 8, height: 12 }}
            />
          ) : (
            <div
              className="rounded-sm"
              style={{
                backgroundColor: p.color,
                width: 12,
                height: 5,
                transform: `rotate(${Math.random() * 45}deg)`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
