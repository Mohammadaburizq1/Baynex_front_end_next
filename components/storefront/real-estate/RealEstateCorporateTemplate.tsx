'use client';
import { formatMoneyCompact } from '@/lib/utils';

import { useState, useEffect, useRef } from 'react';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Home as HomeIcon, TrendingUp, Key, BarChart2,
  Award, Shield, Clock, Users, Phone,
  MapPin, ChevronRight, BedDouble, Bath, Maximize2, Quote,
} from 'lucide-react';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
});
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

function parseSpecs(desc: string) {
  const parts = desc.split(' · ');
  return { specs: parts.slice(0, 3) };
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

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

const AGENTS = [
  { name: 'Oliver Grant', title: 'Head of Residential', deals: 143, years: 15, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mei Lin', title: 'Luxury Portfolio Advisor', deals: 98, years: 10, img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80' },
  { name: 'David Asante', title: 'Commercial Specialist', deals: 117, years: 12, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
];

const SERVICES = [
  { Icon: HomeIcon, num: '01', title: 'Buy', desc: 'We guide buyers through every step, from first viewing to final signature — with unparalleled market knowledge.' },
  { Icon: TrendingUp, num: '02', title: 'Sell', desc: 'Our proven strategies and premium marketing consistently achieve above-market results for our sellers.' },
  { Icon: Key, num: '03', title: 'Rent', desc: 'Find the ideal rental in prime locations. We manage every detail so you can move with confidence.' },
  { Icon: BarChart2, num: '04', title: 'Invest', desc: 'Grow your portfolio with expert investment advisory — identifying opportunities before they reach the market.' },
];

const TESTIMONIALS = [
  { quote: 'Luminary found us our perfect home in three weeks. Their market knowledge is genuinely unmatched — we felt guided every step of the way.', author: 'Sarah & Michael T.', location: 'Purchased in Central Heights' },
  { quote: 'We sold above asking price within days. The process was completely transparent and stress-free. I wouldn\'t use anyone else.', author: 'James W.', location: 'Sold in Marina Quarter' },
  { quote: 'As a first-time buyer I had so many questions. My advisor was patient, knowledgeable, and made it a genuinely exciting experience.', author: 'Aisha K.', location: 'Purchased in Old Town' },
];

const WHY = [
  { Icon: Award, title: 'Industry-Leading Results', desc: 'Consistently ranked among the top agencies in the region for volume and client satisfaction.' },
  { Icon: Shield, title: 'Fully Transparent', desc: 'Clear pricing, honest advice, no hidden costs. Your interests are always our first priority.' },
  { Icon: Clock, title: '7-Day Availability', desc: 'Real estate doesn\'t stop at 5pm — neither do we. Our team is reachable whenever you need us.' },
  { Icon: Users, title: 'Specialist Advisors', desc: 'Every agent specialises in a specific property type or area, giving you genuine depth of expertise.' },
];

export default function RealEstateCorporateTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const formatPrice = (p: number) => formatMoneyCompact(p, store.currencyCode);
  const tc = data.templateContent;
  const [category, setCategory] = useState('All');
  const [navSolid, setNavSolid] = useState(false);

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: svcRef, inView: svcVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: propsRef, inView: propsVis } = useInView();
  const { ref: testRef, inView: testVis } = useInView();
  const { ref: whyRef, inView: whyVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(500, 1400, statsVis);
  const c2 = useCountUp(25, 1200, statsVis);
  const c3 = useCountUp(2, 900, statsVis);
  const c4 = useCountUp(98, 1300, statsVis);

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

  const show = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });

  return (
    <div className={`rc-root ${outfit.className}`}>
      <style>{`
        .rc-root {
          --white: #FFFFFF;
          --warm: #F8F4EF;
          --warm-alt: #F1EBE3;
          --navy: #0E1E35;
          --navy-mid: #17325A;
          --navy-light: #1E4070;
          --copper: #C07830;
          --copper-light: #DDA04A;
          --border: #E4DDD3;
          --text: #1E2D42;
          --body: #445066;
          --muted: #8A95A8;
          background: var(--white);
          color: var(--text);
          min-height: 100vh;
        }

        /* ── Keyframes ── */
        @keyframes splitRevealL {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes splitRevealR {
          from { opacity: 0; transform: scale(1.06); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 48px; }
        }

        /* ── Nav ── */
        .rc-nav {
          position: fixed;
          inset: 0 0 auto;
          z-index: 100;
          padding: 0 56px;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .rc-nav.rc-solid {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 var(--border);
        }
        .rc-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .rc-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .rc-logo-sq {
          width: 36px;
          height: 36px;
          background: var(--copper);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 15px;
        }
        .rc-logo-text-name {
          font-size: 19px;
          line-height: 1;
          color: var(--navy);
        }
        .rc-logo-text-sub {
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--copper);
          font-weight: 600;
          margin-top: 3px;
        }
        .rc-nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .rc-nav-link {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--body);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.2s;
        }
        .rc-nav-link:hover { color: var(--copper); }
        .rc-nav-cta {
          padding: 10px 24px;
          background: var(--navy);
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .rc-nav-cta:hover { background: var(--navy-mid); }

        /* ── Hero (split layout) ── */
        .rc-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .rc-hero-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 120px 64px 80px;
          background: var(--warm);
          animation: splitRevealL 1s ease both 0.1s;
        }
        .rc-hero-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--copper);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rc-hero-tag::before {
          content: '';
          display: block;
          height: 1px;
          width: 32px;
          background: var(--copper);
        }
        .rc-hero-h1 {
          font-size: clamp(44px, 5vw, 72px);
          line-height: 1.08;
          color: var(--navy);
          font-weight: 300;
          font-style: italic;
          margin: 0 0 20px;
          letter-spacing: -0.01em;
        }
        .rc-hero-desc {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--body);
          max-width: 420px;
          margin-bottom: 36px;
        }
        .rc-hero-btns {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 52px;
        }
        .rc-btn-primary {
          padding: 14px 32px;
          background: var(--navy);
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .rc-btn-primary:hover { background: var(--navy-mid); }
        .rc-btn-outline {
          padding: 14px 32px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rc-btn-outline:hover { border-color: var(--navy); color: var(--navy); }
        .rc-hero-mini-stats {
          display: flex;
          gap: 32px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
        }
        .rc-mini-stat-num {
          font-size: 28px;
          color: var(--navy);
          font-weight: 600;
          line-height: 1;
        }
        .rc-mini-stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 4px;
        }
        .rc-hero-image {
          position: relative;
          overflow: hidden;
          animation: splitRevealR 1.2s ease both 0.3s;
        }
        .rc-hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rc-hero-img-label {
          position: absolute;
          bottom: 32px;
          left: 32px;
          background: rgba(14,30,53,0.9);
          backdrop-filter: blur(8px);
          color: #fff;
          padding: 12px 18px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rc-hero-img-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ADE80;
        }

        /* ── Stats band ── */
        .rc-stats-band {
          background: var(--navy);
          padding: 64px 56px;
        }
        .rc-stats-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .rc-stat {
          padding: 0 32px;
          border-right: 1px solid rgba(255,255,255,0.08);
          text-align: center;
        }
        .rc-stat:last-child { border-right: none; }
        .rc-stat-num {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0;
          margin-bottom: 8px;
        }
        .rc-stat-val {
          font-size: clamp(40px, 4.5vw, 60px);
          line-height: 1;
          color: var(--copper-light);
          font-weight: 300;
          font-style: italic;
        }
        .rc-stat-sfx {
          font-size: 0.5em;
          padding-top: 0.2em;
          color: var(--copper);
        }
        .rc-stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          margin-bottom: 3px;
        }
        .rc-stat-sub {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.35);
        }

        /* ── Section shell ── */
        .rc-section {
          padding: 96px 56px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .rc-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--copper);
          margin-bottom: 14px;
        }
        .rc-label::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: var(--copper);
        }
        .rc-h2 {
          font-size: clamp(34px, 4vw, 54px);
          line-height: 1.1;
          color: var(--navy);
          font-weight: 300;
          font-style: italic;
          margin: 0 0 12px;
        }
        .rc-h2.rc-light { color: #fff; }

        /* ── About ── */
        .rc-about-band {
          background: var(--warm);
          padding: 0;
        }
        .rc-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 560px;
        }
        .rc-about-image {
          position: relative;
          overflow: hidden;
        }
        .rc-about-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rc-about-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(14,30,53,0.5) 0%, transparent 60%);
        }
        .rc-about-content {
          padding: 80px 64px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: var(--warm);
        }
        .rc-about-content p {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.85;
          color: var(--body);
          margin-bottom: 16px;
        }
        .rc-about-highlights {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 28px 0;
        }
        .rc-about-highlight {
          padding: 16px;
          background: #fff;
          border: 1px solid var(--border);
          border-top: 3px solid var(--copper);
        }
        .rc-about-highlight-num {
          font-size: 26px;
          color: var(--navy);
          font-weight: 300;
          font-style: italic;
          line-height: 1;
          margin-bottom: 4px;
        }
        .rc-about-highlight-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .rc-text-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--navy);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: gap 0.2s, color 0.2s;
        }
        .rc-text-link:hover { gap: 14px; color: var(--copper); }

        /* ── Services ── */
        .rc-svc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: var(--border);
          margin-top: 48px;
          border: 1px solid var(--border);
        }
        .rc-svc-item {
          background: var(--white);
          padding: 36px;
          display: flex;
          gap: 24px;
          transition: background 0.2s;
        }
        .rc-svc-item:hover { background: var(--warm); }
        .rc-svc-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--copper);
          flex-shrink: 0;
          padding-top: 3px;
        }
        .rc-svc-icon {
          width: 40px;
          height: 40px;
          background: var(--warm-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--navy);
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .rc-svc-item:hover .rc-svc-icon { background: var(--copper); color: #fff; }
        .rc-svc-title {
          font-size: 20px;
          color: var(--navy);
          font-weight: 300;
          font-style: italic;
          margin-bottom: 8px;
        }
        .rc-svc-desc {
          font-size: 13px;
          line-height: 1.75;
          color: var(--body);
          font-weight: 300;
        }

        /* ── Team ── */
        .rc-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 48px;
        }
        .rc-agent-card {
          border: 1px solid var(--border);
          overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
          background: var(--white);
        }
        .rc-agent-card:hover {
          box-shadow: 0 12px 40px rgba(14,30,53,0.1);
          transform: translateY(-4px);
        }
        .rc-agent-photo-wrap {
          position: relative;
          height: 252px;
          overflow: hidden;
        }
        .rc-agent-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: transform 0.4s;
        }
        .rc-agent-card:hover .rc-agent-photo { transform: scale(1.04); }
        .rc-agent-copper-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--copper);
        }
        .rc-agent-body { padding: 22px; }
        .rc-agent-name {
          font-size: 21px;
          color: var(--navy);
          font-weight: 300;
          font-style: italic;
          margin-bottom: 5px;
        }
        .rc-agent-role {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--copper);
          margin-bottom: 16px;
        }
        .rc-agent-stats {
          display: flex;
          gap: 20px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
          margin-bottom: 14px;
        }
        .rc-agent-sn {
          font-size: 22px;
          color: var(--navy);
          font-weight: 300;
          line-height: 1;
        }
        .rc-agent-sl {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 3px;
        }
        .rc-agent-wa {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--navy);
          text-decoration: none;
          transition: color 0.2s;
        }
        .rc-agent-wa:hover { color: var(--copper); }

        /* ── Properties ── */
        .rc-props-band {
          background: var(--warm);
          padding: 96px 56px;
        }
        .rc-props-inner { max-width: 1280px; margin: 0 auto; }
        .rc-cat-tabs {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin: 24px 0 36px;
        }
        .rc-cat-tab {
          padding: 8px 18px;
          border: 1px solid var(--border);
          background: none;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--body);
        }
        .rc-cat-tab.rc-active {
          background: var(--navy);
          color: #fff;
          border-color: var(--navy);
        }
        .rc-cat-tab:hover:not(.rc-active) { border-color: var(--navy); color: var(--navy); }
        .rc-prop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .rc-prop-card {
          background: var(--white);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .rc-prop-card:hover {
          box-shadow: 0 14px 44px rgba(14,30,53,0.1);
          transform: translateY(-4px);
        }
        .rc-prop-img-wrap {
          position: relative;
          height: 224px;
          overflow: hidden;
        }
        .rc-prop-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s;
        }
        .rc-prop-card:hover .rc-prop-img { transform: scale(1.05); }
        .rc-prop-cat {
          position: absolute;
          bottom: 0;
          left: 0;
          background: var(--copper);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 5px 10px;
        }
        .rc-prop-body { padding: 22px; }
        .rc-prop-price {
          font-size: 28px;
          color: var(--navy);
          font-weight: 300;
          font-style: italic;
          line-height: 1;
          margin-bottom: 6px;
        }
        .rc-prop-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--body);
          margin-bottom: 14px;
          line-height: 1.4;
        }
        .rc-prop-specs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          margin-bottom: 14px;
        }
        .rc-prop-spec {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          color: var(--muted);
        }
        .rc-prop-wa {
          display: block;
          width: 100%;
          padding: 10px;
          background: var(--navy);
          color: #fff;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .rc-prop-wa:hover { background: var(--navy-mid); }

        /* ── Testimonials ── */
        .rc-test-band {
          background: var(--navy);
          padding: 96px 56px;
        }
        .rc-test-inner { max-width: 1280px; margin: 0 auto; }
        .rc-test-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 48px;
        }
        .rc-test-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: background 0.2s;
        }
        .rc-test-card:hover { background: rgba(255,255,255,0.08); }
        .rc-test-quote-icon {
          color: var(--copper);
          opacity: 0.6;
        }
        .rc-test-text {
          font-size: 15px;
          line-height: 1.8;
          color: rgba(255,255,255,0.7);
          font-weight: 300;
          font-style: italic;
          flex: 1;
        }
        .rc-test-author-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
        }
        .rc-test-author-loc {
          font-size: 11px;
          font-weight: 400;
          color: var(--copper);
          letter-spacing: 0.04em;
        }

        /* ── Why Us ── */
        .rc-why-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 48px;
        }
        .rc-why-item {
          padding: 28px;
          border: 1px solid var(--border);
          display: flex;
          gap: 18px;
          background: var(--white);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rc-why-item:hover {
          border-color: var(--copper);
          box-shadow: 0 4px 20px rgba(192,120,48,0.08);
        }
        .rc-why-icon {
          width: 44px;
          height: 44px;
          background: var(--warm-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--copper);
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .rc-why-item:hover .rc-why-icon { background: var(--copper); color: #fff; }
        .rc-why-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--navy);
          margin-bottom: 6px;
        }
        .rc-why-desc {
          font-size: 13px;
          line-height: 1.7;
          color: var(--body);
          font-weight: 300;
        }

        /* ── Contact CTA ── */
        .rc-cta-band {
          background: var(--warm-alt);
          padding: 96px 56px;
        }
        .rc-cta-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .rc-cta-image {
          position: relative;
          height: 420px;
          overflow: hidden;
        }
        .rc-cta-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rc-cta-image-copper {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--copper);
        }
        .rc-cta-content {}
        .rc-cta-h2 {
          font-size: clamp(36px, 4vw, 54px);
          line-height: 1.1;
          color: var(--navy);
          font-weight: 300;
          font-style: italic;
          margin-bottom: 16px;
        }
        .rc-cta-body {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--body);
          margin-bottom: 36px;
        }
        .rc-cta-wa {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          background: var(--navy);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s;
          margin-bottom: 24px;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .rc-cta-wa:hover { background: var(--navy-mid); }
        .rc-cta-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rc-cta-detail {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--body);
          font-weight: 400;
        }
        .rc-cta-detail-icon { color: var(--copper); flex-shrink: 0; }

        /* ── Footer ── */
        .rc-footer {
          background: var(--navy);
          padding: 48px 56px;
          text-align: center;
        }
        .rc-footer-name {
          font-size: 22px;
          color: rgba(255,255,255,0.55);
          font-weight: 300;
          font-style: italic;
          margin-bottom: 8px;
        }
        .rc-footer-copy {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.1em;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .rc-hero { grid-template-columns: 1fr; min-height: auto; }
          .rc-hero-image { height: 380px; }
          .rc-hero-text { padding: 100px 32px 60px; }
          .rc-nav, .rc-stats-band, .rc-props-band,
          .rc-test-band, .rc-cta-band, .rc-footer { padding-left: 24px; padding-right: 24px; }
          .rc-section { padding: 72px 24px; }
          .rc-about-grid { grid-template-columns: 1fr; }
          .rc-about-image { height: 320px; }
          .rc-about-content { padding: 48px 24px; }
        }
        @media (max-width: 860px) {
          .rc-stats-inner { grid-template-columns: repeat(2, 1fr); }
          .rc-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 24px 12px; }
          .rc-stat:nth-last-child(-n+2) { border-bottom: none; }
          .rc-svc-grid { grid-template-columns: 1fr; }
          .rc-team-grid { grid-template-columns: 1fr 1fr; }
          .rc-prop-grid { grid-template-columns: 1fr 1fr; }
          .rc-test-grid { grid-template-columns: 1fr; }
          .rc-why-grid { grid-template-columns: 1fr; }
          .rc-cta-grid { grid-template-columns: 1fr; gap: 40px; }
          .rc-nav-links { display: none; }
        }
        @media (max-width: 560px) {
          .rc-prop-grid { grid-template-columns: 1fr; }
          .rc-team-grid { grid-template-columns: 1fr; }
          .rc-about-highlights { grid-template-columns: 1fr; }
          .rc-hero-mini-stats { flex-wrap: wrap; gap: 20px; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav className={`rc-nav${navSolid ? ' rc-solid' : ''}`}>
        <div className="rc-nav-inner">
          <div className="rc-logo" onClick={() => scrollTo('rc-top')}>
            <div className={`rc-logo-sq ${cormorant.className}`}>
              {store.shopName.charAt(0)}
            </div>
            <div>
              <div className={`rc-logo-text-name ${cormorant.className}`}>{store.shopName}</div>
              <div className="rc-logo-text-sub">Real Estate</div>
            </div>
          </div>
          <div className="rc-nav-links">
            {[['About', 'rc-about'], ['Services', 'rc-services'], ['Properties', 'rc-properties'], ['Contact', 'rc-contact']].map(([label, id]) => (
              <button key={id} className="rc-nav-link" onClick={() => scrollTo(id)}>
                {label}
              </button>
            ))}
            {waBase && (
            <button className="rc-nav-cta" onClick={() => window.open(waBase, '_blank')}>
              Get in Touch
            </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO (split) ─── */}
      <section id="rc-top" className="rc-hero">
        <div className="rc-hero-text">
          <p className="rc-hero-tag">Premium Real Estate Since 1999</p>
          <h1 className={`rc-hero-h1 ${cormorant.className}`}>
            Discover Spaces<br />Worth Calling Home
          </h1>
          <p className="rc-hero-desc">
            {tc?.heroDescription || store.description || 'A trusted partner in luxury and residential real estate. We connect exceptional people with extraordinary properties.'}
          </p>
          <div className="rc-hero-btns">
            <button className="rc-btn-primary" onClick={() => scrollTo('rc-properties')}>
              Browse Listings
            </button>
            <button className="rc-btn-outline" onClick={() => scrollTo('rc-about')}>
              About Us
            </button>
          </div>
          {data.demo && (
          <div className="rc-hero-mini-stats">
            {[['500+', 'Properties'], ['25yr', 'Experience'], ['$2B+', 'In Sales'], ['98%', 'Satisfaction']].map(([num, label]) => (
              <div key={label}>
                <div className={`rc-mini-stat-num ${cormorant.className}`}>{num}</div>
                <div className="rc-mini-stat-label">{label}</div>
              </div>
            ))}
          </div>
          )}
        </div>
        <div className="rc-hero-image">
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80"
            alt="Luxury property"
          />
          <div className="rc-hero-img-label">
            <span className="rc-hero-img-dot" />
            New listings available this week
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      {data.demo && (<>
      <div className="rc-stats-band" ref={statsRef}>
        <div className="rc-stats-inner">
          {[
            { val: c1, sfx: '+', label: 'Properties Listed', sub: 'across the region' },
            { val: c2, sfx: ' yrs', label: 'Years in Business', sub: 'established 1999' },
            { val: c3, sfx: 'B+', label: 'In Sales Value', sub: 'total portfolio', pre: '$' },
            { val: c4, sfx: '%', label: 'Client Satisfaction', sub: 'five-star rated' },
          ].map(({ val, sfx, label, sub, pre }, i) => (
            <div key={i} className="rc-stat" style={show(statsVis, i * 90)}>
              <div className="rc-stat-num">
                <span className={`rc-stat-val ${cormorant.className}`}>{pre}{val}</span>
                <span className={`rc-stat-sfx ${cormorant.className}`}>{sfx}</span>
              </div>
              <div className="rc-stat-label">{label}</div>
              <div className="rc-stat-sub">{sub}</div>
            </div>
          ))}
        </div>
      </div>
      </>)}

      {/* ─── ABOUT ─── */}
      <div id="rc-about" className="rc-about-band" ref={aboutRef}>
        <div className="rc-about-grid">
          <div className="rc-about-image" style={show(aboutVis)}>
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
              alt="Our office"
            />
            <div className="rc-about-image-overlay" />
          </div>
          <div className="rc-about-content" style={show(aboutVis, 120)}>
            <div className="rc-label">About Us</div>
            <h2 className={`rc-h2 ${cormorant.className}`} style={{ marginBottom: 20 }}>
              A Legacy Built on Trust and Results
            </h2>
            <p>
              Since 1999, {store.shopName} has been the region's benchmark for honest, expert, results-driven real estate advisory. From first homes to landmark estates, we approach every transaction with the same level of care.
            </p>
            <p>
              Our success is built on relationships — not transactions. Every client receives dedicated, specialist guidance and the benefit of our deep local network.
            </p>
            {data.demo && (
            <div className="rc-about-highlights">
              {[
                ['500+', 'Active Listings'],
                ['25+', 'Years Operating'],
                ['$2B+', 'Total Sales'],
                ['3', 'City Offices'],
              ].map(([num, label]) => (
                <div key={label} className="rc-about-highlight">
                  <div className={`rc-about-highlight-num ${cormorant.className}`}>{num}</div>
                  <div className="rc-about-highlight-label">{label}</div>
                </div>
              ))}
            </div>
            )}
            <button className="rc-text-link" onClick={() => scrollTo('rc-contact')}>
              Work With Us <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── SERVICES ─── */}
      <section id="rc-services">
        <div className="rc-section" ref={svcRef}>
          <div style={show(svcVis)}>
            <div className="rc-label">Our Services</div>
            <h2 className={`rc-h2 ${cormorant.className}`}>
              Everything You Need, Under One Roof
            </h2>
          </div>
          <div className="rc-svc-grid" style={show(svcVis, 80)}>
            {SERVICES.map(({ Icon, num, title, desc }) => (
              <div key={num} className="rc-svc-item">
                <span className="rc-svc-num">{num}</span>
                <div className="rc-svc-icon"><Icon size={18} /></div>
                <div>
                  <div className={`rc-svc-title ${cormorant.className}`}>{title}</div>
                  <p className="rc-svc-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      {data.demo && (<>
      <section id="rc-team" style={{ background: 'var(--warm)' }}>
        <div className="rc-section" ref={teamRef}>
          <div style={show(teamVis)}>
            <div className="rc-label">Our Team</div>
            <h2 className={`rc-h2 ${cormorant.className}`}>
              Specialists in Every Market
            </h2>
            <p style={{ fontSize: 14, color: 'var(--body)', fontWeight: 300, maxWidth: 500, lineHeight: 1.8, marginTop: 8 }}>
              Each advisor specialises in a specific segment — so you always speak to the most qualified person for your property type.
            </p>
          </div>
          <div className="rc-team-grid">
            {AGENTS.map((a, i) => (
              <div key={i} className="rc-agent-card" style={show(teamVis, 100 + i * 90)}>
                <div className="rc-agent-photo-wrap">
                  <img className="rc-agent-photo" src={a.img} alt={a.name} />
                  <div className="rc-agent-copper-bar" />
                </div>
                <div className="rc-agent-body">
                  <div className={`rc-agent-name ${cormorant.className}`}>{a.name}</div>
                  <div className="rc-agent-role">{a.title}</div>
                  <div className="rc-agent-stats">
                    <div>
                      <div className={`rc-agent-sn ${cormorant.className}`}>{a.deals}</div>
                      <div className="rc-agent-sl">Deals</div>
                    </div>
                    <div>
                      <div className={`rc-agent-sn ${cormorant.className}`}>{a.years}</div>
                      <div className="rc-agent-sl">Years</div>
                    </div>
                  </div>
                  {waBase && (
                  <a
                    className="rc-agent-wa"
                    href={`${waBase}?text=${encodeURIComponent(`Hello, I'd like to speak with ${a.name} at ${store.shopName}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact <ChevronRight size={12} />
                  </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </>)}

      {/* ─── PROPERTIES ─── */}
      <div id="rc-properties" className="rc-props-band" ref={propsRef}>
        <div className="rc-props-inner">
          <div style={show(propsVis)}>
            <div className="rc-label">Featured Listings</div>
            <h2 className={`rc-h2 ${cormorant.className}`}>
              Current Properties
            </h2>
          </div>
          <div className="rc-cat-tabs" style={show(propsVis, 70)}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`rc-cat-tab${category === cat ? ' rc-active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="rc-prop-grid">
            {filtered.map((prop, i) => {
              const { specs } = parseSpecs(prop.description);
              const msg = `Hello ${store.shopName}! I'm interested in ${prop.name} listed at ${formatPrice(prop.price)}. Please share more details.`;
              return (
                <div key={prop.id} className="rc-prop-card" style={show(propsVis, 90 + i * 60)}>
                  <div className="rc-prop-img-wrap">
                    <img className="rc-prop-img" src={prop.imageUrl ?? ''} alt={prop.name} />
                    <span className="rc-prop-cat">{prop.category}</span>
                  </div>
                  <div className="rc-prop-body">
                    <div className={`rc-prop-price ${cormorant.className}`}>{formatPrice(prop.price)}</div>
                    <div className="rc-prop-name">{prop.name}</div>
                    <div className="rc-prop-specs">
                      {specs.map((spec, si) => (
                        <span key={si} className="rc-prop-spec">
                          <SpecIcon label={spec} />{spec}
                        </span>
                      ))}
                    </div>
                    {waBase && (
                    <a
                      className="rc-prop-wa"
                      href={`${waBase}?text=${encodeURIComponent(msg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Enquire via WhatsApp
                    </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── TESTIMONIALS ─── */}
      {data.demo && (<>
      <div className="rc-test-band" ref={testRef}>
        <div className="rc-test-inner">
          <div style={show(testVis)}>
            <div className="rc-label" style={{ color: 'rgba(192,120,48,0.8)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 24, height: 1, background: 'rgba(192,120,48,0.8)', flexShrink: 0 }} />
                Client Stories
              </span>
            </div>
            <h2 className={`rc-h2 rc-light ${cormorant.className}`}>
              What Our Clients Say
            </h2>
          </div>
          <div className="rc-test-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rc-test-card" style={show(testVis, 100 + i * 90)}>
                <Quote size={28} className="rc-test-quote-icon" />
                <p className={`rc-test-text ${cormorant.className}`}>{t.quote}</p>
                <div>
                  <div className="rc-test-author-name">{t.author}</div>
                  <div className="rc-test-author-loc">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>)}

      {/* ─── WHY US ─── */}
      <section id="rc-why">
        <div className="rc-section" ref={whyRef}>
          <div style={show(whyVis)}>
            <div className="rc-label">Why Choose Us</div>
            <h2 className={`rc-h2 ${cormorant.className}`}>
              The {store.shopName} Difference
            </h2>
          </div>
          <div className="rc-why-grid">
            {WHY.map(({ Icon, title, desc }, i) => (
              <div key={i} className="rc-why-item" style={show(whyVis, 80 + i * 70)}>
                <div className="rc-why-icon"><Icon size={20} /></div>
                <div>
                  <div className="rc-why-title">{title}</div>
                  <p className="rc-why-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <div id="rc-contact" className="rc-cta-band" ref={ctaRef}>
        <div className="rc-cta-grid">
          <div className="rc-cta-image" style={show(ctaVis)}>
            <div className="rc-cta-image-copper" />
            <img
              src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=80"
              alt="Office"
            />
          </div>
          <div style={show(ctaVis, 120)}>
            <div className="rc-label">Contact Us</div>
            <h2 className={`rc-cta-h2 ${cormorant.className}`}>
              Ready to Take the Next Step?
            </h2>
            <p className="rc-cta-body">
              Whether you're buying, selling, renting, or exploring investment opportunities — our team is here to provide expert, no-pressure guidance from day one.
            </p>
            {waBase && (
            <a className="rc-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Message Us on WhatsApp
            </a>
            )}
            <div className="rc-cta-details">
              {(tc?.openingHours || store.openingHours) && (
                <div className="rc-cta-detail">
                  <Clock size={14} className="rc-cta-detail-icon" />
                  {tc?.openingHours || store.openingHours}
                </div>
              )}
              <div className="rc-cta-detail">
                <MapPin size={14} className="rc-cta-detail-icon" />
                City Central Business District
              </div>
              <div className="rc-cta-detail">
                <Phone size={14} className="rc-cta-detail-icon" />
                {store.whatsappNumber ?? '+1 000 000 0000'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="rc-footer">
        <div className={`rc-footer-name ${cormorant.className}`}>{store.shopName}</div>
        <p className="rc-footer-copy">
          &copy; {new Date().getFullYear()} {store.shopName} &nbsp;&middot;&nbsp; Real Estate Agency &nbsp;&middot;&nbsp; All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
