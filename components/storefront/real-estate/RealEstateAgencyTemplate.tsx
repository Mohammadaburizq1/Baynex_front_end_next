'use client';

import { useState, useEffect, useRef } from 'react';
import { Italiana, Montserrat } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Home as HomeIcon, TrendingUp, Key, BarChart2,
  Award, Shield, Clock, Users,
  ChevronDown, ChevronRight, Phone, MapPin,
  BedDouble, Bath, Maximize2,
} from 'lucide-react';

const italiana = Italiana({ subsets: ['latin'], weight: ['400'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

function formatPrice(p: number): string {
  if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(1)}M`;
  if (p >= 1_000) return `$${Math.round(p / 1_000)}K`;
  return `$${p.toLocaleString()}`;
}

function parseSpecs(desc: string) {
  const parts = desc.split(' · ');
  return { specs: parts.slice(0, 3), detail: parts.slice(3).join(', ') };
}

function SpecIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  if (l.includes('bed')) return <BedDouble size={12} />;
  if (l.includes('bath')) return <Bath size={12} />;
  return <Maximize2 size={12} />;
}

function useInView(threshold = 0.2) {
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
  {
    name: 'Sarah Chen',
    title: 'Senior Property Advisor',
    deals: 127,
    years: 12,
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'James Harlow',
    title: 'Luxury Residential Specialist',
    deals: 94,
    years: 9,
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Priya Rajan',
    title: 'Investment Portfolio Director',
    deals: 156,
    years: 14,
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
  },
];

const SERVICES = [
  { Icon: HomeIcon, title: 'Buy', desc: 'Navigate the market with confidence. We connect you with exceptional properties that match your vision and budget.' },
  { Icon: TrendingUp, title: 'Sell', desc: 'Maximize your return with proven marketing strategies and a wide network of qualified buyers.' },
  { Icon: Key, title: 'Rent', desc: 'Access premium rental properties in sought-after locations. Short-term and long-term leases available.' },
  { Icon: BarChart2, title: 'Invest', desc: 'Build long-term wealth through strategic real estate investments with expert portfolio guidance.' },
];

const WHY_FEATURES = [
  { Icon: Award, title: 'Award-Winning Agency', desc: 'Recognized for excellence in service and results by leading industry bodies year after year.' },
  { Icon: Shield, title: 'Trusted & Transparent', desc: 'Full transparency throughout every transaction. No hidden fees, no surprises, ever.' },
  { Icon: Clock, title: 'Always Available', desc: 'Our dedicated team is on hand around the clock to support every step of your journey.' },
  { Icon: Users, title: 'Deep Local Expertise', desc: 'Decades of on-the-ground knowledge in every neighbourhood and suburb we serve.' },
];

export default function RealEstateAgencyTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [category, setCategory] = useState('All');
  const [navScrolled, setNavScrolled] = useState(false);

  const { ref: statsRef, inView: statsVisible } = useInView(0.4);
  const { ref: aboutRef, inView: aboutVisible } = useInView();
  const { ref: servicesRef, inView: servicesVisible } = useInView();
  const { ref: agentsRef, inView: agentsVisible } = useInView();
  const { ref: propsRef, inView: propsVisible } = useInView();
  const { ref: whyRef, inView: whyVisible } = useInView();
  const { ref: contactRef, inView: contactVisible } = useInView();

  const count1 = useCountUp(500, 1500, statsVisible);
  const count2 = useCountUp(25, 1200, statsVisible);
  const count3 = useCountUp(2, 1000, statsVisible);
  const count4 = useCountUp(98, 1300, statsVisible);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const waBase = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}`;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const fade = (visible: boolean, delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
  });

  return (
    <div className={`ra-root ${montserrat.className}`}>
      <style>{`
        .ra-root {
          --ivory: #F9F6F0;
          --ivory-alt: #F3EFE8;
          --charcoal: #1C2028;
          --charcoal-mid: #2A3140;
          --forest: #2C4A3E;
          --forest-dark: #1D3228;
          --gold: #C8975A;
          --gold-light: #E3B87C;
          --border: #E6DDD4;
          --text-mid: #4A5060;
          --text-muted: #8A8F9A;
          background: var(--ivory);
          color: var(--charcoal);
          min-height: 100vh;
        }

        /* ── Animations ── */
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0) translateX(-50%); }
          50%      { transform: translateY(7px) translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Nav ── */
        .ra-nav {
          position: fixed;
          inset: 0 0 auto;
          z-index: 100;
          padding: 0 56px;
          transition: background 0.35s, box-shadow 0.35s;
        }
        .ra-nav.ra-scrolled {
          background: rgba(249,246,240,0.96);
          backdrop-filter: blur(14px);
          box-shadow: 0 1px 0 var(--border);
        }
        .ra-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          max-width: 1300px;
          margin: 0 auto;
        }
        .ra-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
        }
        .ra-logo-mark {
          width: 38px;
          height: 38px;
          background: var(--forest);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 400;
          flex-shrink: 0;
        }
        .ra-logo-name {
          font-size: 20px;
          line-height: 1;
          color: #fff;
          transition: color 0.3s;
        }
        .ra-nav.ra-scrolled .ra-logo-name {
          color: var(--charcoal);
        }
        .ra-logo-sub {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 600;
          margin-top: 4px;
        }
        .ra-nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
        }
        .ra-nav-link {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.2s;
        }
        .ra-nav.ra-scrolled .ra-nav-link {
          color: var(--text-mid);
        }
        .ra-nav-link:hover {
          color: var(--gold);
        }
        .ra-nav-cta {
          padding: 10px 26px;
          background: var(--forest);
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
        .ra-nav-cta:hover { background: var(--forest-dark); }

        /* ── Hero ── */
        .ra-hero {
          position: relative;
          height: 100vh;
          min-height: 620px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .ra-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1800&q=80');
          background-size: cover;
          background-position: center 30%;
          opacity: 0.28;
          transform: scale(1.04);
        }
        .ra-hero-grad {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(28,32,40,0.9) 0%,
            rgba(28,32,40,0.55) 50%,
            rgba(28,32,40,0.92) 100%
          );
        }
        .ra-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 24px;
          max-width: 820px;
        }
        .ra-hero-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--gold);
          animation: heroReveal 0.8s ease both 0s;
        }
        .ra-hero-rule {
          width: 56px;
          height: 1px;
          background: var(--gold);
          margin: 18px auto 24px;
          transform-origin: center;
          animation: lineGrow 1s ease both 0.25s;
        }
        .ra-hero-h1 {
          font-size: clamp(56px, 8.5vw, 100px);
          line-height: 1.0;
          color: #FFFFFF;
          margin: 0 0 24px;
          font-weight: 400;
          letter-spacing: -0.01em;
          animation: heroReveal 0.85s ease both 0.2s;
        }
        .ra-hero-desc {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.75;
          color: rgba(255,255,255,0.62);
          margin: 0 0 36px;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
          animation: heroReveal 0.85s ease both 0.38s;
        }
        .ra-hero-btns {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          animation: heroReveal 0.85s ease both 0.52s;
        }
        .ra-btn-outline-white {
          padding: 14px 34px;
          border: 1px solid rgba(255,255,255,0.42);
          color: #fff;
          background: transparent;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
        }
        .ra-btn-outline-white:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.7);
        }
        .ra-btn-gold {
          padding: 14px 34px;
          border: 1px solid var(--gold);
          color: var(--gold);
          background: transparent;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
        }
        .ra-btn-gold:hover {
          background: var(--gold);
          color: var(--charcoal);
        }
        .ra-scroll-cue {
          position: absolute;
          bottom: 32px;
          left: 50%;
          color: rgba(255,255,255,0.35);
          animation: scrollBounce 2.2s ease infinite, fadeUp 1s ease both 1.2s;
          cursor: pointer;
        }

        /* ── Stats ── */
        .ra-stats-band {
          background: var(--charcoal);
          padding: 72px 56px;
        }
        .ra-stats-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .ra-stat {
          padding: 0 36px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .ra-stat:last-child { border-right: none; }
        .ra-stat-num {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 2px;
          margin-bottom: 10px;
        }
        .ra-stat-num-val {
          font-size: clamp(44px, 5.5vw, 68px);
          line-height: 1;
          color: var(--gold);
          font-weight: 400;
        }
        .ra-stat-num-sfx {
          font-size: 0.52em;
          padding-top: 0.2em;
          color: var(--gold-light);
        }
        .ra-stat-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 4px;
        }
        .ra-stat-sublabel {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.35);
        }

        /* ── Section shell ── */
        .ra-section {
          padding: 96px 56px;
          max-width: 1300px;
          margin: 0 auto;
        }
        .ra-section-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 16px;
        }
        .ra-section-label::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: var(--gold);
          flex-shrink: 0;
        }
        .ra-section-h2 {
          font-size: clamp(36px, 4vw, 56px);
          line-height: 1.08;
          color: var(--charcoal);
          font-weight: 400;
          margin: 0 0 14px;
        }
        .ra-section-h2.ra-light { color: #fff; }

        /* ── About ── */
        .ra-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 88px;
          align-items: center;
        }
        .ra-about-body p {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.85;
          color: var(--text-mid);
          margin-bottom: 18px;
        }
        .ra-about-checks {
          margin: 24px 0 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ra-about-check {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--charcoal);
        }
        .ra-check-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--forest);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #fff;
        }
        .ra-about-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--forest);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: gap 0.2s;
        }
        .ra-about-link:hover { gap: 13px; }
        .ra-about-images {
          position: relative;
          height: 520px;
        }
        .ra-about-img-a {
          position: absolute;
          top: 0;
          left: 0;
          right: 64px;
          height: 360px;
          object-fit: cover;
          box-shadow: 0 24px 64px rgba(0,0,0,0.14);
          display: block;
        }
        .ra-about-img-b {
          position: absolute;
          bottom: 0;
          right: 0;
          left: 64px;
          height: 280px;
          object-fit: cover;
          box-shadow: 0 24px 64px rgba(0,0,0,0.14);
          display: block;
        }
        .ra-about-badge {
          position: absolute;
          bottom: 84px;
          left: 44px;
          background: var(--gold);
          padding: 16px 22px;
          text-align: center;
          z-index: 2;
          box-shadow: 0 8px 32px rgba(200,151,90,0.32);
        }
        .ra-about-badge-n {
          font-size: 34px;
          color: var(--charcoal);
          line-height: 1;
          font-weight: 400;
        }
        .ra-about-badge-l {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(28,32,40,0.65);
          margin-top: 5px;
        }

        /* ── Services ── */
        .ra-services-band {
          background: var(--forest);
          padding: 96px 56px;
        }
        .ra-services-inner {
          max-width: 1300px;
          margin: 0 auto;
        }
        .ra-services-header { margin-bottom: 56px; }
        .ra-services-header .ra-section-label { color: rgba(200,151,90,0.85); }
        .ra-services-header .ra-section-label::before { background: rgba(200,151,90,0.85); }
        .ra-services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }
        .ra-svc-card {
          background: rgba(255,255,255,0.05);
          padding: 40px 30px;
          transition: background 0.25s, transform 0.25s;
        }
        .ra-svc-card:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-5px);
        }
        .ra-svc-icon {
          width: 50px;
          height: 50px;
          background: rgba(200,151,90,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold);
          margin-bottom: 24px;
        }
        .ra-svc-title {
          font-size: 22px;
          color: #fff;
          font-weight: 400;
          margin-bottom: 12px;
        }
        .ra-svc-desc {
          font-size: 13px;
          line-height: 1.75;
          color: rgba(255,255,255,0.5);
          font-weight: 300;
        }

        /* ── Agents ── */
        .ra-agents-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin-top: 48px;
        }
        .ra-agent-card {
          background: #fff;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .ra-agent-card:hover {
          box-shadow: 0 14px 44px rgba(0,0,0,0.08);
          transform: translateY(-4px);
        }
        .ra-agent-photo {
          width: 100%;
          height: 248px;
          object-fit: cover;
          object-position: top center;
          display: block;
        }
        .ra-agent-body { padding: 24px; }
        .ra-agent-name {
          font-size: 22px;
          color: var(--charcoal);
          font-weight: 400;
          margin-bottom: 6px;
        }
        .ra-agent-role {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--forest);
          margin-bottom: 18px;
        }
        .ra-agent-stats {
          display: flex;
          gap: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          margin-bottom: 18px;
        }
        .ra-agent-stat-n {
          font-size: 24px;
          color: var(--charcoal);
          font-weight: 400;
          line-height: 1;
        }
        .ra-agent-stat-l {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 3px;
        }
        .ra-agent-wa {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--forest);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ra-agent-wa:hover { color: var(--gold); }

        /* ── Properties ── */
        .ra-props-band {
          background: var(--ivory-alt);
          padding: 96px 56px;
        }
        .ra-props-inner { max-width: 1300px; margin: 0 auto; }
        .ra-props-top {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: 12px;
        }
        .ra-cat-tabs {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .ra-cat-tab {
          padding: 8px 20px;
          border: 1px solid var(--border);
          background: none;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-mid);
        }
        .ra-cat-tab.ra-active {
          background: var(--charcoal);
          color: #fff;
          border-color: var(--charcoal);
        }
        .ra-cat-tab:hover:not(.ra-active) { border-color: var(--charcoal); color: var(--charcoal); }
        .ra-prop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ra-prop-card {
          background: #fff;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .ra-prop-card:hover {
          box-shadow: 0 16px 52px rgba(0,0,0,0.09);
          transform: translateY(-5px);
        }
        .ra-prop-img-wrap {
          position: relative;
          height: 216px;
          overflow: hidden;
        }
        .ra-prop-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .ra-prop-card:hover .ra-prop-img { transform: scale(1.05); }
        .ra-prop-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--forest);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 5px 10px;
        }
        .ra-prop-body { padding: 24px; }
        .ra-prop-price {
          font-size: 26px;
          color: var(--charcoal);
          font-weight: 400;
          margin-bottom: 6px;
        }
        .ra-prop-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-mid);
          margin-bottom: 14px;
          line-height: 1.4;
        }
        .ra-prop-specs {
          display: flex;
          gap: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .ra-prop-spec {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
        }
        .ra-prop-cta {
          display: block;
          width: 100%;
          padding: 11px;
          background: var(--forest);
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
        .ra-prop-cta:hover { background: var(--forest-dark); }

        /* ── Why Us ── */
        .ra-why-band {
          background: var(--charcoal-mid);
          padding: 96px 56px;
        }
        .ra-why-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 88px;
          align-items: center;
        }
        .ra-why-quote-wrap {}
        .ra-why-quote {
          font-size: clamp(36px, 4vw, 54px);
          line-height: 1.12;
          color: var(--gold);
          font-weight: 400;
          margin-bottom: 24px;
        }
        .ra-why-attr {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }
        .ra-why-features {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .ra-why-feat {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .ra-why-feat-icon {
          width: 46px;
          height: 46px;
          background: rgba(200,151,90,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--gold);
        }
        .ra-why-feat-title {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 6px;
        }
        .ra-why-feat-desc {
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.42);
          font-weight: 300;
        }

        /* ── Contact ── */
        .ra-contact-band {
          background: var(--forest);
          padding: 96px 56px;
          text-align: center;
        }
        .ra-contact-inner { max-width: 640px; margin: 0 auto; }
        .ra-contact-h2 {
          font-size: clamp(40px, 5.5vw, 68px);
          color: #fff;
          font-weight: 400;
          line-height: 1.08;
          margin-bottom: 16px;
        }
        .ra-contact-sub {
          font-size: 15px;
          font-weight: 300;
          color: rgba(255,255,255,0.6);
          line-height: 1.75;
          margin-bottom: 40px;
        }
        .ra-contact-wa {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 17px 40px;
          background: #fff;
          color: var(--forest);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.25s;
        }
        .ra-contact-wa:hover {
          background: var(--gold);
          color: var(--charcoal);
        }
        .ra-contact-details {
          margin-top: 48px;
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ra-contact-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.55);
        }

        /* ── Footer ── */
        .ra-footer {
          background: #121820;
          padding: 48px 56px;
          text-align: center;
        }
        .ra-footer-name {
          font-size: 24px;
          color: rgba(255,255,255,0.55);
          font-weight: 400;
          margin-bottom: 8px;
        }
        .ra-footer-copy {
          font-size: 11px;
          color: rgba(255,255,255,0.22);
          letter-spacing: 0.1em;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .ra-nav { padding: 0 24px; }
          .ra-nav-links { gap: 20px; }
          .ra-section { padding: 72px 24px; }
          .ra-stats-band, .ra-services-band, .ra-props-band,
          .ra-why-band, .ra-contact-band, .ra-footer { padding-left: 24px; padding-right: 24px; }
        }
        @media (max-width: 880px) {
          .ra-stats-inner { grid-template-columns: repeat(2, 1fr); }
          .ra-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 28px 16px; }
          .ra-stat:nth-child(2n) { border-right: none; }
          .ra-stat:nth-last-child(-n+2) { border-bottom: none; }
          .ra-about-grid { grid-template-columns: 1fr; gap: 48px; }
          .ra-about-images { height: 340px; }
          .ra-services-grid { grid-template-columns: repeat(2, 1fr); }
          .ra-agents-grid { grid-template-columns: 1fr 1fr; }
          .ra-prop-grid { grid-template-columns: repeat(2, 1fr); }
          .ra-why-inner { grid-template-columns: 1fr; gap: 48px; }
          .ra-nav-links { display: none; }
        }
        @media (max-width: 560px) {
          .ra-prop-grid { grid-template-columns: 1fr; }
          .ra-services-grid { grid-template-columns: 1fr; }
          .ra-agents-grid { grid-template-columns: 1fr; }
          .ra-hero-h1 { font-size: 52px; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav className={`ra-nav${navScrolled ? ' ra-scrolled' : ''}`}>
        <div className="ra-nav-inner">
          <div className="ra-logo" onClick={() => scrollTo('ra-top')}>
            <div className={`ra-logo-mark ${italiana.className}`}>
              {store.shopName.charAt(0)}
            </div>
            <div>
              <div className={`ra-logo-name ${italiana.className}`}>{store.shopName}</div>
              <div className="ra-logo-sub">Real Estate Agency</div>
            </div>
          </div>
          <div className="ra-nav-links">
            {[['Properties', 'ra-properties'], ['About', 'ra-about'], ['Services', 'ra-services'], ['Contact', 'ra-contact']].map(([label, id]) => (
              <button key={id} className="ra-nav-link" onClick={() => scrollTo(id)}>
                {label}
              </button>
            ))}
            <button className="ra-nav-cta" onClick={() => window.open(waBase, '_blank')}>
              Get in Touch
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section id="ra-top" className="ra-hero">
        <div className="ra-hero-bg" />
        <div className="ra-hero-grad" />
        <div className="ra-hero-content">
          <p className="ra-hero-eyebrow">Est. 1999 &nbsp;&middot;&nbsp; Award-Winning Real Estate Agency</p>
          <div className="ra-hero-rule" />
          <h1 className={`ra-hero-h1 ${italiana.className}`}>
            Your Vision,<br />Our Expertise
          </h1>
          <p className="ra-hero-desc">
            {tc?.heroDescription || store.description || 'A trusted partner in luxury real estate. We guide you from discovery to keys in hand — with integrity, precision, and passion.'}
          </p>
          <div className="ra-hero-btns">
            <button className="ra-btn-outline-white" onClick={() => scrollTo('ra-properties')}>
              Browse Properties
            </button>
            <button className="ra-btn-gold" onClick={() => scrollTo('ra-about')}>
              Our Story
            </button>
          </div>
        </div>
        <div className="ra-scroll-cue" onClick={() => scrollTo('ra-stats')}>
          <ChevronDown size={28} />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <div id="ra-stats" className="ra-stats-band" ref={statsRef}>
        <div className="ra-stats-inner">
          {[
            { num: count1, sfx: '+', label: 'Properties Listed', sub: 'across the region' },
            { num: count2, sfx: '+', label: 'Years of Excellence', sub: 'in real estate' },
            { num: count3, sfx: 'B+', label: 'In Property Sales', sub: 'total portfolio value', pre: '$' },
            { num: count4, sfx: '%', label: 'Client Satisfaction', sub: 'five-star reviews' },
          ].map(({ num, sfx, label, sub, pre }, i) => (
            <div key={i} className="ra-stat" style={fade(statsVisible, i * 100)}>
              <div className="ra-stat-num">
                <span className={`ra-stat-num-val ${italiana.className}`}>{pre}{num}</span>
                <span className={`ra-stat-num-sfx ${italiana.className}`}>{sfx}</span>
              </div>
              <div className="ra-stat-label">{label}</div>
              <div className="ra-stat-sublabel">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ABOUT ─── */}
      <section id="ra-about">
        <div className="ra-section" ref={aboutRef}>
          <div className="ra-about-grid" style={fade(aboutVisible)}>
            <div className="ra-about-body">
              <div className="ra-section-label">About Us</div>
              <h2 className={`ra-section-h2 ${italiana.className}`} style={{ marginBottom: 24 }}>
                Three Decades of Real Estate Excellence
              </h2>
              <p>
                Founded in 1999, {store.shopName} has grown from a small neighbourhood agency into one of the region's most trusted names in luxury and residential property. Our reputation is built on discretion, expertise, and an unwavering commitment to results.
              </p>
              <p>
                We don't just sell properties — we match people with places that shape their lives. Every client relationship is built on deep listening, transparent communication, and an intimate knowledge of the market.
              </p>
              <div className="ra-about-checks">
                {['Market-leading expertise across all property types', 'Dedicated agent support from first call to final signature', 'Proven record: $2B+ in successful transactions'].map((item, i) => (
                  <div key={i} className="ra-about-check">
                    <div className="ra-check-dot">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <button className="ra-about-link" onClick={() => scrollTo('ra-contact')}>
                Talk to Our Team <ChevronRight size={14} />
              </button>
            </div>
            <div className="ra-about-images">
              <img
                className="ra-about-img-a"
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                alt="Luxury property exterior"
              />
              <img
                className="ra-about-img-b"
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=600&q=80"
                alt="Luxury property interior"
              />
              <div className="ra-about-badge">
                <div className={`ra-about-badge-n ${italiana.className}`}>25+</div>
                <div className="ra-about-badge-l">Years in<br />Business</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <div id="ra-services" className="ra-services-band" ref={servicesRef}>
        <div className="ra-services-inner">
          <div className="ra-services-header" style={fade(servicesVisible)}>
            <div className="ra-section-label">Our Services</div>
            <h2 className={`ra-section-h2 ra-light ${italiana.className}`}>
              Comprehensive Property Solutions
            </h2>
          </div>
          <div className="ra-services-grid">
            {SERVICES.map(({ Icon, title, desc }, i) => (
              <div key={i} className="ra-svc-card" style={fade(servicesVisible, 80 + i * 80)}>
                <div className="ra-svc-icon"><Icon size={22} /></div>
                <div className={`ra-svc-title ${italiana.className}`}>{title}</div>
                <p className="ra-svc-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── AGENTS ─── */}
      <section id="ra-agents">
        <div className="ra-section" ref={agentsRef}>
          <div style={fade(agentsVisible)}>
            <div className="ra-section-label">Our Team</div>
            <h2 className={`ra-section-h2 ${italiana.className}`}>
              Meet Your Advisors
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-mid)', fontWeight: 300, maxWidth: 520, lineHeight: 1.8, marginTop: 8 }}>
              Our agents bring decades of combined experience, deep market knowledge, and a genuine passion for finding the right property for every client.
            </p>
          </div>
          <div className="ra-agents-grid">
            {AGENTS.map((agent, i) => (
              <div key={i} className="ra-agent-card" style={fade(agentsVisible, 120 + i * 100)}>
                <img className="ra-agent-photo" src={agent.img} alt={agent.name} />
                <div className="ra-agent-body">
                  <div className={`ra-agent-name ${italiana.className}`}>{agent.name}</div>
                  <div className="ra-agent-role">{agent.title}</div>
                  <div className="ra-agent-stats">
                    <div>
                      <div className={`ra-agent-stat-n ${italiana.className}`}>{agent.deals}</div>
                      <div className="ra-agent-stat-l">Deals Closed</div>
                    </div>
                    <div>
                      <div className={`ra-agent-stat-n ${italiana.className}`}>{agent.years}</div>
                      <div className="ra-agent-stat-l">Years Exp.</div>
                    </div>
                  </div>
                  <a
                    className="ra-agent-wa"
                    href={`${waBase}?text=${encodeURIComponent(`Hello, I'd like to speak with ${agent.name} at ${store.shopName}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact Agent <ChevronRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROPERTIES ─── */}
      <div id="ra-properties" className="ra-props-band" ref={propsRef}>
        <div className="ra-props-inner">
          <div className="ra-props-top" style={fade(propsVisible)}>
            <div>
              <div className="ra-section-label">Featured Listings</div>
              <h2 className={`ra-section-h2 ${italiana.className}`}>
                Exceptional Properties
              </h2>
            </div>
          </div>
          <div className="ra-cat-tabs" style={fade(propsVisible, 80)}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`ra-cat-tab${category === cat ? ' ra-active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="ra-prop-grid">
            {filtered.map((prop, i) => {
              const { specs } = parseSpecs(prop.description);
              const msg = `Hello ${store.shopName}! I'm interested in ${prop.name} listed at ${formatPrice(prop.price)}. Please share more details.`;
              return (
                <div key={prop.id} className="ra-prop-card" style={fade(propsVisible, 100 + i * 60)}>
                  <div className="ra-prop-img-wrap">
                    <img className="ra-prop-img" src={prop.imageUrl ?? ''} alt={prop.name} />
                    <span className="ra-prop-badge">{prop.category}</span>
                  </div>
                  <div className="ra-prop-body">
                    <div className={`ra-prop-price ${italiana.className}`}>{formatPrice(prop.price)}</div>
                    <div className="ra-prop-name">{prop.name}</div>
                    <div className="ra-prop-specs">
                      {specs.map((spec, si) => (
                        <span key={si} className="ra-prop-spec">
                          <SpecIcon label={spec} /> {spec}
                        </span>
                      ))}
                    </div>
                    <a
                      className="ra-prop-cta"
                      href={`${waBase}?text=${encodeURIComponent(msg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Enquire via WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── WHY US ─── */}
      <div className="ra-why-band" ref={whyRef}>
        <div className="ra-why-inner">
          <div className="ra-why-quote-wrap" style={fade(whyVisible)}>
            <blockquote className={`ra-why-quote ${italiana.className}`}>
              &ldquo;We don&rsquo;t just find you a property. We find you a place to build your life.&rdquo;
            </blockquote>
            <p className="ra-why-attr">Our founding principle, since 1999</p>
          </div>
          <div className="ra-why-features" style={fade(whyVisible, 120)}>
            {WHY_FEATURES.map(({ Icon, title, desc }, i) => (
              <div key={i} className="ra-why-feat">
                <div className="ra-why-feat-icon"><Icon size={20} /></div>
                <div>
                  <div className="ra-why-feat-title">{title}</div>
                  <p className="ra-why-feat-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONTACT ─── */}
      <div id="ra-contact" className="ra-contact-band" ref={contactRef}>
        <div className="ra-contact-inner" style={fade(contactVisible)}>
          <div className="ra-section-label" style={{ justifyContent: 'center', marginBottom: 16 }}>
            Contact Us
          </div>
          <h2 className={`ra-contact-h2 ${italiana.className}`}>
            Let&rsquo;s Find Your Perfect Property
          </h2>
          <p className="ra-contact-sub">
            Whether you&rsquo;re buying, selling, or simply exploring — our team is ready to guide you. Reach out today for a no-obligation consultation.
          </p>
          <a
            className="ra-contact-wa"
            href={waBase}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Message Us on WhatsApp
          </a>
          <div className="ra-contact-details">
            {(tc?.openingHours || store.openingHours) && (
              <div className="ra-contact-detail">
                <Clock size={14} />
                {tc?.openingHours || store.openingHours}
              </div>
            )}
            <div className="ra-contact-detail">
              <MapPin size={14} />
              City Central, Business District
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="ra-footer">
        <div className={`ra-footer-name ${italiana.className}`}>{store.shopName}</div>
        <p className="ra-footer-copy">
          &copy; {new Date().getFullYear()} {store.shopName} &nbsp;&middot;&nbsp; Real Estate Agency &nbsp;&middot;&nbsp; All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
