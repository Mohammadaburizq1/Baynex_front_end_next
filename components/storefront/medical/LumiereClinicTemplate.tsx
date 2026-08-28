'use client';

import { useState, useEffect, useRef } from 'react';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Star, ArrowRight, Clock, MapPin, Phone, CheckCircle,
  Sparkles, Zap, Droplets, Sun, FlaskConical, Heart,
} from 'lucide-react';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], style: ['normal', 'italic'] });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

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

const GRAIN_CELLS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 43 + 7) % 98,
  y: (i * 29 + 11) % 96,
  r: 1 + (i % 3),
  op: 0.03 + (i % 6) * 0.012,
}));

const DOCTORS = [
  { name: 'Dr. Isabelle Laurent', title: 'Medical Director', spec: 'Aesthetic Medicine', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dr. Rami Al-Farsi', title: 'Lead Physician', spec: 'Regenerative Medicine', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dr. Elena Vasquez', title: 'Senior Clinician', spec: 'Laser & Skin Health', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80' },
];

const PILLARS = [
  { Icon: FlaskConical, title: 'Medical Precision', desc: 'Every treatment is clinician-led, evidence-based, and individually prescribed.' },
  { Icon: Sparkles, title: 'Natural Results', desc: 'We believe in subtle enhancement — beauty that is unmistakably you.' },
  { Icon: Heart, title: 'Discreet & Private', desc: 'Total confidentiality, private consultation suites, and zero pressure.' },
  { Icon: CheckCircle, title: 'Aftercare Included', desc: 'All packages include follow-up reviews and complimentary touch-ups.' },
];

const TESTIMONIALS = [
  { quote: 'The most refined and professional clinic experience I have ever had. The results were breathtaking and entirely natural.', author: 'C. Beaumont', stars: 5 },
  { quote: 'I was nervous going in, but the team put me completely at ease. I left feeling genuinely transformed.', author: 'A. Khalid', stars: 5 },
  { quote: 'The level of expertise and artistry here is in a class of its own. My skin has never looked this good.', author: 'D. Rossi', stars: 5 },
];

const SVC_ICONS = [Sparkles, Zap, Droplets, Sun, FlaskConical, Heart];

export default function LumiereClinicTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [navSolid, setNavSolid] = useState(false);
  const [activeT, setActiveT] = useState(0);
  const [category, setCategory] = useState('All');

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: servRef, inView: servVis } = useInView();
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: testRef, inView: testVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(4800, 1400, statsVis);
  const c2 = useCountUp(15, 1100, statsVis);
  const c3 = useCountUp(100, 1200, statsVis);
  const c4 = useCountUp(32, 1000, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waBase = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}`;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const up = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });
  const left = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(-18px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });
  const right = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(18px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });

  return (
    <div className={`lc-root ${jost.className}`}>
      <style>{`
        .lc-root {
          --ivory: #F9F7F4;
          --sand: #EDE9E1;
          --gold: #C4A35A;
          --gold-lt: #D4B470;
          --gold-dk: #9C7E3A;
          --dark: #12100C;
          --mid: #3A3228;
          --body: #6A5E50;
          --muted: #9E9180;
          --border: #DDD5C5;
          background: var(--ivory);
          color: var(--dark);
          min-height: 100vh;
        }

        @keyframes lcWipe {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes lcFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lcShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes lcFloat {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-8px) rotate(0.5deg); }
        }

        /* ─ Nav ─ */
        .lc-nav {
          position: fixed; inset: 0 0 auto; z-index: 100;
          padding: 0 64px;
          transition: background 0.35s, border-color 0.35s;
          border-bottom: 1px solid transparent;
        }
        .lc-nav.lc-solid {
          background: rgba(249,247,244,0.96);
          backdrop-filter: blur(16px);
          border-color: var(--border);
        }
        .lc-nav-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 72px;
        }
        .lc-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .lc-logo-mark {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1.5px solid var(--gold);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .lc-logo-inner {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--gold);
        }
        .lc-logo-name {
          font-size: 20px; font-weight: 600; color: var(--dark);
          letter-spacing: -0.01em;
        }
        .lc-logo-sub { font-size: 8px; font-weight: 500; color: var(--muted); letter-spacing: 0.18em; text-transform: uppercase; margin-top: 1px; }
        .lc-nav-links { display: flex; align-items: center; gap: 28px; }
        .lc-nav-link {
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--body); background: none; border: none;
          cursor: pointer; font-family: inherit; transition: color 0.2s;
        }
        .lc-nav-link:hover { color: var(--gold); }
        .lc-nav-cta {
          padding: 10px 22px; background: var(--dark); color: var(--ivory);
          border: none; font-family: inherit; font-size: 10px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; border-radius: 100px; transition: background 0.2s;
        }
        .lc-nav-cta:hover { background: var(--mid); }

        /* ─ Hero ─ */
        .lc-hero {
          min-height: 100vh;
          background: var(--dark);
          display: flex; align-items: flex-end;
          padding: 0 64px 80px;
          position: relative; overflow: hidden;
        }
        .lc-hero-bg {
          position: absolute; inset: 0;
          background: url('https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1600&q=80') center/cover;
          opacity: 0.25; filter: grayscale(40%);
        }
        .lc-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(18,16,12,0.98) 35%, rgba(18,16,12,0.4) 75%);
        }
        .lc-hero-inner {
          max-width: 1280px; margin: 0 auto; width: 100%;
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 1fr 380px;
          gap: 80px; align-items: flex-end;
        }
        .lc-hero-eyebrow {
          font-size: 10px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 16px;
          animation: lcFadeUp 0.5s ease both 0.2s;
        }
        .lc-hero-h1 {
          font-size: clamp(54px, 7.5vw, 110px); line-height: 0.95;
          letter-spacing: -0.02em; color: var(--ivory); margin: 0 0 20px;
          clip-path: inset(0 100% 0 0);
          animation: lcWipe 1.2s cubic-bezier(0.16,1,0.3,1) both 0.3s;
        }
        .lc-hero-h1 em { font-style: italic; color: var(--gold); }
        .lc-gold-rule {
          width: 48px; height: 1.5px;
          background: linear-gradient(to right, var(--gold), transparent);
          margin-bottom: 18px;
          animation: lcFadeUp 0.6s ease both 1s;
        }
        .lc-hero-desc {
          font-size: 14px; font-weight: 300; line-height: 1.9;
          color: rgba(249,247,244,0.55); max-width: 400px; margin-bottom: 28px;
          animation: lcFadeUp 0.6s ease both 0.9s;
        }
        .lc-hero-btns {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: lcFadeUp 0.6s ease both 1.05s;
        }
        .lc-btn-gold {
          padding: 13px 26px; background: var(--gold); color: var(--dark);
          border: none; font-family: inherit; font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; border-radius: 100px;
          display: flex; align-items: center; gap: 7px;
          transition: background 0.2s, transform 0.2s;
        }
        .lc-btn-gold:hover { background: var(--gold-lt); transform: translateY(-2px); }
        .lc-btn-outline {
          padding: 12px 26px; background: transparent; color: var(--ivory);
          border: 1px solid rgba(249,247,244,0.2); font-family: inherit;
          font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; border-radius: 100px; transition: border-color 0.2s;
        }
        .lc-btn-outline:hover { border-color: rgba(249,247,244,0.5); }
        .lc-hero-stats {
          display: flex; flex-direction: column; gap: 16px;
          padding-bottom: 4px;
          animation: lcFadeUp 0.7s ease both 0.7s;
        }
        .lc-hstat {
          border-left: 1px solid rgba(196,163,90,0.4); padding-left: 18px;
          transition: border-color 0.3s;
        }
        .lc-hstat:hover { border-color: var(--gold); }
        .lc-hstat-num {
          font-size: 30px; font-weight: 300; letter-spacing: -0.02em;
          color: var(--ivory); line-height: 1; margin-bottom: 3px;
        }
        .lc-hstat-num em { font-style: italic; color: var(--gold); font-size: 0.7em; }
        .lc-hstat-label { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(249,247,244,0.4); }

        /* ─ Gold stats band ─ */
        .lc-gold-band { background: var(--gold); padding: 36px 64px; }
        .lc-gold-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .lc-gstat { text-align: center; padding: 0 16px; border-right: 1px solid rgba(18,16,12,0.15); }
        .lc-gstat:last-child { border-right: none; }
        .lc-gstat-num {
          font-size: clamp(34px,4vw,52px); font-weight: 300;
          letter-spacing: -0.02em; line-height: 1;
          color: var(--dark); margin-bottom: 4px;
        }
        .lc-gstat-num em { font-style: italic; }
        .lc-gstat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(18,16,12,0.5); }

        /* ─ Shared ─ */
        .lc-wrap { max-width: 1280px; margin: 0 auto; padding: 100px 64px; }
        .lc-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 9px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 10px;
        }
        .lc-eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--gold); display: block; }
        .lc-h2 {
          font-size: clamp(36px, 4.5vw, 62px);
          line-height: 1.05; letter-spacing: -0.02em;
          color: var(--dark); margin: 0;
        }
        .lc-h2 em { font-style: italic; color: var(--gold); }

        /* ─ Services ─ */
        .lc-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 18px 0 30px; }
        .lc-tab {
          padding: 6px 16px; border-radius: 100px;
          border: 1px solid var(--border);
          background: none; font-family: inherit;
          font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; color: var(--muted); transition: all 0.2s;
        }
        .lc-tab.lc-active { background: var(--dark); color: var(--ivory); border-color: var(--dark); }
        .lc-tab:hover:not(.lc-active) { border-color: var(--gold); color: var(--gold); }
        .lc-svc-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
        .lc-svc-cell {
          background: var(--ivory); padding: 28px 24px;
          position: relative; overflow: hidden;
          transition: background 0.25s;
        }
        .lc-svc-cell::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--gold); transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s ease;
        }
        .lc-svc-cell:hover { background: #fff; }
        .lc-svc-cell:hover::before { transform: scaleX(1); }
        .lc-svc-cell:hover .lc-svc-num { opacity: 1; }
        .lc-svc-num {
          font-size: 60px; font-weight: 300; color: var(--sand);
          position: absolute; bottom: -6px; right: 10px; line-height: 1;
          opacity: 0.6; transition: opacity 0.2s; pointer-events: none;
        }
        .lc-svc-icon { color: var(--gold); margin-bottom: 14px; }
        .lc-svc-cat { font-size: 9px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
        .lc-svc-price { font-size: 22px; font-weight: 300; letter-spacing: -0.02em; color: var(--dark); margin-bottom: 6px; }
        .lc-svc-name { font-size: 16px; font-weight: 600; color: var(--dark); margin-bottom: 8px; line-height: 1.3; }
        .lc-svc-desc { font-size: 12px; font-weight: 300; line-height: 1.75; color: var(--body); margin-bottom: 14px; position: relative; z-index: 1; }
        .lc-svc-book {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--gold); text-decoration: none;
          transition: gap 0.2s, color 0.2s;
        }
        .lc-svc-book:hover { gap: 10px; color: var(--gold-dk); }

        /* ─ About ─ */
        .lc-about-band { background: var(--sand); }
        .lc-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .lc-about-img-wrap { height: 540px; border-radius: 0; overflow: hidden; position: relative; }
        .lc-about-img { width: 100%; height: 100%; object-fit: cover; display: block; animation: lcFloat 8s ease-in-out infinite; }
        .lc-about-badge {
          position: absolute; bottom: 0; right: 0;
          background: var(--dark); padding: 22px 26px;
        }
        .lc-about-badge-n { font-size: 36px; font-weight: 300; color: var(--gold); letter-spacing: -0.02em; line-height: 1; }
        .lc-about-badge-n em { font-style: italic; }
        .lc-about-badge-l { font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(249,247,244,0.4); margin-top: 4px; }
        .lc-about-text { font-size: 15px; font-weight: 300; line-height: 1.9; color: var(--mid); margin-bottom: 14px; }
        .lc-pillars { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
        .lc-pillar {
          border: 1px solid var(--border); background: var(--ivory);
          padding: 16px; border-radius: 0;
          display: flex; flex-direction: column; gap: 8px;
          transition: border-color 0.2s;
        }
        .lc-pillar:hover { border-color: var(--gold); }
        .lc-pillar-icon { color: var(--gold); }
        .lc-pillar-title { font-size: 13px; font-weight: 600; color: var(--dark); }
        .lc-pillar-desc { font-size: 12px; font-weight: 300; color: var(--body); line-height: 1.6; }

        /* ─ Team ─ */
        .lc-team-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px; }
        .lc-doctor-cell {
          position: relative; overflow: hidden;
          height: 440px; cursor: pointer;
        }
        .lc-doctor-img {
          width: 100%; height: 100%; object-fit: cover; object-position: top;
          display: block;
          filter: grayscale(30%) brightness(0.9);
          transition: filter 0.4s, transform 0.4s;
        }
        .lc-doctor-cell:hover .lc-doctor-img { filter: grayscale(0) brightness(0.95); transform: scale(1.04); }
        .lc-doctor-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(18,16,12,0.9) 40%, transparent 75%);
        }
        .lc-doctor-body { position: absolute; bottom: 0; left: 0; right: 0; padding: 22px; }
        .lc-doctor-spec {
          font-size: 9px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 6px;
        }
        .lc-doctor-name { font-size: 20px; font-weight: 600; color: var(--ivory); letter-spacing: -0.01em; margin-bottom: 2px; }
        .lc-doctor-title { font-size: 11px; font-weight: 300; color: rgba(249,247,244,0.5); margin-bottom: 12px; }
        .lc-doctor-wa {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ivory); text-decoration: none;
          border-bottom: 1px solid rgba(249,247,244,0.25); padding-bottom: 2px;
          transition: border-color 0.2s, color 0.2s, gap 0.2s;
        }
        .lc-doctor-wa:hover { color: var(--gold); border-color: var(--gold); gap: 9px; }

        /* ─ Testimonials ─ */
        .lc-test-band { background: var(--dark); }
        .lc-test-inner { max-width: 1280px; margin: 0 auto; padding: 100px 64px; }
        .lc-test-slider { position: relative; min-height: 200px; margin-top: 56px; }
        .lc-test-card {
          position: absolute; inset: 0; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .lc-test-card.lc-vis { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .lc-test-card.lc-hid { opacity: 0; transform: translateY(10px); pointer-events: none; }
        .lc-t-stars { display: flex; gap: 5px; }
        .lc-t-star { color: var(--gold); }
        .lc-test-q {
          font-size: clamp(18px,2.5vw,26px); font-weight: 300; line-height: 1.7; font-style: italic;
          color: rgba(249,247,244,0.75); max-width: 640px;
        }
        .lc-test-by { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); }
        .lc-t-dots { display: flex; gap: 10px; justify-content: center; margin-top: 220px; }
        .lc-t-dot {
          width: 24px; height: 1.5px; background: rgba(249,247,244,0.15);
          border: none; cursor: pointer; transition: background 0.2s, width 0.2s;
        }
        .lc-t-dot.lc-t-active { background: var(--gold); width: 40px; }

        /* ─ CTA ─ */
        .lc-cta-band {
          background: var(--ivory);
          padding: 100px 64px;
        }
        .lc-cta-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
        }
        .lc-cta-h2 {
          font-size: clamp(40px,5.5vw,72px); line-height: 1.05;
          letter-spacing: -0.02em; color: var(--dark); margin-bottom: 14px;
        }
        .lc-cta-h2 em { font-style: italic; color: var(--gold); }
        .lc-cta-sub { font-size: 14px; font-weight: 300; color: var(--body); line-height: 1.85; }
        .lc-cta-right { display: flex; flex-direction: column; gap: 16px; }
        .lc-cta-wa {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 28px; background: var(--dark); color: var(--ivory);
          font-family: inherit; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          border: none; cursor: pointer; text-decoration: none; width: fit-content; border-radius: 100px;
          transition: background 0.2s, transform 0.2s;
        }
        .lc-cta-wa:hover { background: var(--mid); transform: translateY(-2px); }
        .lc-cta-detail { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 300; color: var(--muted); }
        .lc-cta-detail-icon { color: var(--gold); flex-shrink: 0; }

        /* ─ Footer ─ */
        .lc-footer {
          background: var(--dark); padding: 28px 64px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
        }
        .lc-footer-name { font-size: 13px; font-weight: 500; color: rgba(249,247,244,0.2); letter-spacing: 0.06em; }
        .lc-footer-copy { font-size: 10px; color: rgba(249,247,244,0.1); letter-spacing: 0.06em; }

        /* ─ Responsive ─ */
        @media (max-width: 1100px) {
          .lc-hero { padding: 100px 24px 72px; }
          .lc-hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .lc-hero-stats { flex-direction: row; }
          .lc-nav, .lc-gold-band, .lc-cta-band, .lc-footer { padding-left: 24px; padding-right: 24px; }
          .lc-wrap, .lc-test-inner { padding-left: 24px; padding-right: 24px; }
          .lc-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .lc-about-img-wrap { height: 340px; }
          .lc-cta-inner { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 900px) {
          .lc-gold-inner { grid-template-columns: repeat(2,1fr); }
          .lc-gstat { border-right: none; border-bottom: 1px solid rgba(18,16,12,0.15); padding: 16px 0; }
          .lc-gstat:nth-last-child(-n+2) { border-bottom: none; }
          .lc-svc-grid { grid-template-columns: repeat(2,1fr); }
          .lc-team-grid { grid-template-columns: 1fr 1fr; }
          .lc-nav-links { display: none; }
          .lc-pillars { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .lc-svc-grid, .lc-team-grid { grid-template-columns: 1fr; }
          .lc-hero-stats { flex-direction: column; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`lc-nav${navSolid ? ' lc-solid' : ''}`}>
        <div className="lc-nav-inner">
          <div className="lc-logo" onClick={() => scrollTo('lc-top')}>
            <div className="lc-logo-mark"><div className="lc-logo-inner" /></div>
            <div>
              <div className={`lc-logo-name ${cormorant.className}`}>{store.shopName}</div>
              <div className="lc-logo-sub">Aesthetic Clinic</div>
            </div>
          </div>
          <div className="lc-nav-links">
            {[['Treatments','lc-services'],['About','lc-about'],['Our Doctors','lc-team'],['Contact','lc-contact']].map(([l,id]) => (
              <button key={id} className="lc-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <button className="lc-nav-cta" onClick={() => window.open(waBase,'_blank')}>Book Consultation</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="lc-top" className="lc-hero">
        <div className="lc-hero-bg" />
        <div className="lc-hero-overlay" />
        {/* Grain dots */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          {GRAIN_CELLS.map((d, i) => <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.r} fill="#C4A35A" opacity={d.op} />)}
        </svg>
        <div className="lc-hero-inner">
          <div>
            <div className="lc-hero-eyebrow">Lumiere — Private Aesthetic Clinic</div>
            <h1 className={`lc-hero-h1 ${cormorant.className}`}>
              Beauty<br />Without<br /><em>Compromise.</em>
            </h1>
            <div className="lc-gold-rule" />
            <p className="lc-hero-desc">
              {tc?.heroDescription || store.description || 'Clinician-led aesthetic treatments combining medical precision with an artist\'s eye. Subtle, natural, transformative.'}
            </p>
            <div className="lc-hero-btns">
              <button className="lc-btn-gold" onClick={() => scrollTo('lc-services')}>
                View Treatments <ArrowRight size={12} />
              </button>
              <button className="lc-btn-outline" onClick={() => scrollTo('lc-about')}>Our Philosophy</button>
            </div>
          </div>
          <div className="lc-hero-stats" ref={statsRef}>
            {[
              { v: c1, sfx: <em>+</em>, label: 'Treatments Performed' },
              { v: c2, sfx: <em>+</em>, label: 'Years in Practice' },
              { v: c4, sfx: <em>+</em>, label: 'Awards & Accreditations' },
            ].map((s, i) => (
              <div key={i} className="lc-hstat">
                <div className={`lc-hstat-num ${cormorant.className}`}>{s.v}{s.sfx}</div>
                <div className="lc-hstat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GOLD STATS ── */}
      <div className="lc-gold-band">
        <div className="lc-gold-inner">
          {[
            { v: c1, s: '+', l: 'Treatments Performed' },
            { v: c2, s: '+', l: 'Years of Excellence' },
            { v: c3, s: '%', l: 'Client Satisfaction' },
            { v: c4, s: '+', l: 'Industry Accreditations' },
          ].map(({ v, s, l }, i) => (
            <div key={i} className="lc-gstat" style={up(statsVis, i * 80)}>
              <div className={`lc-gstat-num ${cormorant.className}`}><em>{v}</em><span style={{ fontSize: '0.55em' }}>{s}</span></div>
              <div className="lc-gstat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TREATMENTS ── */}
      <div id="lc-services">
        <div className="lc-wrap" ref={servRef}>
          <div style={up(servVis)}>
            <div className="lc-eyebrow">Our Treatments</div>
            <h2 className={`lc-h2 ${cormorant.className}`}>What We Offer</h2>
          </div>
          <div className="lc-tabs" style={up(servVis, 60)}>
            {categories.map(cat => (
              <button key={cat} className={`lc-tab${category === cat ? ' lc-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="lc-svc-grid">
            {filtered.map((svc, i) => {
              const Icon = SVC_ICONS[i % SVC_ICONS.length];
              const msg = `Hello ${store.shopName}! I'd like to enquire about ${svc.name}.`;
              return (
                <div key={svc.id} className="lc-svc-cell" style={up(servVis, 80 + i * 50)}>
                  <div className={`lc-svc-num ${cormorant.className}`}>0{i + 1}</div>
                  <div className="lc-svc-icon"><Icon size={20} /></div>
                  <div className="lc-svc-cat">{svc.category}</div>
                  <div className={`lc-svc-price ${cormorant.className}`}>From ${svc.price}</div>
                  <div className={`lc-svc-name ${cormorant.className}`}>{svc.name}</div>
                  <p className="lc-svc-desc">{svc.description}</p>
                  <a className="lc-svc-book" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                    Enquire <ArrowRight size={11} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div id="lc-about" className="lc-about-band">
        <div className="lc-wrap" ref={aboutRef}>
          <div className="lc-about-grid">
            <div style={left(aboutVis)}>
              <div className="lc-about-img-wrap">
                <img className="lc-about-img" src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=700&q=80" alt="Clinic" />
                <div className="lc-about-badge">
                  <div className={`lc-about-badge-n ${cormorant.className}`}><em>15</em></div>
                  <div className="lc-about-badge-l">Years of<br />Excellence</div>
                </div>
              </div>
            </div>
            <div style={right(aboutVis, 100)}>
              <div className="lc-eyebrow">Our Philosophy</div>
              <h2 className={`lc-h2 ${cormorant.className}`}>Medicine<br />Meets <em>Art.</em></h2>
              <p className="lc-about-text" style={{ marginTop: 14 }}>
                At {store.shopName}, we believe that the finest aesthetic outcomes come from the intersection of rigorous medical training and a refined aesthetic sensibility. Every treatment is a considered, bespoke intervention.
              </p>
              <p className="lc-about-text">
                Our philosophy is subtlety. We enhance what is already there — we do not replace it. Our patients leave looking like themselves, only better.
              </p>
              <div className="lc-pillars">
                {PILLARS.map(({ Icon, title, desc }, i) => (
                  <div key={i} className="lc-pillar">
                    <div className="lc-pillar-icon"><Icon size={16} /></div>
                    <div className="lc-pillar-title">{title}</div>
                    <p className="lc-pillar-desc">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div id="lc-team">
        <div className="lc-wrap" ref={teamRef}>
          <div style={up(teamVis)}>
            <div className="lc-eyebrow">The Clinic</div>
            <h2 className={`lc-h2 ${cormorant.className}`}>Our Doctors</h2>
          </div>
          <div className="lc-team-grid">
            {DOCTORS.map((d, i) => (
              <div key={i} className="lc-doctor-cell" style={up(teamVis, 80 + i * 90)}>
                <img className="lc-doctor-img" src={d.img} alt={d.name} />
                <div className="lc-doctor-overlay" />
                <div className="lc-doctor-body">
                  <div className="lc-doctor-spec">{d.spec}</div>
                  <div className={`lc-doctor-name ${cormorant.className}`}>{d.name}</div>
                  <div className="lc-doctor-title">{d.title}</div>
                  <a className="lc-doctor-wa" href={`${waBase}?text=${encodeURIComponent(`Hi, I'd like to book a consultation with ${d.name}.`)}`} target="_blank" rel="noopener noreferrer">
                    Book <ArrowRight size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="lc-test-band" ref={testRef}>
        <div className="lc-test-inner">
          <div style={{ ...up(testVis), textAlign: 'center' }}>
            <div className="lc-eyebrow" style={{ margin: '0 auto 10px', justifyContent: 'center' }}>Client Voices</div>
            <h2 className={`lc-h2 ${cormorant.className}`} style={{ color: 'var(--ivory)' }}>What They Say</h2>
          </div>
          <div className="lc-test-slider">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`lc-test-card${i === activeT ? ' lc-vis' : ' lc-hid'}`}>
                <div className="lc-t-stars">{Array.from({ length: t.stars }).map((_, s) => <Star key={s} size={14} className="lc-t-star" fill="var(--gold)" />)}</div>
                <p className={`lc-test-q ${cormorant.className}`}>&ldquo;{t.quote}&rdquo;</p>
                <div className="lc-test-by">{t.author}</div>
              </div>
            ))}
          </div>
          <div className="lc-t-dots">
            {TESTIMONIALS.map((_, i) => <button key={i} className={`lc-t-dot${i === activeT ? ' lc-t-active' : ''}`} onClick={() => setActiveT(i)} />)}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div id="lc-contact" className="lc-cta-band" ref={ctaRef}>
        <div className="lc-cta-inner">
          <div style={left(ctaVis)}>
            <h2 className={`lc-cta-h2 ${cormorant.className}`}>
              Begin Your<br /><em>Transformation.</em>
            </h2>
            <p className="lc-cta-sub">Every journey begins with a consultation. Book yours today — complimentary, no obligation, entirely confidential.</p>
          </div>
          <div className="lc-cta-right" style={right(ctaVis, 100)}>
            <a className="lc-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Book a Consultation
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {(tc?.openingHours || store.openingHours) && <div className="lc-cta-detail"><Clock size={13} className="lc-cta-detail-icon" />{tc?.openingHours || store.openingHours}</div>}
              <div className="lc-cta-detail"><MapPin size={13} className="lc-cta-detail-icon" />Private Clinic Location</div>
              {store.whatsappNumber && <div className="lc-cta-detail"><Phone size={13} className="lc-cta-detail-icon" />{store.whatsappNumber}</div>}
            </div>
          </div>
        </div>
      </div>

      <footer className="lc-footer">
        <div className={`lc-footer-name ${cormorant.className}`}>{store.shopName}</div>
        <p className="lc-footer-copy">&copy; {new Date().getFullYear()} {store.shopName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
