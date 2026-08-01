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
  return (
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
  );
}
