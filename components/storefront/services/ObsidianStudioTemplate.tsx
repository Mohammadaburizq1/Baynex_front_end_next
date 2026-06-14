'use client';

import { useState, useEffect, useRef } from 'react';
import { Bebas_Neue, Source_Sans_3 } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Camera, Video, Palette, Layers, Aperture, Zap,
  ArrowRight, ArrowUpRight, ChevronRight, Star,
  Clock, Phone, MapPin, CheckCircle,
} from 'lucide-react';

const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'] });
const sourceSans = Source_Sans_3({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(target: number, dur: number, active: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s: number | null = null;
    const r = (t: number) => {
      if (!s) s = t;
      const p = Math.min((t - s) / dur, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(r);
    };
    requestAnimationFrame(r);
  }, [active, target, dur]);
  return v;
}

// Seeded noise lines for hero bg — no Math.random()
const LINES = Array.from({ length: 20 }, (_, i) => ({
  x1: (i * 37 + 11) % 100,
  x2: (i * 53 + 29) % 100,
  y: (i * 17 + 5) % 100,
  op: 0.02 + (i % 5) * 0.008,
}));

// Seeded grid squares for background pattern
const GRID_CELLS = Array.from({ length: 24 }, (_, i) => ({
  col: i % 6,
  row: Math.floor(i / 6),
  filled: (i * 7 + 3) % 11 < 3,
}));

const TEAM = [
  { name: 'Marcus Wei', title: 'Lead Photographer', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', spec: 'Portrait & Editorial' },
  { name: 'Isla Crawford', title: 'Creative Director', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', spec: 'Brand & Identity' },
  { name: 'Jordan Voss', title: 'Videographer', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', spec: 'Film & Motion' },
];

const CLIENTS = ['VOGUE', 'NIKE', 'TESLA', 'APPLE', 'GUCCI', 'RED BULL', 'DIOR', 'SONY'];

const PROCESS = [
  { num: '01', label: 'Brief', desc: 'We start with a deep dive into your brand, goals, and visual direction.' },
  { num: '02', label: 'Concept', desc: 'Our team builds a full creative concept — mood, references, execution plan.' },
  { num: '03', label: 'Shoot', desc: 'Production day. Every frame captured with purpose, precision, and craft.' },
  { num: '04', label: 'Deliver', desc: 'Final assets delivered, fully retouched and ready for immediate use.' },
];

const TESTIMONIALS = [
  { quote: 'They transformed our brand identity with images that felt genuinely cinematic. The ROI was immediate.', author: 'A. Thornton, Marketing Director', stars: 5 },
  { quote: 'The team understood our vision in the first call and delivered work that surpassed everything we imagined.', author: 'J. Nakamura, Creative Lead', stars: 5 },
  { quote: 'No other studio comes close. The attention to light, composition, and storytelling is in a league of its own.', author: 'S. Petit, Brand Manager', stars: 5 },
];

const SVC_ICONS = [Camera, Video, Palette, Layers, Aperture, Zap];

export default function ObsidianStudioTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const [navSolid, setNavSolid] = useState(false);
  const [activeT, setActiveT] = useState(0);
  const [hoveredSvc, setHoveredSvc] = useState<number | null>(null);

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: clientRef, inView: clientVis } = useInView();
  const { ref: servRef, inView: servVis } = useInView();
  const { ref: gallRef, inView: gallVis } = useInView();
  const { ref: processRef, inView: procVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: testRef, inView: testVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(1200, 1300, statsVis);
  const c2 = useCountUp(9, 1000, statsVis);
  const c3 = useCountUp(340, 1200, statsVis);
  const c4 = useCountUp(100, 1100, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % TESTIMONIALS.length), 5200);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waBase = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}`;

  const up = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.65s ease ${d}ms, transform 0.65s ease ${d}ms`,
  });
  const left = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(-20px)',
    transition: `opacity 0.65s ease ${d}ms, transform 0.65s ease ${d}ms`,
  });
  const right = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(20px)',
    transition: `opacity 0.65s ease ${d}ms, transform 0.65s ease ${d}ms`,
  });

  return (
    <div className={`os-root ${sourceSans.className}`}>
      <style>{`
        .os-root {
          --black: #080808;
          --near-black: #121212;
          --grey-dk: #1C1C1C;
          --grey: #2E2E2E;
          --grey-mid: #555;
          --grey-lt: #888;
          --off-white: #F0F0F0;
          --white: #FAFAFA;
          --red: #E8001C;
          --red-dark: #B20016;
          background: var(--black);
          color: var(--white);
          min-height: 100vh;
        }

        @keyframes osWipe {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes osFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes osSlideRight {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes osRedLine {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes osTickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes osPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }

        /* ─ Nav ─ */
        .os-nav {
          position: fixed; inset: 0 0 auto; z-index: 100;
          padding: 0 64px;
          border-bottom: 1px solid transparent;
          transition: background 0.35s, border-color 0.35s;
        }
        .os-nav.os-solid {
          background: rgba(8,8,8,0.95);
          backdrop-filter: blur(12px);
          border-color: var(--grey-dk);
        }
        .os-nav-inner {
          max-width: 1400px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 68px;
        }
        .os-logo {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
        }
        .os-logo-sq {
          width: 30px; height: 30px;
          background: var(--red);
          display: flex; align-items: center; justify-content: center;
        }
        .os-logo-name {
          font-size: 18px; letter-spacing: 0.08em;
          color: var(--white);
        }
        .os-nav-links { display: flex; align-items: center; gap: 28px; }
        .os-nav-link {
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--grey-lt); background: none; border: none;
          cursor: pointer; font-family: inherit;
          transition: color 0.2s;
        }
        .os-nav-link:hover { color: var(--white); }
        .os-nav-cta {
          padding: 9px 18px;
          background: var(--red);
          color: var(--white);
          border: none; font-family: inherit;
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .os-nav-cta:hover { background: var(--red-dark); }

        /* ─ Hero ─ */
        .os-hero {
          min-height: 100vh;
          background: var(--black);
          display: flex; align-items: flex-end;
          padding: 0 64px 80px;
          position: relative;
          overflow: hidden;
        }
        .os-hero-bg {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .os-hero-img-fill {
          position: absolute; inset: 0;
          background: url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
          opacity: 0.22;
          filter: grayscale(60%);
        }
        .os-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(8,8,8,1) 30%, rgba(8,8,8,0.3) 70%);
        }
        .os-hero-inner {
          max-width: 1400px; margin: 0 auto;
          position: relative; z-index: 1; width: 100%;
          display: grid; grid-template-columns: 1fr 380px;
          gap: 80px; align-items: flex-end;
        }
        .os-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--red);
          margin-bottom: 20px;
          animation: osFadeUp 0.5s ease both 0.2s;
        }
        .os-hero-tag::before { content: ''; width: 20px; height: 1.5px; background: var(--red); display: block; }
        .os-hero-h1 {
          font-size: clamp(70px, 10vw, 140px);
          line-height: 0.95;
          letter-spacing: 0.01em;
          color: var(--white);
          text-transform: uppercase;
          margin: 0 0 24px;
          clip-path: inset(0 100% 0 0);
          animation: osWipe 1.2s cubic-bezier(0.16,1,0.3,1) both 0.3s;
        }
        .os-hero-h1 span { color: var(--red); }
        .os-hero-sub {
          max-width: 460px;
          font-size: 14px; font-weight: 300; line-height: 1.85;
          color: var(--grey-lt); margin-bottom: 28px;
          animation: osFadeUp 0.7s ease both 1s;
        }
        .os-hero-btns {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: osFadeUp 0.7s ease both 1.1s;
        }
        .os-btn-red {
          padding: 13px 24px;
          background: var(--red); color: var(--white);
          border: none; font-family: inherit; font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: background 0.2s;
        }
        .os-btn-red:hover { background: var(--red-dark); }
        .os-btn-outline {
          padding: 12px 24px;
          background: transparent; color: var(--white);
          border: 1px solid var(--grey); font-family: inherit;
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .os-btn-outline:hover { border-color: var(--white); }
        .os-hero-right {
          display: flex; flex-direction: column; gap: 16px;
          padding-bottom: 4px;
          animation: osFadeUp 0.7s ease both 0.9s;
        }
        .os-hero-stat {
          border-left: 2px solid var(--grey);
          padding: 10px 0 10px 18px;
          transition: border-color 0.3s;
        }
        .os-hero-stat:hover { border-color: var(--red); }
        .os-hero-stat-num {
          font-size: 32px; font-weight: 700; letter-spacing: -0.02em;
          color: var(--white); line-height: 1; margin-bottom: 3px;
        }
        .os-hero-stat-num span { color: var(--red); }
        .os-hero-stat-label { font-size: 11px; font-weight: 400; color: var(--grey-lt); letter-spacing: 0.04em; }

        /* ─ Clients ticker ─ */
        .os-clients { overflow: hidden; background: var(--near-black); border-top: 1px solid var(--grey-dk); border-bottom: 1px solid var(--grey-dk); padding: 18px 0; }
        .os-clients-track {
          display: flex; gap: 0;
          animation: osTickerScroll 22s linear infinite;
          width: max-content;
        }
        .os-client-item {
          padding: 0 36px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--grey-lt);
          border-right: 1px solid var(--grey-dk);
          transition: color 0.2s;
          flex-shrink: 0;
          display: flex; align-items: center;
        }
        .os-client-item:hover { color: var(--white); }

        /* ─ Stats ─ */
        .os-stats { background: var(--near-black); padding: 60px 64px; border-bottom: 1px solid var(--grey-dk); }
        .os-stats-inner {
          max-width: 1400px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .os-stat { padding: 0 32px; border-right: 1px solid var(--grey-dk); text-align: center; }
        .os-stat:first-child { padding-left: 0; text-align: left; }
        .os-stat:last-child { border-right: none; }
        .os-stat-num {
          font-size: clamp(48px,6vw,80px);
          letter-spacing: -0.02em; line-height: 1; margin-bottom: 6px;
          color: var(--white);
        }
        .os-stat-num span { color: var(--red); }
        .os-stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--grey-lt); }

        /* ─ Shared ─ */
        .os-wrap { max-width: 1400px; margin: 0 auto; padding: 100px 64px; }
        .os-section-header { margin-bottom: 56px; }
        .os-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--red); margin-bottom: 12px;
        }
        .os-eyebrow::before { content: ''; width: 18px; height: 1.5px; background: var(--red); display: block; }
        .os-h2 {
          font-size: clamp(40px, 5vw, 68px);
          line-height: 0.95; text-transform: uppercase;
          letter-spacing: 0.01em; color: var(--white);
          margin: 0;
        }

        /* ─ Services ─ */
        .os-svc-list { display: flex; flex-direction: column; gap: 0; }
        .os-svc-row {
          display: grid; grid-template-columns: 60px 1fr auto;
          gap: 28px; align-items: center;
          padding: 26px 0;
          border-bottom: 1px solid var(--grey-dk);
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }
        .os-svc-row::before {
          content: '';
          position: absolute; left: 0; right: 0; bottom: 0;
          height: 1px; background: var(--red);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s ease;
        }
        .os-svc-row:hover::before { transform: scaleX(1); }
        .os-svc-row:hover .os-svc-name { color: var(--red); }
        .os-svc-row:hover .os-svc-arrow { transform: rotate(-45deg) translateX(2px); color: var(--red); }
        .os-svc-num { font-size: 12px; font-weight: 700; color: var(--grey); letter-spacing: 0.1em; }
        .os-svc-main { display: flex; flex-direction: column; gap: 4px; }
        .os-svc-cat { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--grey-lt); }
        .os-svc-name { font-size: 20px; font-weight: 700; color: var(--white); transition: color 0.2s; letter-spacing: -0.01em; }
        .os-svc-price { font-size: 16px; font-weight: 700; color: var(--white); letter-spacing: -0.01em; flex-shrink: 0; }
        .os-svc-arrow { transition: transform 0.2s, color 0.2s; flex-shrink: 0; color: var(--grey-lt); }

        /* expanded detail */
        .os-svc-detail {
          grid-column: 2 / 3;
          overflow: hidden;
          transition: max-height 0.35s ease, opacity 0.35s ease;
        }
        .os-svc-detail.os-open { max-height: 80px; opacity: 1; }
        .os-svc-detail.os-closed { max-height: 0; opacity: 0; }
        .os-svc-desc { font-size: 13px; font-weight: 300; line-height: 1.7; color: var(--grey-lt); padding: 8px 0 4px; }

        /* ─ Gallery / Featured ─ */
        .os-gallery-band { background: var(--near-black); border-top: 1px solid var(--grey-dk); }
        .os-gallery-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 260px 260px;
          gap: 2px;
          margin-top: 40px;
        }
        .os-gal-cell {
          overflow: hidden;
          position: relative;
        }
        .os-gal-cell:first-child { grid-row: span 2; }
        .os-gal-cell img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          filter: grayscale(30%) brightness(0.85);
          transition: filter 0.4s, transform 0.4s;
        }
        .os-gal-cell:hover img { filter: grayscale(0) brightness(1); transform: scale(1.04); }
        .os-gal-overlay {
          position: absolute; inset: 0;
          background: rgba(8,8,8,0.55);
          display: flex; align-items: flex-end; padding: 14px;
          opacity: 0; transition: opacity 0.3s;
        }
        .os-gal-cell:hover .os-gal-overlay { opacity: 1; }
        .os-gal-tag {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--white); background: var(--red);
          padding: 4px 10px;
        }

        /* ─ Process ─ */
        .os-process-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 1px; background: var(--grey-dk);
          margin-top: 40px;
          border: 1px solid var(--grey-dk);
        }
        .os-p-step {
          background: var(--near-black); padding: 36px 28px;
          position: relative; overflow: hidden;
          transition: background 0.2s;
        }
        .os-p-step:hover { background: var(--grey-dk); }
        .os-p-step:hover .os-p-num { opacity: 1; }
        .os-p-num {
          font-size: clamp(60px,8vw,100px);
          font-weight: 700; letter-spacing: -0.04em;
          color: var(--black); text-shadow: 1px 1px 0 var(--grey-dk);
          position: absolute; bottom: -8px; right: -4px;
          line-height: 1; opacity: 0.8; transition: opacity 0.2s;
          pointer-events: none;
        }
        .os-p-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--red); margin-bottom: 10px;
        }
        .os-p-title { font-size: 20px; font-weight: 700; color: var(--white); margin-bottom: 10px; }
        .os-p-desc { font-size: 13px; font-weight: 300; line-height: 1.75; color: var(--grey-lt); position: relative; z-index: 1; }

        /* ─ Team ─ */
        .os-team-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; margin-top: 40px; }
        .os-agent-cell { position: relative; overflow: hidden; height: 420px; }
        .os-agent-img {
          width: 100%; height: 100%; object-fit: cover; object-position: top;
          filter: grayscale(60%) brightness(0.7);
          transition: filter 0.4s, transform 0.4s;
          display: block;
        }
        .os-agent-cell:hover .os-agent-img { filter: grayscale(0) brightness(0.85); transform: scale(1.04); }
        .os-agent-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(8,8,8,0.92) 40%, transparent 80%);
        }
        .os-agent-body {
          position: absolute; bottom: 0; left: 0; right: 0; padding: 24px;
        }
        .os-agent-spec {
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--red); margin-bottom: 6px;
        }
        .os-agent-name { font-size: 22px; font-weight: 700; color: var(--white); letter-spacing: -0.01em; margin-bottom: 2px; }
        .os-agent-title { font-size: 12px; font-weight: 300; color: var(--grey-lt); margin-bottom: 12px; }
        .os-agent-wa {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--white); text-decoration: none;
          border-bottom: 1px solid var(--grey); padding-bottom: 3px;
          transition: border-color 0.2s, color 0.2s, gap 0.2s;
        }
        .os-agent-wa:hover { color: var(--red); border-color: var(--red); gap: 9px; }

        /* ─ Testimonials ─ */
        .os-test-band { background: var(--black); border-top: 1px solid var(--grey-dk); border-bottom: 1px solid var(--grey-dk); }
        .os-test-inner { max-width: 1400px; margin: 0 auto; padding: 100px 64px; }
        .os-test-grid { display: grid; grid-template-columns: 340px 1fr; gap: 80px; align-items: start; margin-top: 48px; }
        .os-test-counter { font-size: 100px; font-weight: 700; letter-spacing: -0.04em; line-height: 1; color: var(--grey-dk); margin-bottom: 20px; }
        .os-test-dots { display: flex; gap: 8px; }
        .os-td {
          width: 28px; height: 2px; background: var(--grey);
          border: none; cursor: pointer;
          transition: background 0.2s, width 0.2s;
        }
        .os-td.os-ta { background: var(--red); width: 48px; }
        .os-test-slides { position: relative; min-height: 200px; }
        .os-test-slide {
          position: absolute; inset: 0;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .os-test-slide.os-vis { opacity: 1; transform: none; pointer-events: auto; }
        .os-test-slide.os-hid { opacity: 0; transform: translateX(16px); pointer-events: none; }
        .os-test-stars { display: flex; gap: 4px; margin-bottom: 20px; }
        .os-t-star { color: var(--red); }
        .os-test-q {
          font-size: clamp(18px,2.5vw,26px);
          font-weight: 300; line-height: 1.6;
          color: var(--off-white); margin-bottom: 22px;
          font-style: italic;
        }
        .os-test-by { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--grey-lt); }

        /* ─ CTA ─ */
        .os-cta-band {
          background: var(--red);
          padding: 100px 64px;
          position: relative; overflow: hidden;
        }
        .os-cta-band::before {
          content: '';
          position: absolute; inset: 0;
          background: url('https://images.unsplash.com/photo-1531951523507-36e43d2e4d3b?auto=format&fit=crop&w=1600&q=80') center/cover;
          opacity: 0.08;
          filter: grayscale(100%);
        }
        .os-cta-inner {
          max-width: 1400px; margin: 0 auto;
          display: flex; flex-direction: column; align-items: flex-start;
          position: relative;
        }
        .os-cta-h2 {
          font-size: clamp(60px,8vw,110px);
          letter-spacing: 0.01em; text-transform: uppercase;
          color: var(--white); line-height: 0.95;
          margin-bottom: 28px;
        }
        .os-cta-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 36px; }
        .os-cta-wa {
          padding: 14px 26px; background: var(--white); color: var(--red);
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          text-decoration: none; display: flex; align-items: center; gap: 8px;
          transition: opacity 0.2s; border: none; font-family: inherit; cursor: pointer;
        }
        .os-cta-wa:hover { opacity: 0.9; }
        .os-cta-sub { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.55); display: flex; align-items: center; gap: 8px; }
        .os-cta-details { display: flex; gap: 28px; flex-wrap: wrap; }
        .os-cta-detail { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.65); }

        /* ─ Footer ─ */
        .os-footer {
          background: var(--black); padding: 28px 64px;
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid var(--grey-dk);
          flex-wrap: wrap; gap: 10px;
        }
        .os-footer-name { font-size: 13px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--grey); }
        .os-footer-copy { font-size: 11px; color: var(--grey-dk); letter-spacing: 0.06em; }

        /* ─ Responsive ─ */
        @media (max-width: 1100px) {
          .os-hero-inner { grid-template-columns: 1fr; }
          .os-hero-right { flex-direction: row; }
          .os-hero { padding: 100px 24px 64px; }
          .os-nav { padding: 0 24px; }
          .os-stats { padding-left: 24px; padding-right: 24px; }
          .os-wrap, .os-test-inner, .os-cta-band { padding-left: 24px; padding-right: 24px; }
          .os-gallery-grid { grid-template-columns: 1fr 1fr; grid-template-rows: 220px 220px; }
          .os-gal-cell:first-child { grid-row: auto; }
          .os-test-grid { grid-template-columns: 1fr; gap: 32px; }
          .os-test-counter { font-size: 60px; display: inline; margin-right: 16px; }
          .os-footer { padding-left: 24px; padding-right: 24px; }
        }
        @media (max-width: 900px) {
          .os-stats-inner { grid-template-columns: repeat(2,1fr); }
          .os-stat { border-right: none; border-bottom: 1px solid var(--grey-dk); padding: 20px 0; }
          .os-stat:nth-last-child(-n+2) { border-bottom: none; }
          .os-svc-row { grid-template-columns: 40px 1fr auto; gap: 14px; }
          .os-process-grid { grid-template-columns: 1fr 1fr; }
          .os-team-grid { grid-template-columns: 1fr; }
          .os-agent-cell { height: 320px; }
          .os-nav-links { display: none; }
        }
        @media (max-width: 560px) {
          .os-process-grid { grid-template-columns: 1fr; }
          .os-gallery-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
          .os-gal-cell { height: 240px; }
          .os-hero-right { flex-direction: column; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`os-nav${navSolid ? ' os-solid' : ''}`}>
        <div className="os-nav-inner">
          <div className="os-logo" onClick={() => scrollTo('os-top')}>
            <div className="os-logo-sq"><Camera size={14} color="white" /></div>
            <div className={`os-logo-name ${bebasNeue.className}`}>{store.shopName}</div>
          </div>
          <div className="os-nav-links">
            {[['Work','os-gallery'],['Services','os-services'],['Process','os-process'],['Team','os-team'],['Contact','os-contact']].map(([l,id]) => (
              <button key={id} className="os-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <button className="os-nav-cta" onClick={() => window.open(waBase,'_blank')}>Get Quote</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="os-top" className="os-hero">
        <div className="os-hero-bg">
          <div className="os-hero-img-fill" />
          <div className="os-hero-overlay" />
          {/* Noise lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {LINES.map((l, i) => (
              <line key={i} x1={`${l.x1}%`} x2={`${l.x2}%`} y1={`${l.y}%`} y2={`${l.y}%`} stroke="white" strokeWidth="0.5" opacity={l.op} />
            ))}
          </svg>
        </div>
        <div className="os-hero-inner">
          <div>
            <div className="os-hero-tag">Visual Storytelling Studio</div>
            <h1 className={`os-hero-h1 ${bebasNeue.className}`}>
              We Make<br /><span>Images</span><br />That Move.
            </h1>
            <p className="os-hero-sub">{store.description || 'Award-winning photography and visual media production for brands that refuse to be ordinary.'}</p>
            <div className="os-hero-btns">
              <button className="os-btn-red" onClick={() => scrollTo('os-gallery')}>
                View Our Work <ArrowRight size={13} />
              </button>
              <button className="os-btn-outline" onClick={() => scrollTo('os-contact')}>Start a Project</button>
            </div>
          </div>
          <div className="os-hero-right">
            {[
              { num: c1, sfx: '+', label: 'Projects Delivered' },
              { num: c2, sfx: ' yrs', label: 'In the Industry' },
              { num: c4, sfx: '%', label: 'Client Retention' },
            ].map((s, i) => (
              <div key={i} className="os-hero-stat" ref={i === 0 ? statsRef : undefined}>
                <div className={`os-hero-stat-num ${bebasNeue.className}`}>{s.num}<span>{s.sfx}</span></div>
                <div className="os-hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CLIENTS TICKER ── */}
      <div className="os-clients" ref={clientRef}>
        <div className="os-clients-track">
          {[...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS].map((c, i) => (
            <div key={i} className="os-client-item">{c}</div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="os-stats">
        <div className="os-stats-inner">
          {[
            { v: c1, s: '+', l: 'Projects Completed' },
            { v: c2, s: '+', l: 'Years Active' },
            { v: c3, s: '+', l: 'Brands Worked With' },
            { v: c4, s: '%', l: 'Client Retention' },
          ].map(({ v, s, l }, i) => (
            <div key={i} className="os-stat" style={up(statsVis, i * 80)}>
              <div className={`os-stat-num ${bebasNeue.className}`}>{v}<span>{s}</span></div>
              <div className="os-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div id="os-services">
        <div className="os-wrap" ref={servRef}>
          <div className="os-section-header" style={up(servVis)}>
            <div className="os-eyebrow">What We Do</div>
            <h2 className={`os-h2 ${bebasNeue.className}`}>Our Services</h2>
          </div>
          <div className="os-svc-list">
            {products.map((svc, i) => {
              const Icon = SVC_ICONS[i % SVC_ICONS.length];
              const isOpen = hoveredSvc === i;
              const msg = `Hi! I'd like to enquire about ${svc.name}.`;
              return (
                <div key={svc.id} style={up(servVis, 60 + i * 50)}>
                  <div
                    className="os-svc-row"
                    onMouseEnter={() => setHoveredSvc(i)}
                    onMouseLeave={() => setHoveredSvc(null)}
                    onClick={() => window.open(`${waBase}?text=${encodeURIComponent(msg)}`, '_blank')}
                  >
                    <div className="os-svc-num">0{i + 1}</div>
                    <div className="os-svc-main">
                      <div className="os-svc-cat">{svc.category}</div>
                      <div className="os-svc-name">{svc.name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div className="os-svc-price">${svc.price}</div>
                      <ArrowUpRight size={18} className="os-svc-arrow" />
                    </div>
                  </div>
                  <div className={`os-svc-detail ${isOpen ? 'os-open' : 'os-closed'}`}
                    style={{ paddingLeft: 88 }}>
                    <p className="os-svc-desc">{svc.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── GALLERY ── */}
      <div id="os-gallery" className="os-gallery-band">
        <div className="os-wrap" ref={gallRef}>
          <div className="os-section-header" style={up(gallVis)}>
            <div className="os-eyebrow">Portfolio</div>
            <h2 className={`os-h2 ${bebasNeue.className}`}>Selected Work</h2>
          </div>
          <div className="os-gallery-grid">
            {[
              { src: 'https://images.unsplash.com/photo-1561069934-eee225952461?auto=format&fit=crop&w=700&q=80', tag: 'Brand Shoot' },
              { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80', tag: 'Commercial' },
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=700&q=80', tag: 'Product' },
              { src: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=700&q=80', tag: 'Editorial' },
              { src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80', tag: 'Portrait' },
            ].map((item, i) => (
              <div key={i} className="os-gal-cell" style={up(gallVis, i * 70)}>
                <img src={item.src} alt={item.tag} />
                <div className="os-gal-overlay">
                  <div className="os-gal-tag">{item.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROCESS ── */}
      <div id="os-process">
        <div className="os-wrap" ref={processRef}>
          <div className="os-section-header" style={up(procVis)}>
            <div className="os-eyebrow">How We Work</div>
            <h2 className={`os-h2 ${bebasNeue.className}`}>The Process</h2>
          </div>
          <div className="os-process-grid">
            {PROCESS.map((s, i) => (
              <div key={i} className="os-p-step" style={up(procVis, 60 + i * 80)}>
                <div className="os-p-label">{s.num}</div>
                <div className={`os-p-title ${bebasNeue.className}`}>{s.label}</div>
                <p className="os-p-desc">{s.desc}</p>
                <div className={`os-p-num ${bebasNeue.className}`}>{s.num}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div id="os-team">
        <div className="os-wrap" ref={teamRef}>
          <div className="os-section-header" style={up(teamVis)}>
            <div className="os-eyebrow">The Crew</div>
            <h2 className={`os-h2 ${bebasNeue.className}`}>Meet the Studio</h2>
          </div>
          <div className="os-team-grid">
            {TEAM.map((t, i) => (
              <div key={i} className="os-agent-cell" style={up(teamVis, 80 + i * 90)}>
                <img className="os-agent-img" src={t.img} alt={t.name} />
                <div className="os-agent-overlay" />
                <div className="os-agent-body">
                  <div className="os-agent-spec">{t.spec}</div>
                  <div className={`os-agent-name ${bebasNeue.className}`}>{t.name}</div>
                  <div className="os-agent-title">{t.title}</div>
                  <a className="os-agent-wa" href={`${waBase}?text=${encodeURIComponent(`Hi, I'd like to work with ${t.name}.`)}`} target="_blank" rel="noopener noreferrer">
                    Connect <ArrowRight size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="os-test-band" ref={testRef}>
        <div className="os-test-inner">
          <div style={up(testVis)}>
            <div className="os-eyebrow">Client Reviews</div>
            <h2 className={`os-h2 ${bebasNeue.className}`}>What They Say</h2>
          </div>
          <div className="os-test-grid">
            <div>
              <div className={`os-test-counter ${bebasNeue.className}`}>0{activeT + 1}</div>
              <div className="os-test-dots">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} className={`os-td${i === activeT ? ' os-ta' : ''}`} onClick={() => setActiveT(i)} />
                ))}
              </div>
            </div>
            <div className="os-test-slides">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={`os-test-slide${i === activeT ? ' os-vis' : ' os-hid'}`}>
                  <div className="os-test-stars">
                    {Array.from({ length: t.stars }).map((_, s) => <Star key={s} size={14} className="os-t-star" fill="var(--red)" />)}
                  </div>
                  <p className="os-test-q">&ldquo;{t.quote}&rdquo;</p>
                  <div className="os-test-by">{t.author}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div id="os-contact" className="os-cta-band" ref={ctaRef}>
        <div className="os-cta-inner">
          <h2 className={`os-cta-h2 ${bebasNeue.className}`} style={up(ctaVis)}>
            Let's Build<br />Something<br />Unforgettable.
          </h2>
          <div className="os-cta-row" style={up(ctaVis, 100)}>
            <a className="os-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Start a Project
            </a>
            <span className="os-cta-sub"><ChevronRight size={12} />Response within 24 hours</span>
          </div>
          <div className="os-cta-details" style={up(ctaVis, 160)}>
            {store.openingHours && <div className="os-cta-detail"><Clock size={13} />{store.openingHours}</div>}
            <div className="os-cta-detail"><MapPin size={13} />Studio Location</div>
            {store.whatsappNumber && <div className="os-cta-detail"><Phone size={13} />{store.whatsappNumber}</div>}
          </div>
        </div>
      </div>

      <footer className="os-footer">
        <div className={`os-footer-name ${bebasNeue.className}`}>{store.shopName}</div>
        <p className="os-footer-copy">&copy; {new Date().getFullYear()} {store.shopName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
