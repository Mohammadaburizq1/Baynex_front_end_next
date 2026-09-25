'use client';
import { formatMoney } from '@/lib/utils';

import { useState, useEffect, useRef } from 'react';
import { Plus_Jakarta_Sans, Nunito_Sans } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  Search, ShoppingBag, Truck, Clock, Shield, ArrowRight,
  Pill, Star, CheckCircle, Phone, MapPin, BadgeCheck, Leaf,
  Thermometer, Syringe, HeartPulse, FlaskConical,
} from 'lucide-react';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });
const nunito = Nunito_Sans({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });

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

const WAVE_DOTS = Array.from({ length: 20 }, (_, i) => ({
  x: (i * 47 + 9) % 96,
  y: (i * 31 + 17) % 88,
  r: 2 + (i % 3),
  op: 0.06 + (i % 4) * 0.02,
}));

const PHARMACISTS = [
  { name: 'Farida Al-Hamdan', title: 'Chief Pharmacist', img: 'https://images.unsplash.com/photo-1614235999584-b7b9d8e45c9a?auto=format&fit=crop&w=400&q=80', spec: 'Clinical Pharmacy' },
  { name: 'Leon Baptiste', title: 'Senior Pharmacist', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80', spec: 'Drug Interactions' },
  { name: 'Priya Sharma', title: 'Nutrition Specialist', img: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=400&q=80', spec: 'Supplements & Wellness' },
];

const SERVICES = [
  { Icon: Pill, title: 'Prescription Dispensing', desc: 'Fast and accurate dispensing with pharmacist review and patient counselling.' },
  { Icon: Truck, title: 'Collection or Delivery', desc: 'Arranged directly with you on WhatsApp for each order.' },
  { Icon: HeartPulse, title: 'Health Screening', desc: 'Blood pressure, glucose, and cholesterol checks — walk in, no appointment needed.' },
  { Icon: FlaskConical, title: 'Compounding Services', desc: 'Custom medication formulations prepared by our licensed compounding pharmacists.' },
];

const BENEFITS = [
  'Registered & fully licensed pharmacy',
  'Qualified clinical pharmacists on duty',
  'Private medication counselling available',
  'Insurance claims processing',
  'Loyalty programme & member discounts',
  'Cold-chain storage for temperature-sensitive items',
];

const TESTIMONIALS = [
  { quote: 'Always attentive, always professional. The pharmacists here actually explain what you\'re taking and why. Rare.', author: 'Hana M.', stars: 5 },
  { quote: 'Delivery was within two hours. Great quality products and the packaging was pristine. Will use again.', author: 'Karim B.', stars: 5 },
  { quote: 'The health screening caught something my GP had missed. I am genuinely grateful for this team.', author: 'Ruth N.', stars: 5 },
];

const CAT_ICONS = [Pill, Leaf, Thermometer, Syringe, HeartPulse, FlaskConical];

export default function PharmaTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [navSolid, setNavSolid] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeT, setActiveT] = useState(0);

  const { ref: statsRef, inView: statsVis } = useInView(0.5);
  const { ref: prodRef, inView: prodVis } = useInView();
  const { ref: servRef, inView: servVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: testRef, inView: testVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(12000, 1300, statsVis);
  const c2 = useCountUp(3500, 1200, statsVis);
  const c3 = useCountUp(98, 1100, statsVis);
  const c4 = useCountUp(8, 1000, statsVis);

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % TESTIMONIALS.length), 5200);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waDigits = (store.whatsappNumber ?? '').replace(/\D/g, '');
  // No number, no WhatsApp CTAs: a bare wa.me link opens WhatsApp with no recipient.
  const waBase = waDigits ? `https://wa.me/${waDigits}` : null;
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p =>
    (category === 'All' || p.category === category) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

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
    <div className={`ph-root ${nunito.className}`}>
      <style>{`
        .ph-root {
          --green: #00875A;
          --green-lt: #00B377;
          --green-dk: #005C3C;
          --mint: #E6F5EF;
          --mint-mid: #C5E8D8;
          --cream: #F7FAF8;
          --dark: #0F2D1E;
          --body: #2D5040;
          --muted: #6B8F7A;
          --border: #C5E0D0;
          background: var(--cream);
          color: var(--dark);
          min-height: 100vh;
        }

        @keyframes phFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes phWipe {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes phBob {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }

        /* ─ Nav ─ */
        .ph-nav {
          position: fixed; inset: 0 0 auto; z-index: 100;
          padding: 0 64px;
          transition: background 0.35s, box-shadow 0.35s;
        }
        .ph-nav.ph-solid {
          background: rgba(247,250,248,0.97);
          backdrop-filter: blur(14px);
          box-shadow: 0 1px 0 var(--border);
        }
        .ph-nav-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 68px;
        }
        .ph-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .ph-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--green);
          display: flex; align-items: center; justify-content: center;
        }
        .ph-logo-name { font-size: 17px; font-weight: 800; color: var(--dark); letter-spacing: -0.01em; }
        .ph-logo-sub  { font-size: 9px; font-weight: 600; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }
        .ph-nav-links { display: flex; align-items: center; gap: 28px; }
        .ph-nav-link {
          font-size: 13px; font-weight: 600; color: var(--body);
          background: none; border: none; cursor: pointer; font-family: inherit;
          transition: color 0.2s;
        }
        .ph-nav-link:hover { color: var(--green); }
        .ph-nav-cta {
          padding: 10px 22px; background: var(--green); color: #fff;
          border: none; font-family: inherit; font-size: 12px; font-weight: 700;
          cursor: pointer; border-radius: 100px;
          transition: background 0.2s;
        }
        .ph-nav-cta:hover { background: var(--green-lt); }

        /* ─ Hero ─ */
        .ph-hero {
          min-height: 88vh;
          background: linear-gradient(135deg, var(--green-dk) 0%, #006B46 100%);
          display: flex; align-items: center;
          padding: 100px 64px 70px;
          position: relative; overflow: hidden;
        }
        .ph-hero-blob {
          position: absolute; border-radius: 50%;
          background: var(--green); filter: blur(80px);
          pointer-events: none;
        }
        .ph-hero-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 72px; align-items: center;
          position: relative; z-index: 1; width: 100%;
        }
        .ph-hero-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 14px; background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.8); margin-bottom: 18px;
          animation: phFadeUp 0.5s ease both 0.1s;
        }
        .ph-hero-h1 {
          font-size: clamp(38px, 5.5vw, 68px); line-height: 1.08;
          letter-spacing: -0.025em; color: #fff; margin: 0 0 14px;
          clip-path: inset(0 100% 0 0);
          animation: phWipe 1.1s cubic-bezier(0.22,1,0.36,1) both 0.25s;
        }
        .ph-hero-h1 span { color: #7DFFB8; }
        .ph-hero-desc {
          font-size: 15px; font-weight: 300; line-height: 1.85;
          color: rgba(255,255,255,0.6); max-width: 420px; margin-bottom: 28px;
          animation: phFadeUp 0.6s ease both 0.85s;
        }
        /* Search bar in hero */
        .ph-search {
          display: flex; gap: 0; background: #fff; border-radius: 14px;
          overflow: hidden; box-shadow: 0 8px 32px rgba(0,100,60,0.25);
          animation: phFadeUp 0.6s ease both 1s;
          max-width: 460px;
        }
        .ph-search-icon {
          display: flex; align-items: center; padding: 0 16px;
          color: var(--muted); flex-shrink: 0;
        }
        .ph-search-input {
          flex: 1; border: none; outline: none;
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: var(--dark); padding: 14px 0;
          background: transparent;
        }
        .ph-search-input::placeholder { color: var(--muted); }
        .ph-search-btn {
          padding: 12px 20px; background: var(--green); color: #fff;
          border: none; font-family: inherit; font-size: 12px; font-weight: 700;
          cursor: pointer; letter-spacing: 0.03em; margin: 4px; border-radius: 10px;
          transition: background 0.2s;
        }
        .ph-search-btn:hover { background: var(--green-lt); }
        /* Hero right: feature cards */
        .ph-hero-cards {
          display: flex; flex-direction: column; gap: 14px;
          animation: phFadeUp 0.7s ease both 0.6s;
        }
        .ph-hcard {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px; padding: 14px 18px;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .ph-hcard:hover { background: rgba(255,255,255,0.13); }
        .ph-hcard-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(125,255,184,0.15);
          display: flex; align-items: center; justify-content: center;
          color: #7DFFB8; flex-shrink: 0;
        }
        .ph-hcard-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .ph-hcard-desc { font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.5); }

        /* ─ Stats ─ */
        .ph-stats { background: #fff; border-bottom: 1px solid var(--border); padding: 40px 64px; }
        .ph-stats-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .ph-stat { text-align: center; padding: 0 16px; border-right: 1px solid var(--border); }
        .ph-stat:last-child { border-right: none; }
        .ph-stat-num {
          font-size: clamp(32px,4vw,50px); font-weight: 800;
          letter-spacing: -0.025em; line-height: 1; color: var(--green); margin-bottom: 5px;
        }
        .ph-stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }

        /* ─ Shared ─ */
        .ph-wrap { max-width: 1280px; margin: 0 auto; padding: 88px 64px; }
        .ph-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 4px 12px; border-radius: 100px;
          background: var(--mint); border: 1px solid var(--mint-mid);
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--green-dk); margin-bottom: 10px;
        }
        .ph-h2 {
          font-size: clamp(28px,3.5vw,46px);
          line-height: 1.1; letter-spacing: -0.02em;
          color: var(--dark); margin: 0;
        }

        /* ─ Products ─ */
        .ph-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 18px 0 28px; }
        .ph-tab {
          padding: 6px 16px; border-radius: 100px;
          border: 1.5px solid var(--border);
          background: none; font-family: inherit;
          font-size: 11px; font-weight: 700;
          cursor: pointer; color: var(--muted);
          transition: all 0.2s;
        }
        .ph-tab.ph-active { background: var(--green); color: #fff; border-color: var(--green); }
        .ph-tab:hover:not(.ph-active) { border-color: var(--green); color: var(--green); }
        .ph-prod-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .ph-prod-card {
          background: #fff; border: 1.5px solid var(--border);
          border-radius: 16px; overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
        }
        .ph-prod-card:hover { box-shadow: 0 10px 28px rgba(0,135,90,0.1); transform: translateY(-3px); border-color: var(--mint-mid); }
        .ph-prod-img-wrap { height: 130px; overflow: hidden; background: var(--mint); }
        .ph-prod-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s; }
        .ph-prod-card:hover .ph-prod-img { transform: scale(1.05); }
        .ph-prod-body { padding: 16px; }
        .ph-prod-cat { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--green); margin-bottom: 5px; }
        .ph-prod-name { font-size: 15px; font-weight: 700; color: var(--dark); margin-bottom: 6px; line-height: 1.3; }
        .ph-prod-desc { font-size: 12px; font-weight: 300; color: var(--body); line-height: 1.65; margin-bottom: 12px; }
        .ph-prod-footer { display: flex; align-items: center; justify-content: space-between; }
        .ph-prod-price { font-size: 18px; font-weight: 800; color: var(--green); letter-spacing: -0.02em; }
        .ph-prod-orig { font-size: 12px; font-weight: 400; color: var(--muted); text-decoration: line-through; margin-left: 6px; }
        .ph-prod-wa {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: var(--green);
          text-decoration: none; transition: color 0.2s, gap 0.2s;
        }
        .ph-prod-wa:hover { color: var(--green-dk); gap: 9px; }

        /* ─ Services ─ */
        .ph-svc-band { background: var(--green); }
        .ph-svc-inner { max-width: 1280px; margin: 0 auto; padding: 80px 64px; }
        .ph-svc-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-top: 48px; }
        .ph-svc-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 16px; padding: 24px;
          transition: background 0.2s;
        }
        .ph-svc-card:hover { background: rgba(255,255,255,0.15); }
        .ph-svc-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(125,255,184,0.15);
          display: flex; align-items: center; justify-content: center;
          color: #7DFFB8; margin-bottom: 14px;
        }
        .ph-svc-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .ph-svc-desc { font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.6); line-height: 1.7; }

        /* ─ About ─ */
        .ph-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .ph-about-img-wrap { height: 460px; border-radius: 24px; overflow: hidden; position: relative; }
        .ph-about-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ph-about-badge {
          position: absolute; bottom: 22px; right: 22px;
          background: var(--green); border-radius: 14px; padding: 14px 18px; text-align: center;
        }
        .ph-badge-num { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.02em; line-height: 1; }
        .ph-badge-lbl { font-size: 9px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-top: 2px; }
        .ph-about-text { font-size: 15px; font-weight: 300; line-height: 1.9; color: var(--body); margin-bottom: 14px; }
        .ph-benefits { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .ph-benefit { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: var(--dark); }
        .ph-benefit-chk { color: var(--green); flex-shrink: 0; }

        /* ─ Team ─ */
        .ph-team-band { background: var(--mint); }
        .ph-team-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px; }
        .ph-pharm-card {
          background: #fff; border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .ph-pharm-card:hover { box-shadow: 0 12px 32px rgba(0,135,90,0.12); transform: translateY(-4px); }
        .ph-pharm-photo { height: 250px; overflow: hidden; }
        .ph-pharm-photo img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; transition: transform 0.4s; }
        .ph-pharm-card:hover .ph-pharm-photo img { transform: scale(1.04); }
        .ph-pharm-body { padding: 16px 18px; }
        .ph-pharm-spec {
          display: inline-flex; padding: 3px 10px; border-radius: 100px;
          background: var(--mint); font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--green-dk);
          margin-bottom: 7px;
        }
        .ph-pharm-name { font-size: 17px; font-weight: 700; color: var(--dark); margin-bottom: 2px; }
        .ph-pharm-title { font-size: 12px; color: var(--muted); margin-bottom: 12px; }
        .ph-pharm-line { height: 1px; background: var(--border); margin-bottom: 12px; }
        .ph-pharm-wa {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: var(--green);
          text-decoration: none; transition: color 0.2s, gap 0.2s;
        }
        .ph-pharm-wa:hover { color: var(--green-dk); gap: 9px; }

        /* ─ Testimonials ─ */
        .ph-test-band { background: #fff; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .ph-test-inner { max-width: 1280px; margin: 0 auto; padding: 88px 64px; }
        .ph-test-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px; }
        .ph-t-card {
          background: var(--cream); border: 1.5px solid var(--border);
          border-radius: 16px; padding: 24px;
          position: relative; overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ph-t-card:hover { border-color: var(--mint-mid); box-shadow: 0 6px 20px rgba(0,135,90,0.07); }
        .ph-t-stars { display: flex; gap: 4px; margin-bottom: 14px; }
        .ph-t-star { color: #FFB800; }
        .ph-t-quote { font-size: 14px; font-weight: 300; line-height: 1.75; color: var(--body); font-style: italic; margin-bottom: 14px; }
        .ph-t-author { font-size: 12px; font-weight: 700; color: var(--green); }

        /* ─ CTA ─ */
        .ph-cta-band {
          background: linear-gradient(135deg, #004D33 0%, #006644 100%);
          padding: 88px 64px;
          position: relative; overflow: hidden;
        }
        .ph-cta-blob {
          position: absolute; border-radius: 50%;
          background: var(--green-lt); filter: blur(80px);
          pointer-events: none;
        }
        .ph-cta-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
          position: relative;
        }
        .ph-cta-h2 {
          font-size: clamp(32px,4vw,54px); line-height: 1.08;
          letter-spacing: -0.02em; color: #fff; margin-bottom: 12px;
        }
        .ph-cta-h2 span { color: #7DFFB8; }
        .ph-cta-sub { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.55); line-height: 1.8; }
        .ph-cta-right { display: flex; flex-direction: column; gap: 14px; }
        .ph-cta-wa {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 26px; background: var(--green-lt); color: #fff;
          font-family: inherit; font-size: 12px; font-weight: 700; letter-spacing: 0.03em;
          border: none; border-radius: 100px; cursor: pointer; text-decoration: none;
          width: fit-content; transition: background 0.2s, transform 0.2s;
        }
        .ph-cta-wa:hover { background: #00CC88; transform: translateY(-2px); }
        .ph-cta-detail { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.4); }

        /* ─ Footer ─ */
        .ph-footer {
          background: var(--dark); padding: 28px 64px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
        }
        .ph-footer-name { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.2); }
        .ph-footer-copy { font-size: 11px; color: rgba(255,255,255,0.1); }

        /* ─ Responsive ─ */
        @media (max-width: 1024px) {
          .ph-hero, .ph-stats, .ph-cta-band, .ph-footer { padding-left: 24px; padding-right: 24px; }
          .ph-wrap, .ph-test-inner, .ph-svc-inner { padding-left: 24px; padding-right: 24px; }
          .ph-hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .ph-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .ph-about-img-wrap { height: 300px; }
          .ph-cta-inner { grid-template-columns: 1fr; gap: 36px; }
          .ph-nav { padding-left: 24px; padding-right: 24px; }
        }
        @media (max-width: 900px) {
          .ph-stats-inner { grid-template-columns: repeat(2,1fr); }
          .ph-stat { border-right: none; border-bottom: 1px solid var(--border); padding: 16px 0; }
          .ph-stat:nth-last-child(-n+2) { border-bottom: none; }
          .ph-prod-grid { grid-template-columns: repeat(2,1fr); }
          .ph-svc-grid { grid-template-columns: repeat(2,1fr); }
          .ph-team-grid, .ph-test-grid { grid-template-columns: 1fr 1fr; }
          .ph-nav-links { display: none; }
        }
        @media (max-width: 560px) {
          .ph-prod-grid, .ph-team-grid, .ph-test-grid, .ph-svc-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`ph-nav${navSolid ? ' ph-solid' : ''}`}>
        <div className="ph-nav-inner">
          <div className="ph-logo" onClick={() => scrollTo('ph-top')}>
            <div className="ph-logo-icon"><Pill size={18} color="white" /></div>
            <div>
              <div className={`ph-logo-name ${jakarta.className}`}>{store.shopName}</div>
              <div className="ph-logo-sub">Pharmacy & Health</div>
            </div>
          </div>
          <div className="ph-nav-links">
            {[['Products','ph-products'],['Services','ph-services'],...(data.demo ? [['Our Team','ph-team']] : []),['Contact','ph-contact']].map(([l,id]) => (
              <button key={id} className="ph-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            {waBase && (
            <button className="ph-nav-cta" onClick={() => window.open(waBase,'_blank')}>Order on WhatsApp</button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="ph-top" className="ph-hero">
        <div className="ph-hero-blob" style={{ width: 360, height: 360, opacity: 0.08, top: '-80px', right: '5%' }} />
        <div className="ph-hero-blob" style={{ width: 240, height: 240, opacity: 0.06, bottom: '10%', left: '30%' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {WAVE_DOTS.map((d, i) => <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.r} fill="white" opacity={d.op} />)}
        </svg>
        <div className="ph-hero-inner">
          <div>
            <div className="ph-hero-pill"><BadgeCheck size={11} />Licensed & Regulated</div>
            <h1 className={`ph-hero-h1 ${jakarta.className}`}>
              Your Health,<br />Made <span>Simple.</span>
            </h1>
            <p className="ph-hero-desc">
              {tc?.heroDescription || store.description || 'Premium medicines, supplements, and health products — dispensed by expert pharmacists.'}
            </p>
            <div className="ph-search">
              <div className="ph-search-icon"><Search size={16} /></div>
              <input
                className="ph-search-input"
                placeholder="Search medicines, vitamins..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="ph-search-btn" onClick={() => scrollTo('ph-products')}>Search</button>
            </div>
          </div>
          <div className="ph-hero-cards">
            {[
              { Icon: Truck, title: 'Order on WhatsApp', desc: 'Tell us what you need and we will confirm availability with you.' },
              { Icon: Shield, title: 'Genuine Products', desc: 'Every product sourced directly from licensed manufacturers.' },
              { Icon: HeartPulse, title: 'Pharmacist Advice', desc: 'Free consultation with every prescription and OTC purchase.' },
            ].map(({ Icon, title, desc }, i) => (
              <div key={i} className="ph-hcard">
                <div className="ph-hcard-icon"><Icon size={18} /></div>
                <div>
                  <div className="ph-hcard-title">{title}</div>
                  <div className="ph-hcard-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      {data.demo && (<>
      <div className="ph-stats" ref={statsRef}>
        <div className="ph-stats-inner">
          {[
            { v: c1, s: '+', l: 'Happy Customers' },
            { v: c2, s: '+', l: 'Products In Stock' },
            { v: c3, s: '%', l: 'Satisfaction Rate' },
            { v: c4, s: '+', l: 'Years Established' },
          ].map(({ v, s, l }, i) => (
            <div key={i} className="ph-stat" style={up(statsVis, i * 80)}>
              <div className={`ph-stat-num ${jakarta.className}`}>{v}<span style={{ fontSize: '0.6em' }}>{s}</span></div>
              <div className="ph-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
      </>)}

      {/* ── PRODUCTS ── */}
      <div id="ph-products">
        <div className="ph-wrap" ref={prodRef}>
          <div style={up(prodVis)}>
            <div className="ph-eyebrow"><Pill size={10} />Health Products</div>
            <h2 className={`ph-h2 ${jakarta.className}`}>Shop Our Range</h2>
          </div>
          <div className="ph-tabs" style={up(prodVis, 60)}>
            {categories.map(cat => (
              <button key={cat} className={`ph-tab${category === cat ? ' ph-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="ph-prod-grid">
            {filtered.map((prod, i) => {
              const msg = `Hello! I'd like to order ${prod.name}.`;
              return (
                <div key={prod.id} className="ph-prod-card" style={up(prodVis, 80 + i * 55)}>
                  {prod.imageUrl && (
                    <div className="ph-prod-img-wrap">
                      <img className="ph-prod-img" src={prod.imageUrl ?? ''} alt={prod.name} />
                    </div>
                  )}
                  <div className="ph-prod-body">
                    <div className="ph-prod-cat">{prod.category}</div>
                    <div className={`ph-prod-name ${jakarta.className}`}>{prod.name}</div>
                    <p className="ph-prod-desc">{prod.description}</p>
                    <div className="ph-prod-footer">
                      <div>
                        <span className="ph-prod-price">{formatMoney(prod.discountPrice ?? prod.price, store.currencyCode)}</span>
                        {prod.discountPrice != null && <span className="ph-prod-orig">{formatMoney(prod.price, store.currencyCode)}</span>}
                      </div>
                      {waBase && (
                      <a className="ph-prod-wa" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                        Order on WhatsApp <ArrowRight size={12} />
                      </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PHARMACY SERVICES ── */}
      <div id="ph-services" className="ph-svc-band">
        <div className="ph-svc-inner" ref={servRef}>
          <div style={{ ...up(servVis), textAlign: 'center' }}>
            <div className="ph-eyebrow" style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)', color: '#7DFFB8', margin: '0 auto 10px' }}>
              <HeartPulse size={10} />What We Do
            </div>
            <h2 className={`ph-h2 ${jakarta.className}`} style={{ color: '#fff' }}>Our Services</h2>
          </div>
          <div className="ph-svc-grid">
            {SERVICES.map(({ Icon, title, desc }, i) => (
              <div key={i} className="ph-svc-card" style={up(servVis, 80 + i * 80)}>
                <div className="ph-svc-icon"><Icon size={20} /></div>
                <div className="ph-svc-title">{title}</div>
                <p className="ph-svc-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div>
        <div className="ph-wrap">
          <div className="ph-about-grid">
            <div style={left(prodVis)}>
              <div className="ph-eyebrow"><BadgeCheck size={10} />Why Choose Us</div>
              <h2 className={`ph-h2 ${jakarta.className}`}>Your Health,<br />Our Mission</h2>
              <p className="ph-about-text" style={{ marginTop: 14 }}>
                Since opening our doors, {store.shopName} has been the community's trusted source for genuine medicines, expert advice, and convenient health products — all from qualified, caring professionals.
              </p>
              <p className="ph-about-text">
                We stock only certified, licensed products and every dispensing is reviewed by a pharmacist. Because with health, there's no room for compromise.
              </p>
              <div className="ph-benefits">
                {BENEFITS.map((b, i) => (
                  <div key={i} className="ph-benefit">
                    <CheckCircle size={14} className="ph-benefit-chk" />{b}
                  </div>
                ))}
              </div>
            </div>
            <div style={right(prodVis, 100)}>
              <div className="ph-about-img-wrap">
                <img className="ph-about-img" src="https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=700&q=80" alt="Pharmacy" />
                <div className="ph-about-badge">
                  <div className={`ph-badge-num ${jakarta.className}`}>3.5K+</div>
                  <div className="ph-badge-lbl">Products<br />In Stock</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      {data.demo && (<>
      <div id="ph-team" className="ph-team-band">
        <div className="ph-wrap" ref={teamRef}>
          <div style={up(teamVis)}>
            <div className="ph-eyebrow"><HeartPulse size={10} />Meet the Team</div>
            <h2 className={`ph-h2 ${jakarta.className}`}>Our Pharmacists</h2>
          </div>
          <div className="ph-team-grid">
            {PHARMACISTS.map((p, i) => (
              <div key={i} className="ph-pharm-card" style={up(teamVis, 80 + i * 90)}>
                <div className="ph-pharm-photo"><img src={p.img} alt={p.name} /></div>
                <div className="ph-pharm-body">
                  <div className="ph-pharm-spec">{p.spec}</div>
                  <div className={`ph-pharm-name ${jakarta.className}`}>{p.name}</div>
                  <div className="ph-pharm-title">{p.title}</div>
                  <div className="ph-pharm-line" />
                  {waBase && (
                  <a className="ph-pharm-wa" href={`${waBase}?text=${encodeURIComponent(`Hi! I'd like to speak with ${p.name}.`)}`} target="_blank" rel="noopener noreferrer">
                    Ask a Question <ArrowRight size={12} />
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
      <div className="ph-test-band" ref={testRef}>
        <div className="ph-test-inner">
          <div style={{ ...up(testVis), textAlign: 'center' }}>
            <div className="ph-eyebrow" style={{ margin: '0 auto 10px' }}><Star size={10} />Reviews</div>
            <h2 className={`ph-h2 ${jakarta.className}`}>What Customers Say</h2>
          </div>
          <div className="ph-test-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="ph-t-card" style={up(testVis, 80 + i * 80)}>
                <div className="ph-t-stars">{Array.from({ length: t.stars }).map((_, s) => <Star key={s} size={14} className="ph-t-star" fill="#FFB800" />)}</div>
                <p className="ph-t-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="ph-t-author">{t.author}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>)}

      {/* ── CTA ── */}
      <div id="ph-contact" className="ph-cta-band" ref={ctaRef}>
        <div className="ph-cta-blob" style={{ width: 300, height: 300, opacity: 0.08, top: '-60px', right: '5%' }} />
        <div className="ph-cta-inner">
          <div style={left(ctaVis)}>
            <h2 className={`ph-cta-h2 ${jakarta.className}`}>
              Need Your<br /><span>Medicine Today?</span>
            </h2>
            <p className="ph-cta-sub">Message us on WhatsApp. We'll confirm your order and arrange delivery or pickup — quickly and professionally.</p>
          </div>
          <div className="ph-cta-right" style={right(ctaVis, 100)}>
            {waBase && (
            <a className="ph-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Order via WhatsApp
            </a>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {(tc?.openingHours || store.openingHours) && <div className="ph-cta-detail"><Clock size={13} />{tc?.openingHours || store.openingHours}</div>}
              <div className="ph-cta-detail"><MapPin size={13} />Pharmacy Location</div>
              {store.whatsappNumber && <div className="ph-cta-detail"><Phone size={13} />{store.whatsappNumber}</div>}
            </div>
          </div>
        </div>
      </div>

      <footer className="ph-footer">
        <div className={`ph-footer-name ${jakarta.className}`}>{store.shopName}</div>
        <p className="ph-footer-copy">&copy; {new Date().getFullYear()} {store.shopName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
