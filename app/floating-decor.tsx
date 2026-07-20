import type { CSSProperties } from "react";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const dots = [
  { x: "8%", size: 11, color: "#75e9ed", delay: "-2.1s", speed: "5.4s" },
  { x: "18%", size: 12, color: "#ff5b00", delay: "-4.8s", speed: "6.1s" },
  { x: "22%", size: 15, color: "#2128bd", delay: "-3.4s", speed: "5.8s" },
  { x: "36%", size: 8, color: "#ffca45", delay: "-5.2s", speed: "5.1s" },
  { x: "52%", size: 9, color: "#80e7ee", delay: "-1.2s", speed: "5.6s" },
  { x: "70%", size: 23, color: "#ffecef", delay: "-4.1s", speed: "6.4s" },
  { x: "81%", size: 25, color: "#2428be", delay: "-6.2s", speed: "6.7s" },
  { x: "90%", size: 12, color: "#ff5b00", delay: "-2.8s", speed: "5.3s" },
  { x: "95%", size: 18, color: "#075eee", delay: "-5.6s", speed: "6.2s" },
];

export function FloatingDecor({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`floating-field${compact ? " is-compact" : ""}`} aria-hidden="true">
      {dots.map((dot, index) => (
        <span
          className="float-dot"
          key={`dot-${index}`}
          style={
            {
              "--x": dot.x,
              "--size": `${dot.size}px`,
              "--dot-color": dot.color,
              "--delay": dot.delay,
              "--speed": dot.speed,
            } as CSSVars
          }
        />
      ))}
    </div>
  );
}
