"use client";

import { motion } from "framer-motion";
import { pageTransitionVariants, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const shouldAnimate = !prefersReducedMotion();

  return (
    <motion.div
      initial={shouldAnimate ? "initial" : "animate"}
      animate="animate"
      exit={shouldAnimate ? "exit" : "animate"}
      variants={pageTransitionVariants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
