"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SYMBOLS = [
  "∑", "∫", "π", "Δ", "∇", "∞", "θ", "λ",
  "α", "β", "√", "∂", "≡", "∈", "φ", "ρ",
  "μ", "σ", "ε", "ψ", "Ω", "ξ", "∮", "℃",
  "E=mc²", "F=ma", "∝", "≈", "±", "⊗",
];

interface Particle {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  dx: number;
  dy: number;
  rz: number;
  rx: number;
  ry: number;
  opacity: number;
}

export default function FloatingSymbols() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      symbol: SYMBOLS[i % SYMBOLS.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 18 + 11,
      duration: Math.random() * 25 + 22,
      delay: Math.random() * -40,
      dx: (Math.random() - 0.5) * 140,
      dy: (Math.random() - 0.5) * 140,
      rz: (Math.random() - 0.5) * 90,
      rx: (Math.random() - 0.5) * 40,
      ry: (Math.random() - 0.5) * 40,
      opacity: Math.random() * 0.045 + 0.025,
    }));
    setParticles(items);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            color: `rgba(232,168,32,${p.opacity})`,
            fontFamily: "ui-monospace, monospace",
            fontWeight: 700,
            userSelect: "none",
            perspective: "600px",
          }}
          animate={{
            x: [0, p.dx, -p.dx * 0.6, p.dx * 0.3, 0],
            y: [0, p.dy * 0.5, p.dy, -p.dy * 0.4, 0],
            rotateZ: [0, p.rz, -p.rz * 0.7, p.rz * 0.4, 0],
            rotateX: [0, p.rx, -p.rx * 0.5, p.rx * 0.3, 0],
            rotateY: [0, p.ry, -p.ry * 0.8, p.ry * 0.2, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.symbol}
        </motion.span>
      ))}
    </div>
  );
}
