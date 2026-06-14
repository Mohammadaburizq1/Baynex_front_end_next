export default function AnimatedBackground() {
  const PARTICLES = Array.from({ length: 20 }, (_, i) => {
    const seed = i * 1.618;
    const colors = ['#1E4A7A', '#FBBF24', '#EF4444', '#FDE68A'];
    return {
      left: `${((seed * 17) % 100).toFixed(1)}%`,
      delay: `${((seed * 3.7) % 10).toFixed(2)}s`,
      duration: `${(6 + (i % 5) * 1.5).toFixed(1)}s`,
      size: 2 + (i % 5),
      opacity: 0.15 + (i % 4) * 0.08,
      color: colors[i % 4],
    };
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #0A1628 0%, #132F5C 40%, #1A2844 75%, #0A1628 100%)',
        }}
      />

      {/* Layer 1 — Aurora waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="landing-aurora-1 absolute w-[200%] h-52 -left-1/2"
          style={{
            top: '15%',
            background: 'linear-gradient(180deg, rgba(30,74,122,0.07) 0%, rgba(30,74,122,0.035) 50%, transparent 100%)',
            borderRadius: '50% 50% 0 0 / 30px',
          }}
        />
        <div
          className="landing-aurora-2 absolute w-[200%] h-52 -left-1/2"
          style={{
            top: '43%',
            background: 'linear-gradient(180deg, rgba(251,191,36,0.07) 0%, rgba(251,191,36,0.035) 50%, transparent 100%)',
            borderRadius: '50% 50% 0 0 / 30px',
          }}
        />
        <div
          className="landing-aurora-3 absolute w-[200%] h-52 -left-1/2"
          style={{
            top: '71%',
            background: 'linear-gradient(180deg, rgba(239,68,68,0.07) 0%, rgba(239,68,68,0.035) 50%, transparent 100%)',
            borderRadius: '50% 50% 0 0 / 30px',
          }}
        />
      </div>

      {/* Layer 2 — Mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="landing-blob-1 absolute w-[48vw] h-[48vw] rounded-full" style={{ left: '28%', top: '38%', background: 'radial-gradient(circle, rgba(30,74,122,0.28) 0%, rgba(30,74,122,0.07) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="landing-blob-2 absolute w-[40vw] h-[40vw] rounded-full" style={{ left: '78%', top: '22%', background: 'radial-gradient(circle, rgba(251,191,36,0.20) 0%, rgba(251,191,36,0.05) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="landing-blob-3 absolute w-[32vw] h-[32vw] rounded-full" style={{ left: '68%', top: '72%', background: 'radial-gradient(circle, rgba(239,68,68,0.16) 0%, rgba(239,68,68,0.04) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="landing-blob-4 absolute w-[24vw] h-[24vw] rounded-full" style={{ left: '32%', top: '62%', background: 'radial-gradient(circle, rgba(253,230,138,0.12) 0%, rgba(253,230,138,0.03) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="landing-blob-5 absolute w-[56vw] h-[56vw] rounded-full" style={{ left: '48%', top: '38%', background: 'radial-gradient(circle, rgba(19,47,92,0.35) 0%, rgba(19,47,92,0.09) 50%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* Layer 3 — Grid + shimmer */}
      <div className="absolute inset-0 landing-grid overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="landing-shimmer absolute inset-y-0 w-[22vw]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.12) 50%, transparent 100%)' }}
        />
      </div>

      {/* Layer 4 — Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: p.left,
              bottom: 0,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              animation: `particleFloat ${p.duration} linear ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer 5 — Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="orb-1 absolute w-60 h-60 rounded-full" style={{ left: '18%', top: '25%', background: 'radial-gradient(circle, rgba(10,22,40,0.35) 0%, rgba(10,22,40,0.08) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-2 absolute w-72 h-72 rounded-full" style={{ left: '82%', top: '18%', background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(251,191,36,0.06) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-1 absolute w-60 h-60 rounded-full" style={{ left: '72%', top: '78%', background: 'radial-gradient(circle, rgba(239,68,68,0.20) 0%, rgba(239,68,68,0.05) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-3 absolute w-80 h-80 rounded-full" style={{ left: '28%', top: '68%', background: 'radial-gradient(circle, rgba(253,230,138,0.15) 0%, rgba(253,230,138,0.04) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-2 absolute w-56 h-56 rounded-full" style={{ left: '50%', top: '45%', background: 'radial-gradient(circle, rgba(19,47,92,0.30) 0%, rgba(19,47,92,0.08) 50%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>
    </div>
  );
}
