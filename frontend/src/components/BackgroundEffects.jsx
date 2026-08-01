import { useEffect, useRef } from "react";

/* Stable seeded particles — no re-render flicker */
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const seed = i * 137.508;
  return {
    id: i,
    x: (seed * 0.61803) % 100,
    y: (seed * 0.38197) % 100,
    size: 1.5 + (i % 4) * 0.5,
    duration: 12 + (i % 8) * 2.5,
    delay: -(i % 10) * 1.3,
    opacity: 0.04 + (i % 5) * 0.02,
  };
});

export default function BackgroundEffects() {
  const dotRef       = useRef(null);
  const ringRef      = useRef(null);
  const spotlightRef = useRef(null);
  const rafRef       = useRef(null);

  // Live mouse position (no state — just a ref)
  const mouseRef = useRef({ x: -500, y: -500 });
  // Current lerped ring position
  const ringPosRef = useRef({ x: -500, y: -500 });

  const [isDesktop, setIsDesktop] = useEffect(() => {
    return false;
  }, []);

    const dot       = dotRef.current;
    const ring      = ringRef.current;
    const spotlight = spotlightRef.current;
    if (!dot || !ring || !spotlight) return;

    const lerp = (a, b, t) => a + (b - a) * t;

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Dot: instant — set directly, no React state
      dot.style.left    = `${e.clientX}px`;
      dot.style.top     = `${e.clientY}px`;
      dot.style.opacity = "1";
      ring.style.opacity      = "1";
      spotlight.style.opacity = "1";

      // Hover state for interactive elements
      const isInteractive = !!e.target?.closest("a, button, input, textarea, select, label, [role='button']");
      if (isInteractive) {
        dot.classList.add("fx-dot--hover");
        ring.classList.add("fx-ring--hover");
      } else {
        dot.classList.remove("fx-dot--hover");
        ring.classList.remove("fx-ring--hover");
      }
    };

    const onLeave = () => {
      dot.style.opacity       = "0";
      ring.style.opacity      = "0";
      spotlight.style.opacity = "0";
    };

    // rAF loop only for the smooth trailing ring + spotlight
    const tick = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ringPosRef.current.x = lerp(ringPosRef.current.x, mx, 0.14);
      ringPosRef.current.y = lerp(ringPosRef.current.y, my, 0.14);

      const rx = ringPosRef.current.x;
      const ry = ringPosRef.current.y;

      ring.style.left      = `${rx}px`;
      ring.style.top       = `${ry}px`;
      spotlight.style.left = `${rx}px`;
      spotlight.style.top  = `${ry}px`;

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Floating particle layer */}
      <div className="fx-particles" aria-hidden="true">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="fx-particle"
            style={{
              left:              `${p.x}%`,
              top:               `${p.y}%`,
              width:             p.size,
              height:            p.size,
              opacity:           p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay:    `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Radial cursor spotlight */}
      <div ref={spotlightRef} className="fx-spotlight" aria-hidden="true" style={{ opacity: 0 }} />

      {/* Trailing ring */}
      <div ref={ringRef} className="fx-ring" aria-hidden="true" style={{ opacity: 0 }} />

      {/* Instant cursor dot */}
      <div ref={dotRef} className="fx-dot" aria-hidden="true" style={{ opacity: 0 }} />
    </>
  );
}
