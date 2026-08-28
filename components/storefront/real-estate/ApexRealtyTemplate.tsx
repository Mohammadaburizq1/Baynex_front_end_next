'use client';

import { useState, useEffect, useRef } from 'react';
import { Syne, DM_Sans } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Home as HomeIcon, TrendingUp, Key, BarChart2,
  Award, Shield, Clock, Users, MapPin, Phone,
  BedDouble, Bath, Maximize2, ChevronRight, ArrowRight,
} from 'lucide-react';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

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
  { name: 'Marcus Webb', title: 'Founding Partner', deals: 210, years: 20, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
  { name: 'Naomi Brooks', title: 'Residential Director', deals: 148, years: 14, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tariq Hassan', title: 'Commercial Lead', deals: 87, years: 8, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
];

const SERVICES = [
  { Icon: HomeIcon, num: '01', title: 'Buy', desc: 'From shortlisting to settlement — we do the heavy lifting so you can focus on the future.' },
  { Icon: TrendingUp, num: '02', title: 'Sell', desc: 'Bold marketing. Real buyers. We don\'t wait for the market — we move it.' },
  { Icon: Key, num: '03', title: 'Rent', desc: 'Prime addresses, vetted tenants. Renting done properly, the first time.' },
  { Icon: BarChart2, num: '04', title: 'Invest', desc: 'Data-backed investment advice that turns bricks and mortar into real wealth.' },
];

const WHY = [
  { Icon: Award, title: 'Top-Ranked', desc: 'Nationally recognised as a leading agency for both volume and client satisfaction.' },
  { Icon: Shield, title: 'Zero BS Policy', desc: 'No inflated appraisals. No hidden fees. Just honest advice and exceptional execution.' },
  { Icon: Clock, title: 'Always On', desc: 'Our team is available 7 days a week — because the best opportunities don\'t wait.' },
  { Icon: Users, title: 'Deep Network', desc: 'Decades of relationships with off-market sellers, developers, and institutional buyers.' },
];

export default function ApexRealtyTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [category, setCategory] = useState('All');
  const [navSolid, setNavSolid] = useState(false);

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: svcRef, inView: svcVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: propsRef, inView: propsVis } = useInView();
  const { ref: whyRef, inView: whyVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(450, 1400, statsVis);
  const c2 = useCountUp(20, 1200, statsVis);
  const c3 = useCountUp(1, 900, statsVis);
  const c4 = useCountUp(97, 1300, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waBase = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}`;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const slideIn = (v: boolean, d = 0, dir: 'up' | 'left' | 'right' = 'up'): React.CSSProperties => {
    const map = { up: 'translateY(28px)', left: 'translateX(-28px)', right: 'translateX(28px)' };
    return {
      opacity: v ? 1 : 0,
      transform: v ? 'translate(0)' : map[dir],
      transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
    };
  };

  return (
    <div className={`ap-root ${dmSans.className}`}>
      <style>{`
        .ap-root {
          --white: #FAFAFA;
          --blue: #1040C0;
          --blue-dark: #0A2E8A;
          --blue-light: #3060E0;
          --orange: #FF4D00;
          --orange-light: #FF7040;
          --black: #0A0A0A;
          --grey: #F0F0F0;
          --border: #E0E4F0;
          --text: #0A0A0A;
          --body: #3A4460;
          --muted: #7A84A0;
          background: var(--white);
          color: var(--text);
          min-height: 100vh;
        }

        /* ── Animations ── */
        @keyframes wipeReveal {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orangePop {
          0%  { transform: scaleX(0); }
          100%{ transform: scaleX(1); }
        }
        @keyframes countScale {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bgNumber {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 0.04; transform: scale(1); }
        }
        @keyframes borderSweep {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }

        /* ── Nav ── */
        .ap-nav {
          position: fixed;
          inset: 0 0 auto;
          z-index: 100;
          padding: 0 56px;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .ap-nav.ap-solid {
          background: rgba(250,250,250,0.96);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 var(--border);
        }
        .ap-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          max-width: 1300px;
          margin: 0 auto;
        }
        .ap-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .ap-logo-block {
          width: 34px;
          height: 34px;
          background: var(--blue);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .ap-logo-orange-dot {
          width: 6px;
          height: 6px;
          background: var(--orange);
          border-radius: 50%;
          margin-left: -3px;
          margin-top: -22px;
          flex-shrink: 0;
        }
        .ap-logo-name {
          font-size: 18px;
          font-weight: 800;
          color: var(--black);
          letter-spacing: -0.01em;
        }
        .ap-logo-sub {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--blue);
          margin-top: 2px;
        }
        .ap-nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .ap-nav-link {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--body);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.2s;
        }
        .ap-nav-link:hover { color: var(--blue); }
        .ap-nav-cta {
          padding: 10px 24px;
          background: var(--orange);
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ap-nav-cta:hover { background: var(--orange-light); }

        /* ── Hero ── */
        .ap-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .ap-hero-left {
          background: var(--black);
          padding: 120px 64px 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
          clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%);
          z-index: 2;
        }
        .ap-hero-bg-num {
          position: absolute;
          font-size: 32vw;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          right: -4vw;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          animation: bgNumber 1.5s ease both 0.5s;
          z-index: 0;
          letter-spacing: -0.05em;
        }
        .ap-hero-left-content {
          position: relative;
          z-index: 1;
        }
        .ap-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--orange);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 14px;
          margin-bottom: 24px;
          animation: slideUp 0.7s ease both 0.1s;
        }
        .ap-hero-h1 {
          font-size: clamp(44px, 5.5vw, 80px);
          font-weight: 800;
          line-height: 0.95;
          color: #fff;
          letter-spacing: -0.03em;
          margin: 0 0 24px;
          clip-path: inset(0 100% 0 0);
          animation: wipeReveal 1.1s cubic-bezier(0.22,1,0.36,1) both 0.3s;
        }
        .ap-hero-h1 span {
          color: var(--orange);
        }
        .ap-hero-desc {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(255,255,255,0.55);
          max-width: 400px;
          margin-bottom: 36px;
          animation: slideUp 0.7s ease both 0.6s;
        }
        .ap-hero-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          animation: slideUp 0.7s ease both 0.75s;
        }
        .ap-btn-orange {
          padding: 14px 32px;
          background: var(--orange);
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, transform 0.2s;
        }
        .ap-btn-orange:hover { background: var(--orange-light); transform: translateY(-2px); }
        .ap-btn-blue {
          padding: 14px 32px;
          background: var(--blue);
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ap-btn-blue:hover { background: var(--blue-light); }
        .ap-hero-right {
          position: relative;
          overflow: hidden;
        }
        .ap-hero-right img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ap-hero-right-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(10,10,10,0.4) 0%, transparent 40%);
        }
        .ap-hero-mini-stat {
          position: absolute;
          bottom: 40px;
          left: 40px;
          background: #fff;
          padding: 16px 24px;
          display: flex;
          gap: 24px;
          animation: slideUp 0.8s ease both 1s;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        }
        .ap-mini-stat-n {
          font-size: 28px;
          font-weight: 800;
          color: var(--blue);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .ap-mini-stat-l {
          font-size: 10px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 3px;
        }

        /* ── Stats ── */
        .ap-stats-band {
          background: var(--blue);
          padding: 64px 56px;
          position: relative;
          overflow: hidden;
        }
        .ap-stats-bg-text {
          position: absolute;
          right: -2%;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18vw;
          font-weight: 800;
          color: rgba(255,255,255,0.04);
          line-height: 1;
          pointer-events: none;
          letter-spacing: -0.05em;
        }
        .ap-stats-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          position: relative;
        }
        .ap-stat {
          padding: 0 32px;
          border-right: 1px solid rgba(255,255,255,0.15);
          text-align: center;
        }
        .ap-stat:last-child { border-right: none; }
        .ap-stat-num {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 2px;
          margin-bottom: 8px;
        }
        .ap-stat-val {
          font-size: clamp(44px, 5.5vw, 68px);
          line-height: 1;
          color: #fff;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .ap-stat-sfx {
          font-size: 0.38em;
          padding-top: 0.28em;
          color: rgba(255,255,255,0.65);
          font-weight: 700;
        }
        .ap-stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin-bottom: 2px;
        }
        .ap-stat-sub {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.4);
        }

        /* ── Section shell ── */
        .ap-section {
          padding: 96px 56px;
          max-width: 1300px;
          margin: 0 auto;
        }
        .ap-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--orange);
          margin-bottom: 12px;
        }
        .ap-label::before {
          content: '';
          display: block;
          width: 20px;
          height: 3px;
          background: var(--orange);
          animation: orangePop 0.6s ease both;
          transform-origin: left;
        }
        .ap-h2 {
          font-size: clamp(32px, 4vw, 54px);
          line-height: 1.05;
          color: var(--black);
          font-weight: 800;
          letter-spacing: -0.025em;
          margin: 0 0 10px;
        }

        /* ── About ── */
        .ap-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .ap-about-image {
          position: relative;
          height: 500px;
          overflow: hidden;
        }
        .ap-about-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ap-about-image-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 6px;
          height: 100%;
          background: var(--orange);
        }
        .ap-about-image-blue {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: var(--blue);
        }
        .ap-about-image-badge {
          position: absolute;
          bottom: 24px;
          right: 24px;
          background: var(--blue);
          color: #fff;
          padding: 14px 18px;
          text-align: center;
        }
        .ap-about-badge-n {
          font-size: 30px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .ap-about-badge-l {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          margin-top: 4px;
        }
        .ap-about-text p {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.85;
          color: var(--body);
          margin-bottom: 16px;
        }
        .ap-about-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 20px 0 24px;
        }
        .ap-about-pill {
          padding: 7px 14px;
          background: var(--grey);
          border-left: 3px solid var(--blue);
          font-size: 12px;
          font-weight: 600;
          color: var(--body);
          letter-spacing: 0.04em;
        }
        .ap-cta-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--blue);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          letter-spacing: 0.04em;
          transition: gap 0.2s;
        }
        .ap-cta-link:hover { gap: 13px; color: var(--orange); }

        /* ── Services ── */
        .ap-svc-band {
          background: var(--black);
          padding: 96px 56px;
          position: relative;
          overflow: hidden;
        }
        .ap-svc-band::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(to right, var(--orange), var(--blue));
        }
        .ap-svc-inner { max-width: 1300px; margin: 0 auto; }
        .ap-svc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          margin-top: 48px;
        }
        .ap-svc-card {
          background: rgba(255,255,255,0.03);
          padding: 36px 28px;
          position: relative;
          overflow: hidden;
          transition: background 0.25s;
        }
        .ap-svc-card:hover { background: rgba(255,255,255,0.07); }
        .ap-svc-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--orange);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .ap-svc-card:hover::after { transform: scaleX(1); }
        .ap-svc-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--orange);
          margin-bottom: 14px;
        }
        .ap-svc-icon {
          width: 44px;
          height: 44px;
          border: 2px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-bottom: 18px;
          transition: border-color 0.25s, background 0.25s;
        }
        .ap-svc-card:hover .ap-svc-icon { border-color: var(--orange); background: rgba(255,77,0,0.1); }
        .ap-svc-title {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
        }
        .ap-svc-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: rgba(255,255,255,0.45);
        }

        /* ── Properties ── */
        .ap-cat-tabs {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin: 24px 0 36px;
        }
        .ap-cat-tab {
          padding: 8px 18px;
          border: 2px solid var(--border);
          background: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--body);
        }
        .ap-cat-tab.ap-active {
          background: var(--blue);
          color: #fff;
          border-color: var(--blue);
        }
        .ap-cat-tab:hover:not(.ap-active) { border-color: var(--blue); color: var(--blue); }
        .ap-prop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .ap-prop-card {
          background: var(--white);
          border: 2px solid var(--border);
          overflow: hidden;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
          position: relative;
        }
        .ap-prop-card:hover {
          border-color: var(--blue);
          box-shadow: 0 12px 40px rgba(16,64,192,0.12);
          transform: translateY(-4px);
        }
        .ap-prop-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--blue);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.35s ease;
          z-index: 2;
        }
        .ap-prop-card:hover::before { transform: scaleY(1); }
        .ap-prop-img-wrap {
          position: relative;
          height: 210px;
          overflow: hidden;
        }
        .ap-prop-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s;
        }
        .ap-prop-card:hover .ap-prop-img { transform: scale(1.05); }
        .ap-prop-cat {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--blue);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 10px;
        }
        .ap-prop-body { padding: 20px; }
        .ap-prop-price {
          font-size: 26px;
          font-weight: 800;
          color: var(--blue);
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .ap-prop-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--body);
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .ap-prop-specs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 2px solid var(--border);
          margin-bottom: 14px;
        }
        .ap-prop-spec {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
        }
        .ap-prop-wa {
          display: block;
          width: 100%;
          padding: 11px;
          background: var(--blue);
          color: #fff;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .ap-prop-wa:hover { background: var(--blue-dark); }

        /* ── Team ── */
        .ap-team-band {
          background: var(--grey);
          padding: 96px 56px;
        }
        .ap-team-inner { max-width: 1300px; margin: 0 auto; }
        .ap-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 48px;
        }
        .ap-agent-card {
          background: var(--white);
          border: 2px solid var(--border);
          overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .ap-agent-card:hover {
          border-color: var(--blue);
          transform: translateY(-4px);
          box-shadow: 0 10px 32px rgba(16,64,192,0.1);
        }
        .ap-agent-photo {
          width: 100%;
          height: 240px;
          object-fit: cover;
          object-position: top;
          display: block;
          transition: transform 0.4s;
        }
        .ap-agent-card:hover .ap-agent-photo { transform: scale(1.04); }
        .ap-agent-bar {
          height: 5px;
          background: linear-gradient(to right, var(--blue), var(--orange));
        }
        .ap-agent-body { padding: 20px; }
        .ap-agent-name {
          font-size: 20px;
          font-weight: 800;
          color: var(--black);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .ap-agent-role {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 14px;
        }
        .ap-agent-stats {
          display: flex;
          gap: 20px;
          padding-top: 12px;
          border-top: 2px solid var(--border);
          margin-bottom: 14px;
        }
        .ap-agent-sn {
          font-size: 24px;
          font-weight: 800;
          color: var(--black);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .ap-agent-sl {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 3px;
        }
        .ap-agent-wa {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--body);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ap-agent-wa:hover { color: var(--orange); }

        /* ── Why Us ── */
        .ap-why-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 48px;
        }
        .ap-why-card {
          padding: 28px;
          border: 2px solid var(--border);
          background: var(--white);
          display: flex;
          gap: 18px;
          transition: border-color 0.25s, background 0.25s;
          position: relative;
          overflow: hidden;
        }
        .ap-why-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, var(--blue), var(--orange));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .ap-why-card:hover::after { transform: scaleX(1); }
        .ap-why-card:hover { border-color: var(--blue); background: #F5F8FF; }
        .ap-why-icon {
          width: 48px;
          height: 48px;
          background: var(--blue);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .ap-why-card:hover .ap-why-icon { background: var(--orange); }
        .ap-why-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--black);
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .ap-why-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          color: var(--body);
        }

        /* ── Contact ── */
        .ap-cta-band {
          background: var(--blue);
          padding: 96px 56px;
          position: relative;
          overflow: hidden;
        }
        .ap-cta-band::after {
          content: 'APEX';
          position: absolute;
          right: -3%;
          top: 50%;
          transform: translateY(-50%);
          font-size: 22vw;
          font-weight: 800;
          color: rgba(255,255,255,0.04);
          line-height: 1;
          pointer-events: none;
          letter-spacing: -0.05em;
        }
        .ap-cta-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .ap-cta-left {}
        .ap-cta-h2 {
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 800;
          color: #fff;
          line-height: 0.95;
          letter-spacing: -0.03em;
          margin-bottom: 14px;
        }
        .ap-cta-h2 span { color: var(--orange); }
        .ap-cta-sub {
          font-size: 15px;
          font-weight: 300;
          color: rgba(255,255,255,0.6);
          line-height: 1.75;
        }
        .ap-cta-right { display: flex; flex-direction: column; gap: 16px; }
        .ap-cta-wa {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 18px 36px;
          background: var(--orange);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          width: fit-content;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .ap-cta-wa:hover { background: var(--orange-light); transform: translateY(-2px); }
        .ap-cta-details { display: flex; flex-direction: column; gap: 10px; }
        .ap-cta-detail {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.55);
        }
        .ap-cta-detail-icon { color: rgba(255,255,255,0.4); flex-shrink: 0; }

        /* ── Footer ── */
        .ap-footer {
          background: var(--black);
          padding: 40px 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .ap-footer-name {
          font-size: 18px;
          font-weight: 800;
          color: rgba(255,255,255,0.5);
          letter-spacing: -0.02em;
        }
        .ap-footer-copy {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.06em;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .ap-hero { grid-template-columns: 1fr; min-height: auto; }
          .ap-hero-left { clip-path: none; padding: 100px 32px 60px; }
          .ap-hero-right { height: 360px; }
          .ap-nav, .ap-stats-band, .ap-svc-band, .ap-team-band,
          .ap-cta-band, .ap-footer { padding-left: 24px; padding-right: 24px; }
          .ap-section { padding: 64px 24px; }
          .ap-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .ap-about-image { height: 320px; }
        }
        @media (max-width: 880px) {
          .ap-stats-inner { grid-template-columns: repeat(2, 1fr); }
          .ap-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.12); padding: 24px 12px; }
          .ap-stat:nth-last-child(-n+2) { border-bottom: none; }
          .ap-svc-grid { grid-template-columns: repeat(2, 1fr); }
          .ap-prop-grid { grid-template-columns: repeat(2, 1fr); }
          .ap-team-grid { grid-template-columns: 1fr 1fr; }
          .ap-why-grid { grid-template-columns: 1fr; }
          .ap-cta-inner { grid-template-columns: 1fr; gap: 40px; }
          .ap-nav-links { display: none; }
          .ap-footer { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 560px) {
          .ap-prop-grid, .ap-team-grid, .ap-svc-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav className={`ap-nav${navSolid ? ' ap-solid' : ''}`}>
        <div className="ap-nav-inner">
          <div className="ap-logo" onClick={() => scrollTo('ap-top')}>
            <div className={`ap-logo-block ${syne.className}`}>{store.shopName.charAt(0)}</div>
            <div className="ap-logo-orange-dot" />
            <div>
              <div className={`ap-logo-name ${syne.className}`}>{store.shopName}</div>
              <div className="ap-logo-sub">Real Estate</div>
            </div>
          </div>
          <div className="ap-nav-links">
            {[['About', 'ap-about'], ['Services', 'ap-services'], ['Properties', 'ap-properties'], ['Contact', 'ap-contact']].map(([l, id]) => (
              <button key={id} className="ap-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <button className="ap-nav-cta" onClick={() => window.open(waBase, '_blank')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section id="ap-top" className="ap-hero">
        <div className="ap-hero-left">
          <div className="ap-hero-bg-num">A</div>
          <div className="ap-hero-left-content">
            <div className="ap-hero-tag">
              <ArrowRight size={12} /> Real Estate Agency
            </div>
            <h1 className={`ap-hero-h1 ${syne.className}`}>
              We Find<br /><span>Apex</span><br />Properties.
            </h1>
            <p className="ap-hero-desc">
              {tc?.heroDescription || store.description || 'Bold results for buyers, sellers, and investors. No fluff — just expertise, hustle, and deals that close.'}
            </p>
            <div className="ap-hero-btns">
              <button className="ap-btn-orange" onClick={() => scrollTo('ap-properties')}>
                Browse Listings <ArrowRight size={14} />
              </button>
              <button className="ap-btn-blue" onClick={() => scrollTo('ap-about')}>Our Story</button>
            </div>
          </div>
        </div>
        <div className="ap-hero-right">
          <img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80" alt="Property" />
          <div className="ap-hero-right-overlay" />
          <div className="ap-hero-mini-stat">
            <div>
              <div className={`ap-mini-stat-n ${syne.className}`}>450+</div>
              <div className="ap-mini-stat-l">Active Listings</div>
            </div>
            <div>
              <div className={`ap-mini-stat-n ${syne.className}`}>20yr</div>
              <div className="ap-mini-stat-l">In Business</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <div className="ap-stats-band" ref={statsRef}>
        <div className="ap-stats-bg-text">APEX</div>
        <div className="ap-stats-inner">
          {[
            { v: c1, s: '+', l: 'Properties Listed', sub: 'across the region' },
            { v: c2, s: ' yrs', l: 'Years in Business', sub: 'since 2004' },
            { v: c3, s: 'B+', l: 'In Closed Deals', sub: 'total value', pre: '$' },
            { v: c4, s: '%', l: 'Client Satisfaction', sub: 'five-star rating' },
          ].map(({ v, s, l, sub, pre }, i) => (
            <div key={i} className="ap-stat" style={slideIn(statsVis, i * 80, 'up')}>
              <div className="ap-stat-num">
                <span className={`ap-stat-val ${syne.className}`}>{pre}{v}</span>
                <span className={`ap-stat-sfx ${syne.className}`}>{s}</span>
              </div>
              <div className="ap-stat-label">{l}</div>
              <div className="ap-stat-sub">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ABOUT ─── */}
      <section id="ap-about">
        <div className="ap-section" ref={aboutRef}>
          <div className="ap-about-grid">
            <div className="ap-about-image" style={slideIn(aboutVis, 0, 'left')}>
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" alt="Office" />
              <div className="ap-about-image-accent" />
              <div className="ap-about-image-blue" />
              <div className="ap-about-image-badge">
                <div className={`ap-about-badge-n ${syne.className}`}>20+</div>
                <div className="ap-about-badge-l">Years of<br />Results</div>
              </div>
            </div>
            <div style={slideIn(aboutVis, 120, 'right')}>
              <div className="ap-label">About Us</div>
              <h2 className={`ap-h2 ${syne.className}`}>We Don't Wait<br />For the Market.</h2>
              <div style={{ marginBottom: 20, marginTop: 12 }}>
                <p className="ap-about-text">
                  <span style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.85, color: 'var(--body)', display: 'block', marginBottom: 12 }}>
                    Founded in 2004, {store.shopName} built its reputation on one thing: doing what it takes to close. We're not a passive agency — we actively create opportunities for our clients.
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.85, color: 'var(--body)', display: 'block' }}>
                    From first-time buyers to seasoned investors, we bring the same energy, the same network, and the same no-nonsense approach to every single deal.
                  </span>
                </p>
              </div>
              <div className="ap-about-pills">
                {['Off-market inventory', 'Data-backed pricing', '7-day availability', 'Transparent fees'].map(p => (
                  <div key={p} className="ap-about-pill">{p}</div>
                ))}
              </div>
              <button className="ap-cta-link" onClick={() => scrollTo('ap-contact')}>
                Let's Talk <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <div id="ap-services" className="ap-svc-band" ref={svcRef}>
        <div className="ap-svc-inner">
          <div style={slideIn(svcVis, 0)}>
            <div className="ap-label" style={{ color: 'var(--orange)' }}>What We Do</div>
            <h2 className={`ap-h2 ${syne.className}`} style={{ color: '#fff' }}>Our Services</h2>
          </div>
          <div className="ap-svc-grid">
            {SERVICES.map(({ Icon, num, title, desc }, i) => (
              <div key={i} className="ap-svc-card" style={slideIn(svcVis, 80 + i * 80)}>
                <div className="ap-svc-num">{num}</div>
                <div className="ap-svc-icon"><Icon size={20} /></div>
                <div className={`ap-svc-title ${syne.className}`}>{title}</div>
                <p className="ap-svc-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PROPERTIES ─── */}
      <section id="ap-properties">
        <div className="ap-section" ref={propsRef}>
          <div style={slideIn(propsVis)}>
            <div className="ap-label">What's Available</div>
            <h2 className={`ap-h2 ${syne.className}`}>Current Listings</h2>
          </div>
          <div className="ap-cat-tabs" style={slideIn(propsVis, 70)}>
            {categories.map(cat => (
              <button key={cat} className={`ap-cat-tab${category === cat ? ' ap-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="ap-prop-grid">
            {filtered.map((prop, i) => {
              const { specs } = parseSpecs(prop.description);
              const msg = `Hello ${store.shopName}! I'm interested in ${prop.name} at ${formatPrice(prop.price)}.`;
              return (
                <div key={prop.id} className="ap-prop-card" style={slideIn(propsVis, 90 + i * 60)}>
                  <div className="ap-prop-img-wrap">
                    <img className="ap-prop-img" src={prop.imageUrl ?? ''} alt={prop.name} />
                    <span className="ap-prop-cat">{prop.category}</span>
                  </div>
                  <div className="ap-prop-body">
                    <div className={`ap-prop-price ${syne.className}`}>{formatPrice(prop.price)}</div>
                    <div className="ap-prop-name">{prop.name}</div>
                    <div className="ap-prop-specs">
                      {specs.map((s, si) => <span key={si} className="ap-prop-spec"><SpecIcon label={s} />{s}</span>)}
                    </div>
                    <a className="ap-prop-wa" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                      Enquire Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <div className="ap-team-band" ref={teamRef}>
        <div className="ap-team-inner">
          <div style={slideIn(teamVis)}>
            <div className="ap-label">The Team</div>
            <h2 className={`ap-h2 ${syne.className}`}>Who You're Working With</h2>
          </div>
          <div className="ap-team-grid">
            {AGENTS.map((a, i) => (
              <div key={i} className="ap-agent-card" style={slideIn(teamVis, 80 + i * 90)}>
                <img className="ap-agent-photo" src={a.img} alt={a.name} />
                <div className="ap-agent-bar" />
                <div className="ap-agent-body">
                  <div className={`ap-agent-name ${syne.className}`}>{a.name}</div>
                  <div className="ap-agent-role">{a.title}</div>
                  <div className="ap-agent-stats">
                    <div>
                      <div className={`ap-agent-sn ${syne.className}`}>{a.deals}</div>
                      <div className="ap-agent-sl">Deals</div>
                    </div>
                    <div>
                      <div className={`ap-agent-sn ${syne.className}`}>{a.years}</div>
                      <div className="ap-agent-sl">Years</div>
                    </div>
                  </div>
                  <a className="ap-agent-wa" href={`${waBase}?text=${encodeURIComponent(`Hello, I'd like to speak with ${a.name} at ${store.shopName}.`)}`} target="_blank" rel="noopener noreferrer">
                    Contact <ChevronRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── WHY US ─── */}
      <section id="ap-why">
        <div className="ap-section" ref={whyRef}>
          <div style={slideIn(whyVis)}>
            <div className="ap-label">Why Apex</div>
            <h2 className={`ap-h2 ${syne.className}`}>The Difference</h2>
          </div>
          <div className="ap-why-grid">
            {WHY.map(({ Icon, title, desc }, i) => (
              <div key={i} className="ap-why-card" style={slideIn(whyVis, 80 + i * 70)}>
                <div className="ap-why-icon"><Icon size={22} /></div>
                <div>
                  <div className="ap-why-title">{title}</div>
                  <p className="ap-why-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <div id="ap-contact" className="ap-cta-band" ref={ctaRef}>
        <div className="ap-cta-inner">
          <div style={slideIn(ctaVis, 0, 'left')}>
            <h2 className={`ap-cta-h2 ${syne.className}`}>
              Ready to<br /><span>Move?</span>
            </h2>
            <p className="ap-cta-sub">
              Whether you're buying, selling, or investing — we're ready. Message us on WhatsApp for a fast, no-obligation conversation.
            </p>
          </div>
          <div className="ap-cta-right" style={slideIn(ctaVis, 120, 'right')}>
            <a className="ap-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Us Now
            </a>
            <div className="ap-cta-details">
              {(tc?.openingHours || store.openingHours) && <div className="ap-cta-detail"><Clock size={14} className="ap-cta-detail-icon" />{tc?.openingHours || store.openingHours}</div>}
              <div className="ap-cta-detail"><MapPin size={14} className="ap-cta-detail-icon" />City Central Office</div>
              {store.whatsappNumber && <div className="ap-cta-detail"><Phone size={14} className="ap-cta-detail-icon" />{store.whatsappNumber}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="ap-footer">
        <div className={`ap-footer-name ${syne.className}`}>{store.shopName}</div>
        <p className="ap-footer-copy">&copy; {new Date().getFullYear()} {store.shopName} · All Rights Reserved</p>
      </footer>
    </div>
  );
}
