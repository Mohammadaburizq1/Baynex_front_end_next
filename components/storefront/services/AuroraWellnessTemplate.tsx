'use client';
import { formatMoney } from '@/lib/utils';

import { useState, useEffect, useRef } from 'react';
import { Fraunces, DM_Sans } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Heart, Leaf, Sun, Moon, Wind, Smile,
  ArrowRight, Clock, MapPin, Phone, CheckCircle, Star, Quote,
} from 'lucide-react';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['300', '400', '600', '700', '900'], style: ['normal', 'italic'] });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });

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

// Seeded dots for hero — no Math.random()
const DOTS = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 29 + 13) % 94,
  y: (i * 41 + 7) % 90,
  r: 2 + (i % 4),
  op: 0.08 + (i % 5) * 0.04,
}));

const TEAM = [
  { name: 'Amara Osei', title: 'Lead Practitioner', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', specialty: 'Mind & Body' },
  { name: 'Lucas Ferreira', title: 'Wellness Coach', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', specialty: 'Nutrition & Fitness' },
  { name: 'Yuna Park', title: 'Holistic Therapist', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', specialty: 'Recovery & Rest' },
];

const PILLARS = [
  { Icon: Leaf, title: 'Natural Methods', desc: 'Every treatment and programme is rooted in evidence-based, natural approaches to health.' },
  { Icon: Heart, title: 'Client-Centred', desc: 'We start with you — your goals, your timeline, your life. No cookie-cutter plans.' },
  { Icon: Sun, title: 'Whole-Person Care', desc: 'Mind, body, and lifestyle — we look at all three, always.' },
  { Icon: Moon, title: 'Long-Term Thinking', desc: 'Quick fixes aren\'t our thing. We build lasting habits and sustainable wellness.' },
];

const STEPS = [
  { num: '01', label: 'Consultation', desc: 'A free 20-minute call to understand where you are and what you\'re working towards.' },
  { num: '02', label: 'Your Plan', desc: 'We create a personalised programme — sessions, goals, and a realistic roadmap.' },
  { num: '03', label: 'The Work', desc: 'Together we move through your programme at your pace, with full support throughout.' },
  { num: '04', label: 'Results', desc: 'We review, adapt, and celebrate. Your progress is tracked and recognised.' },
];

const TESTIMONIALS = [
  { quote: 'I came in exhausted and overwhelmed. Within eight weeks the change was visible to everyone around me — not just me.', author: 'Kirra M.', stars: 5 },
  { quote: 'The most thoughtful wellness approach I\'ve ever experienced. They genuinely care about outcomes, not just filling slots.', author: 'Daniel S.', stars: 5 },
  { quote: 'My sleep, my energy, my mood — all transformed. I only wish I\'d found them sooner.', author: 'Sophie L.', stars: 5 },
];

export default function AuroraWellnessTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [category, setCategory] = useState('All');
  const [navSolid, setNavSolid] = useState(false);
  const [activeT, setActiveT] = useState(0);

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: servRef, inView: servVis } = useInView();
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: stepsRef, inView: stepsVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: testRef, inView: testVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(2400, 1400, statsVis);
  const c2 = useCountUp(12, 1100, statsVis);
  const c3 = useCountUp(98, 1200, statsVis);
  const c4 = useCountUp(7, 1000, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % TESTIMONIALS.length), 4800);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waDigits = (store.whatsappNumber ?? '').replace(/\D/g, '');
  // No number, no WhatsApp CTAs: a bare wa.me link opens WhatsApp with no recipient.
  const waBase = waDigits ? `https://wa.me/${waDigits}` : null;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const up = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });
  const left = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(-22px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });
  const right = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(22px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });

  return (
    <div className={`aw-root ${dmSans.className}`}>
      <style>{`
        .aw-root {
          --cream: #F8F4EE;
          --sand: #EEE7D8;
          --terra: #C26845;
          --terra-light: #D47A59;
          --sage: #6B8F71;
          --sage-light: #8AAF90;
          --dark: #2A1F16;
          --body: #4A3D34;
          --muted: #8A7A70;
          --border: #DDD4C4;
          background: var(--cream);
          color: var(--dark);
          min-height: 100vh;
        }

        @keyframes awFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes awWipe {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes awFloat {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-6px) rotate(1deg); }
          66%      { transform: translateY(-3px) rotate(-0.5deg); }
        }
        @keyframes awLineGrow {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
        @keyframes awBreathe {
          0%,100% { transform: scale(1); opacity: 0.9; }
          50%      { transform: scale(1.03); opacity: 1; }
        }

        /* ─ Nav ─ */
        .aw-nav {
          position: fixed; inset: 0 0 auto; z-index: 100;
          padding: 0 64px;
          transition: background 0.35s, box-shadow 0.35s;
        }
        .aw-nav.aw-solid {
          background: rgba(248,244,238,0.96);
          backdrop-filter: blur(14px);
          box-shadow: 0 1px 0 var(--border);
        }
        .aw-nav-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 70px;
        }
        .aw-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .aw-logo-mark {
          width: 34px; height: 34px; border-radius: 50%;
          border: 2px solid var(--terra);
          display: flex; align-items: center; justify-content: center;
        }
        .aw-logo-leaf { color: var(--sage); }
        .aw-logo-name { font-size: 17px; font-weight: 600; color: var(--dark); letter-spacing: -0.01em; }
        .aw-logo-sub { font-size: 9px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-top: 1px; }
        .aw-nav-links { display: flex; align-items: center; gap: 32px; }
        .aw-nav-link {
          font-size: 12px; font-weight: 500; color: var(--body);
          background: none; border: none; cursor: pointer; font-family: inherit;
          transition: color 0.2s;
        }
        .aw-nav-link:hover { color: var(--terra); }
        .aw-nav-cta {
          padding: 10px 22px; background: var(--terra); color: #fff;
          border: none; font-family: inherit; font-size: 11px; font-weight: 600;
          letter-spacing: 0.05em; cursor: pointer; border-radius: 100px;
          transition: background 0.2s;
        }
        .aw-nav-cta:hover { background: var(--terra-light); }

        /* ─ Hero ─ */
        .aw-hero {
          min-height: 100vh;
          background: var(--cream);
          display: flex;
          align-items: center;
          padding: 100px 64px 60px;
          position: relative;
          overflow: hidden;
        }
        .aw-hero-dots {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .aw-hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
        }
        .aw-hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 1;
          width: 100%;
        }
        .aw-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(107,143,113,0.12);
          border: 1px solid rgba(107,143,113,0.25);
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sage);
          margin-bottom: 22px;
          animation: awFadeUp 0.6s ease both 0.1s;
        }
        .aw-hero-h1 {
          font-size: clamp(44px, 5vw, 72px);
          line-height: 1.07;
          letter-spacing: -0.02em;
          color: var(--dark);
          margin: 0 0 18px;
          clip-path: inset(0 100% 0 0);
          animation: awWipe 1.1s cubic-bezier(0.22,1,0.36,1) both 0.25s;
        }
        .aw-hero-h1 em { font-style: italic; color: var(--terra); }
        .aw-terra-line {
          width: 36px; height: 3px; background: var(--terra);
          border-radius: 2px; margin-bottom: 20px;
          animation: awLineGrow 0.8s ease both 1s;
        }
        .aw-hero-desc {
          font-size: 15px; font-weight: 300; line-height: 1.9;
          color: var(--body); max-width: 380px; margin-bottom: 32px;
          animation: awFadeUp 0.7s ease both 0.8s;
        }
        .aw-hero-btns {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: awFadeUp 0.7s ease both 1s;
        }
        .aw-btn-terra {
          padding: 13px 26px; background: var(--terra); color: #fff;
          border: none; font-family: inherit; font-size: 12px; font-weight: 600;
          letter-spacing: 0.04em; cursor: pointer; border-radius: 100px;
          display: flex; align-items: center; gap: 7px;
          transition: background 0.2s, transform 0.2s;
        }
        .aw-btn-terra:hover { background: var(--terra-light); transform: translateY(-2px); }
        .aw-btn-sage {
          padding: 13px 26px; background: transparent;
          color: var(--sage); border: 1.5px solid var(--sage);
          font-family: inherit; font-size: 12px; font-weight: 600;
          letter-spacing: 0.04em; cursor: pointer; border-radius: 100px;
          transition: background 0.2s, color 0.2s;
        }
        .aw-btn-sage:hover { background: rgba(107,143,113,0.1); }
        .aw-hero-img {
          border-radius: 120px 120px 60px 60px;
          overflow: hidden;
          height: 520px;
          position: relative;
          animation: awFloat 7s ease-in-out infinite;
        }
        .aw-hero-img img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .aw-hero-img-badge {
          position: absolute;
          bottom: 28px; left: 28px;
          background: var(--cream);
          padding: 12px 18px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(42,31,22,0.14);
          animation: awBreathe 4s ease-in-out infinite;
        }
        .aw-badge-n { font-size: 24px; font-weight: 700; color: var(--terra); letter-spacing: -0.02em; line-height: 1; }
        .aw-badge-l { font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-top: 2px; }

        /* ─ Stats ─ */
        .aw-stats { background: var(--dark); padding: 52px 64px; }
        .aw-stats-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .aw-stat { padding: 0 24px; border-right: 1px solid rgba(255,255,255,0.08); text-align: center; }
        .aw-stat:last-child { border-right: none; }
        .aw-stat-num {
          font-size: clamp(36px,4.5vw,56px); font-weight: 700;
          letter-spacing: -0.03em; line-height: 1; margin-bottom: 6px;
          color: var(--cream);
        }
        .aw-stat-sfx { color: var(--terra); }
        .aw-stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(248,244,238,0.4); }

        /* ─ Shared ─ */
        .aw-wrap { max-width: 1280px; margin: 0 auto; padding: 96px 64px; }
        .aw-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 12px;
          background: rgba(194,104,69,0.08);
          border-radius: 100px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--terra); margin-bottom: 12px;
        }
        .aw-h2 {
          font-size: clamp(30px,3.5vw,50px);
          line-height: 1.1; letter-spacing: -0.02em;
          color: var(--dark); margin: 0 0 10px;
        }
        .aw-h2 em { font-style: italic; }

        /* ─ Services ─ */
        .aw-tabs {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin: 20px 0 32px;
        }
        .aw-tab {
          padding: 7px 16px; border-radius: 100px;
          border: 1.5px solid var(--border);
          background: none; font-family: inherit;
          font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
          cursor: pointer; color: var(--muted);
          transition: all 0.2s;
        }
        .aw-tab.aw-active { background: var(--terra); color: #fff; border-color: var(--terra); }
        .aw-tab:hover:not(.aw-active) { border-color: var(--terra); color: var(--terra); }
        .aw-svc-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .aw-svc-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
          position: relative;
          overflow: hidden;
        }
        .aw-svc-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(to right, var(--terra), var(--sage));
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s ease;
          border-radius: 16px 16px 0 0;
        }
        .aw-svc-card:hover { box-shadow: 0 12px 36px rgba(42,31,22,0.1); transform: translateY(-4px); border-color: transparent; }
        .aw-svc-card:hover::before { transform: scaleX(1); }
        .aw-svc-icon-wrap {
          width: 42px; height: 42px; border-radius: 12px;
          background: rgba(194,104,69,0.1);
          display: flex; align-items: center; justify-content: center;
          color: var(--terra); margin-bottom: 14px;
          transition: background 0.2s;
        }
        .aw-svc-card:hover .aw-svc-icon-wrap { background: rgba(194,104,69,0.18); }
        .aw-svc-cat { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--terra); margin-bottom: 6px; }
        .aw-svc-name { font-size: 15px; font-weight: 600; color: var(--dark); margin-bottom: 8px; line-height: 1.3; }
        .aw-svc-price { font-size: 22px; font-weight: 700; color: var(--dark); letter-spacing: -0.02em; margin-bottom: 8px; }
        .aw-svc-desc { font-size: 13px; font-weight: 300; line-height: 1.75; color: var(--body); margin-bottom: 14px; }
        .aw-svc-wa {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; color: var(--sage);
          text-decoration: none; letter-spacing: 0.04em;
          transition: gap 0.2s, color 0.2s;
        }
        .aw-svc-wa:hover { gap: 10px; color: var(--terra); }

        /* ─ About ─ */
        .aw-about-band { background: var(--sand); }
        .aw-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .aw-about-img-wrap { height: 480px; border-radius: 80px 80px 32px 32px; overflow: hidden; position: relative; }
        .aw-about-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .aw-about-img-badge {
          position: absolute; bottom: 24px; right: 24px;
          background: #fff; border-radius: 14px; padding: 14px 18px;
          box-shadow: 0 6px 20px rgba(42,31,22,0.12);
          text-align: center;
        }
        .aw-about-badge-n { font-size: 26px; font-weight: 700; color: var(--sage); letter-spacing: -0.02em; line-height: 1; }
        .aw-about-badge-l { font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-top: 3px; }
        .aw-about-text { font-size: 15px; font-weight: 300; line-height: 1.9; color: var(--body); margin-bottom: 14px; }
        .aw-pillars { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
        .aw-pillar {
          background: #fff; border-radius: 12px; padding: 16px;
          display: flex; gap: 12px; align-items: flex-start;
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .aw-pillar:hover { border-color: var(--terra); }
        .aw-pillar-icon { color: var(--terra); flex-shrink: 0; margin-top: 1px; }
        .aw-pillar-title { font-size: 13px; font-weight: 600; color: var(--dark); margin-bottom: 3px; }
        .aw-pillar-desc { font-size: 12px; font-weight: 300; line-height: 1.6; color: var(--body); }

        /* ─ Steps ─ */
        .aw-steps-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 0; margin-top: 48px;
          position: relative;
        }
        .aw-steps-grid::before {
          content: '';
          position: absolute; top: 28px; left: 7%; right: 7%; height: 1px;
          background: linear-gradient(to right, var(--terra), var(--sage));
          z-index: 0;
        }
        .aw-step { padding: 0 20px; text-align: center; position: relative; z-index: 1; }
        .aw-step-circle {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--cream);
          border: 2px solid var(--terra);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          font-size: 14px; font-weight: 700; color: var(--terra);
          letter-spacing: 0.02em;
        }
        .aw-step-label { font-size: 15px; font-weight: 600; color: var(--dark); margin-bottom: 8px; }
        .aw-step-desc { font-size: 13px; font-weight: 300; line-height: 1.7; color: var(--body); }

        /* ─ Team ─ */
        .aw-team-band { background: var(--cream); }
        .aw-team-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px; }
        .aw-agent-card {
          background: #fff; border: 1.5px solid var(--border);
          border-radius: 20px; overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .aw-agent-card:hover { box-shadow: 0 12px 36px rgba(42,31,22,0.1); transform: translateY(-4px); }
        .aw-agent-photo-wrap { height: 260px; overflow: hidden; }
        .aw-agent-photo { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; transition: transform 0.4s; }
        .aw-agent-card:hover .aw-agent-photo { transform: scale(1.04); }
        .aw-agent-body { padding: 18px; }
        .aw-agent-specialty {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; background: rgba(194,104,69,0.1);
          border-radius: 100px; font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--terra); margin-bottom: 8px;
        }
        .aw-agent-name { font-size: 18px; font-weight: 600; color: var(--dark); margin-bottom: 2px; letter-spacing: -0.01em; }
        .aw-agent-title { font-size: 12px; font-weight: 400; color: var(--muted); margin-bottom: 12px; }
        .aw-agent-divider { height: 1px; background: var(--border); margin-bottom: 12px; }
        .aw-agent-wa {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; color: var(--sage);
          text-decoration: none; transition: color 0.2s, gap 0.2s;
        }
        .aw-agent-wa:hover { color: var(--terra); gap: 9px; }

        /* ─ Testimonials ─ */
        .aw-test-band { background: var(--dark); }
        .aw-test-inner { max-width: 1280px; margin: 0 auto; padding: 96px 64px; }
        .aw-test-slider { position: relative; height: 210px; margin: 48px 0 0; }
        .aw-test-card {
          position: absolute; inset: 0;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .aw-test-card.aw-active { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .aw-test-card.aw-hidden { opacity: 0; transform: translateY(10px); pointer-events: none; }
        .aw-test-stars { display: flex; gap: 4px; }
        .aw-star { color: var(--terra); }
        .aw-test-quote {
          font-size: 18px; font-weight: 300; line-height: 1.75;
          color: rgba(248,244,238,0.8); max-width: 620px; font-style: italic;
        }
        .aw-test-author { font-size: 13px; font-weight: 600; color: var(--terra); letter-spacing: 0.04em; }
        .aw-test-dots { display: flex; gap: 8px; justify-content: center; margin-top: 230px; }
        .aw-t-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(248,244,238,0.2); border: none; cursor: pointer;
          transition: background 0.2s;
        }
        .aw-t-dot.aw-t-active { background: var(--terra); }

        /* ─ CTA ─ */
        .aw-cta-band {
          background: linear-gradient(135deg, var(--terra) 0%, #8B3A22 100%);
          padding: 96px 64px;
          position: relative; overflow: hidden;
        }
        .aw-cta-band::before {
          content: '';
          position: absolute; top: -80px; right: -80px;
          width: 360px; height: 360px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .aw-cta-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
          position: relative;
        }
        .aw-cta-h2 {
          font-size: clamp(40px,5vw,66px);
          line-height: 1.05; color: #fff;
          letter-spacing: -0.02em; margin-bottom: 14px;
        }
        .aw-cta-h2 em { font-style: italic; }
        .aw-cta-sub { font-size: 15px; font-weight: 300; line-height: 1.8; color: rgba(255,255,255,0.65); }
        .aw-cta-right { display: flex; flex-direction: column; gap: 14px; }
        .aw-cta-wa {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 28px;
          background: #fff; color: var(--terra);
          font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
          text-decoration: none; border-radius: 100px;
          width: fit-content;
          transition: transform 0.2s, opacity 0.2s;
          border: none; font-family: inherit; cursor: pointer;
        }
        .aw-cta-wa:hover { transform: translateY(-2px); opacity: 0.9; }
        .aw-cta-detail { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.55); }
        .aw-cta-detail-icon { color: rgba(255,255,255,0.5); flex-shrink: 0; }

        /* ─ Footer ─ */
        .aw-footer {
          background: var(--dark); padding: 36px 64px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .aw-footer-name { font-size: 16px; font-weight: 600; color: rgba(248,244,238,0.25); letter-spacing: 0.02em; }
        .aw-footer-copy { font-size: 11px; color: rgba(248,244,238,0.12); letter-spacing: 0.06em; }

        /* ─ Responsive ─ */
        @media (max-width: 1024px) {
          .aw-hero { padding: 100px 24px 60px; }
          .aw-hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .aw-hero-img { height: 360px; }
          .aw-nav, .aw-stats, .aw-cta-band, .aw-footer { padding-left: 24px; padding-right: 24px; }
          .aw-wrap, .aw-test-inner { padding-left: 24px; padding-right: 24px; }
          .aw-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .aw-about-img-wrap { height: 320px; }
          .aw-cta-inner { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 900px) {
          .aw-stats-inner { grid-template-columns: repeat(2,1fr); }
          .aw-stat { border: none; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 20px 8px; }
          .aw-stat:nth-last-child(-n+2) { border-bottom: none; }
          .aw-svc-grid { grid-template-columns: repeat(2,1fr); }
          .aw-steps-grid { grid-template-columns: repeat(2,1fr); }
          .aw-steps-grid::before { display: none; }
          .aw-team-grid { grid-template-columns: 1fr 1fr; }
          .aw-nav-links { display: none; }
          .aw-footer { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 560px) {
          .aw-svc-grid, .aw-team-grid, .aw-steps-grid, .aw-pillars { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`aw-nav${navSolid ? ' aw-solid' : ''}`}>
        <div className="aw-nav-inner">
          <div className="aw-logo" onClick={() => scrollTo('aw-top')}>
            <div className="aw-logo-mark"><Leaf size={16} className="aw-logo-leaf" /></div>
            <div>
              <div className={`aw-logo-name ${fraunces.className}`}>{store.shopName}</div>
              <div className="aw-logo-sub">Wellness Studio</div>
            </div>
          </div>
          <div className="aw-nav-links">
            {[['Services','aw-services'],['About','aw-about'],['Our Process','aw-process'],['Contact','aw-contact']].map(([l,id]) => (
              <button key={id} className="aw-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            {waBase && (
            <button className="aw-nav-cta" onClick={() => window.open(waBase,'_blank')}>Book on WhatsApp</button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="aw-top" className="aw-hero">
        {/* Blobs */}
        <div className="aw-hero-blob" style={{ width: 400, height: 400, background: 'var(--terra)', opacity: 0.06, top: '10%', right: '5%' }} />
        <div className="aw-hero-blob" style={{ width: 300, height: 300, background: 'var(--sage)', opacity: 0.07, bottom: '15%', left: '2%' }} />
        {/* Dots */}
        <svg className="aw-hero-dots" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {DOTS.map((d, i) => (
            <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.r} fill="var(--terra)" opacity={d.op} />
          ))}
        </svg>
        <div className="aw-hero-inner">
          <div>
            <div className="aw-hero-eyebrow"><Leaf size={11} /> Holistic Wellness</div>
            <h1 className={`aw-hero-h1 ${fraunces.className}`}>
              Feel Better,<br /><em>Live Better.</em>
            </h1>
            <div className="aw-terra-line" />
            <p className="aw-hero-desc">
              {tc?.heroDescription || store.description || 'Personalised wellness programmes, expert practitioners, and a warm community — everything you need to thrive.'}
            </p>
            <div className="aw-hero-btns">
              <button className="aw-btn-terra" onClick={() => scrollTo('aw-services')}>
                Explore Sessions <ArrowRight size={13} />
              </button>
              <button className="aw-btn-sage" onClick={() => scrollTo('aw-about')}>Our Approach</button>
            </div>
          </div>
          <div className="aw-hero-img">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80" alt="Wellness" />
            <div className="aw-hero-img-badge">
              <div className={`aw-badge-n ${fraunces.className}`}>2.4K+</div>
              <div className="aw-badge-l">Happy clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      {data.demo && (<>
      <div className="aw-stats" ref={statsRef}>
        <div className="aw-stats-inner">
          {[
            { v: c1, s: '+', l: 'Clients Transformed' },
            { v: c2, s: ' yrs', l: 'Studio Experience' },
            { v: c3, s: '%', l: 'Would Recommend Us' },
            { v: c4, s: '+', l: 'Treatment Styles' },
          ].map(({ v, s, l }, i) => (
            <div key={i} className="aw-stat" style={up(statsVis, i * 80)}>
              <div className={`aw-stat-num ${fraunces.className}`}>{v}<span className="aw-stat-sfx">{s}</span></div>
              <div className="aw-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
      </>)}

      {/* ── SERVICES ── */}
      <div id="aw-services">
        <div className="aw-wrap" ref={servRef}>
          <div style={up(servVis)}>
            <div className="aw-eyebrow"><Heart size={10} />Our Treatments</div>
            <h2 className={`aw-h2 ${fraunces.className}`}>What We Offer</h2>
          </div>
          <div className="aw-tabs" style={up(servVis, 60)}>
            {categories.map(cat => (
              <button key={cat} className={`aw-tab${category === cat ? ' aw-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="aw-svc-grid">
            {filtered.map((svc, i) => {
              const msg = `Hello ${store.shopName}! I'd like to book ${svc.name}.`;
              const icons = [Heart, Leaf, Sun, Moon, Wind, Smile];
              const Icon = icons[i % icons.length];
              return (
                <div key={svc.id} className="aw-svc-card" style={up(servVis, 80 + i * 55)}>
                  <div className="aw-svc-icon-wrap"><Icon size={18} /></div>
                  <div className="aw-svc-cat">{svc.category}</div>
                  <div className={`aw-svc-price ${fraunces.className}`}>{formatMoney(svc.discountPrice ?? svc.price, store.currencyCode)}</div>
                  <div className="aw-svc-name">{svc.name}</div>
                  <p className="aw-svc-desc">{svc.description}</p>
                  {waBase && (
                  <a className="aw-svc-wa" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                    Book on WhatsApp <ArrowRight size={12} />
                  </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div id="aw-about" className="aw-about-band">
        <div className="aw-wrap" ref={aboutRef}>
          <div className="aw-about-grid">
            <div style={left(aboutVis)}>
              <div className="aw-about-img-wrap">
                <img className="aw-about-img" src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80" alt="Studio" />
                <div className="aw-about-img-badge">
                  <div className={`aw-about-badge-n ${fraunces.className}`}>12+</div>
                  <div className="aw-about-badge-l">Years caring<br />for clients</div>
                </div>
              </div>
            </div>
            <div style={right(aboutVis, 100)}>
              <div className="aw-eyebrow"><Smile size={10} />Our Philosophy</div>
              <h2 className={`aw-h2 ${fraunces.className}`}>Rooted in<br /><em>Real Care.</em></h2>
              <p className="aw-about-text" style={{ marginTop: 14 }}>
                {store.shopName} was built on the belief that wellness isn't a luxury — it's a foundation. Since opening our doors, we've helped thousands of people feel more like themselves again.
              </p>
              <p className="aw-about-text">
                Our practitioners bring deep expertise and genuine warmth to every session. No hard sells, no one-size-fits-all plans — just honest, attentive care.
              </p>
              <div className="aw-pillars">
                {PILLARS.map(({ Icon, title, desc }, i) => (
                  <div key={i} className="aw-pillar">
                    <Icon size={16} className="aw-pillar-icon" />
                    <div>
                      <div className="aw-pillar-title">{title}</div>
                      <p className="aw-pillar-desc">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEPS ── */}
      <div id="aw-process">
        <div className="aw-wrap" ref={stepsRef}>
          <div style={{ ...up(stepsVis), textAlign: 'center' }}>
            <div className="aw-eyebrow" style={{ margin: '0 auto 12px' }}><Sun size={10} />Getting Started</div>
            <h2 className={`aw-h2 ${fraunces.className}`}>How It Works</h2>
          </div>
          <div className="aw-steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="aw-step" style={up(stepsVis, 100 + i * 100)}>
                <div className="aw-step-circle">{s.num}</div>
                <div className={`aw-step-label ${fraunces.className}`}>{s.label}</div>
                <p className="aw-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      {data.demo && (<>
      <div className="aw-team-band">
        <div className="aw-wrap" ref={teamRef}>
          <div style={up(teamVis)}>
            <div className="aw-eyebrow"><Heart size={10} />Our Practitioners</div>
            <h2 className={`aw-h2 ${fraunces.className}`}>Meet Your Team</h2>
          </div>
          <div className="aw-team-grid">
            {TEAM.map((t, i) => (
              <div key={i} className="aw-agent-card" style={up(teamVis, 80 + i * 90)}>
                <div className="aw-agent-photo-wrap">
                  <img className="aw-agent-photo" src={t.img} alt={t.name} />
                </div>
                <div className="aw-agent-body">
                  <div className="aw-agent-specialty">{t.specialty}</div>
                  <div className={`aw-agent-name ${fraunces.className}`}>{t.name}</div>
                  <div className="aw-agent-title">{t.title}</div>
                  <div className="aw-agent-divider" />
                  {waBase && (
                  <a className="aw-agent-wa" href={`${waBase}?text=${encodeURIComponent(`Hi! I'd like to book with ${t.name}.`)}`} target="_blank" rel="noopener noreferrer">
                    Book with {t.name.split(' ')[0]} <ArrowRight size={12} />
                  </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>)}

      {/* ── TESTIMONIALS ── */}
      {data.demo && (<>
      <div className="aw-test-band" ref={testRef}>
        <div className="aw-test-inner">
          <div style={{ ...up(testVis), textAlign: 'center' }}>
            <div className="aw-eyebrow" style={{ margin: '0 auto 12px', background: 'rgba(194,104,69,0.15)', color: 'var(--terra)' }}>
              <Star size={10} />Client Stories
            </div>
            <h2 className={`aw-h2 ${fraunces.className}`} style={{ color: 'var(--cream)' }}>What Our Clients Say</h2>
          </div>
          <div className="aw-test-slider">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`aw-test-card${i === activeT ? ' aw-active' : ' aw-hidden'}`}>
                <div className="aw-test-stars">
                  {Array.from({ length: t.stars }).map((_, s) => <Star key={s} size={14} className="aw-star" fill="var(--terra)" />)}
                </div>
                <p className={`aw-test-quote ${fraunces.className}`}>&ldquo;{t.quote}&rdquo;</p>
                <div className="aw-test-author">{t.author}</div>
              </div>
            ))}
          </div>
          <div className="aw-test-dots">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} className={`aw-t-dot${i === activeT ? ' aw-t-active' : ''}`} onClick={() => setActiveT(i)} />
            ))}
          </div>
        </div>
      </div>
      </>)}

      {/* ── CTA ── */}
      <div id="aw-contact" className="aw-cta-band" ref={ctaRef}>
        <div className="aw-cta-inner">
          <div style={left(ctaVis)}>
            <h2 className={`aw-cta-h2 ${fraunces.className}`}>Your Journey<br /><em>Starts Here.</em></h2>
            <p className="aw-cta-sub">Book your first session today. If you're not sure where to start, we'll guide you — no pressure, just a conversation.</p>
          </div>
          <div className="aw-cta-right" style={right(ctaVis, 100)}>
            {waBase && (
            <a className="aw-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Book via WhatsApp
            </a>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {(tc?.openingHours || store.openingHours) && <div className="aw-cta-detail"><Clock size={13} className="aw-cta-detail-icon" />{tc?.openingHours || store.openingHours}</div>}
              <div className="aw-cta-detail"><MapPin size={13} className="aw-cta-detail-icon" />Studio Location</div>
              {store.whatsappNumber && <div className="aw-cta-detail"><Phone size={13} className="aw-cta-detail-icon" />{store.whatsappNumber}</div>}
            </div>
          </div>
        </div>
      </div>

      <footer className="aw-footer">
        <div className={`aw-footer-name ${fraunces.className}`}>{store.shopName}</div>
        <p className="aw-footer-copy">&copy; {new Date().getFullYear()} {store.shopName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
