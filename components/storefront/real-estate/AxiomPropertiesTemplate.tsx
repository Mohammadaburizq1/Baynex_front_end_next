'use client';
import { formatMoneyCompact } from '@/lib/utils';

import { useState, useEffect, useRef } from 'react';
import { Anton, Barlow } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Home as HomeIcon, TrendingUp, Key, BarChart2,
  Award, Shield, Clock, Users, MapPin, Phone,
  BedDouble, Bath, Maximize2, ArrowRight, ArrowUpRight,
} from 'lucide-react';

const anton = Anton({ subsets: ['latin'], weight: ['400'] });
const barlow = Barlow({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

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
  { name: 'Dominic Cross', title: 'Managing Director', deals: 230, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
  { name: 'Yuki Tanaka', title: 'Head of Sales', deals: 175, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kofi Mensah', title: 'Investment Advisor', deals: 98, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
];

const SERVICES = [
  { Icon: HomeIcon, num: '01', title: 'Buy', desc: 'Sharp advice on acquisition — from first inspection to final signature. No wasted time.' },
  { Icon: TrendingUp, num: '02', title: 'Sell', desc: 'Maximum exposure, strategic pricing, decisive action. We move property.' },
  { Icon: Key, num: '03', title: 'Lease', desc: 'Premium tenants. Professional management. Full returns, minimal hassle.' },
  { Icon: BarChart2, num: '04', title: 'Invest', desc: 'Portfolio-grade advice backed by granular market data and real track records.' },
];

const WHY = [
  { Icon: Award, title: 'Top Performer', desc: 'Every listing is handled end to end by an experienced agent.' },
  { Icon: Shield, title: 'No Hidden Costs', desc: 'Clear, upfront fee structures. No surprises. No exceptions.' },
  { Icon: Clock, title: '7-Day Service', desc: 'The market doesn\'t work 9–5. Neither do we.' },
  { Icon: Users, title: 'Deep Network', desc: 'Two decades of relationships with buyers, developers, and off-market sellers.' },
];

export default function AxiomPropertiesTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const formatPrice = (p: number) => formatMoneyCompact(p, store.currencyCode);
  const tc = data.templateContent;
  const [category, setCategory] = useState('All');
  const [navSolid, setNavSolid] = useState(false);

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: svcRef, inView: svcVis } = useInView();
  const { ref: propsRef, inView: propsVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: whyRef, inView: whyVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(500, 1400, statsVis);
  const c2 = useCountUp(22, 1200, statsVis);
  const c3 = useCountUp(3, 900, statsVis);
  const c4 = useCountUp(99, 1300, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waDigits = (store.whatsappNumber ?? '').replace(/\D/g, '');
  // No number, no WhatsApp CTAs: a bare wa.me link opens WhatsApp with no recipient.
  const waBase = waDigits ? `https://wa.me/${waDigits}` : null;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const reveal = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${d}ms, transform 0.6s ease ${d}ms`,
  });

  const revealLeft = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(-24px)',
    transition: `opacity 0.6s ease ${d}ms, transform 0.6s ease ${d}ms`,
  });

  const revealRight = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(24px)',
    transition: `opacity 0.6s ease ${d}ms, transform 0.6s ease ${d}ms`,
  });

  return (
    <div className={`ax-root ${barlow.className}`}>
      <style>{`
        .ax-root {
          --black: #0D0D0D;
          --white: #FAFAFA;
          --red: #E62020;
          --red-dark: #B81A1A;
          --grey: #F4F4F4;
          --border: #E8E8E8;
          --body: #3C3C3C;
          --muted: #888888;
          background: var(--white);
          color: var(--black);
          min-height: 100vh;
        }

        @keyframes axSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes axWipe {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes axRedIn {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes axScale {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes axCountPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }

        /* ── Nav ── */
        .ax-nav {
          position: fixed;
          inset: 0 0 auto;
          z-index: 100;
          background: var(--black);
          transition: box-shadow 0.3s;
        }
        .ax-nav.ax-shadow { box-shadow: 0 2px 0 rgba(230,32,32,0.4); }
        .ax-nav-inner {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        .ax-logo {
          display: flex;
          align-items: center;
          gap: 2px;
          cursor: pointer;
        }
        .ax-logo-text {
          font-size: 22px;
          letter-spacing: 0.01em;
          color: var(--white);
          line-height: 1;
        }
        .ax-logo-dot {
          width: 6px;
          height: 6px;
          background: var(--red);
          border-radius: 50%;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .ax-nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .ax-nav-link {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(250,250,250,0.5);
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.2s;
        }
        .ax-nav-link:hover { color: var(--white); }
        .ax-nav-cta {
          padding: 10px 22px;
          background: var(--red);
          color: var(--white);
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ax-nav-cta:hover { background: var(--red-dark); }

        /* ── Hero ── */
        .ax-hero {
          padding: 64px 56px 0;
          max-width: 1300px;
          margin: 0 auto;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }
        .ax-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 20px;
          animation: axSlideUp 0.6s ease both 0.1s;
        }
        .ax-hero-tag::before {
          content: '';
          width: 28px;
          height: 2px;
          background: var(--red);
        }
        .ax-hero-h1-wrap {
          position: relative;
          margin-bottom: 32px;
        }
        .ax-hero-h1 {
          font-size: clamp(64px, 10vw, 148px);
          line-height: 0.88;
          letter-spacing: -0.02em;
          color: var(--black);
          clip-path: inset(0 100% 0 0);
          animation: axWipe 1.2s cubic-bezier(0.22,1,0.36,1) both 0.25s;
        }
        .ax-hero-h1-red {
          color: var(--red);
        }
        .ax-hero-underline {
          height: 6px;
          background: var(--black);
          margin-top: 8px;
          transform-origin: left;
          animation: axScale 0.9s ease both 1.1s;
        }
        .ax-hero-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          margin-top: 28px;
          animation: axSlideUp 0.7s ease both 1s;
        }
        .ax-hero-desc {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--muted);
          max-width: 380px;
        }
        .ax-hero-btns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ax-btn-red {
          padding: 16px 32px;
          background: var(--red);
          color: var(--white);
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, transform 0.2s;
        }
        .ax-btn-red:hover { background: var(--red-dark); transform: translateY(-2px); }
        .ax-btn-black {
          padding: 16px 32px;
          background: var(--black);
          color: var(--white);
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .ax-btn-black:hover { opacity: 0.75; }
        .ax-hero-img-strip {
          margin: 40px -56px 0;
          height: 300px;
          overflow: hidden;
          position: relative;
          animation: axSlideUp 0.8s ease both 1.2s;
        }
        .ax-hero-img-strip img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 40%;
          display: block;
        }
        .ax-hero-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, var(--white) 0%, transparent 20%, transparent 80%, var(--white) 100%);
        }
        .ax-hero-stat-pill {
          position: absolute;
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%);
          background: var(--black);
          color: var(--white);
          padding: 12px 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          white-space: nowrap;
        }
        .ax-hero-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ax-hero-stat-n {
          font-size: 20px;
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--red);
        }
        .ax-hero-stat-l {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(250,250,250,0.4);
          margin-top: 2px;
        }
        .ax-hero-stat-div { width: 1px; height: 28px; background: rgba(255,255,255,0.12); }

        /* ── Stats ── */
        .ax-stats-band {
          background: var(--black);
          padding: 64px 56px;
        }
        .ax-stats-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4,1fr);
        }
        .ax-stat {
          padding: 0 32px;
          border-right: 1px solid rgba(255,255,255,0.08);
          text-align: center;
        }
        .ax-stat:last-child { border-right: none; }
        .ax-stat-num {
          font-size: clamp(48px,5.5vw,72px);
          line-height: 1;
          color: var(--white);
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }
        .ax-stat-sfx { color: var(--red); }
        .ax-stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }

        /* ── Shared wrap ── */
        .ax-wrap {
          max-width: 1300px;
          margin: 0 auto;
          padding: 96px 56px;
        }
        .ax-section-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ax-section-tag::before {
          content: '';
          width: 24px;
          height: 2px;
          background: var(--red);
        }
        .ax-h2 {
          font-size: clamp(36px,4.5vw,60px);
          line-height: 0.95;
          letter-spacing: -0.03em;
          margin: 0 0 12px;
        }

        /* ── About ── */
        .ax-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          margin-top: 48px;
        }
        .ax-about-left {}
        .ax-about-big-num {
          font-size: clamp(80px, 14vw, 180px);
          line-height: 0.85;
          color: var(--grey);
          letter-spacing: -0.04em;
          margin-bottom: 16px;
          position: relative;
        }
        .ax-about-big-num span {
          color: var(--red);
        }
        .ax-about-statement {
          font-size: 22px;
          font-weight: 300;
          line-height: 1.5;
          color: var(--body);
          letter-spacing: -0.01em;
          margin-bottom: 24px;
          border-left: 4px solid var(--red);
          padding-left: 20px;
        }
        .ax-about-right {}
        .ax-about-text {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.85;
          color: var(--body);
          margin-bottom: 14px;
        }
        .ax-about-points {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 24px;
          border-top: 1px solid var(--border);
        }
        .ax-about-point {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
          font-size: 13px;
          font-weight: 500;
          color: var(--body);
        }
        .ax-about-point-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--red);
        }

        /* ── Services ── */
        .ax-svc-band {
          background: var(--black);
          padding: 96px 56px;
        }
        .ax-svc-inner { max-width: 1300px; margin: 0 auto; }
        .ax-svc-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          margin-top: 48px;
          border-left: 1px solid rgba(255,255,255,0.06);
        }
        .ax-svc-card {
          padding: 28px 24px;
          border-right: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
          transition: background 0.25s;
        }
        .ax-svc-card:hover { background: rgba(255,255,255,0.04); }
        .ax-svc-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--red);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .ax-svc-card:hover::after { transform: scaleX(1); }
        .ax-svc-num {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: var(--red);
          margin-bottom: 16px;
        }
        .ax-svc-icon {
          color: rgba(250,250,250,0.4);
          margin-bottom: 14px;
          transition: color 0.2s;
        }
        .ax-svc-card:hover .ax-svc-icon { color: var(--white); }
        .ax-svc-title {
          font-size: 20px;
          letter-spacing: -0.01em;
          color: var(--white);
          margin-bottom: 10px;
        }
        .ax-svc-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          color: rgba(250,250,250,0.35);
        }

        /* ── Properties ── */
        .ax-cat-tabs {
          display: flex;
          gap: 0;
          margin-top: 20px;
          margin-bottom: 32px;
          border-bottom: 2px solid var(--border);
        }
        .ax-cat-tab {
          padding: 10px 20px;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          color: var(--muted);
          position: relative;
          transition: color 0.2s;
        }
        .ax-cat-tab.ax-active { color: var(--black); }
        .ax-cat-tab.ax-active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--red);
        }
        .ax-cat-tab:hover:not(.ax-active) { color: var(--body); }
        .ax-prop-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }
        .ax-prop-card {
          background: var(--white);
          overflow: hidden;
          transition: background 0.2s;
          position: relative;
        }
        .ax-prop-card:hover { background: var(--grey); }
        .ax-prop-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--red);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.35s ease;
          z-index: 1;
        }
        .ax-prop-card:hover::before { transform: scaleY(1); }
        .ax-prop-img-wrap {
          height: 200px;
          overflow: hidden;
          position: relative;
        }
        .ax-prop-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s;
          filter: grayscale(20%);
        }
        .ax-prop-card:hover .ax-prop-img { transform: scale(1.05); filter: grayscale(0%); }
        .ax-prop-cat {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--black);
          color: var(--white);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 10px;
        }
        .ax-prop-body { padding: 20px; }
        .ax-prop-price {
          font-size: 30px;
          letter-spacing: -0.02em;
          color: var(--red);
          line-height: 1;
          margin-bottom: 4px;
        }
        .ax-prop-name {
          font-size: 13px;
          font-weight: 400;
          color: var(--body);
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .ax-prop-specs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          padding: 10px 0;
          border-top: 1px solid var(--border);
          margin-bottom: 14px;
        }
        .ax-prop-spec {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
        }
        .ax-prop-wa {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-top: 1px solid var(--border);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--black);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ax-prop-wa:hover { color: var(--red); }

        /* ── Team ── */
        .ax-team-band {
          background: var(--grey);
          padding: 96px 56px;
        }
        .ax-team-inner { max-width: 1300px; margin: 0 auto; }
        .ax-team-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 20px;
          margin-top: 48px;
        }
        .ax-agent-card {
          background: var(--white);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .ax-agent-card:hover { box-shadow: 0 10px 36px rgba(0,0,0,0.1); transform: translateY(-4px); }
        .ax-agent-photo-wrap {
          height: 260px;
          overflow: hidden;
          position: relative;
        }
        .ax-agent-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          display: block;
          filter: grayscale(40%) brightness(0.9);
          transition: filter 0.4s, transform 0.4s;
        }
        .ax-agent-card:hover .ax-agent-photo { filter: grayscale(0%) brightness(1); transform: scale(1.04); }
        .ax-agent-body { padding: 18px; }
        .ax-agent-num {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 6px;
        }
        .ax-agent-name {
          font-size: 22px;
          letter-spacing: -0.01em;
          color: var(--black);
          margin-bottom: 3px;
          line-height: 1.1;
        }
        .ax-agent-role {
          font-size: 12px;
          font-weight: 500;
          color: var(--muted);
          margin-bottom: 14px;
        }
        .ax-agent-deals {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          margin-bottom: 12px;
        }
        .ax-agent-deals-n {
          font-size: 26px;
          letter-spacing: -0.02em;
          color: var(--black);
          line-height: 1;
        }
        .ax-agent-deals-l {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .ax-agent-wa {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--black);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ax-agent-wa:hover { color: var(--red); }

        /* ── Why Us ── */
        .ax-why-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 16px;
          margin-top: 48px;
        }
        .ax-why-card {
          display: flex;
          gap: 16px;
          padding: 24px;
          border: 1px solid var(--border);
          background: var(--white);
          transition: border-color 0.25s;
          position: relative;
          overflow: hidden;
        }
        .ax-why-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 3px;
          background: var(--red);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.35s ease;
        }
        .ax-why-card:hover { border-color: var(--black); }
        .ax-why-card:hover::before { transform: scaleY(1); }
        .ax-why-icon {
          width: 44px;
          height: 44px;
          background: var(--black);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .ax-why-card:hover .ax-why-icon { background: var(--red); }
        .ax-why-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--black);
          margin-bottom: 5px;
          letter-spacing: -0.01em;
        }
        .ax-why-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          color: var(--body);
        }

        /* ── CTA ── */
        .ax-cta-band {
          background: var(--red);
          padding: 96px 56px;
          position: relative;
          overflow: hidden;
        }
        .ax-cta-band::after {
          content: '';
          position: absolute;
          right: -8%;
          top: 50%;
          transform: translateY(-50%);
          font-size: 28vw;
          font-weight: 900;
          color: rgba(255,255,255,0.07);
          line-height: 1;
          letter-spacing: -0.04em;
          pointer-events: none;
        }
        .ax-cta-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 60px;
          align-items: center;
          position: relative;
        }
        .ax-cta-h2 {
          font-size: clamp(48px,6vw,80px);
          letter-spacing: -0.03em;
          line-height: 0.92;
          color: var(--white);
          margin-bottom: 14px;
        }
        .ax-cta-sub {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.75;
          color: rgba(255,255,255,0.65);
          max-width: 440px;
        }
        .ax-cta-right {
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: flex-start;
          min-width: 240px;
        }
        .ax-cta-wa {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 18px 32px;
          background: var(--black);
          color: var(--white);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          width: 100%;
          justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .ax-cta-wa:hover { opacity: 0.85; transform: translateY(-2px); }
        .ax-cta-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
        }

        /* ── Footer ── */
        .ax-footer {
          background: var(--black);
          padding: 36px 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .ax-footer-name {
          font-size: 20px;
          letter-spacing: -0.01em;
          color: rgba(250,250,250,0.3);
        }
        .ax-footer-copy {
          font-size: 11px;
          color: rgba(250,250,250,0.15);
          letter-spacing: 0.06em;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .ax-nav-inner, .ax-hero, .ax-wrap, .ax-stats-band, .ax-svc-band, .ax-team-band, .ax-cta-band, .ax-footer { padding-left: 24px; padding-right: 24px; }
          .ax-hero-img-strip { margin-left: -24px; margin-right: -24px; }
          .ax-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .ax-cta-inner { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .ax-stats-inner { grid-template-columns: repeat(2,1fr); }
          .ax-stat { border: none; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 20px 8px; }
          .ax-stat:nth-last-child(-n+2) { border-bottom: none; }
          .ax-svc-grid { grid-template-columns: repeat(2,1fr); }
          .ax-prop-grid { grid-template-columns: repeat(2,1fr); }
          .ax-team-grid { grid-template-columns: 1fr 1fr; }
          .ax-why-grid { grid-template-columns: 1fr; }
          .ax-nav-links { display: none; }
          .ax-footer { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 560px) {
          .ax-prop-grid, .ax-team-grid, .ax-svc-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`ax-nav${navSolid ? ' ax-shadow' : ''}`}>
        <div className="ax-nav-inner">
          <div className="ax-logo" onClick={() => scrollTo('ax-top')}>
            <span className={`ax-logo-text ${anton.className}`}>{store.shopName.toUpperCase()}</span>
            <span className="ax-logo-dot" />
          </div>
          <div className="ax-nav-links">
            {[['About','ax-about'],['Services','ax-services'],['Properties','ax-properties'],['Contact','ax-contact']].map(([l,id]) => (
              <button key={id} className="ax-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            {waBase && (
            <button className="ax-nav-cta" onClick={() => window.open(waBase,'_blank')}>Enquire</button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="ax-top" className="ax-hero">
        <div className="ax-hero-tag">Real Estate Agency</div>
        <div className="ax-hero-h1-wrap">
          <div className={`ax-hero-h1 ${anton.className}`}>
            <span>WE CLOSE</span><br/>
            <span className="ax-hero-h1-red">DEALS.</span>
          </div>
          <div className="ax-hero-underline" />
        </div>
        <div className="ax-hero-bottom">
          <p className="ax-hero-desc">
            {tc?.heroDescription || store.description || 'Premier real estate agency. Proven results. Two decades of deals that matter.'}
          </p>
          <div className="ax-hero-btns">
            <button className="ax-btn-red" onClick={() => scrollTo('ax-properties')}>
              See Listings <ArrowRight size={14} />
            </button>
            <button className="ax-btn-black" onClick={() => scrollTo('ax-about')}>About Us</button>
          </div>
        </div>
        <div className="ax-hero-img-strip">
          <img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80" alt="Property" />
          <div className="ax-hero-img-overlay" />
          {data.demo && (
          <div className="ax-hero-stat-pill">
            <div className="ax-hero-stat-item">
              <div className={`ax-hero-stat-n ${anton.className}`}>500+</div>
              <div className="ax-hero-stat-l">Properties Closed</div>
            </div>
            <div className="ax-hero-stat-div" />
            <div className="ax-hero-stat-item">
              <div className={`ax-hero-stat-n ${anton.className}`}>22 YRS</div>
              <div className="ax-hero-stat-l">In Business</div>
            </div>
            <div className="ax-hero-stat-div" />
            <div className="ax-hero-stat-item">
              <div className={`ax-hero-stat-n ${anton.className}`}>$3B+</div>
              <div className="ax-hero-stat-l">Total Sales</div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* ── STATS ── */}
      {data.demo && (<>
      <div className="ax-stats-band" ref={statsRef}>
        <div className="ax-stats-inner">
          {[
            { v: c1, s: '+', l: 'Properties Sold', pre: '' },
            { v: c2, s: ' yrs', l: 'Years Active', pre: '' },
            { v: c3, s: 'B+', l: 'In Closed Deals', pre: '$' },
            { v: c4, s: '%', l: 'Client Satisfaction', pre: '' },
          ].map(({ v, s, l, pre }, i) => (
            <div key={i} className="ax-stat" style={reveal(statsVis, i * 70)}>
              <div className={`ax-stat-num ${anton.className}`}>{pre}{v}<span className="ax-stat-sfx">{s}</span></div>
              <div className="ax-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
      </>)}

      {/* ── ABOUT ── */}
      <div id="ax-about">
        <div className="ax-wrap" ref={aboutRef}>
          <div className="ax-section-tag">About</div>
          <div className="ax-about-grid">
            <div style={revealLeft(aboutVis)}>
              {data.demo && (<>
              <div className={`ax-about-big-num ${anton.className}`}>22<span>+</span></div>
              <p className="ax-about-statement">
                Years of closing deals that other agencies couldn't.
              </p>
              </>)}
            </div>
            <div style={revealRight(aboutVis, 100)}>
              <h2 className={`ax-h2 ${anton.className}`} style={{ marginBottom: 20 }}>WE DON'T WAIT. WE MOVE.</h2>
              <p className="ax-about-text">
                {store.shopName} was built on one principle: act with precision, deliver results. Since 2002, we've closed over 500 transactions and managed more than three billion dollars in property value.
              </p>
              <p className="ax-about-text">
                We're not here to make friends — we're here to get you the best possible outcome, every time.
              </p>
              <div className="ax-about-points">
                {['Dedicated agent, every client','Off-market inventory access','Data-driven market pricing','No-nonsense, transparent fees'].map((p, i) => (
                  <div key={i} className="ax-about-point">
                    {p}
                    <span className="ax-about-point-num">0{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div id="ax-services" className="ax-svc-band" ref={svcRef}>
        <div className="ax-svc-inner">
          <div style={reveal(svcVis)}>
            <div className="ax-section-tag" style={{ color: 'var(--red)' }}>Services</div>
            <h2 className={`ax-h2 ${anton.className}`} style={{ color: 'var(--white)' }}>WHAT WE DO</h2>
          </div>
          <div className="ax-svc-grid">
            {SERVICES.map(({ Icon, num, title, desc }, i) => (
              <div key={i} className="ax-svc-card" style={reveal(svcVis, 80 + i * 80)}>
                <div className="ax-svc-num">{num}</div>
                <div className="ax-svc-icon"><Icon size={22} /></div>
                <div className={`ax-svc-title ${anton.className}`}>{title.toUpperCase()}</div>
                <p className="ax-svc-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROPERTIES ── */}
      <div id="ax-properties">
        <div className="ax-wrap" ref={propsRef}>
          <div style={reveal(propsVis)}>
            <div className="ax-section-tag">Listings</div>
            <h2 className={`ax-h2 ${anton.className}`}>AVAILABLE NOW</h2>
          </div>
          <div className="ax-cat-tabs" style={reveal(propsVis, 60)}>
            {categories.map(cat => (
              <button key={cat} className={`ax-cat-tab${category === cat ? ' ax-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="ax-prop-grid">
            {filtered.map((prop, i) => {
              const { specs } = parseSpecs(prop.description);
              const msg = `Hello ${store.shopName}! I'm interested in ${prop.name} at ${formatPrice(prop.price)}.`;
              return (
                <div key={prop.id} className="ax-prop-card" style={reveal(propsVis, 80 + i * 60)}>
                  <div className="ax-prop-img-wrap">
                    <img className="ax-prop-img" src={prop.imageUrl ?? ''} alt={prop.name} />
                    <span className="ax-prop-cat">{prop.category}</span>
                  </div>
                  <div className="ax-prop-body">
                    <div className={`ax-prop-price ${anton.className}`}>{formatPrice(prop.price)}</div>
                    <div className="ax-prop-name">{prop.name}</div>
                    <div className="ax-prop-specs">
                      {specs.map((s, si) => <span key={si} className="ax-prop-spec"><SpecIcon label={s} />{s}</span>)}
                    </div>
                    {waBase && (
                    <a className="ax-prop-wa" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                      Enquire Now <ArrowUpRight size={13} />
                    </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      {data.demo && (<>
      <div className="ax-team-band" ref={teamRef}>
        <div className="ax-team-inner">
          <div style={reveal(teamVis)}>
            <div className="ax-section-tag">The Team</div>
            <h2 className={`ax-h2 ${anton.className}`}>WHO CLOSES YOUR DEAL</h2>
          </div>
          <div className="ax-team-grid">
            {AGENTS.map((a, i) => (
              <div key={i} className="ax-agent-card" style={reveal(teamVis, 80 + i * 90)}>
                <div className="ax-agent-photo-wrap">
                  <img className="ax-agent-photo" src={a.img} alt={a.name} />
                </div>
                <div className="ax-agent-body">
                  <div className="ax-agent-num">0{i + 1}</div>
                  <div className={`ax-agent-name ${anton.className}`}>{a.name.toUpperCase()}</div>
                  <div className="ax-agent-role">{a.title}</div>
                  <div className="ax-agent-deals">
                    <div>
                      <div className={`ax-agent-deals-n ${anton.className}`}>{a.deals}</div>
                      <div className="ax-agent-deals-l">Deals Closed</div>
                    </div>
                  </div>
                  {waBase && (
                  <a className="ax-agent-wa" href={`${waBase}?text=${encodeURIComponent(`Hello, I'd like to connect with ${a.name}.`)}`} target="_blank" rel="noopener noreferrer">
                    Contact <ArrowUpRight size={12} />
                  </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>)}

      {/* ── WHY US ── */}
      <div>
        <div className="ax-wrap" ref={whyRef}>
          <div style={reveal(whyVis)}>
            <div className="ax-section-tag">Why Axiom</div>
            <h2 className={`ax-h2 ${anton.className}`}>THE DIFFERENCE</h2>
          </div>
          <div className="ax-why-grid">
            {WHY.map(({ Icon, title, desc }, i) => (
              <div key={i} className="ax-why-card" style={reveal(whyVis, 80 + i * 70)}>
                <div className="ax-why-icon"><Icon size={20} /></div>
                <div>
                  <div className="ax-why-title">{title}</div>
                  <p className="ax-why-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div id="ax-contact" className="ax-cta-band" ref={ctaRef}>
        <div className="ax-cta-inner">
          <div style={revealLeft(ctaVis)}>
            <h2 className={`ax-cta-h2 ${anton.className}`}>
              READY TO<br />MOVE?
            </h2>
            <p className="ax-cta-sub">
              One conversation changes everything. Send us a message on WhatsApp and we'll respond fast — because that's how we work.
            </p>
          </div>
          <div className="ax-cta-right" style={revealRight(ctaVis, 100)}>
            {waBase && (
            <a className="ax-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Message on WhatsApp
            </a>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="ax-cta-detail"><MapPin size={13} />City Centre Office</div>
              {(tc?.openingHours || store.openingHours) && <div className="ax-cta-detail"><Clock size={13} />{tc?.openingHours || store.openingHours}</div>}
              {store.whatsappNumber && <div className="ax-cta-detail"><Phone size={13} />{store.whatsappNumber}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="ax-footer">
        <div className={`ax-footer-name ${anton.className}`}>{store.shopName.toUpperCase()}</div>
        <p className="ax-footer-copy">&copy; {new Date().getFullYear()} {store.shopName}. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
