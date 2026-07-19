import { useEffect, useRef, useState } from "react";

// Stable seeded particles (no re-render flicker)
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const seed = i * 137.508; // golden-angle spread
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
  const [dot, setDot] = useState({ x: -200, y: -200 });
  const [ring, setRing] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const dotRef = useRef({ x: -200, y: -200 });
  const ringRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      dotRef.current = { x: e.clientX, y: e.clientY };
      setDot({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);

      // Detect if hovering interactive element
      const tag = e.target?.tagName?.toLowerCase();
      const isInteractive =
        tag === "a" ||
        tag === "button" ||
        e.target?.closest("a, button, [role='button'], input, textarea");
      setHovering(!!isInteractive);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [visible]);

  // Smooth lerp ring trailing
  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    let rx = -200, ry = -200;

    const tick = () => {
      rx = lerp(rx, dotRef.current.x, 0.1);
      ry = lerp(ry, dotRef.current.y, 0.1);
      setRing({ x: rx, y: ry });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Skip on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
    return null;
  }

  return (
    <>
      {/* ── Floating particle layer ── */}
      <div className="fx-particles" aria-hidden="true">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="fx-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Radial cursor spotlight on background ── */}
      <div
        className="fx-spotlight"
        aria-hidden="true"
        style={{
          left: ring.x,
          top: ring.y,
          opacity: visible ? 1 : 0,
        }}
      />

      {/* ── Custom cursor ring (trailing) ── */}
      <div
        className={`fx-ring${hovering ? " fx-ring--hover" : ""}`}
        aria-hidden="true"
        style={{
          left: ring.x,
          top: ring.y,
          opacity: visible ? 1 : 0,
        }}
      />

      {/* ── Custom cursor dot (instant) ── */}
      <div
        className={`fx-dot${hovering ? " fx-dot--hover" : ""}`}
        aria-hidden="true"
        style={{
          left: dot.x,
          top: dot.y,
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  );
}
