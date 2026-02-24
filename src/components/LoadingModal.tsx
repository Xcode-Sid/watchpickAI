import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingModalProps {
  open: boolean;
  message?: string;
  subtext?: string;
}

export function LoadingModal({ open, message, subtext }: LoadingModalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center loading-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="flex flex-col items-center gap-8 rounded-3xl border-2 border-accent/20 bg-card/98 px-14 py-12 shadow-2xl glow-gold"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 200 }}
          >
            {/* Animated watch face with hands */}
            <div className="relative">
              {/* Gold rotating bezel */}
              <div
                className="absolute -inset-3 rounded-full border-4 border-accent/60 animate-watch-bezel"
                style={{ borderStyle: "double" }}
              />
              {/* Watch case */}
              <div className="relative h-28 w-28 rounded-full border-4 border-accent/40 bg-gradient-to-br from-card to-muted shadow-inner">
                {/* Hour markers */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/70"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-38px)`,
                    }}
                  />
                ))}
                {/* Second hand - long, thin, rotates from center */}
                <div
                  className="absolute left-1/2 top-1/2 h-12 w-0.5 -translate-x-1/2 -translate-y-full origin-bottom animate-watch-second"
                  style={{ background: "linear-gradient(to top, hsl(var(--accent)), transparent)" }}
                />
                {/* Minute hand */}
                <div
                  className="absolute left-1/2 top-1/2 h-9 w-1 -translate-x-1/2 -translate-y-full origin-bottom animate-watch-second [animation-duration:20s] [animation-direction:reverse]"
                  style={{ background: "linear-gradient(to top, hsl(var(--primary)), transparent)" }}
                />
                {/* Hour hand */}
                <div
                  className="absolute left-1/2 top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-full origin-bottom animate-watch-second [animation-duration:30s] [animation-direction:reverse]"
                  style={{ background: "linear-gradient(to top, hsl(var(--foreground)), transparent)" }}
                />
                {/* Center cap */}
                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
              </div>

              {/* Floating mini watches - "picking" animation */}
              <div className="absolute -right-2 -top-2 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-accent/50 bg-card flex items-center justify-center"
                    animate={{
                      y: [0, -3, 0],
                      scale: i === 1 ? [1, 1.2, 1] : 1,
                      boxShadow:
                        i === 1
                          ? [
                              "0 0 0 0 hsla(var(--accent) / 0.2)",
                              "0 0 12px 2px hsla(var(--accent) / 0.5)",
                              "0 0 0 0 hsla(var(--accent) / 0.2)",
                            ]
                          : "0 0 0 0 transparent",
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    <div className="h-2 w-2 rounded-full bg-accent/80" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Animated dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-accent"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            {(message || subtext) && (
              <div className="text-center">
                {message && <p className="text-sm font-medium text-foreground">{message}</p>}
                {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
