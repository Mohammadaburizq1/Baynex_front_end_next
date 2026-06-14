'use client';

import { useState, useEffect, useRef } from 'react';
import { Cinzel, Nunito_Sans } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Home as HomeIcon, TrendingUp, Key, BarChart2,
  Award, Shield, Clock, Users, MapPin, Phone,
  BedDouble, Bath, Maximize2, ChevronRight, ChevronDown,
} from 'lucide-react';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600', '700'] });
const nunito = Nunito_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

// Seeded particle positions — no Math.random() to avoid hydration issues
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  x: (i * 17 + 11) % 100,
  y: (i * 23 + 7) % 97,
  sz: 1.6 + (i % 5) * 0.5,
  op: 0.25 + (i % 4) * 0.18,
  delay: ((i * 0.37) % 4).toFixed(2),
  dur: (3.8 + (i % 7) * 0.65).toFixed(2),
}));

const AGENTS = [
  { name: 'Victor Moreau', title: 'Principal Broker', deals: 183, years: 18, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
  { name: 'Celine Hartt', title: 'Luxury Portfolio Director', deals: 134, years: 13, img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Rohan Das', title: 'Investment Specialist', deals: 97, years: 9, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
];

const SERVICES = [
  { Icon: HomeIcon, title: 'Acquisition', desc: 'End-to-end guidance for buyers — from market analysis to the moment you hold the keys.' },
  { Icon: TrendingUp, title: 'Disposition', desc: 'Premium listing strategies that consistently achieve prices above market expectation.' },
  { Icon: Key, title: 'Leasing', desc: 'Curated rental matching in the most sought-after addresses across the city.' },
  { Icon: BarChart2, title: 'Portfolio', desc: 'Strategic investment advisory to grow and protect your real estate wealth over time.' },
];

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
  if (l.includes('bed')) return <BedDouble size={11} />;
  if (l.includes('bath')) return <Bath size={11} />;
  return <Maximize2 size={11} />;
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

export default function EclipseEstateTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const [category, setCategory] = useState('All');
  const [navSolid, setNavSolid] = useState(false);

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: svcRef, inView: svcVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: propsRef, inView: propsVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(600, 1500, statsVis);
  const c2 = useCountUp(28, 1200, statsVis);
  const c3 = useCountUp(3, 1000, statsVis);
  const c4 = useCountUp(99, 1300, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 70);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waBase = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}`;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const reveal = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.8s ease ${d}ms, transform 0.8s ease ${d}ms`,
  });

  return (
    <div className={`ee-root ${nunito.className}`}>
      <style>{`
        .ee-root {
          --obsidian: #07090F;
          --obsidian-mid: #0E1220;
          --obsidian-card: #111520;
          --gold: #C9A87A;
          --gold-light: #E4C99A;
          --gold-dim: #8A6E42;
          --platinum: #A8B8CC;
          --border: rgba(201,168,122,0.15);
          --text: #E8E0D4;
          --muted: rgba(168,184,204,0.6);
          background: var(--obsidian);
          color: var(--text);
          min-height: 100vh;
        }

        /* ── Animations ── */
        @keyframes particleFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-14px) scale(1.15); }
        }
        @keyframes particleGlow {
          0%,100% { box-shadow: 0 0 6px 2px currentColor; }
          50%      { box-shadow: 0 0 16px 6px currentColor; }
        }
        @keyframes clipRevealR {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes clipRevealL {
          from { clip-path: inset(0 0 0 100%); }
          to   { clip-path: inset(0 0 0 0%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes goldPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,122,0); }
          50%      { box-shadow: 0 0 24px 4px rgba(201,168,122,0.18); }
        }
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0) translateX(-50%); }
          50%      { transform: translateY(8px) translateX(-50%); }
        }
        @keyframes lineExpand {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }

        /* ── Nav ── */
        .ee-nav {
          position: fixed;
          inset: 0 0 auto;
          z-index: 100;
          padding: 0 56px;
          transition: background 0.35s, backdrop-filter 0.35s;
        }
        .ee-nav.ee-solid {
          background: rgba(7,9,15,0.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .ee-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          max-width: 1300px;
          margin: 0 auto;
        }
        .ee-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .ee-logo-diamond {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--gold), var(--gold-dim));
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ee-logo-diamond-inner {
          width: 16px;
          height: 16px;
          background: var(--obsidian);
          transform: rotate(0deg);
        }
        .ee-logo-name {
          font-size: 17px;
          letter-spacing: 0.12em;
          color: var(--gold-light);
          line-height: 1;
        }
        .ee-logo-sub {
          font-size: 8px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold-dim);
          font-weight: 600;
          margin-top: 3px;
        }
        .ee-nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .ee-nav-link {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.2s;
        }
        .ee-nav-link:hover { color: var(--gold); }
        .ee-nav-cta {
          padding: 9px 24px;
          border: 1px solid var(--gold-dim);
          color: var(--gold);
          background: transparent;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
        }
        .ee-nav-cta:hover {
          background: var(--gold);
          color: var(--obsidian);
          border-color: var(--gold);
        }

        /* ── Hero ── */
        .ee-hero {
          position: relative;
          height: 100vh;
          min-height: 640px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--obsidian);
        }
        .ee-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80');
          background-size: cover;
          background-position: center;
          opacity: 0.1;
        }
        .ee-hero-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(7,9,15,0.85) 100%);
        }
        .ee-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          color: var(--gold);
          animation: particleFloat var(--p-dur,4s) ease-in-out infinite var(--p-delay,0s),
                     particleGlow var(--p-dur,4s) ease-in-out infinite var(--p-delay,0s);
        }
        .ee-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 24px;
          max-width: 860px;
        }
        .ee-hero-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          color: var(--gold);
          animation: fadeInUp 0.8s ease both 0.1s;
          margin-bottom: 20px;
        }
        .ee-hero-rule {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          margin-bottom: 28px;
          animation: fadeInUp 0.8s ease both 0.2s;
        }
        .ee-hero-rule-line {
          flex: 1;
          max-width: 80px;
          height: 1px;
          background: linear-gradient(to right, transparent, var(--gold-dim));
        }
        .ee-hero-rule-line.ee-rev {
          background: linear-gradient(to left, transparent, var(--gold-dim));
        }
        .ee-hero-rule-diamond {
          width: 6px;
          height: 6px;
          background: var(--gold);
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .ee-hero-h1 {
          font-size: clamp(44px, 6vw, 82px);
          line-height: 1.06;
          color: #FFFFFF;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0 0 24px;
          clip-path: inset(0 100% 0 0);
          animation: clipRevealR 1.3s cubic-bezier(0.22,1,0.36,1) both 0.4s;
        }
        .ee-hero-sub {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(232,224,212,0.6);
          max-width: 520px;
          margin: 0 auto 36px;
          animation: fadeInUp 0.8s ease both 0.7s;
        }
        .ee-hero-btns {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease both 0.85s;
        }
        .ee-btn-gold {
          padding: 14px 34px;
          background: linear-gradient(135deg, var(--gold-dim), var(--gold));
          color: var(--obsidian);
          border: none;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .ee-btn-gold:hover { opacity: 0.88; transform: translateY(-2px); }
        .ee-btn-ghost {
          padding: 14px 34px;
          border: 1px solid rgba(201,168,122,0.35);
          color: var(--gold-light);
          background: transparent;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
        }
        .ee-btn-ghost:hover {
          border-color: var(--gold);
          background: rgba(201,168,122,0.08);
        }
        .ee-scroll-cue {
          position: absolute;
          bottom: 32px;
          left: 50%;
          color: var(--gold-dim);
          animation: scrollBounce 2.4s ease infinite, fadeInUp 0.8s ease both 1.4s;
          cursor: pointer;
        }

        /* ── Stats ── */
        .ee-stats-band {
          background: var(--obsidian-mid);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 64px 56px;
        }
        .ee-stats-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .ee-stat {
          padding: 0 40px;
          text-align: center;
          border-right: 1px solid var(--border);
        }
        .ee-stat:last-child { border-right: none; }
        .ee-stat-num {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 2px;
          margin-bottom: 10px;
        }
        .ee-stat-val {
          font-size: clamp(44px, 5vw, 64px);
          line-height: 1;
          color: var(--gold);
          letter-spacing: 0.04em;
        }
        .ee-stat-sfx {
          font-size: 0.48em;
          padding-top: 0.22em;
          color: var(--gold-dim);
          letter-spacing: 0.08em;
        }
        .ee-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(232,224,212,0.7);
          margin-bottom: 3px;
        }
        .ee-stat-sub {
          font-size: 11px;
          font-weight: 300;
          color: var(--muted);
        }

        /* ── Shared section ── */
        .ee-section {
          padding: 96px 56px;
          max-width: 1300px;
          margin: 0 auto;
        }
        .ee-label {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 16px;
        }
        .ee-label-line {
          width: 28px;
          height: 1px;
          background: var(--gold-dim);
          animation: lineExpand 0.8s ease both;
        }
        .ee-h2 {
          font-size: clamp(32px, 3.5vw, 52px);
          line-height: 1.1;
          color: #FFFFFF;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 400;
          margin: 0 0 12px;
        }

        /* ── About ── */
        .ee-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .ee-about-images {
          position: relative;
          height: 500px;
        }
        .ee-about-img-a {
          position: absolute;
          top: 0;
          left: 0;
          right: 64px;
          height: 340px;
          object-fit: cover;
          display: block;
          border: 1px solid var(--border);
          clip-path: inset(0 0 0 0);
        }
        .ee-about-img-b {
          position: absolute;
          bottom: 0;
          right: 0;
          left: 72px;
          height: 260px;
          object-fit: cover;
          display: block;
          border: 1px solid var(--border);
        }
        .ee-about-num-badge {
          position: absolute;
          bottom: 76px;
          left: 52px;
          background: var(--gold);
          color: var(--obsidian);
          padding: 14px 18px;
          text-align: center;
          z-index: 2;
          box-shadow: 0 8px 32px rgba(201,168,122,0.25);
        }
        .ee-about-num {
          font-size: 30px;
          line-height: 1;
          letter-spacing: 0.06em;
          font-weight: 400;
        }
        .ee-about-num-label {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(7,9,15,0.65);
          margin-top: 4px;
        }
        .ee-about-text p {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.88;
          color: rgba(232,224,212,0.65);
          margin-bottom: 16px;
        }
        .ee-about-check {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 10px;
        }
        .ee-check-diamond {
          width: 8px;
          height: 8px;
          background: var(--gold);
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .ee-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: gap 0.2s;
        }
        .ee-link:hover { gap: 14px; }

        /* ── Services ── */
        .ee-svc-band {
          background: var(--obsidian-mid);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 96px 56px;
        }
        .ee-svc-inner { max-width: 1300px; margin: 0 auto; }
        .ee-svc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          margin-top: 48px;
        }
        .ee-svc-card {
          background: var(--obsidian-card);
          padding: 36px 28px;
          transition: background 0.25s;
          animation: goldPulse 4s ease infinite;
          animation-play-state: paused;
        }
        .ee-svc-card:hover {
          background: rgba(201,168,122,0.06);
          animation-play-state: running;
        }
        .ee-svc-icon {
          width: 44px;
          height: 44px;
          border: 1px solid var(--gold-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold);
          margin-bottom: 20px;
          transition: all 0.25s;
        }
        .ee-svc-card:hover .ee-svc-icon {
          background: var(--gold);
          color: var(--obsidian);
          border-color: var(--gold);
        }
        .ee-svc-title {
          font-size: 16px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold-light);
          font-weight: 400;
          margin-bottom: 10px;
        }
        .ee-svc-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: var(--muted);
        }

        /* ── Properties ── */
        .ee-cat-tabs {
          display: flex;
          gap: 3px;
          flex-wrap: wrap;
          margin: 24px 0 36px;
        }
        .ee-cat-tab {
          padding: 7px 18px;
          border: 1px solid var(--border);
          background: none;
          font-family: inherit;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--muted);
        }
        .ee-cat-tab.ee-active {
          background: var(--gold);
          color: var(--obsidian);
          border-color: var(--gold);
        }
        .ee-cat-tab:hover:not(.ee-active) { border-color: var(--gold-dim); color: var(--gold-light); }
        .ee-prop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .ee-prop-card {
          background: var(--obsidian-card);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
        }
        .ee-prop-card:hover {
          border-color: var(--gold-dim);
          box-shadow: 0 0 32px rgba(201,168,122,0.12);
          transform: translateY(-4px);
        }
        .ee-prop-img-wrap {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        .ee-prop-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.85);
          transition: filter 0.4s, transform 0.5s;
        }
        .ee-prop-card:hover .ee-prop-img {
          filter: brightness(1);
          transform: scale(1.05);
        }
        .ee-prop-cat {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(7,9,15,0.82);
          color: var(--gold);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 5px 10px;
          border: 1px solid var(--border);
        }
        .ee-prop-body { padding: 20px; }
        .ee-prop-price {
          font-size: 24px;
          letter-spacing: 0.06em;
          color: var(--gold-light);
          font-weight: 400;
          margin-bottom: 6px;
        }
        .ee-prop-name {
          font-size: 12px;
          font-weight: 500;
          color: rgba(232,224,212,0.6);
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .ee-prop-specs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          margin-bottom: 14px;
        }
        .ee-prop-spec {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 500;
          color: var(--muted);
        }
        .ee-prop-wa {
          display: block;
          width: 100%;
          padding: 10px;
          background: transparent;
          border: 1px solid var(--gold-dim);
          color: var(--gold);
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.25s;
          cursor: pointer;
          font-family: inherit;
        }
        .ee-prop-wa:hover {
          background: var(--gold);
          color: var(--obsidian);
          border-color: var(--gold);
        }

        /* ── Team ── */
        .ee-team-band {
          background: var(--obsidian-mid);
          border-top: 1px solid var(--border);
          padding: 96px 56px;
        }
        .ee-team-inner { max-width: 1300px; margin: 0 auto; }
        .ee-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 48px;
        }
        .ee-agent-card {
          background: var(--obsidian-card);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s;
        }
        .ee-agent-card:hover {
          border-color: var(--gold-dim);
          transform: translateY(-3px);
        }
        .ee-agent-photo {
          width: 100%;
          height: 240px;
          object-fit: cover;
          object-position: top;
          display: block;
          filter: grayscale(30%) brightness(0.85);
          transition: filter 0.4s;
        }
        .ee-agent-card:hover .ee-agent-photo { filter: grayscale(0%) brightness(0.95); }
        .ee-agent-gold-bar {
          height: 2px;
          background: linear-gradient(to right, var(--gold-dim), var(--gold), var(--gold-dim));
        }
        .ee-agent-body { padding: 20px; }
        .ee-agent-name {
          font-size: 17px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          font-weight: 400;
          margin-bottom: 5px;
        }
        .ee-agent-role {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 14px;
        }
        .ee-agent-stats {
          display: flex;
          gap: 20px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
          margin-bottom: 14px;
        }
        .ee-agent-sn {
          font-size: 22px;
          letter-spacing: 0.06em;
          color: var(--gold-light);
          font-weight: 400;
          line-height: 1;
        }
        .ee-agent-sl {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 3px;
        }
        .ee-agent-wa {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--gold-dim);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ee-agent-wa:hover { color: var(--gold); }

        /* ── Contact ── */
        .ee-cta-band {
          background: var(--obsidian);
          border-top: 1px solid var(--border);
          padding: 96px 56px;
          text-align: center;
        }
        .ee-cta-inner { max-width: 680px; margin: 0 auto; }
        .ee-cta-ornament {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          margin-bottom: 24px;
        }
        .ee-cta-orn-line {
          flex: 1;
          max-width: 80px;
          height: 1px;
          background: var(--border);
        }
        .ee-cta-orn-diamond {
          width: 8px;
          height: 8px;
          background: var(--gold);
          transform: rotate(45deg);
        }
        .ee-cta-h2 {
          font-size: clamp(36px, 5vw, 64px);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          font-weight: 400;
          margin-bottom: 14px;
          line-height: 1.1;
        }
        .ee-cta-sub {
          font-size: 15px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.8;
          margin-bottom: 36px;
        }
        .ee-cta-wa {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 40px;
          background: linear-gradient(135deg, var(--gold-dim), var(--gold));
          color: var(--obsidian);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .ee-cta-wa:hover { opacity: 0.88; transform: translateY(-2px); }
        .ee-cta-details {
          margin-top: 40px;
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ee-cta-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--muted);
        }

        /* ── Footer ── */
        .ee-footer {
          background: #040508;
          border-top: 1px solid var(--border);
          padding: 40px 56px;
          text-align: center;
        }
        .ee-footer-name {
          font-size: 16px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold-dim);
          font-weight: 400;
          margin-bottom: 6px;
        }
        .ee-footer-copy {
          font-size: 10px;
          color: rgba(168,184,204,0.25);
          letter-spacing: 0.14em;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .ee-nav, .ee-stats-band, .ee-svc-band, .ee-team-band,
          .ee-cta-band, .ee-footer { padding-left: 24px; padding-right: 24px; }
          .ee-section { padding: 64px 24px; }
        }
        @media (max-width: 880px) {
          .ee-stats-inner { grid-template-columns: repeat(2, 1fr); }
          .ee-stat { border-right: none; border-bottom: 1px solid var(--border); padding: 24px 12px; }
          .ee-stat:nth-last-child(-n+2) { border-bottom: none; }
          .ee-about-grid { grid-template-columns: 1fr; gap: 48px; }
          .ee-about-images { height: 340px; }
          .ee-svc-grid { grid-template-columns: repeat(2, 1fr); }
          .ee-prop-grid { grid-template-columns: repeat(2, 1fr); }
          .ee-team-grid { grid-template-columns: 1fr 1fr; }
          .ee-nav-links { display: none; }
        }
        @media (max-width: 560px) {
          .ee-prop-grid, .ee-team-grid, .ee-svc-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav className={`ee-nav${navSolid ? ' ee-solid' : ''}`}>
        <div className="ee-nav-inner">
          <div className="ee-logo" onClick={() => scrollTo('ee-top')}>
            <div className="ee-logo-diamond"><div className="ee-logo-diamond-inner" /></div>
            <div>
              <div className={`ee-logo-name ${cinzel.className}`}>{store.shopName}</div>
              <div className="ee-logo-sub">Prestige Real Estate</div>
            </div>
          </div>
          <div className="ee-nav-links">
            {[['Properties', 'ee-properties'], ['About', 'ee-about'], ['Services', 'ee-services'], ['Contact', 'ee-contact']].map(([l, id]) => (
              <button key={id} className="ee-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <button className="ee-nav-cta" onClick={() => window.open(waBase, '_blank')}>Enquire</button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section id="ee-top" className="ee-hero">
        <div className="ee-hero-bg" />
        <div className="ee-hero-vignette" />
        {PARTICLES.map((p, pi) => (
          <div
            key={pi}
            className="ee-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.sz}px`,
              height: `${p.sz}px`,
              opacity: p.op,
              ['--p-dur' as string]: `${p.dur}s`,
              ['--p-delay' as string]: `${p.delay}s`,
              background: 'radial-gradient(circle, rgba(201,168,122,0.9) 0%, rgba(201,168,122,0) 70%)',
            } as React.CSSProperties}
          />
        ))}
        <div className="ee-hero-content">
          <p className="ee-hero-eyebrow">Prestige Real Estate &nbsp;&middot;&nbsp; Est. 2001</p>
          <div className="ee-hero-rule">
            <div className="ee-hero-rule-line" />
            <div className="ee-hero-rule-diamond" />
            <div className="ee-hero-rule-line ee-rev" />
          </div>
          <h1 className={`ee-hero-h1 ${cinzel.className}`}>
            Where Luxury<br />Finds Its Address
          </h1>
          <p className="ee-hero-sub">
            {store.description || 'We represent a select collection of the world\'s most exceptional properties — homes that transcend the ordinary.'}
          </p>
          <div className="ee-hero-btns">
            <button className="ee-btn-gold" onClick={() => scrollTo('ee-properties')}>View Listings</button>
            <button className="ee-btn-ghost" onClick={() => scrollTo('ee-about')}>Our Heritage</button>
          </div>
        </div>
        <div className="ee-scroll-cue" onClick={() => scrollTo('ee-stats')}>
          <ChevronDown size={26} />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <div id="ee-stats" className="ee-stats-band" ref={statsRef}>
        <div className="ee-stats-inner">
          {[
            { v: c1, s: '+', l: 'Properties Listed', sub: 'across all categories' },
            { v: c2, s: ' yrs', l: 'Years of Excellence', sub: 'established 2001' },
            { v: c3, s: 'B+', l: 'In Closed Sales', sub: 'total portfolio', pre: '$' },
            { v: c4, s: '%', l: 'Client Retention', sub: 'return & referred' },
          ].map(({ v, s, l, sub, pre }, i) => (
            <div key={i} className="ee-stat" style={reveal(statsVis, i * 90)}>
              <div className="ee-stat-num">
                <span className={`ee-stat-val ${cinzel.className}`}>{pre}{v}</span>
                <span className={`ee-stat-sfx ${cinzel.className}`}>{s}</span>
              </div>
              <div className="ee-stat-label">{l}</div>
              <div className="ee-stat-sub">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ABOUT ─── */}
      <section id="ee-about">
        <div className="ee-section" ref={aboutRef}>
          <div className="ee-about-grid" style={reveal(aboutVis)}>
            <div className="ee-about-images">
              <img className="ee-about-img-a" src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80" alt="Property" />
              <img className="ee-about-img-b" src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=600&q=80" alt="Interior" />
              <div className="ee-about-num-badge">
                <div className={`ee-about-num ${cinzel.className}`}>28+</div>
                <div className="ee-about-num-label">Years of<br />Excellence</div>
              </div>
            </div>
            <div className="ee-about-text" style={reveal(aboutVis, 150)}>
              <div className="ee-label">
                <span className="ee-label-line" />
                Our Heritage
              </div>
              <h2 className={`ee-h2 ${cinzel.className}`} style={{ marginBottom: 20 }}>
                A Standard<br />Above the Rest
              </h2>
              <p>Since 2001, {store.shopName} has been synonymous with discretion, excellence, and results that speak for themselves. We represent a carefully curated selection of properties — never a volume play.</p>
              <p>Our clients are not simply buyers and sellers; they are partners who trust us with their most significant decisions. That trust is something we earn anew with every single transaction.</p>
              <div style={{ marginTop: 20 }}>
                {['Exclusive off-market inventory unavailable elsewhere', 'White-glove service at every stage of the transaction', 'Unmatched local and international buyer network'].map((item, i) => (
                  <div key={i} className="ee-about-check">
                    <div className="ee-check-diamond" />
                    {item}
                  </div>
                ))}
              </div>
              <button className="ee-link" onClick={() => scrollTo('ee-contact')}>
                Begin a Conversation <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <div id="ee-services" className="ee-svc-band" ref={svcRef}>
        <div className="ee-svc-inner">
          <div style={reveal(svcVis)}>
            <div className="ee-label" style={{ color: 'rgba(201,168,122,0.75)' }}>
              <span className="ee-label-line" style={{ background: 'rgba(201,168,122,0.4)' }} />
              What We Offer
            </div>
            <h2 className={`ee-h2 ${cinzel.className}`}>Our Services</h2>
          </div>
          <div className="ee-svc-grid">
            {SERVICES.map(({ Icon, title, desc }, i) => (
              <div key={i} className="ee-svc-card" style={reveal(svcVis, 80 + i * 80)}>
                <div className="ee-svc-icon"><Icon size={20} /></div>
                <div className={`ee-svc-title ${cinzel.className}`}>{title}</div>
                <p className="ee-svc-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PROPERTIES ─── */}
      <section id="ee-properties">
        <div className="ee-section" ref={propsRef}>
          <div style={reveal(propsVis)}>
            <div className="ee-label"><span className="ee-label-line" />Current Listings</div>
            <h2 className={`ee-h2 ${cinzel.className}`}>Featured Properties</h2>
          </div>
          <div className="ee-cat-tabs" style={reveal(propsVis, 70)}>
            {categories.map(cat => (
              <button key={cat} className={`ee-cat-tab${category === cat ? ' ee-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="ee-prop-grid">
            {filtered.map((prop, i) => {
              const { specs } = parseSpecs(prop.description);
              const msg = `Hello ${store.shopName}! I'm enquiring about ${prop.name} at ${formatPrice(prop.price)}.`;
              return (
                <div key={prop.id} className="ee-prop-card" style={reveal(propsVis, 80 + i * 65)}>
                  <div className="ee-prop-img-wrap">
                    <img className="ee-prop-img" src={prop.imageUrl ?? ''} alt={prop.name} />
                    <span className="ee-prop-cat">{prop.category}</span>
                  </div>
                  <div className="ee-prop-body">
                    <div className={`ee-prop-price ${cinzel.className}`}>{formatPrice(prop.price)}</div>
                    <div className="ee-prop-name">{prop.name}</div>
                    <div className="ee-prop-specs">
                      {specs.map((s, si) => (
                        <span key={si} className="ee-prop-spec"><SpecIcon label={s} />{s}</span>
                      ))}
                    </div>
                    <a className="ee-prop-wa" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                      Request Details
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <div className="ee-team-band" ref={teamRef}>
        <div className="ee-team-inner">
          <div style={reveal(teamVis)}>
            <div className="ee-label" style={{ color: 'rgba(201,168,122,0.75)' }}>
              <span className="ee-label-line" style={{ background: 'rgba(201,168,122,0.4)' }} />
              Our Advisors
            </div>
            <h2 className={`ee-h2 ${cinzel.className}`}>The Principals</h2>
          </div>
          <div className="ee-team-grid">
            {AGENTS.map((a, i) => (
              <div key={i} className="ee-agent-card" style={reveal(teamVis, 100 + i * 100)}>
                <img className="ee-agent-photo" src={a.img} alt={a.name} />
                <div className="ee-agent-gold-bar" />
                <div className="ee-agent-body">
                  <div className={`ee-agent-name ${cinzel.className}`}>{a.name}</div>
                  <div className="ee-agent-role">{a.title}</div>
                  <div className="ee-agent-stats">
                    <div>
                      <div className={`ee-agent-sn ${cinzel.className}`}>{a.deals}</div>
                      <div className="ee-agent-sl">Closings</div>
                    </div>
                    <div>
                      <div className={`ee-agent-sn ${cinzel.className}`}>{a.years}</div>
                      <div className="ee-agent-sl">Years</div>
                    </div>
                  </div>
                  <a className="ee-agent-wa" href={`${waBase}?text=${encodeURIComponent(`Hello, I'd like to speak with ${a.name} at ${store.shopName}.`)}`} target="_blank" rel="noopener noreferrer">
                    Connect <ChevronRight size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONTACT ─── */}
      <div id="ee-contact" className="ee-cta-band" ref={ctaRef}>
        <div className="ee-cta-inner" style={reveal(ctaVis)}>
          <div className="ee-cta-ornament">
            <div className="ee-cta-orn-line" />
            <div className="ee-cta-orn-diamond" />
            <div className="ee-cta-orn-line" />
          </div>
          <div className="ee-label" style={{ justifyContent: 'center', marginBottom: 16 }}>
            <span className="ee-label-line" />Contact
          </div>
          <h2 className={`ee-cta-h2 ${cinzel.className}`}>Begin Your Journey</h2>
          <p className="ee-cta-sub">Whether acquiring, disposing, or exploring — our principals are available for confidential consultation at your convenience.</p>
          <a className="ee-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Enquire via WhatsApp
          </a>
          <div className="ee-cta-details">
            {store.openingHours && <div className="ee-cta-detail"><Clock size={13} />{store.openingHours}</div>}
            <div className="ee-cta-detail"><MapPin size={13} />Prime Business District</div>
            {store.whatsappNumber && <div className="ee-cta-detail"><Phone size={13} />{store.whatsappNumber}</div>}
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="ee-footer">
        <div className={`ee-footer-name ${cinzel.className}`}>{store.shopName}</div>
        <p className="ee-footer-copy">&copy; {new Date().getFullYear()} {store.shopName} &middot; Prestige Real Estate &middot; All Rights Reserved</p>
      </footer>
    </div>
  );
}
