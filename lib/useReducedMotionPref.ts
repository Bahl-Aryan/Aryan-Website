import { useReducedMotion } from "framer-motion"

/**
 * Hook to check if user prefers reduced motion.
 * Uses Framer Motion's built-in hook which respects prefers-reduced-motion media query.
 */
export function useReducedMotionPref(): boolean {
  return useReducedMotion() ?? false
}
