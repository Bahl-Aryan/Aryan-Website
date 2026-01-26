import { Variants } from "framer-motion";

// Easing curves (premium, heavy feel)
export const easing = {
  standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
  heavy: [0.5, 0, 0.3, 1] as [number, number, number, number],
  micro: [0.4, 0, 0.6, 1] as [number, number, number, number],
};

// Durations
export const duration = {
  micro: 0.15,
  standard: 0.35,
  hero: 0.75,
};

// Check for reduced motion preference
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Reveal animation (scroll-triggered)
export const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.standard,
      ease: easing.standard,
    },
  },
};

// Page transition
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.standard,
      ease: easing.standard,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: duration.micro,
      ease: easing.micro,
    },
  },
};

// Hover lift
export const hoverLiftVariants: Variants = {
  rest: {
    y: 0,
    transition: {
      duration: duration.micro,
      ease: easing.micro,
    },
  },
  hover: {
    y: -2,
    transition: {
      duration: duration.micro,
      ease: easing.micro,
    },
  },
};
