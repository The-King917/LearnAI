"use client";

import { motion, type Transition } from "framer-motion";
import type { ReactNode } from "react";

// Expo ease-out — fast start, smooth deceleration (Scale AI / Linear style)
const EASE_OUT: Transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] };

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  transition,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  transition?: Transition;
}) {
  const t: Transition = transition ?? EASE_OUT;
  const resolved: Transition = delay
    ? { ...t, delay }
    : t;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={resolved}
    >
      {children}
    </motion.div>
  );
}
