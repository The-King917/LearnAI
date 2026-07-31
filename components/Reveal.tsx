"use client";

import { motion, type Transition } from "framer-motion";
import type { ReactNode } from "react";
import { transition as motionTransition, DURATION } from "@/lib/motion";

const EASE_OUT: Transition = motionTransition(DURATION.slower);

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
