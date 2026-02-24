import type { Variants, TargetAndTransition } from "framer-motion";

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 100 },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 12, stiffness: 200 },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
  exit: {
    opacity: 0,
    y: -40,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30, filter: "blur(6px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
};

export const hoverScale: TargetAndTransition = {
  scale: 1.03,
  transition: { type: "spring", stiffness: 300, damping: 20 },
};

export const tapScale: TargetAndTransition = { scale: 0.97 };

export const hoverLift: TargetAndTransition = {
  y: -6,
  transition: { type: "spring", stiffness: 300, damping: 20 },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
};
