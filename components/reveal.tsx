"use client";

import { MotionConfig, motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const spring = { type: "spring", stiffness: 140, damping: 22, mass: 0.9 } as const;

/** Respects the device's reduced-motion setting for every Motion animation inside. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Slides content up into place as it scrolls into view. The starting offset
 * is small and the content is already visible, so nothing is hidden if
 * JavaScript is slow or the page is captured as a still.
 */
export function Reveal({ children, delay = 0, y = 28, ...rest }: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0.001, y }}
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
            transition={{ ...spring, stiffness: 120, delay: 0.06 * i }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
