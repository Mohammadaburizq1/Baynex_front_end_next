'use client';

import { useState, useEffect, useRef } from 'react';
import { Outfit, Nunito_Sans } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Zap, Layers, Monitor, Megaphone, Palette, Code2,
  ArrowRight, ArrowUpRight, Clock, MapPin, Phone,
  Star, ChevronRight,
} from 'lucide-react';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const nunitoSans = Nunito_Sans({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });

const ORBS = Array.from({ length: 7 }, (_, i) => ({
  x: (i * 31 + 17) % 88,
  y: (i * 53 + 9) % 82,
  sz: 120 + (i % 4) * 60,
  color: i % 3 === 0 ? '#A8FF00' : i % 3 === 1 ? '#7C3AED' : '#4C1D95',
  op: 0.06 + (i % 3) * 0.03,
}));

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

const TEAM = [
  { name: 'Zara Okonkwo', title: 'Creative Director', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', tag: 'Brand & Identity' },
  { name: 'Leo Hartmann', title: 'Lead Developer', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', tag: 'Web & Apps' },
  { name: 'Mia Svensson', title: 'Strategy Director', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', tag: 'Growth & Content' },
];

const PROCESS = [
  { Icon: Zap, num: '01', title: 'Spark', desc: 'We workshop your brief, define the problem clearly, and set creative direction that excites both sides.' },
  { Icon: Layers, num: '02', title: 'Build', desc: 'Our team executes fast and with full transparency — design sprints, live previews, iterative feedback.' },
  { Icon: Star, num: '03', title: 'Launch', desc: 'We ship, measure, and stay with you post-launch to optimise performance and scale what\'s working.' },
];

const CLIENTS = ['Veridian Co.', 'Kova Studio', 'Nex Labs', 'Folium', 'Arch & Co.', 'Synapse'];

export default function VoltCreativeTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const [category, setCategory] = useState('All');
  const [navSolid, setNavSolid] = useState(false);

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: servicesRef, inView: servicesVis } = useInView();
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: processRef, inView: processVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(120, 1300, statsVis);
  const c2 = useCountUp(8, 1100, statsVis);
  const c3 = useCountUp(45, 1200, statsVis);
  const c4 = useCountUp(100, 1400, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waBase = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}`;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const up = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.65s ease ${d}ms, transform 0.65s ease ${d}ms`,
  });
  const fromLeft = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(-24px)',
    transition: `opacity 0.65s ease ${d}ms, transform 0.65s ease ${d}ms`,
  });
  const fromRight = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(24px)',
    transition: `opacity 0.65s ease ${d}ms, transform 0.65s ease ${d}ms`,
  });

  return (
    <div className={`vc-root ${nunitoSans.className}`}>
      <style>{`
        .vc-root {
          --void: #0F0720;
          --void-2: #1A0F35;
          --neon: #A8FF00;
          --neon-dim: rgba(168,255,0,0.12);
          --neon-border: rgba(168,255,0,0.3);
          --purple: #7C3AED;
          --purple-light: #9D5BFF;
          --white: #F4F0FF;
          --body: rgba(244,240,255,0.6);
          --muted: rgba(244,240,255,0.3);
          --border: rgba(168,255,0,0.1);
          --card-bg: rgba(255,255,255,0.04);
          background: var(--void);
          color: var(--white);
          min-height: 100vh;
        }

        @keyframes vcWipe {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes vcFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vcNeonPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(168,255,0,0.2), 0 0 16px rgba(168,255,0,0.1); }
          50%      { box-shadow: 0 0 0 6px rgba(168,255,0,0), 0 0 28px rgba(168,255,0,0.2); }
        }
        @keyframes vcBorderGlow {
          0%,100% { border-color: rgba(168,255,0,0.15); }
          50%      { border-color: rgba(168,255,0,0.5); }
        }
        @keyframes vcScaleIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes vcScanLine {
          0%   { transform: translateY(-100%); opacity: 0.15; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes vcTickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ─ Nav ─ */
        .vc-nav {
          position: fixed;
          inset: 0 0 auto;
          z-index: 100;
          padding: 0 56px;
          border-bottom: 1px solid transparent;
          transition: background 0.3s, border-color 0.3s;
        }
        .vc-nav.vc-solid {
          background: rgba(15,7,32,0.95);
          backdrop-filter: blur(16px);
          border-color: var(--border);
        }
        .vc-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 66px;
        }
        .vc-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .vc-logo-icon {
          width: 30px;
          height: 30px;
          background: var(--neon);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--void);
        }
        .vc-logo-text { font-size: 18px; font-weight: 800; color: var(--white); letter-spacing: -0.02em; }
        .vc-logo-dot { color: var(--neon); }
        .vc-nav-links { display: flex; align-items: center; gap: 32px; }
        .vc-nav-link {
          font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
          color: var(--muted); background: none; border: none;
          cursor: pointer; font-family: inherit;
          transition: color 0.2s;
        }
        .vc-nav-link:hover { color: var(--white); }
        .vc-nav-cta {
          padding: 9px 20px;
          background: var(--neon);
          color: var(--void);
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .vc-nav-cta:hover { opacity: 0.85; }

        /* ─ Hero ─ */
        .vc-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 100px 56px 60px;
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
        }
        .vc-hero-orbs {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }
        .vc-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
        }
        .vc-scan {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to bottom, transparent, rgba(168,255,0,0.04), transparent);
          animation: vcScanLine 8s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        .vc-hero-content { position: relative; z-index: 2; }
        .vc-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--neon-border);
          padding: 6px 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--neon);
          margin-bottom: 24px;
          animation: vcFadeUp 0.6s ease both 0.1s;
        }
        .vc-tag-dot { width: 5px; height: 5px; background: var(--neon); border-radius: 50%; }
        .vc-hero-h1 {
          font-size: clamp(56px, 8vw, 120px);
          line-height: 0.92;
          letter-spacing: -0.03em;
          font-weight: 800;
          color: var(--white);
          margin-bottom: 6px;
          clip-path: inset(0 100% 0 0);
          animation: vcWipe 1.2s cubic-bezier(0.22,1,0.36,1) both 0.2s;
        }
        .vc-hero-h1-neon {
          font-size: clamp(56px, 8vw, 120px);
          line-height: 0.92;
          letter-spacing: -0.03em;
          font-weight: 800;
          color: var(--neon);
          margin-bottom: 28px;
          clip-path: inset(0 100% 0 0);
          animation: vcWipe 1.2s cubic-bezier(0.22,1,0.36,1) both 0.5s;
          text-shadow: 0 0 40px rgba(168,255,0,0.3);
        }
        .vc-hero-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          animation: vcFadeUp 0.7s ease both 1s;
        }
        .vc-hero-desc {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--body);
          max-width: 400px;
        }
        .vc-hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .vc-btn-neon {
          padding: 14px 28px;
          background: var(--neon);
          color: var(--void);
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.05em;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: opacity 0.2s, transform 0.2s;
        }
        .vc-btn-neon:hover { opacity: 0.9; transform: translateY(-2px); }
        .vc-btn-ghost {
          padding: 14px 28px;
          background: transparent;
          color: var(--white);
          border: 1px solid rgba(244,240,255,0.2);
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .vc-btn-ghost:hover { border-color: var(--neon); color: var(--neon); }

        /* ─ Ticker ─ */
        .vc-ticker {
          overflow: hidden;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 14px 0;
          background: var(--void-2);
        }
        .vc-ticker-track {
          display: flex;
          gap: 48px;
          animation: vcTickerScroll 18s linear infinite;
          white-space: nowrap;
          width: max-content;
        }
        .vc-ticker-item {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .vc-ticker-dot { width: 4px; height: 4px; background: var(--neon); border-radius: 50%; flex-shrink: 0; }

        /* ─ Stats ─ */
        .vc-stats-band {
          background: var(--void-2);
          border-bottom: 1px solid var(--border);
          padding: 56px;
        }
        .vc-stats-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4,1fr);
        }
        .vc-stat {
          padding: 0 32px;
          border-right: 1px solid rgba(168,255,0,0.1);
          text-align: center;
        }
        .vc-stat:last-child { border-right: none; }
        .vc-stat-num {
          font-size: clamp(40px,5vw,64px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: var(--neon);
          margin-bottom: 6px;
          text-shadow: 0 0 24px rgba(168,255,0,0.25);
        }
        .vc-stat-sfx { color: rgba(168,255,0,0.6); font-size: 0.55em; vertical-align: super; }
        .vc-stat-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* ─ Shared wrap ─ */
        .vc-wrap { max-width: 1280px; margin: 0 auto; padding: 96px 56px; }
        .vc-tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--neon-border);
          padding: 5px 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--neon);
          margin-bottom: 14px;
        }
        .vc-h2 {
          font-size: clamp(34px,4vw,56px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: var(--white);
          margin: 0 0 12px;
        }

        /* ─ Services ─ */
        .vc-cat-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid var(--border);
          margin: 20px 0 36px;
        }
        .vc-cat-tab {
          padding: 10px 18px;
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
        .vc-cat-tab.vc-active { color: var(--white); }
        .vc-cat-tab.vc-active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--neon);
        }
        .vc-cat-tab:hover:not(.vc-active) { color: rgba(244,240,255,0.7); }
        .vc-svc-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 16px;
        }
        .vc-svc-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          padding: 24px;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
          position: relative;
          overflow: hidden;
        }
        .vc-svc-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, var(--neon), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .vc-svc-card:hover { background: rgba(168,255,0,0.04); border-color: rgba(168,255,0,0.3); transform: translateY(-3px); }
        .vc-svc-card:hover::before { opacity: 1; }
        .vc-svc-cat {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--neon);
          margin-bottom: 10px;
        }
        .vc-svc-price {
          font-size: 24px;
          font-weight: 800;
          color: var(--white);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .vc-svc-name {
          font-size: 15px;
          font-weight: 600;
          color: rgba(244,240,255,0.9);
          margin-bottom: 10px;
          line-height: 1.3;
        }
        .vc-svc-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          color: var(--body);
          margin-bottom: 16px;
        }
        .vc-svc-wa {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--neon);
          text-decoration: none;
          transition: gap 0.2s;
        }
        .vc-svc-wa:hover { gap: 9px; }

        /* ─ About ─ */
        .vc-about-band { background: var(--void-2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .vc-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .vc-about-left {}
        .vc-big-num {
          font-size: clamp(80px,14vw,180px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.85;
          color: rgba(168,255,0,0.06);
          margin-bottom: 16px;
        }
        .vc-about-statement {
          font-size: 20px;
          font-weight: 600;
          line-height: 1.5;
          color: var(--white);
          margin-bottom: 20px;
          border-left: 3px solid var(--neon);
          padding-left: 18px;
        }
        .vc-about-right {}
        .vc-about-text {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.85;
          color: var(--body);
          margin-bottom: 16px;
        }
        .vc-client-logos {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .vc-client-tag {
          padding: 6px 14px;
          border: 1px solid var(--border);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--muted);
          transition: border-color 0.2s, color 0.2s;
        }
        .vc-client-tag:hover { border-color: var(--neon-border); color: var(--white); }

        /* ─ Process ─ */
        .vc-process-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 0;
          border: 1px solid var(--border);
          margin-top: 48px;
          position: relative;
        }
        .vc-process-card {
          padding: 32px 28px;
          border-right: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          transition: background 0.25s;
        }
        .vc-process-card:last-child { border-right: none; }
        .vc-process-card:hover { background: rgba(168,255,0,0.04); }
        .vc-process-icon {
          width: 44px;
          height: 44px;
          border: 1px solid var(--neon-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--neon);
          margin-bottom: 16px;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .vc-process-card:hover .vc-process-icon {
          background: rgba(168,255,0,0.08);
          box-shadow: 0 0 16px rgba(168,255,0,0.2);
        }
        .vc-process-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--neon);
          margin-bottom: 8px;
        }
        .vc-process-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--white);
          letter-spacing: -0.02em;
          margin-bottom: 10px;
        }
        .vc-process-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          color: var(--body);
        }

        /* ─ Team ─ */
        .vc-team-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 16px;
          margin-top: 48px;
        }
        .vc-agent-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: border-color 0.25s, transform 0.25s;
        }
        .vc-agent-card:hover { border-color: rgba(168,255,0,0.3); transform: translateY(-4px); }
        .vc-agent-photo-wrap {
          height: 260px;
          overflow: hidden;
          position: relative;
        }
        .vc-agent-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          display: block;
          filter: grayscale(50%) brightness(0.75);
          transition: filter 0.4s, transform 0.4s;
        }
        .vc-agent-card:hover .vc-agent-photo { filter: grayscale(20%) brightness(0.9); transform: scale(1.04); }
        .vc-agent-neon-bar {
          height: 2px;
          background: var(--neon);
          box-shadow: 0 0 12px rgba(168,255,0,0.5);
        }
        .vc-agent-body { padding: 18px; }
        .vc-agent-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--neon);
          margin-bottom: 6px;
        }
        .vc-agent-name {
          font-size: 20px;
          font-weight: 800;
          color: var(--white);
          letter-spacing: -0.02em;
          margin-bottom: 3px;
        }
        .vc-agent-role {
          font-size: 12px;
          font-weight: 400;
          color: var(--body);
          margin-bottom: 14px;
        }
        .vc-agent-wa {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: var(--neon);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: gap 0.2s;
        }
        .vc-agent-wa:hover { gap: 9px; }

        /* ─ CTA ─ */
        .vc-cta-band {
          background: var(--void-2);
          border-top: 1px solid var(--neon-border);
          padding: 96px 56px;
          position: relative;
          overflow: hidden;
        }
        .vc-cta-glow {
          position: absolute;
          bottom: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(168,255,0,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .vc-cta-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 60px;
          align-items: center;
          position: relative;
        }
        .vc-cta-h2 {
          font-size: clamp(44px,6vw,80px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 0.92;
          color: var(--white);
          margin-bottom: 14px;
        }
        .vc-cta-h2 span { color: var(--neon); text-shadow: 0 0 32px rgba(168,255,0,0.3); }
        .vc-cta-sub {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.75;
          color: var(--body);
          max-width: 420px;
        }
        .vc-cta-right {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 220px;
        }
        .vc-cta-wa {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          background: var(--neon);
          color: var(--void);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-decoration: none;
          width: 100%;
          justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
          cursor: pointer;
          border: none;
          font-family: inherit;
          animation: vcNeonPulse 3s ease-in-out infinite;
        }
        .vc-cta-wa:hover { opacity: 0.9; transform: translateY(-2px); }
        .vc-cta-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--muted);
        }
        .vc-cta-detail-icon { color: rgba(168,255,0,0.4); flex-shrink: 0; }

        /* ─ Footer ─ */
        .vc-footer {
          background: #080412;
          border-top: 1px solid var(--border);
          padding: 32px 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .vc-footer-name { font-size: 17px; font-weight: 800; color: rgba(244,240,255,0.2); letter-spacing: -0.02em; }
        .vc-footer-neon { color: rgba(168,255,0,0.3); }
        .vc-footer-copy { font-size: 11px; color: rgba(244,240,255,0.1); letter-spacing: 0.06em; }

        /* ─ Responsive ─ */
        @media (max-width: 1024px) {
          .vc-hero { padding-left: 24px; padding-right: 24px; }
          .vc-nav, .vc-stats-band, .vc-cta-band, .vc-footer { padding-left: 24px; padding-right: 24px; }
          .vc-wrap { padding-left: 24px; padding-right: 24px; }
          .vc-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .vc-cta-inner { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .vc-stats-inner { grid-template-columns: repeat(2,1fr); }
          .vc-stat { border: none; border-bottom: 1px solid var(--border); padding: 20px 8px; }
          .vc-stat:nth-last-child(-n+2) { border-bottom: none; }
          .vc-svc-grid { grid-template-columns: repeat(2,1fr); }
          .vc-process-grid { grid-template-columns: 1fr; }
          .vc-process-card { border-right: none; border-bottom: 1px solid var(--border); }
          .vc-process-card:last-child { border-bottom: none; }
          .vc-team-grid { grid-template-columns: 1fr 1fr; }
          .vc-nav-links { display: none; }
          .vc-footer { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 560px) {
          .vc-svc-grid, .vc-team-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── ORB BACKGROUND ── */}
      <div className="vc-hero-orbs">
        {ORBS.map((o, i) => (
          <div key={i} className="vc-orb" style={{
            left: `${o.x}%`, top: `${o.y}%`,
            width: o.sz, height: o.sz,
            background: o.color,
            opacity: o.op,
            marginLeft: -o.sz / 2, marginTop: -o.sz / 2,
          }} />
        ))}
      </div>
      <div className="vc-scan" />

      {/* ── NAV ── */}
      <nav className={`vc-nav${navSolid ? ' vc-solid' : ''}`}>
        <div className="vc-nav-inner">
          <div className="vc-logo" onClick={() => scrollTo('vc-top')}>
            <div className="vc-logo-icon"><Zap size={16} /></div>
            <span className={`vc-logo-text ${outfit.className}`}>
              {store.shopName}<span className="vc-logo-dot">.</span>
            </span>
          </div>
          <div className="vc-nav-links">
            {[['Services','vc-services'],['About','vc-about'],['Process','vc-process'],['Contact','vc-contact']].map(([l,id]) => (
              <button key={id} className="vc-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <button className="vc-nav-cta" onClick={() => window.open(waBase,'_blank')}>Start a Project</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="vc-top" className="vc-hero">
        <div className="vc-hero-content">
          <div className="vc-hero-tag">
            <div className="vc-tag-dot" /> Creative & Digital Agency
          </div>
          <div className={`vc-hero-h1 ${outfit.className}`}>WE BUILD</div>
          <div className={`vc-hero-h1-neon ${outfit.className}`}>BOLD THINGS.</div>
          <div className="vc-hero-bottom">
            <p className="vc-hero-desc">
              {store.description || 'Branding, web design, digital strategy, and creative production — all under one roof, with zero compromise on quality.'}
            </p>
            <div className="vc-hero-btns">
              <button className="vc-btn-neon" onClick={() => scrollTo('vc-services')}>
                Our Work <ArrowRight size={14} />
              </button>
              <button className="vc-btn-ghost" onClick={() => scrollTo('vc-about')}>About Us</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CLIENT TICKER ── */}
      <div className="vc-ticker">
        <div className="vc-ticker-track">
          {[...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS].map((c, i) => (
            <div key={i} className="vc-ticker-item">
              <div className="vc-ticker-dot" />
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="vc-stats-band" ref={statsRef}>
        <div className="vc-stats-inner">
          {[
            { v: c1, s: '+', l: 'Projects Delivered' },
            { v: c2, s: ' yrs', l: 'Agency Experience' },
            { v: c3, s: '+', l: 'Happy Clients' },
            { v: c4, s: '%', l: 'On-Time Delivery' },
          ].map(({ v, s, l }, i) => (
            <div key={i} className="vc-stat" style={up(statsVis, i * 80)}>
              <div className={`vc-stat-num ${outfit.className}`}>{v}<span className="vc-stat-sfx">{s}</span></div>
              <div className="vc-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div id="vc-services">
        <div className="vc-wrap" ref={servicesRef}>
          <div style={up(servicesVis)}>
            <div className="vc-tag-pill"><div className="vc-tag-dot" />What We Do</div>
            <h2 className={`vc-h2 ${outfit.className}`}>Our Services</h2>
          </div>
          <div className="vc-cat-tabs" style={up(servicesVis, 60)}>
            {categories.map(cat => (
              <button key={cat} className={`vc-cat-tab${category === cat ? ' vc-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="vc-svc-grid">
            {filtered.map((svc, i) => {
              const msg = `Hi ${store.shopName}! I'm interested in ${svc.name}.`;
              return (
                <div key={svc.id} className="vc-svc-card" style={up(servicesVis, 80 + i * 60)}>
                  <div className="vc-svc-cat">{svc.category}</div>
                  <div className={`vc-svc-price ${outfit.className}`}>${svc.price}</div>
                  <div className="vc-svc-name">{svc.name}</div>
                  <p className="vc-svc-desc">{svc.description}</p>
                  <a className="vc-svc-wa" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                    Get a Quote <ArrowUpRight size={12} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div id="vc-about" className="vc-about-band">
        <div className="vc-wrap" ref={aboutRef}>
          <div className="vc-about-grid">
            <div style={fromLeft(aboutVis)}>
              <div className={`vc-big-num ${outfit.className}`}>8+</div>
              <p className="vc-about-statement">
                Years building brands and digital products that actually move the needle.
              </p>
            </div>
            <div style={fromRight(aboutVis, 100)}>
              <div className="vc-tag-pill" style={{ marginBottom: 14 }}><div className="vc-tag-dot" />About</div>
              <h2 className={`vc-h2 ${outfit.className}`} style={{ marginBottom: 18 }}>We Don't Do Average.</h2>
              <p className="vc-about-text">
                {store.shopName} is a full-service creative and digital studio. We partner with startups, scale-ups, and established brands who want work that's genuinely great — not just delivered on time.
              </p>
              <p className="vc-about-text">
                We keep our team lean and our thinking sharp. Every project gets senior attention from brief to handover.
              </p>
              <div className="vc-client-logos">
                {CLIENTS.map(c => <div key={c} className="vc-client-tag">{c}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROCESS ── */}
      <div id="vc-process">
        <div className="vc-wrap" ref={processRef}>
          <div style={up(processVis)}>
            <div className="vc-tag-pill"><div className="vc-tag-dot" />How We Work</div>
            <h2 className={`vc-h2 ${outfit.className}`}>The Process</h2>
          </div>
          <div className="vc-process-grid">
            {PROCESS.map(({ Icon, num, title, desc }, i) => (
              <div key={i} className="vc-process-card" style={up(processVis, 80 + i * 100)}>
                <div className="vc-process-icon"><Icon size={20} /></div>
                <div className="vc-process-num">{num}</div>
                <div className={`vc-process-title ${outfit.className}`}>{title}</div>
                <p className="vc-process-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div>
        <div className="vc-wrap" ref={teamRef}>
          <div style={up(teamVis)}>
            <div className="vc-tag-pill"><div className="vc-tag-dot" />The Team</div>
            <h2 className={`vc-h2 ${outfit.className}`}>Who You Work With</h2>
          </div>
          <div className="vc-team-grid">
            {TEAM.map((t, i) => (
              <div key={i} className="vc-agent-card" style={up(teamVis, 80 + i * 90)}>
                <div className="vc-agent-photo-wrap">
                  <img className="vc-agent-photo" src={t.img} alt={t.name} />
                </div>
                <div className="vc-agent-neon-bar" />
                <div className="vc-agent-body">
                  <div className="vc-agent-tag">{t.tag}</div>
                  <div className={`vc-agent-name ${outfit.className}`}>{t.name}</div>
                  <div className="vc-agent-role">{t.title}</div>
                  <a className="vc-agent-wa" href={`${waBase}?text=${encodeURIComponent(`Hi, I'd like to work with ${t.name} at ${store.shopName}.`)}`} target="_blank" rel="noopener noreferrer">
                    Get in touch <ArrowUpRight size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div id="vc-contact" className="vc-cta-band" ref={ctaRef}>
        <div className="vc-cta-glow" />
        <div className="vc-cta-inner">
          <div style={fromLeft(ctaVis)}>
            <h2 className={`vc-cta-h2 ${outfit.className}`}>
              GOT A<br /><span>PROJECT?</span>
            </h2>
            <p className="vc-cta-sub">
              Tell us what you're building and we'll come back to you with a straight answer on how we can help — fast.
            </p>
          </div>
          <div className="vc-cta-right" style={fromRight(ctaVis, 100)}>
            <a className="vc-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Message on WhatsApp
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {store.openingHours && <div className="vc-cta-detail"><Clock size={12} className="vc-cta-detail-icon" />{store.openingHours}</div>}
              <div className="vc-cta-detail"><MapPin size={12} className="vc-cta-detail-icon" />Studio Location</div>
              {store.whatsappNumber && <div className="vc-cta-detail"><Phone size={12} className="vc-cta-detail-icon" />{store.whatsappNumber}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="vc-footer">
        <div className={`vc-footer-name ${outfit.className}`}>
          {store.shopName}<span className="vc-footer-neon">.</span>
        </div>
        <p className="vc-footer-copy">&copy; {new Date().getFullYear()} {store.shopName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
