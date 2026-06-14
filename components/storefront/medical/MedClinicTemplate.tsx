'use client';

import { useState, useEffect, useRef } from 'react';
import { Sora, DM_Sans } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Heart, Activity, ShieldCheck, Clock, MapPin, Phone,
  ArrowRight, CheckCircle, Star, Stethoscope, Microscope,
  Brain, Bone, Eye, Wind,
} from 'lucide-react';

const sora = Sora({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });
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

const CROSS_DOTS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 43 + 7) % 95,
  y: (i * 29 + 13) % 90,
  s: 3 + (i % 4),
  op: 0.04 + (i % 5) * 0.025,
}));

const DOCTORS = [
  { name: 'Dr. Sarah Chen', title: 'Chief Medical Officer', spec: 'Internal Medicine', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dr. James Okonkwo', title: 'Lead Cardiologist', spec: 'Cardiology', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dr. Mila Petrov', title: 'Head of Diagnostics', spec: 'Radiology', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80' },
];

const TRUST_PILLARS = [
  { Icon: ShieldCheck, title: 'Accredited Facility', desc: 'JCI-accredited and fully licensed by the national health authority.' },
  { Icon: Activity, title: 'Same-Day Results', desc: 'Advanced on-site lab delivers most results within hours, not days.' },
  { Icon: Heart, title: 'Patient-First Care', desc: 'Every care plan is built around your health goals and personal history.' },
];

const WHY_US = [
  '20+ years of clinical excellence',
  'In-house diagnostics & imaging',
  'Multilingual care team',
  'Telehealth appointments available',
  'Transparent, itemised billing',
  'Same-day urgent care slots',
];

const TESTIMONIALS = [
  { quote: 'The most thorough medical team I have ever encountered. Every question answered, every concern addressed.', author: 'Robert H.', stars: 5 },
  { quote: 'Diagnosis was clear, fast, and the follow-up care was exceptional. I trust this clinic completely.', author: 'Amina S.', stars: 5 },
  { quote: 'Genuine, professional, and kind. The kind of healthcare that actually puts the patient first.', author: 'Tom F.', stars: 5 },
];

const SVC_ICONS = [Stethoscope, Microscope, Heart, Brain, Bone, Eye, Activity, Wind];

export default function MedClinicTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const [navSolid, setNavSolid] = useState(false);
  const [activeT, setActiveT] = useState(0);
  const [category, setCategory] = useState('All');

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: servRef, inView: servVis } = useInView();
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: testRef, inView: testVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(18500, 1400, statsVis);
  const c2 = useCountUp(24, 1100, statsVis);
  const c3 = useCountUp(99, 1200, statsVis);
  const c4 = useCountUp(15, 1000, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waBase = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}`;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const up = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.65s ease ${d}ms, transform 0.65s ease ${d}ms`,
  });
  const left = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(-18px)',
    transition: `opacity 0.65s ease ${d}ms, transform 0.65s ease ${d}ms`,
  });
  const right = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(18px)',
    transition: `opacity 0.65s ease ${d}ms, transform 0.65s ease ${d}ms`,
  });

  return (
    <div className={`mc-root ${dmSans.className}`}>
      <style>{`
        .mc-root {
          --blue: #1B3A6B;
          --sky: #2E86DE;
          --sky-lt: #4D9AE8;
          --light-blue: #EEF4FF;
          --cream: #FAFCFF;
          --dark: #0D1F3C;
          --body: #3D4F6B;
          --muted: #7A8CA8;
          --border: #D8E4F0;
          background: var(--cream);
          color: var(--dark);
          min-height: 100vh;
        }

        @keyframes mcWipe {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes mcFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mcPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
        @keyframes mcFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }

        /* ─ Nav ─ */
        .mc-nav {
          position: fixed; inset: 0 0 auto; z-index: 100;
          padding: 0 64px;
          transition: background 0.35s, box-shadow 0.35s;
        }
        .mc-nav.mc-solid {
          background: rgba(250,252,255,0.97);
          backdrop-filter: blur(14px);
          box-shadow: 0 1px 0 var(--border);
        }
        .mc-nav-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 68px;
        }
        .mc-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .mc-logo-cross {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--sky);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .mc-logo-cross::before, .mc-logo-cross::after {
          content: ''; position: absolute; background: white; border-radius: 2px;
        }
        .mc-logo-cross::before { width: 14px; height: 4px; }
        .mc-logo-cross::after  { width: 4px; height: 14px; }
        .mc-logo-name { font-size: 17px; font-weight: 700; color: var(--blue); letter-spacing: -0.01em; }
        .mc-logo-sub  { font-size: 9px; font-weight: 500; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }
        .mc-nav-links { display: flex; align-items: center; gap: 28px; }
        .mc-nav-link {
          font-size: 13px; font-weight: 500; color: var(--body);
          background: none; border: none; cursor: pointer; font-family: inherit;
          transition: color 0.2s;
        }
        .mc-nav-link:hover { color: var(--sky); }
        .mc-nav-cta {
          padding: 10px 22px; background: var(--sky); color: #fff;
          border: none; font-family: inherit; font-size: 12px; font-weight: 600;
          letter-spacing: 0.02em; cursor: pointer; border-radius: 8px;
          transition: background 0.2s;
        }
        .mc-nav-cta:hover { background: var(--sky-lt); }

        /* ─ Hero ─ */
        .mc-hero {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--blue) 0%, #0D2450 100%);
          display: flex; align-items: center;
          padding: 100px 64px 60px;
          position: relative; overflow: hidden;
        }
        .mc-hero-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
          position: relative; z-index: 1; width: 100%;
        }
        .mc-hero-tag {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 14px; background: rgba(46,134,222,0.25);
          border: 1px solid rgba(46,134,222,0.4);
          border-radius: 100px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; color: #7FC5FF;
          margin-bottom: 20px;
          animation: mcFadeUp 0.5s ease both 0.1s;
        }
        .mc-hero-h1 {
          font-size: clamp(40px, 5.5vw, 70px); line-height: 1.06;
          letter-spacing: -0.025em; color: #fff; margin: 0 0 16px;
          clip-path: inset(0 100% 0 0);
          animation: mcWipe 1.1s cubic-bezier(0.22,1,0.36,1) both 0.3s;
        }
        .mc-hero-h1 span { color: var(--sky); }
        .mc-sky-line {
          width: 40px; height: 3px; background: var(--sky);
          border-radius: 2px; margin-bottom: 18px;
          animation: mcFadeUp 0.6s ease both 1s;
        }
        .mc-hero-desc {
          font-size: 15px; font-weight: 300; line-height: 1.85;
          color: rgba(255,255,255,0.65); max-width: 400px; margin-bottom: 28px;
          animation: mcFadeUp 0.6s ease both 0.9s;
        }
        .mc-hero-btns {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: mcFadeUp 0.6s ease both 1.05s;
        }
        .mc-btn-sky {
          padding: 13px 24px; background: var(--sky); color: #fff;
          border: none; font-family: inherit; font-size: 12px; font-weight: 600;
          cursor: pointer; border-radius: 8px;
          display: flex; align-items: center; gap: 7px;
          transition: background 0.2s, transform 0.2s;
        }
        .mc-btn-sky:hover { background: var(--sky-lt); transform: translateY(-2px); }
        .mc-btn-ghost {
          padding: 12px 24px; background: transparent; color: #fff;
          border: 1px solid rgba(255,255,255,0.25); font-family: inherit;
          font-size: 12px; font-weight: 500; cursor: pointer; border-radius: 8px;
          transition: border-color 0.2s, background 0.2s;
        }
        .mc-btn-ghost:hover { border-color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.05); }
        .mc-pillars {
          display: flex; flex-direction: column; gap: 14px;
          animation: mcFadeUp 0.7s ease both 0.6s;
        }
        .mc-pillar {
          display: flex; align-items: flex-start; gap: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 16px;
          backdrop-filter: blur(8px);
          transition: background 0.2s, border-color 0.2s;
        }
        .mc-pillar:hover { background: rgba(255,255,255,0.1); border-color: rgba(46,134,222,0.4); }
        .mc-pillar-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(46,134,222,0.2);
          display: flex; align-items: center; justify-content: center;
          color: var(--sky); flex-shrink: 0;
        }
        .mc-pillar-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .mc-pillar-desc { font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.5); line-height: 1.6; }

        /* ─ Stats ─ */
        .mc-stats { background: var(--sky); padding: 42px 64px; }
        .mc-stats-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .mc-stat { text-align: center; padding: 0 16px; border-right: 1px solid rgba(255,255,255,0.25); }
        .mc-stat:last-child { border-right: none; }
        .mc-stat-num {
          font-size: clamp(34px,4.5vw,54px); font-weight: 700;
          letter-spacing: -0.02em; line-height: 1; color: #fff; margin-bottom: 5px;
        }
        .mc-stat-sfx { font-size: 0.6em; }
        .mc-stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.65); }

        /* ─ Shared ─ */
        .mc-wrap { max-width: 1280px; margin: 0 auto; padding: 96px 64px; }
        .mc-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 4px 12px; border-radius: 100px;
          background: rgba(46,134,222,0.08); border: 1px solid rgba(46,134,222,0.18);
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--sky); margin-bottom: 10px;
        }
        .mc-h2 {
          font-size: clamp(28px,3.5vw,48px);
          line-height: 1.1; letter-spacing: -0.02em;
          color: var(--dark); margin: 0;
        }

        /* ─ Services ─ */
        .mc-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 20px 0 32px; }
        .mc-tab {
          padding: 7px 16px; border-radius: 100px;
          border: 1.5px solid var(--border);
          background: none; font-family: inherit;
          font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
          cursor: pointer; color: var(--muted);
          transition: all 0.2s;
        }
        .mc-tab.mc-active { background: var(--sky); color: #fff; border-color: var(--sky); }
        .mc-tab:hover:not(.mc-active) { border-color: var(--sky); color: var(--sky); }
        .mc-svc-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .mc-svc-card {
          background: #fff; border: 1.5px solid var(--border); border-radius: 14px; padding: 24px;
          transition: box-shadow 0.25s, border-color 0.25s, transform 0.25s;
          position: relative; overflow: hidden;
        }
        .mc-svc-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--sky); transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s ease;
        }
        .mc-svc-card:hover { box-shadow: 0 10px 30px rgba(27,58,107,0.1); border-color: var(--light-blue); transform: translateY(-3px); }
        .mc-svc-card:hover::after { transform: scaleX(1); }
        .mc-svc-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--light-blue); display: flex; align-items: center; justify-content: center; color: var(--sky); margin-bottom: 14px; }
        .mc-svc-cat { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sky); margin-bottom: 6px; }
        .mc-svc-price { font-size: 20px; font-weight: 700; color: var(--dark); letter-spacing: -0.02em; margin-bottom: 6px; }
        .mc-svc-name { font-size: 15px; font-weight: 600; color: var(--dark); margin-bottom: 8px; line-height: 1.3; }
        .mc-svc-desc { font-size: 13px; font-weight: 300; line-height: 1.75; color: var(--body); margin-bottom: 14px; }
        .mc-svc-book {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; color: var(--sky);
          text-decoration: none; letter-spacing: 0.03em;
          transition: gap 0.2s, color 0.2s;
        }
        .mc-svc-book:hover { gap: 10px; color: var(--blue); }

        /* ─ About ─ */
        .mc-about-band { background: var(--light-blue); }
        .mc-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .mc-about-img-wrap { border-radius: 24px; overflow: hidden; height: 480px; position: relative; }
        .mc-about-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .mc-about-badge {
          position: absolute; bottom: 24px; right: 24px;
          background: #fff; border-radius: 14px; padding: 16px 20px;
          box-shadow: 0 8px 28px rgba(27,58,107,0.14);
          animation: mcPulse 4s ease-in-out infinite;
        }
        .mc-badge-n { font-size: 28px; font-weight: 700; color: var(--sky); letter-spacing: -0.02em; line-height: 1; }
        .mc-badge-l { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 3px; }
        .mc-about-text { font-size: 15px; font-weight: 300; line-height: 1.9; color: var(--body); margin-bottom: 14px; }
        .mc-why-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .mc-why-item { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; color: var(--blue); }
        .mc-why-check { color: var(--sky); flex-shrink: 0; }

        /* ─ Team ─ */
        .mc-team-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px; }
        .mc-doctor-card {
          background: #fff; border: 1.5px solid var(--border); border-radius: 18px; overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .mc-doctor-card:hover { box-shadow: 0 12px 36px rgba(27,58,107,0.1); transform: translateY(-4px); }
        .mc-doctor-photo { height: 260px; overflow: hidden; }
        .mc-doctor-photo img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; transition: transform 0.4s; }
        .mc-doctor-card:hover .mc-doctor-photo img { transform: scale(1.04); }
        .mc-doctor-body { padding: 18px 20px; }
        .mc-doctor-spec {
          display: inline-flex; padding: 3px 10px; border-radius: 100px;
          background: var(--light-blue); font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--sky);
          margin-bottom: 8px;
        }
        .mc-doctor-name { font-size: 18px; font-weight: 600; color: var(--dark); margin-bottom: 2px; letter-spacing: -0.01em; }
        .mc-doctor-title { font-size: 12px; color: var(--muted); margin-bottom: 12px; }
        .mc-doctor-line { height: 1px; background: var(--border); margin-bottom: 12px; }
        .mc-doctor-wa {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; color: var(--sky);
          text-decoration: none; transition: color 0.2s, gap 0.2s;
        }
        .mc-doctor-wa:hover { color: var(--blue); gap: 9px; }

        /* ─ Testimonials ─ */
        .mc-test-band { background: var(--blue); }
        .mc-test-inner { max-width: 1280px; margin: 0 auto; padding: 96px 64px; }
        .mc-test-slider { position: relative; min-height: 180px; margin-top: 48px; }
        .mc-test-card {
          position: absolute; inset: 0; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          transition: opacity 0.6s, transform 0.6s;
        }
        .mc-test-card.mc-vis { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .mc-test-card.mc-hid { opacity: 0; transform: translateY(10px); pointer-events: none; }
        .mc-t-stars { display: flex; gap: 4px; }
        .mc-t-star { color: #FFD166; }
        .mc-test-q {
          font-size: 18px; font-weight: 300; line-height: 1.75; font-style: italic;
          color: rgba(255,255,255,0.8); max-width: 600px;
        }
        .mc-test-by { font-size: 12px; font-weight: 600; color: var(--sky); letter-spacing: 0.05em; }
        .mc-t-dots { display: flex; gap: 7px; justify-content: center; margin-top: 200px; }
        .mc-t-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.2); border: none; cursor: pointer; transition: background 0.2s; }
        .mc-t-dot.mc-t-active { background: var(--sky); }

        /* ─ CTA ─ */
        .mc-cta-band { background: var(--cream); padding: 96px 64px; }
        .mc-cta-inner {
          max-width: 1280px; margin: 0 auto;
          background: var(--blue); border-radius: 24px; padding: 64px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
          position: relative; overflow: hidden;
        }
        .mc-cta-inner::before {
          content: ''; position: absolute; right: -60px; top: -60px;
          width: 280px; height: 280px; border-radius: 50%;
          border: 1px solid rgba(46,134,222,0.2);
          pointer-events: none;
        }
        .mc-cta-inner::after {
          content: ''; position: absolute; right: -20px; top: -20px;
          width: 180px; height: 180px; border-radius: 50%;
          border: 1px solid rgba(46,134,222,0.15);
          pointer-events: none;
        }
        .mc-cta-h2 {
          font-size: clamp(32px,4vw,52px); line-height: 1.1;
          letter-spacing: -0.02em; color: #fff; margin-bottom: 12px;
        }
        .mc-cta-h2 span { color: var(--sky); }
        .mc-cta-sub { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.55); line-height: 1.8; }
        .mc-cta-right { display: flex; flex-direction: column; gap: 14px; position: relative; }
        .mc-cta-wa {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 26px; background: var(--sky); color: #fff;
          font-family: inherit; font-size: 12px; font-weight: 600; letter-spacing: 0.03em;
          border: none; border-radius: 10px; cursor: pointer; text-decoration: none; width: fit-content;
          transition: background 0.2s, transform 0.2s;
        }
        .mc-cta-wa:hover { background: var(--sky-lt); transform: translateY(-2px); }
        .mc-cta-detail { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.4); }

        /* ─ Footer ─ */
        .mc-footer {
          background: var(--dark); padding: 28px 64px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
        }
        .mc-footer-name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.2); }
        .mc-footer-copy { font-size: 11px; color: rgba(255,255,255,0.1); letter-spacing: 0.06em; }

        /* ─ Responsive ─ */
        @media (max-width: 1024px) {
          .mc-hero, .mc-stats, .mc-cta-band { padding-left: 24px; padding-right: 24px; }
          .mc-wrap, .mc-test-inner { padding-left: 24px; padding-right: 24px; }
          .mc-hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .mc-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .mc-about-img-wrap { height: 320px; }
          .mc-cta-inner { grid-template-columns: 1fr; gap: 36px; }
          .mc-nav { padding-left: 24px; padding-right: 24px; }
          .mc-footer { padding-left: 24px; padding-right: 24px; }
        }
        @media (max-width: 900px) {
          .mc-stats-inner { grid-template-columns: repeat(2,1fr); }
          .mc-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.25); padding: 16px 0; }
          .mc-stat:nth-last-child(-n+2) { border-bottom: none; }
          .mc-svc-grid { grid-template-columns: repeat(2,1fr); }
          .mc-team-grid { grid-template-columns: 1fr 1fr; }
          .mc-nav-links { display: none; }
        }
        @media (max-width: 560px) {
          .mc-svc-grid, .mc-team-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`mc-nav${navSolid ? ' mc-solid' : ''}`}>
        <div className="mc-nav-inner">
          <div className="mc-logo" onClick={() => scrollTo('mc-top')}>
            <div className="mc-logo-cross" />
            <div>
              <div className={`mc-logo-name ${sora.className}`}>{store.shopName}</div>
              <div className="mc-logo-sub">Medical Centre</div>
            </div>
          </div>
          <div className="mc-nav-links">
            {[['Services','mc-services'],['About','mc-about'],['Our Doctors','mc-team'],['Contact','mc-contact']].map(([l,id]) => (
              <button key={id} className="mc-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <button className="mc-nav-cta" onClick={() => window.open(waBase,'_blank')}>Book Appointment</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="mc-top" className="mc-hero">
        {/* Decorative dots */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          {CROSS_DOTS.map((d, i) => <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.s} fill="white" opacity={d.op} />)}
        </svg>
        <div className="mc-hero-inner">
          <div>
            <div className="mc-hero-tag"><ShieldCheck size={11} /> Accredited & Trusted</div>
            <h1 className={`mc-hero-h1 ${sora.className}`}>
              Your Health,<br />Our <span>Priority.</span>
            </h1>
            <div className="mc-sky-line" />
            <p className="mc-hero-desc">
              {store.description || 'Comprehensive medical care from diagnosis to treatment. Expert doctors, advanced diagnostics, and genuine care for every patient.'}
            </p>
            <div className="mc-hero-btns">
              <button className="mc-btn-sky" onClick={() => scrollTo('mc-services')}>
                View Services <ArrowRight size={13} />
              </button>
              <button className="mc-btn-ghost" onClick={() => scrollTo('mc-about')}>About the Clinic</button>
            </div>
          </div>
          <div className="mc-pillars">
            {TRUST_PILLARS.map(({ Icon, title, desc }, i) => (
              <div key={i} className="mc-pillar">
                <div className="mc-pillar-icon"><Icon size={18} /></div>
                <div>
                  <div className="mc-pillar-title">{title}</div>
                  <p className="mc-pillar-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="mc-stats" ref={statsRef}>
        <div className="mc-stats-inner">
          {[
            { v: c1, s: '+', l: 'Patients Treated' },
            { v: c2, s: '+', l: 'Years of Excellence' },
            { v: c3, s: '%', l: 'Satisfaction Rate' },
            { v: c4, s: '+', l: 'Medical Specialists' },
          ].map(({ v, s, l }, i) => (
            <div key={i} className="mc-stat" style={up(statsVis, i * 80)}>
              <div className={`mc-stat-num ${sora.className}`}>{v}<span className="mc-stat-sfx">{s}</span></div>
              <div className="mc-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div id="mc-services">
        <div className="mc-wrap" ref={servRef}>
          <div style={up(servVis)}>
            <div className="mc-eyebrow"><Stethoscope size={10} />Medical Services</div>
            <h2 className={`mc-h2 ${sora.className}`}>What We Treat</h2>
          </div>
          <div className="mc-tabs" style={up(servVis, 60)}>
            {categories.map(cat => (
              <button key={cat} className={`mc-tab${category === cat ? ' mc-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="mc-svc-grid">
            {filtered.map((svc, i) => {
              const Icon = SVC_ICONS[i % SVC_ICONS.length];
              const msg = `Hello ${store.shopName}! I'd like to book ${svc.name}.`;
              return (
                <div key={svc.id} className="mc-svc-card" style={up(servVis, 80 + i * 55)}>
                  <div className="mc-svc-icon"><Icon size={18} /></div>
                  <div className="mc-svc-cat">{svc.category}</div>
                  <div className={`mc-svc-price ${sora.className}`}>${svc.price}</div>
                  <div className="mc-svc-name">{svc.name}</div>
                  <p className="mc-svc-desc">{svc.description}</p>
                  <a className="mc-svc-book" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                    Book Now <ArrowRight size={12} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div id="mc-about" className="mc-about-band">
        <div className="mc-wrap" ref={aboutRef}>
          <div className="mc-about-grid">
            <div style={left(aboutVis)}>
              <div className="mc-about-img-wrap">
                <img className="mc-about-img" src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=700&q=80" alt="Clinic" />
                <div className="mc-about-badge">
                  <div className={`mc-badge-n ${sora.className}`}>24</div>
                  <div className="mc-badge-l">Years<br />Established</div>
                </div>
              </div>
            </div>
            <div style={right(aboutVis, 100)}>
              <div className="mc-eyebrow"><Heart size={10} />Our Story</div>
              <h2 className={`mc-h2 ${sora.className}`}>Medicine Built<br />on Trust</h2>
              <p className="mc-about-text" style={{ marginTop: 14 }}>
                {store.shopName} was founded on the belief that exceptional healthcare should be accessible, transparent, and genuinely patient-centred. Over two decades, we've earned the trust of families across the region.
              </p>
              <p className="mc-about-text">
                Our multidisciplinary team combines deep clinical expertise with the warmth and communication patients deserve — so you always understand your health, your options, and your plan.
              </p>
              <div className="mc-why-grid">
                {WHY_US.map((item, i) => (
                  <div key={i} className="mc-why-item">
                    <CheckCircle size={14} className="mc-why-check" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div id="mc-team">
        <div className="mc-wrap" ref={teamRef}>
          <div style={up(teamVis)}>
            <div className="mc-eyebrow"><Heart size={10} />Our Specialists</div>
            <h2 className={`mc-h2 ${sora.className}`}>Meet the Doctors</h2>
          </div>
          <div className="mc-team-grid">
            {DOCTORS.map((d, i) => (
              <div key={i} className="mc-doctor-card" style={up(teamVis, 80 + i * 90)}>
                <div className="mc-doctor-photo"><img src={d.img} alt={d.name} /></div>
                <div className="mc-doctor-body">
                  <div className="mc-doctor-spec">{d.spec}</div>
                  <div className={`mc-doctor-name ${sora.className}`}>{d.name}</div>
                  <div className="mc-doctor-title">{d.title}</div>
                  <div className="mc-doctor-line" />
                  <a className="mc-doctor-wa" href={`${waBase}?text=${encodeURIComponent(`Hi! I'd like to book with ${d.name}.`)}`} target="_blank" rel="noopener noreferrer">
                    Book Appointment <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="mc-test-band" ref={testRef}>
        <div className="mc-test-inner">
          <div style={{ ...up(testVis), textAlign: 'center' }}>
            <div className="mc-eyebrow" style={{ background: 'rgba(46,134,222,0.2)', borderColor: 'rgba(46,134,222,0.3)', margin: '0 auto 10px' }}>
              <Star size={10} />Patient Reviews
            </div>
            <h2 className={`mc-h2 ${sora.className}`} style={{ color: '#fff' }}>What Patients Say</h2>
          </div>
          <div className="mc-test-slider">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`mc-test-card${i === activeT ? ' mc-vis' : ' mc-hid'}`}>
                <div className="mc-t-stars">{Array.from({ length: t.stars }).map((_, s) => <Star key={s} size={14} className="mc-t-star" fill="#FFD166" />)}</div>
                <p className="mc-test-q">&ldquo;{t.quote}&rdquo;</p>
                <div className="mc-test-by">{t.author}</div>
              </div>
            ))}
          </div>
          <div className="mc-t-dots">
            {TESTIMONIALS.map((_, i) => <button key={i} className={`mc-t-dot${i === activeT ? ' mc-t-active' : ''}`} onClick={() => setActiveT(i)} />)}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div id="mc-contact" className="mc-cta-band" ref={ctaRef}>
        <div className="mc-cta-inner">
          <div style={left(ctaVis)}>
            <h2 className={`mc-cta-h2 ${sora.className}`}>
              Ready to Take<br />Control of Your <span>Health?</span>
            </h2>
            <p className="mc-cta-sub">Book your consultation today. Same-day appointments often available for urgent concerns.</p>
          </div>
          <div className="mc-cta-right" style={right(ctaVis, 100)}>
            <a className="mc-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Book via WhatsApp
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {store.openingHours && <div className="mc-cta-detail"><Clock size={13} />{store.openingHours}</div>}
              <div className="mc-cta-detail"><MapPin size={13} />Clinic Location</div>
              {store.whatsappNumber && <div className="mc-cta-detail"><Phone size={13} />{store.whatsappNumber}</div>}
            </div>
          </div>
        </div>
      </div>

      <footer className="mc-footer">
        <div className={`mc-footer-name ${sora.className}`}>{store.shopName}</div>
        <p className="mc-footer-copy">&copy; {new Date().getFullYear()} {store.shopName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
