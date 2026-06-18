"use client";

import { motion, type Transition } from "framer-motion";
import type { ReactNode } from "react";

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  transition,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  transition?: Transition;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={transition ?? { duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}
