"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface BinaryBit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  opacity: number;
  size: number;
  flipTimer: number;
  flipInterval: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PARTICLE_COLOR = "rgba(113, 111, 73,";   // slate-500 — visible on white
const LINK_COLOR = "rgba(113, 111, 73,";   // slate-400
const BG_COLOR = "#f8fafc";               // slate-50

const MOBILE_CANVAS_MAX = 640;

// ─── Stats data ───────────────────────────────────────────────────────────────
const STATS = [
  { value: 100, suffix: "+", label: "Research Papers" },
  { value: 50, suffix: "+", label: "Journals Indexed" },
  { value: 30, suffix: "+", label: "Active Researchers" },
];

type ParticleConfig = {
  count: number;
  linkDistance: number;
  linkOpacityMax: number;
  mouseLinkOpacityMax: number;
  mouseLinkMaxDist: number;
  linkLineWidth: number;
  dotOpacity: number;
  radiusMin: number;
  radiusMax: number;
  speed: number;
  repulseRadius: number;
  bitCount: number;
};

function getParticleConfig(width: number): ParticleConfig {
  const narrow = width > 0 && width < MOBILE_CANVAS_MAX;
  if (narrow) {
    return {
      count: 46,
      linkDistance: 116,
      linkOpacityMax: 0.35,
      mouseLinkOpacityMax: 0.62,
      mouseLinkMaxDist: 148,
      linkLineWidth: 0.7,
      dotOpacity: 0.55,
      radiusMin: 1,
      radiusMax: 2.2,
      speed: 0.35,
      repulseRadius: 90,
      bitCount: 0, // hide bits on mobile for cleanliness
    };
  }
  return {
    count: 80,
    linkDistance: 160,
    linkOpacityMax: 0.45,
    mouseLinkOpacityMax: 0.75,
    mouseLinkMaxDist: 180,
    linkLineWidth: 0.9,
    dotOpacity: 0.7,
    radiusMin: 2,
    radiusMax: 4,
    speed: 0.5,
    repulseRadius: 120,
    bitCount: 0, // no binary bits — cleaner academic look
  };
}

// ─── Hook: canvas particle animation ─────────────────────────────────────────
function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let mouseX = -9999;
    let mouseY = -9999;

    let cfg: ParticleConfig = getParticleConfig(0);
    let particles: Particle[] = [];
    let bits: BinaryBit[] = [];

    const seedParticles = () => {
      cfg = getParticleConfig(canvas.width);

      particles = Array.from({ length: cfg.count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * cfg.speed * 2,
        vy: (Math.random() - 0.5) * cfg.speed * 2,
        radius: Math.random() * (cfg.radiusMax - cfg.radiusMin) + cfg.radiusMin,
      }));

      bits = Array.from({ length: cfg.bitCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        char: Math.random() > 0.5 ? "1" : "0",
        opacity: Math.random() * 0.18 + 0.05,
        size: Math.floor(Math.random() * 5 + 10),
        flipTimer: 0,
        flipInterval: Math.floor(Math.random() * 300 + 120),
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      seedParticles();
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      particles.forEach((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cfg.repulseRadius) {
          p.vx += (dx / dist) * 2;
          p.vy += (dy / dist) * 2;
        }
      });
    };
    canvas.addEventListener("click", onClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // bits (none by default now, but kept for future use)
      bits.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -20) b.x = canvas.width + 20;
        if (b.x > canvas.width + 20) b.x = -20;
        if (b.y < -20) b.y = canvas.height + 20;
        if (b.y > canvas.height + 20) b.y = -20;
        b.flipTimer++;
        if (b.flipTimer >= b.flipInterval) {
          b.flipTimer = 0;
          b.char = b.char === "1" ? "0" : "1";
          b.flipInterval = Math.floor(Math.random() * 300 + 120);
        }
        ctx.font = `${b.size}px monospace`;
        ctx.fillStyle = `${PARTICLE_COLOR}${b.opacity})`;
        ctx.fillText(b.char, b.x, b.y);
      });

      // update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > cfg.speed * 20) {
          p.vx = (p.vx / speed) * cfg.speed * 50;
          p.vy = (p.vy / speed) * cfg.speed * 50;
        }
      });

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cfg.linkDistance) {
            const opacity = (1 - dist / cfg.linkDistance) * cfg.linkOpacityMax;
            ctx.beginPath();
            ctx.strokeStyle = `${LINK_COLOR}${opacity})`;
            ctx.lineWidth = cfg.linkLineWidth;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        const mdx = particles[i].x - mouseX;
        const mdy = particles[i].y - mouseY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < cfg.mouseLinkMaxDist) {
          const opacity =
            (1 - mDist / cfg.mouseLinkMaxDist) * cfg.mouseLinkOpacityMax;
          ctx.beginPath();
          ctx.strokeStyle = `${LINK_COLOR}${opacity})`;
          ctx.lineWidth = cfg.linkLineWidth;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      }

      // dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${PARTICLE_COLOR}${cfg.dotOpacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [canvasRef]);
}

// ─── Stats Row Component ──────────────────────────────────────────────────────
function StatsRow() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <div
      ref={ref}
      className="mt-14 flex flex-wrap items-center justify-center gap-8 text-center"
    >
      {STATS.map(({ value, suffix, label }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-2xl font-extrabold text-[#716f49] sm:text-3xl">
            {inView ? (
              <CountUp
                start={0}
                end={value}
                duration={2.4}
                separator=","
                suffix={suffix}
                useEasing
                easingFn={(t, b, c, d) => {
                  // ease-out-expo
                  return t === d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
                }}
              />
            ) : (
              `0${suffix}`
            )}
          </span>
          <span className="mt-0.5 text-xs text-[#716f49]">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sample suggestion chips ──────────────────────────────────────────────────
const SUGGESTIONS = [
  "Machine Learning",
  "Neural Networks",
  "Cybersecurity",
  "Blockchain",
  "Computer Vision",
  "Natural Language Processing",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Banner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleCanvas(canvasRef);

  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // TODO: wire up to your search route
    console.log("Search:", query);
  };

  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: BG_COLOR }}
    >
      {/* Particle canvas */}
      <div className="absolute inset-0" aria-hidden>
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      {/* Subtle radial vignette so text centre feels grounded */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(248,250,252,0.72) 0%, rgba(248,250,252,0.10) 60%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Hero content */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-28 text-center sm:px-8 sm:py-32">

        {/* Headline */}
        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Advance the Frontiers of{" "}
          <span className="text-[#716f49]">Computational Intelligence</span>
        </h1>

        {/* Sub-headline */}
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          The central hub for our research community to share papers, archive weekly presentations, and collaborate <br className="hidden sm:block"/> on cutting-edge innovations.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mb-6 flex w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 focus-within:border-[#716f49]/60 focus-within:ring-4 focus-within:ring-[#716f49]/15 transition-all duration-200"
        >
          <span className="flex items-center pl-5 text-slate-400">
            <Search size={20} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, author, DOI…"
            className="flex-1 bg-transparent px-4 py-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none sm:text-base"
          />
          <button
            type="submit"
            className="m-1.5 rounded-xl bg-[#716f49] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1f321c] active:scale-95 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Suggestion chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-[#1f321c]">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm transition-colors hover:border-[#716f49]/50 hover:bg-[#716f49]/8 hover:text-[#1f321c]"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <StatsRow />
      </div>
    </section>
  );
}