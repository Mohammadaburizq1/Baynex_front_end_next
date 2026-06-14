'use client';

import { useState, useEffect, useRef } from 'react';
import { Playfair_Display, Raleway } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Home as HomeIcon, TrendingUp, Key, BarChart2,
  Award, Shield, Clock, Users, MapPin, Phone,
  BedDouble, Bath, Maximize2, ArrowRight, Star, Quote,
} from 'lucide-react';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], style: ['normal', 'italic'] });
const raleway = Raleway({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

function formatPrice(p: number): string {
  if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(1)}M`;
  if (p >= 1_000) return `$${Math.round(p / 1_000)}K`;
  return `$${p.toLocaleString()}`;
}

function parseSpecs(desc: string) {
  return { specs: desc.split(' · ').slice(0, 3) };
}

function SpecIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  if (l.includes('bed')) return <BedDouble size={12} />;
  if (l.includes('bath')) return <Bath size={12} />;
  return <Maximize2 size={12} />;
}

function useInView(threshold = 0.18) {
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

const AGENTS = [
  { name: 'Isabella Martín', title: 'Senior Partner', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', sales: 190 },
  { name: 'Rafael Osei', title: 'Luxury Specialist', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', sales: 142 },
  { name: 'Camille Durand', title: 'Investment Director', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', sales: 114 },
];

const SERVICES = [
  { Icon: HomeIcon, title: 'Residential Sales', desc: 'From compact city apartments to sprawling coastal villas — we market every home with equal passion.' },
  { Icon: TrendingUp, title: 'Portfolio Growth', desc: 'Strategic investment advice grounded in deep local knowledge and long-term market trends.' },
  { Icon: Key, title: 'Property Management', desc: 'Full-service management: tenants, maintenance, and returns — all handled for you.' },
  { Icon: BarChart2, title: 'Market Appraisals', desc: 'Honest, data-backed valuations that reflect what your property will genuinely achieve.' },
  { Icon: Award, title: 'Exclusive Listings', desc: 'Access off-market properties through our private network before they reach the open market.' },
  { Icon: Users, title: 'Relocation Services', desc: 'Seamless moves for international clients — from area guides to school enrolments.' },
];

const TESTIMONIALS = [
  { quote: 'Soleil didn\'t just sell our house — they created a campaign around it. The result was $180K above asking.', author: 'Laurent & Marie-Claire V.', location: 'Sold in 12 days' },
  { quote: 'As an overseas investor, I needed someone I could trust completely. Soleil managed every detail across three properties.', author: 'James Kwon', location: 'Investment client' },
  { quote: 'The most elegant and professional real estate experience we\'ve ever had. We wouldn\'t use anyone else.', author: 'Dr. Priya Anand', location: 'Purchased coastal villa' },
];

export default function SoleilEstatesTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const [category, setCategory] = useState('All');
  const [navSolid, setNavSolid] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: svcRef, inView: svcVis } = useInView();
  const { ref: propsRef, inView: propsVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: testimonialsRef, inView: testimonialsVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(380, 1400, statsVis);
  const c2 = useCountUp(24, 1200, statsVis);
  const c3 = useCountUp(2, 900, statsVis);
  const c4 = useCountUp(98, 1300, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waBase = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}`;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const fadeUp = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });

  const fadeLeft = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(-28px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });

  const fadeRight = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(28px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });

  return (
    <div className={`sl-root ${raleway.className}`}>
      <style>{`
        .sl-root {
          --teal: #0D4F5C;
          --teal-mid: #1A6B7C;
          --teal-light: #D6EBF0;
          --gold: #D4A853;
          --gold-light: #EAC97A;
          --cream: #FEFCF8;
          --sand: #F5EDDE;
          --dark: #071520;
          --body: #3A4A52;
          --muted: #7A8A90;
          --border: #DDD5C4;
          background: var(--cream);
          color: var(--dark);
          min-height: 100vh;
        }

        @keyframes clipLeft {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }

        /* ── Nav ── */
        .sl-nav {
          position: fixed;
          inset: 0 0 auto;
          z-index: 100;
          padding: 0 64px;
          transition: background 0.4s, box-shadow 0.4s;
        }
        .sl-nav.sl-solid {
          background: rgba(254,252,248,0.95);
          backdrop-filter: blur(14px);
          box-shadow: 0 1px 0 rgba(13,79,92,0.1);
        }
        .sl-nav-inner {
          max-width: 1320px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }
        .sl-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .sl-logo-mark {
          width: 36px;
          height: 36px;
          border: 2px solid var(--teal);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .sl-logo-mark::after {
          content: '';
          width: 14px;
          height: 14px;
          background: var(--gold);
          border-radius: 50%;
        }
        .sl-logo-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--teal);
          letter-spacing: 0.02em;
        }
        .sl-logo-sub {
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 1px;
        }
        .sl-nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
        }
        .sl-nav-link {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--body);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.2s;
        }
        .sl-nav-link:hover { color: var(--teal); }
        .sl-nav-cta {
          padding: 10px 22px;
          background: var(--teal);
          color: var(--cream);
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          border-radius: 2px;
          transition: background 0.2s;
        }
        .sl-nav-cta:hover { background: var(--teal-mid); }

        /* ── Hero ── */
        .sl-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .sl-hero-left {
          background: var(--teal);
          padding: 110px 64px 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .sl-hero-left::before {
          content: '';
          position: absolute;
          bottom: -80px;
          right: -80px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          border: 1px solid rgba(212,168,83,0.15);
        }
        .sl-hero-left::after {
          content: '';
          position: absolute;
          bottom: -40px;
          right: -40px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(212,168,83,0.1);
        }
        .sl-hero-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 22px;
          animation: fadeUp 0.7s ease both 0.2s;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sl-hero-h1 {
          font-size: clamp(44px, 5vw, 76px);
          line-height: 1.05;
          color: var(--cream);
          margin: 0 0 28px;
          letter-spacing: -0.01em;
          clip-path: inset(0 100% 0 0);
          animation: clipLeft 1.1s cubic-bezier(0.22,1,0.36,1) both 0.35s;
        }
        .sl-hero-h1 em {
          font-style: italic;
          color: var(--gold);
        }
        .sl-hero-gold-line {
          width: 48px;
          height: 3px;
          background: var(--gold);
          margin-bottom: 24px;
          animation: slideRight 0.8s ease both 0.9s;
        }
        .sl-hero-desc {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.85;
          color: rgba(254,252,248,0.6);
          max-width: 380px;
          margin-bottom: 36px;
          animation: fadeUp 0.7s ease both 0.8s;
        }
        .sl-hero-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          animation: fadeUp 0.7s ease both 1s;
        }
        .sl-btn-gold {
          padding: 14px 28px;
          background: var(--gold);
          color: var(--dark);
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, transform 0.2s;
        }
        .sl-btn-gold:hover { background: var(--gold-light); transform: translateY(-2px); }
        .sl-btn-outline {
          padding: 14px 28px;
          background: transparent;
          color: var(--cream);
          border: 1px solid rgba(254,252,248,0.3);
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          border-radius: 2px;
          transition: border-color 0.2s, color 0.2s;
        }
        .sl-btn-outline:hover { border-color: var(--gold); color: var(--gold); }
        .sl-hero-right {
          position: relative;
          overflow: hidden;
        }
        .sl-hero-right img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .sl-hero-pill {
          position: absolute;
          bottom: 40px;
          right: 40px;
          background: var(--cream);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 4px;
          box-shadow: 0 8px 32px rgba(7,21,32,0.18);
          animation: scaleIn 0.6s ease both 1.1s;
        }
        .sl-pill-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--gold);
          animation: floatY 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        .sl-pill-num {
          font-size: 22px;
          font-weight: 700;
          color: var(--teal);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .sl-pill-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 2px;
        }

        /* ── Stats ── */
        .sl-stats {
          background: var(--sand);
          padding: 56px 64px;
          border-top: 3px solid var(--gold);
        }
        .sl-stats-inner {
          max-width: 1320px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 0;
        }
        .sl-stat {
          padding: 0 32px;
          border-right: 1px solid var(--border);
          text-align: center;
        }
        .sl-stat:last-child { border-right: none; }
        .sl-stat-num {
          font-size: clamp(40px,4.5vw,60px);
          font-weight: 700;
          color: var(--teal);
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .sl-stat-sfx { color: var(--gold); }
        .sl-stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* ── Shared section ── */
        .sl-wrap {
          max-width: 1320px;
          margin: 0 auto;
          padding: 96px 64px;
        }
        .sl-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sl-eyebrow::before {
          content: '';
          width: 24px;
          height: 2px;
          background: var(--gold);
        }
        .sl-h2 {
          font-size: clamp(30px,3.5vw,50px);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 8px;
          color: var(--dark);
        }

        /* ── About ── */
        .sl-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        .sl-about-imgs {
          position: relative;
          height: 520px;
        }
        .sl-about-img-main {
          position: absolute;
          top: 0;
          left: 0;
          right: 80px;
          bottom: 80px;
          border-radius: 4px;
          overflow: hidden;
        }
        .sl-about-img-main img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .sl-about-img-accent {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 200px;
          height: 200px;
          border-radius: 4px;
          overflow: hidden;
          border: 4px solid var(--cream);
          box-shadow: 0 8px 32px rgba(7,21,32,0.15);
        }
        .sl-about-img-accent img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .sl-about-teal-strip {
          position: absolute;
          top: 32px;
          left: -6px;
          width: 6px;
          height: 160px;
          background: var(--gold);
          border-radius: 0 2px 2px 0;
        }
        .sl-about-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--teal);
          color: var(--cream);
          padding: 10px 14px;
          text-align: center;
          border-radius: 3px;
        }
        .sl-badge-num {
          font-size: 26px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .sl-badge-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(254,252,248,0.6);
          margin-top: 2px;
        }
        .sl-about-text p {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.9;
          color: var(--body);
          margin-bottom: 14px;
        }
        .sl-about-bullets {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 20px 0 28px;
        }
        .sl-about-bullet {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          font-weight: 500;
          color: var(--body);
        }
        .sl-about-bullet::before {
          content: '';
          width: 18px;
          height: 2px;
          background: var(--gold);
          flex-shrink: 0;
        }
        .sl-text-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--teal);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: gap 0.2s, color 0.2s;
        }
        .sl-text-link:hover { gap: 14px; color: var(--gold); }

        /* ── Services ── */
        .sl-svc-band {
          background: var(--teal);
          position: relative;
          overflow: hidden;
        }
        .sl-svc-band::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -120px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: rgba(212,168,83,0.06);
        }
        .sl-svc-band::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(212,168,83,0.04);
        }
        .sl-svc-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 96px 64px;
          position: relative;
        }
        .sl-svc-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 24px;
          margin-top: 48px;
        }
        .sl-svc-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(212,168,83,0.18);
          padding: 28px;
          border-radius: 4px;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
          position: relative;
          overflow: hidden;
        }
        .sl-svc-card::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gold);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .sl-svc-card:hover { background: rgba(255,255,255,0.1); border-color: rgba(212,168,83,0.4); transform: translateY(-3px); }
        .sl-svc-card:hover::before { transform: scaleX(1); }
        .sl-svc-icon {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(212,168,83,0.35);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold);
          margin-bottom: 16px;
          transition: background 0.25s;
        }
        .sl-svc-card:hover .sl-svc-icon { background: rgba(212,168,83,0.12); }
        .sl-svc-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--cream);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .sl-svc-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: rgba(254,252,248,0.5);
        }

        /* ── Properties ── */
        .sl-tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid var(--border);
          margin-bottom: 36px;
          margin-top: 20px;
        }
        .sl-tab {
          padding: 10px 20px;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          color: var(--muted);
          position: relative;
          transition: color 0.2s;
        }
        .sl-tab.sl-active { color: var(--teal); }
        .sl-tab.sl-active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gold);
        }
        .sl-tab:hover:not(.sl-active) { color: var(--body); }
        .sl-prop-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 20px;
        }
        .sl-prop-card {
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--cream);
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .sl-prop-card:hover {
          box-shadow: 0 12px 40px rgba(13,79,92,0.12);
          transform: translateY(-4px);
        }
        .sl-prop-img-wrap {
          height: 200px;
          overflow: hidden;
          position: relative;
        }
        .sl-prop-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s;
        }
        .sl-prop-card:hover .sl-prop-img { transform: scale(1.06); }
        .sl-prop-cat {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--teal);
          color: var(--cream);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 2px;
        }
        .sl-prop-body { padding: 18px; }
        .sl-prop-price {
          font-size: 24px;
          font-weight: 700;
          color: var(--teal);
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .sl-prop-name {
          font-size: 13px;
          font-weight: 400;
          color: var(--body);
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .sl-prop-specs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          padding: 10px 0;
          border-top: 1px solid var(--border);
          margin-bottom: 12px;
        }
        .sl-prop-spec {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
        }
        .sl-prop-wa {
          display: block;
          width: 100%;
          padding: 10px;
          background: var(--teal);
          color: var(--cream);
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 2px;
          transition: background 0.2s;
        }
        .sl-prop-wa:hover { background: var(--teal-mid); }

        /* ── Team ── */
        .sl-team-band { background: var(--sand); }
        .sl-team-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 24px;
          margin-top: 48px;
        }
        .sl-agent-card {
          background: var(--cream);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid var(--border);
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .sl-agent-card:hover { box-shadow: 0 10px 32px rgba(13,79,92,0.1); transform: translateY(-4px); }
        .sl-agent-photo-wrap {
          height: 260px;
          overflow: hidden;
          position: relative;
        }
        .sl-agent-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          display: block;
          transition: transform 0.5s;
        }
        .sl-agent-card:hover .sl-agent-photo { transform: scale(1.05); }
        .sl-agent-teal-bar {
          height: 4px;
          background: linear-gradient(to right, var(--teal), var(--gold));
        }
        .sl-agent-body { padding: 18px; }
        .sl-agent-name {
          font-size: 19px;
          font-weight: 700;
          color: var(--dark);
          letter-spacing: -0.01em;
          margin-bottom: 3px;
        }
        .sl-agent-role {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 12px;
        }
        .sl-agent-sales {
          font-size: 13px;
          color: var(--body);
          padding-top: 10px;
          border-top: 1px solid var(--border);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sl-agent-wa {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--teal);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s, gap 0.2s;
        }
        .sl-agent-wa:hover { color: var(--gold); gap: 10px; }

        /* ── Testimonials ── */
        .sl-testimonials-band { background: var(--cream); }
        .sl-testimonials-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 96px 64px;
        }
        .sl-testimonials-track {
          position: relative;
          height: 200px;
          margin-top: 48px;
        }
        .sl-testimonial {
          position: absolute;
          inset: 0;
          transition: opacity 0.6s ease, transform 0.6s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }
        .sl-testimonial.sl-t-active { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .sl-testimonial.sl-t-hidden { opacity: 0; transform: translateY(12px); pointer-events: none; }
        .sl-testimonial-quote {
          font-size: 17px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--body);
          max-width: 680px;
        }
        .sl-testimonial-author {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--teal);
        }
        .sl-testimonial-loc {
          font-size: 11px;
          color: var(--muted);
          margin-top: 2px;
        }
        .sl-testimonial-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 228px;
        }
        .sl-t-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--border);
          cursor: pointer;
          transition: background 0.25s;
          border: none;
        }
        .sl-t-dot.sl-t-dot-active { background: var(--gold); }
        .sl-quote-icon {
          color: var(--gold);
          opacity: 0.4;
        }

        /* ── CTA ── */
        .sl-cta-band {
          background: var(--dark);
          padding: 96px 64px;
          position: relative;
          overflow: hidden;
        }
        .sl-cta-band::before {
          content: '';
          position: absolute;
          right: -100px;
          top: -100px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%);
        }
        .sl-cta-inner {
          max-width: 1320px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
        }
        .sl-cta-h2 {
          font-size: clamp(40px,5vw,68px);
          line-height: 1.05;
          color: var(--cream);
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }
        .sl-cta-h2 em { color: var(--gold); }
        .sl-cta-sub {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(254,252,248,0.5);
        }
        .sl-cta-right { display: flex; flex-direction: column; gap: 18px; }
        .sl-cta-wa {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 18px 32px;
          background: var(--gold);
          color: var(--dark);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-decoration: none;
          border-radius: 2px;
          width: fit-content;
          transition: background 0.2s, transform 0.2s;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .sl-cta-wa:hover { background: var(--gold-light); transform: translateY(-2px); }
        .sl-cta-detail {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(254,252,248,0.4);
        }

        /* ── Footer ── */
        .sl-footer {
          background: #040E14;
          padding: 36px 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .sl-footer-name {
          font-size: 16px;
          font-weight: 700;
          color: rgba(254,252,248,0.4);
          letter-spacing: 0.04em;
        }
        .sl-footer-copy {
          font-size: 11px;
          color: rgba(254,252,248,0.18);
          letter-spacing: 0.06em;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .sl-hero { grid-template-columns: 1fr; min-height: auto; }
          .sl-hero-left { padding: 100px 32px 60px; }
          .sl-hero-right { height: 380px; }
          .sl-nav, .sl-stats, .sl-cta-band, .sl-footer { padding-left: 24px; padding-right: 24px; }
          .sl-wrap, .sl-svc-inner, .sl-testimonials-inner { padding-left: 24px; padding-right: 24px; }
          .sl-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .sl-about-imgs { height: 320px; }
          .sl-cta-inner { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 860px) {
          .sl-stats-inner { grid-template-columns: repeat(2,1fr); gap: 0; }
          .sl-stat { border: none; border-bottom: 1px solid var(--border); padding: 20px 12px; }
          .sl-stat:nth-last-child(-n+2) { border-bottom: none; }
          .sl-svc-grid { grid-template-columns: repeat(2,1fr); }
          .sl-prop-grid { grid-template-columns: repeat(2,1fr); }
          .sl-team-grid { grid-template-columns: 1fr 1fr; }
          .sl-nav-links { display: none; }
          .sl-footer { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 560px) {
          .sl-svc-grid, .sl-prop-grid, .sl-team-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`sl-nav${navSolid ? ' sl-solid' : ''}`}>
        <div className="sl-nav-inner">
          <div className="sl-logo" onClick={() => scrollTo('sl-top')}>
            <div className="sl-logo-mark" />
            <div>
              <div className={`sl-logo-name ${playfair.className}`}>{store.shopName}</div>
              <div className="sl-logo-sub">Estates</div>
            </div>
          </div>
          <div className="sl-nav-links">
            {[['About','sl-about'],['Services','sl-services'],['Properties','sl-properties'],['Contact','sl-contact']].map(([l,id]) => (
              <button key={id} className="sl-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <button className="sl-nav-cta" onClick={() => window.open(waBase,'_blank')}>Enquire</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="sl-top" className="sl-hero">
        <div className="sl-hero-left">
          <p className="sl-hero-eyebrow">Luxury Property Specialists</p>
          <h1 className={`sl-hero-h1 ${playfair.className}`}>
            Find Your<br /><em>Perfect</em><br />Home.
          </h1>
          <div className="sl-hero-gold-line" />
          <p className="sl-hero-desc">
            {store.description || 'Two decades of expertise placing discerning clients in exceptional properties across the region and beyond.'}
          </p>
          <div className="sl-hero-btns">
            <button className="sl-btn-gold" onClick={() => scrollTo('sl-properties')}>
              View Listings <ArrowRight size={14} />
            </button>
            <button className="sl-btn-outline" onClick={() => scrollTo('sl-about')}>Our Story</button>
          </div>
        </div>
        <div className="sl-hero-right">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80" alt="Property" />
          <div className="sl-hero-pill">
            <div className="sl-pill-dot" />
            <div>
              <div className={`sl-pill-num ${playfair.className}`}>380+</div>
              <div className="sl-pill-label">Active Listings</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="sl-stats" ref={statsRef}>
        <div className="sl-stats-inner">
          {[
            { v: c1, s: '+', l: 'Properties Sold' },
            { v: c2, s: ' yrs', l: 'Market Experience' },
            { v: c3, s: 'B+', l: 'In Total Sales', pre: '$' },
            { v: c4, s: '%', l: 'Client Retention' },
          ].map(({ v, s, l, pre }, i) => (
            <div key={i} className="sl-stat" style={fadeUp(statsVis, i * 80)}>
              <div className={`sl-stat-num ${playfair.className}`}>
                {pre}{v}<span className="sl-stat-sfx">{s}</span>
              </div>
              <div className="sl-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div id="sl-about">
        <div className="sl-wrap" ref={aboutRef}>
          <div className="sl-about-grid">
            <div className="sl-about-imgs" style={fadeLeft(aboutVis)}>
              <div className="sl-about-img-main">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" alt="Office" />
              </div>
              <div className="sl-about-teal-strip" />
              <div className="sl-about-img-accent">
                <img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=400&q=80" alt="Property" />
              </div>
              <div className="sl-about-badge">
                <div className={`sl-badge-num ${playfair.className}`}>24+</div>
                <div className="sl-badge-label">Years of<br/>Excellence</div>
              </div>
            </div>
            <div style={fadeRight(aboutVis, 100)}>
              <div className="sl-eyebrow">About Us</div>
              <h2 className={`sl-h2 ${playfair.className}`}>More Than a Transaction.</h2>
              <div style={{ marginTop: 16 }}>
                <p className="sl-about-text" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.9, color: 'var(--body)', marginBottom: 12 }}>
                  Since 2000, {store.shopName} has guided thousands of clients through some of the most important decisions of their lives. We don't rush relationships — we build them.
                </p>
                <p className="sl-about-text" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.9, color: 'var(--body)' }}>
                  Our team blends deep local expertise with a global perspective, giving you access to opportunities others simply don't see.
                </p>
              </div>
              <div className="sl-about-bullets">
                {['Off-market access through our private network','Bespoke marketing for every property','Transparent pricing, always','International buyer reach'].map(b => (
                  <div key={b} className="sl-about-bullet">{b}</div>
                ))}
              </div>
              <button className="sl-text-link" onClick={() => scrollTo('sl-contact')}>
                Start a conversation <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div id="sl-services" className="sl-svc-band" ref={svcRef}>
        <div className="sl-svc-inner">
          <div style={fadeUp(svcVis)}>
            <div className="sl-eyebrow" style={{ color: 'rgba(212,168,83,0.8)' }}>What We Offer</div>
            <h2 className={`sl-h2 ${playfair.className}`} style={{ color: 'var(--cream)' }}>Our Services</h2>
          </div>
          <div className="sl-svc-grid">
            {SERVICES.map(({ Icon, title, desc }, i) => (
              <div key={i} className="sl-svc-card" style={fadeUp(svcVis, 80 + i * 70)}>
                <div className="sl-svc-icon"><Icon size={18} /></div>
                <div className={`sl-svc-title ${playfair.className}`}>{title}</div>
                <p className="sl-svc-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROPERTIES ── */}
      <div id="sl-properties">
        <div className="sl-wrap" ref={propsRef}>
          <div style={fadeUp(propsVis)}>
            <div className="sl-eyebrow">Featured Listings</div>
            <h2 className={`sl-h2 ${playfair.className}`}>Available Properties</h2>
          </div>
          <div className="sl-tabs" style={fadeUp(propsVis, 60)}>
            {categories.map(cat => (
              <button key={cat} className={`sl-tab${category === cat ? ' sl-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="sl-prop-grid">
            {filtered.map((prop, i) => {
              const { specs } = parseSpecs(prop.description);
              const msg = `Hello ${store.shopName}! I'm enquiring about ${prop.name} at ${formatPrice(prop.price)}.`;
              return (
                <div key={prop.id} className="sl-prop-card" style={fadeUp(propsVis, 80 + i * 60)}>
                  <div className="sl-prop-img-wrap">
                    <img className="sl-prop-img" src={prop.imageUrl ?? ''} alt={prop.name} />
                    <span className="sl-prop-cat">{prop.category}</span>
                  </div>
                  <div className="sl-prop-body">
                    <div className={`sl-prop-price ${playfair.className}`}>{formatPrice(prop.price)}</div>
                    <div className="sl-prop-name">{prop.name}</div>
                    <div className="sl-prop-specs">
                      {specs.map((s, si) => <span key={si} className="sl-prop-spec"><SpecIcon label={s} />{s}</span>)}
                    </div>
                    <a className="sl-prop-wa" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                      Enquire via WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div className="sl-team-band" ref={teamRef}>
        <div className="sl-wrap">
          <div style={fadeUp(teamVis)}>
            <div className="sl-eyebrow">Our People</div>
            <h2 className={`sl-h2 ${playfair.className}`}>Meet the Team</h2>
          </div>
          <div className="sl-team-grid">
            {AGENTS.map((a, i) => (
              <div key={i} className="sl-agent-card" style={fadeUp(teamVis, 80 + i * 90)}>
                <div className="sl-agent-photo-wrap">
                  <img className="sl-agent-photo" src={a.img} alt={a.name} />
                </div>
                <div className="sl-agent-teal-bar" />
                <div className="sl-agent-body">
                  <div className={`sl-agent-name ${playfair.className}`}>{a.name}</div>
                  <div className="sl-agent-role">{a.title}</div>
                  <div className="sl-agent-sales">
                    <Star size={12} color="var(--gold)" />
                    <span>{a.sales} sales completed</span>
                  </div>
                  <a className="sl-agent-wa" href={`${waBase}?text=${encodeURIComponent(`Hello, I'd like to speak with ${a.name}.`)}`} target="_blank" rel="noopener noreferrer">
                    Get in touch <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="sl-testimonials-band" ref={testimonialsRef}>
        <div className="sl-testimonials-inner">
          <div style={fadeUp(testimonialsVis)}>
            <div className="sl-eyebrow" style={{ justifyContent: 'center' }}>Client Stories</div>
            <h2 className={`sl-h2 ${playfair.className}`} style={{ textAlign: 'center' }}>What Our Clients Say</h2>
          </div>
          <div className="sl-testimonials-track">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`sl-testimonial${i === activeTestimonial ? ' sl-t-active' : ' sl-t-hidden'}`}>
                <Quote size={28} className="sl-quote-icon" />
                <p className={`sl-testimonial-quote ${playfair.className}`}>&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="sl-testimonial-author">{t.author}</div>
                  <div className="sl-testimonial-loc">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="sl-testimonial-dots">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} className={`sl-t-dot${i === activeTestimonial ? ' sl-t-dot-active' : ''}`} onClick={() => setActiveTestimonial(i)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div id="sl-contact" className="sl-cta-band" ref={ctaRef}>
        <div className="sl-cta-inner">
          <div style={fadeLeft(ctaVis)}>
            <h2 className={`sl-cta-h2 ${playfair.className}`}>
              Ready to<br /><em>Begin?</em>
            </h2>
            <p className="sl-cta-sub">
              Whether you're ready to buy, sell, or simply exploring — our team is waiting. One message is all it takes.
            </p>
          </div>
          <div className="sl-cta-right" style={fadeRight(ctaVis, 100)}>
            <a className="sl-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Message Us on WhatsApp
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="sl-cta-detail"><MapPin size={14} style={{ color: 'rgba(212,168,83,0.5)' }} />City Centre Office</div>
              {store.openingHours && <div className="sl-cta-detail"><Clock size={14} style={{ color: 'rgba(212,168,83,0.5)' }} />{store.openingHours}</div>}
              {store.whatsappNumber && <div className="sl-cta-detail"><Phone size={14} style={{ color: 'rgba(212,168,83,0.5)' }} />{store.whatsappNumber}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="sl-footer">
        <div className={`sl-footer-name ${playfair.className}`}>{store.shopName} Estates</div>
        <p className="sl-footer-copy">&copy; {new Date().getFullYear()} {store.shopName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
