import { Watch } from "lucide-react";
import Navbar from "@/components/Navbar";

/** Full-page loading screen - never black, always has visible content */
export function LandingSkeleton() {
  return (
    <div className="min-h-screen skeleton-page-bg">
      <Navbar
        rightContent={
          <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-16 rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-14 rounded bg-muted/50 animate-pulse" />
            <div className="h-9 w-24 rounded-lg bg-muted/50 animate-pulse" />
          </div>
        }
      />

      {/* Hero - centered loading content */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        <div className="hero-gradient absolute inset-0 animate-gradient opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
          {/* Animated watch icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-accent/30 flex items-center justify-center bg-card/50 backdrop-blur-sm animate-pulse">
              <Watch className="w-12 h-12 text-accent animate-watch-bounce" strokeWidth={1.5} />
            </div>
            <div className="absolute -inset-2 rounded-full border border-accent/20 animate-spin" style={{ animationDuration: "4s" }} />
          </div>
          {/* Loading text */}
          <div className="text-center">
            <p className="text-lg font-medium text-foreground/90">Finding your perfect watch</p>
            <p className="text-sm text-muted-foreground mt-1">Loading...</p>
          </div>
          {/* Animated dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-accent animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
