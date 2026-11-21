"use client";

import { MotionConfig, motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/** Critically damped (no overshoot): content settles calmly into place. */
const spring = { type: "spring", bounce: 0, duration: 0.6 } as const;

/** Respects the device's reduced-motion setting for every Motion animation inside. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Slides content up into place as it scrolls into view. It starts partly
 * visible, so nothing is ever blank if the scroll observer misses.
 */
export function Reveal({ children, delay = 0, y = 28, ...rest }: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0.4, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ ...spring, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Splits a headline into words that rise in one after another. */
export function RiseWords({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ ...spring, duration: 0.7, delay: 0.06 * i }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
