import { Watch } from "lucide-react";

/** Watch-themed animated background to fill black space - floating icons, dial rings, mesh */
export function WatchBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Mesh gradient - fills black with visible color */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, hsla(var(--primary) / 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 80%, hsla(var(--accent) / 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 50% 60%, hsla(var(--primary) / 0.06) 0%, transparent 65%)
          `,
        }}
      />
      {/* Subtle rotating watch bezel rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[min(90vw,600px)] h-[min(90vw,600px)] rounded-full border-2 border-accent/[0.15] animate-bezel-slow-reverse" />
        <div className="absolute w-[min(80vw,500px)] h-[min(80vw,500px)] rounded-full border border-accent/[0.1] animate-bezel-slow" style={{ animationDuration: "45s" }} />
      </div>
      {/* Floating watch icons - project themed */}
      {[
        { x: "10%", y: "15%", delay: 0, size: 12 },
        { x: "85%", y: "25%", delay: 2, size: 10 },
        { x: "5%", y: "70%", delay: 4, size: 8 },
        { x: "90%", y: "60%", delay: 1, size: 14 },
        { x: "50%", y: "10%", delay: 3, size: 6 },
        { x: "25%", y: "85%", delay: 5, size: 10 },
        { x: "75%", y: "90%", delay: 2.5, size: 8 },
        { x: "15%", y: "45%", delay: 1.5, size: 6 },
        { x: "88%", y: "45%", delay: 3.5, size: 8 },
      ].map((w, i) => (
        <div
          key={i}
          className="absolute text-accent/[0.18] animate-watch-drift"
          style={{
            left: w.x,
            top: w.y,
            width: w.size,
            height: w.size,
            animationDelay: `${w.delay}s`,
            animationDuration: `${15 + i * 2}s`,
          }}
        >
          <Watch className="w-full h-full" strokeWidth={1} />
        </div>
      ))}
    </div>
  );
}
