"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function TypeText({
  text,
  className,
  speed = 18,
  delay = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = setTimeout(() => {
      const id = setInterval(() => {
        setTyped((c) => {
          if (c >= text.length) {
            clearInterval(id);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, delay * 1000);
    return () => clearTimeout(start);
  }, [inView, text, speed, delay]);

  return (
    <span ref={ref} className={className}>
      {text.slice(0, typed)}
    </span>
  );
}
