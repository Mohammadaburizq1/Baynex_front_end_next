'use client';

import { useState, useEffect, useRef } from 'react';
import { DM_Serif_Display, Work_Sans } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import {
  MapPin, Phone, Clock, ArrowRight, CheckCircle,
  BarChart2, Users, Shield, Award, Lightbulb,
  TrendingUp, ChevronRight, Quote,
} from 'lucide-react';

const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'] });
const workSans = Work_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

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
  { name: 'Eleanor Voss', title: 'Managing Director', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', years: 18 },
  { name: 'David Achebe', title: 'Senior Consultant', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', years: 12 },
  { name: 'Lena Kirchner', title: 'Strategy Lead', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', years: 9 },
];

const PROCESS = [
  { num: '01', title: 'Discover', desc: 'We start with a deep-dive consultation — understanding your goals, your gaps, and what success looks like for you.' },
  { num: '02', title: 'Strategise', desc: 'Our team builds a tailored roadmap. No copy-paste templates — every plan is bespoke to your situation.' },
  { num: '03', title: 'Execute', desc: 'We work alongside your team to implement the plan, removing blockers and maintaining momentum.' },
  { num: '04', title: 'Optimise', desc: 'We measure, review, and refine — making sure results compound over time rather than stall.' },
];

const TESTIMONIALS = [
  { quote: 'Meridian reshaped how we think about growth. Their strategy work directly contributed to a 40% revenue increase in 12 months.', author: 'Thomas Reid', role: 'CEO, Calloway Group' },
  { quote: 'The level of detail and care in their work is unmatched. They don\'t just consult — they become part of your team.', author: 'Amina Diallo', role: 'COO, Vertex Solutions' },
  { quote: 'Clear thinking, direct advice, measurable outcomes. Exactly what we needed and were missing before.', author: 'Peter Hahn', role: 'Founder, Brinkhaus Capital' },
];

const STRENGTHS = [
  { Icon: Shield, title: 'Trusted Track Record', desc: 'Over 400 engagements across 15 industries with a 96% client retention rate.' },
  { Icon: Lightbulb, title: 'Bespoke Strategy', desc: 'We build from scratch every time. Your challenge is unique — your solution should be too.' },
  { Icon: TrendingUp, title: 'Results-Driven', desc: 'Every engagement is tied to clear outcomes and metrics. We hold ourselves accountable.' },
  { Icon: Users, title: 'Collaborative Approach', desc: 'We embed with your team rather than advise from a distance. Real work, real change.' },
];

export default function MeridianProTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [category, setCategory] = useState('All');
  const [navSolid, setNavSolid] = useState(false);
  const [activeT, setActiveT] = useState(0);

  const { ref: heroStatsRef, inView: heroStatsVis } = useInView(0.5);
  const { ref: servicesRef, inView: servicesVis } = useInView();
  const { ref: aboutRef, inView: aboutVis } = useInView();
  const { ref: processRef, inView: processVis } = useInView();
  const { ref: teamRef, inView: teamVis } = useInView();
  const { ref: testRef, inView: testVis } = useInView();
  const { ref: ctaRef, inView: ctaVis } = useInView();

  const c1 = useCountUp(400, 1400, heroStatsVis);
  const c2 = useCountUp(18, 1200, heroStatsVis);
  const c3 = useCountUp(96, 1100, heroStatsVis);
  const c4 = useCountUp(15, 1000, heroStatsVis);

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
    transform: v ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });
  const fromLeft = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(-26px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });
  const fromRight = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateX(0)' : 'translateX(26px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });

  return (
    <div className={`mp-root ${workSans.className}`}>
      <style>{`
        .mp-root {
          --green: #1B4332;
          --green-mid: #2D6A4F;
          --green-light: #D8F3DC;
          --copper: #C08B45;
          --copper-light: #D4A85A;
          --cream: #FAFAF5;
          --sand: #F3EFE4;
          --dark: #1A1A1A;
          --body: #3D3D3D;
          --muted: #7A7A7A;
          --border: #DDD8CC;
          background: var(--cream);
          color: var(--dark);
          min-height: 100vh;
        }

        @keyframes mpWipe {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes mpSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mpLineGrow {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
        @keyframes mpPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(192,139,69,0.25); }
          50%      { box-shadow: 0 0 0 10px rgba(192,139,69,0); }
        }

        /* ─ Nav ─ */
        .mp-nav {
          position: fixed;
          inset: 0 0 auto;
          z-index: 100;
          padding: 0 64px;
          transition: background 0.35s, box-shadow 0.35s;
        }
        .mp-nav.mp-solid {
          background: rgba(250,250,245,0.96);
          backdrop-filter: blur(14px);
          box-shadow: 0 1px 0 rgba(27,67,50,0.08);
        }
        .mp-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }
        .mp-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .mp-logo-mark {
          width: 34px;
          height: 34px;
          background: var(--green);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mp-logo-mark::after {
          content: '';
          width: 10px;
          height: 10px;
          background: var(--copper);
          transform: rotate(45deg);
        }
        .mp-logo-text { font-size: 17px; font-weight: 700; color: var(--green); letter-spacing: -0.01em; }
        .mp-logo-sub { font-size: 9px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-top: 1px; }
        .mp-nav-links { display: flex; align-items: center; gap: 34px; }
        .mp-nav-link {
          font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
          color: var(--body); background: none; border: none;
          cursor: pointer; font-family: inherit;
          transition: color 0.2s;
        }
        .mp-nav-link:hover { color: var(--green); }
        .mp-nav-cta {
          padding: 10px 22px; background: var(--green); color: var(--cream);
          border: none; font-family: inherit; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; cursor: pointer; border-radius: 2px;
          transition: background 0.2s;
        }
        .mp-nav-cta:hover { background: var(--green-mid); }

        /* ─ Hero ─ */
        .mp-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .mp-hero-left {
          background: var(--green);
          padding: 110px 64px 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .mp-hero-left::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: rgba(192,139,69,0.05);
          pointer-events: none;
        }
        .mp-hero-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--copper);
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: mpSlideUp 0.6s ease both 0.1s;
        }
        .mp-hero-eyebrow::before {
          content: '';
          width: 20px;
          height: 2px;
          background: var(--copper);
        }
        .mp-hero-h1 {
          font-size: clamp(42px, 4.5vw, 68px);
          line-height: 1.08;
          color: var(--cream);
          margin: 0 0 20px;
          letter-spacing: -0.01em;
          clip-path: inset(0 100% 0 0);
          animation: mpWipe 1.1s cubic-bezier(0.22,1,0.36,1) both 0.3s;
        }
        .mp-hero-h1 em { font-style: italic; color: var(--copper); }
        .mp-copper-rule {
          width: 40px;
          height: 3px;
          background: var(--copper);
          margin-bottom: 22px;
          animation: mpLineGrow 0.8s ease both 1s;
        }
        .mp-hero-desc {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.85;
          color: rgba(250,250,245,0.55);
          max-width: 360px;
          margin-bottom: 32px;
          animation: mpSlideUp 0.7s ease both 0.8s;
        }
        .mp-hero-btns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          animation: mpSlideUp 0.7s ease both 1s;
        }
        .mp-btn-copper {
          padding: 13px 26px;
          background: var(--copper);
          color: var(--dark);
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          cursor: pointer;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: background 0.2s, transform 0.2s;
        }
        .mp-btn-copper:hover { background: var(--copper-light); transform: translateY(-2px); }
        .mp-btn-outline {
          padding: 13px 26px;
          background: transparent;
          color: var(--cream);
          border: 1px solid rgba(250,250,245,0.25);
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          border-radius: 2px;
          transition: border-color 0.2s, color 0.2s;
        }
        .mp-btn-outline:hover { border-color: var(--copper); color: var(--copper); }

        /* ─ Hero Right: Stats ─ */
        .mp-hero-right {
          background: var(--sand);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 110px 56px 80px;
          position: relative;
        }
        .mp-hero-right::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--copper);
        }
        .mp-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .mp-stat-box {
          padding: 24px;
          background: var(--cream);
          border: 1px solid var(--border);
          border-radius: 3px;
          position: relative;
          overflow: hidden;
        }
        .mp-stat-box::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--copper);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .mp-stat-box:hover::before { transform: scaleX(1); }
        .mp-stat-num {
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1;
          letter-spacing: -0.03em;
          color: var(--green);
          margin-bottom: 6px;
        }
        .mp-stat-sfx { color: var(--copper); }
        .mp-stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .mp-stat-sub {
          font-size: 11px;
          font-weight: 300;
          color: var(--muted);
          margin-top: 2px;
        }

        /* ─ Shared ─ */
        .mp-wrap { max-width: 1280px; margin: 0 auto; padding: 96px 64px; }
        .mp-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--copper);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .mp-eyebrow::before { content: ''; width: 20px; height: 2px; background: var(--copper); }
        .mp-h2 {
          font-size: clamp(32px, 3.8vw, 52px);
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--dark);
          margin: 0 0 10px;
        }

        /* ─ Services ─ */
        .mp-svc-tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid var(--border);
          margin: 20px 0 36px;
        }
        .mp-svc-tab {
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
        .mp-svc-tab.mp-active { color: var(--green); }
        .mp-svc-tab.mp-active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--copper);
        }
        .mp-svc-tab:hover:not(.mp-active) { color: var(--body); }
        .mp-svc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .mp-svc-card {
          background: var(--cream);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 24px;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
          position: relative;
          overflow: hidden;
        }
        .mp-svc-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, var(--green), var(--copper));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .mp-svc-card:hover { border-color: var(--green); box-shadow: 0 8px 28px rgba(27,67,50,0.1); transform: translateY(-3px); }
        .mp-svc-card:hover::before { transform: scaleX(1); }
        .mp-svc-price {
          font-size: 22px;
          font-weight: 700;
          color: var(--green);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .mp-svc-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 8px;
          line-height: 1.3;
        }
        .mp-svc-cat {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--copper);
          background: rgba(192,139,69,0.1);
          padding: 3px 8px;
          border-radius: 2px;
          margin-bottom: 10px;
        }
        .mp-svc-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: var(--body);
          margin-bottom: 14px;
        }
        .mp-svc-wa {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--green);
          text-decoration: none;
          transition: gap 0.2s, color 0.2s;
        }
        .mp-svc-wa:hover { gap: 10px; color: var(--copper); }

        /* ─ About ─ */
        .mp-about-band { background: var(--sand); }
        .mp-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        .mp-about-img-wrap {
          height: 480px;
          position: relative;
        }
        .mp-about-img {
          width: calc(100% - 32px);
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 3px;
        }
        .mp-about-img-border {
          position: absolute;
          top: 24px;
          right: 0;
          width: calc(100% - 32px);
          height: 100%;
          border: 3px solid var(--copper);
          border-radius: 3px;
          z-index: -1;
        }
        .mp-about-badge {
          position: absolute;
          bottom: 24px;
          left: 0;
          background: var(--green);
          color: var(--cream);
          padding: 14px 18px;
          border-radius: 3px;
          animation: mpPulse 3s ease-in-out infinite;
        }
        .mp-badge-n { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
        .mp-badge-l { font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(250,250,245,0.6); margin-top: 3px; }
        .mp-about-text { font-size: 15px; font-weight: 300; line-height: 1.9; color: var(--body); margin-bottom: 14px; }
        .mp-about-checks {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 20px 0 26px;
        }
        .mp-about-check {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--body);
        }
        .mp-check-icon { color: var(--copper); flex-shrink: 0; }
        .mp-text-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--green);
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: gap 0.2s, color 0.2s;
        }
        .mp-text-link:hover { gap: 12px; color: var(--copper); }

        /* ─ Process ─ */
        .mp-process-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin-top: 48px;
          border: 1px solid var(--border);
        }
        .mp-process-card {
          padding: 28px 24px;
          border-right: 1px solid var(--border);
          position: relative;
          transition: background 0.25s;
          overflow: hidden;
        }
        .mp-process-card:last-child { border-right: none; }
        .mp-process-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--green);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .mp-process-card:hover { background: rgba(27,67,50,0.03); }
        .mp-process-card:hover::after { transform: scaleX(1); }
        .mp-process-num {
          font-size: 42px;
          font-weight: 700;
          color: rgba(192,139,69,0.12);
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 12px;
        }
        .mp-process-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .mp-process-desc {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          color: var(--body);
        }

        /* ─ Team ─ */
        .mp-team-band { background: var(--sand); }
        .mp-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 48px;
        }
        .mp-agent-card {
          background: var(--cream);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .mp-agent-card:hover { box-shadow: 0 10px 32px rgba(27,67,50,0.1); transform: translateY(-4px); }
        .mp-agent-photo {
          width: 100%;
          height: 250px;
          object-fit: cover;
          object-position: top;
          display: block;
          transition: transform 0.4s;
        }
        .mp-agent-card:hover .mp-agent-photo { transform: scale(1.04); }
        .mp-agent-bar { height: 4px; background: linear-gradient(to right, var(--green), var(--copper)); }
        .mp-agent-body { padding: 18px; }
        .mp-agent-name { font-size: 19px; font-weight: 700; color: var(--dark); margin-bottom: 3px; letter-spacing: -0.01em; }
        .mp-agent-role { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--copper); margin-bottom: 10px; }
        .mp-agent-years {
          font-size: 12px;
          font-weight: 400;
          color: var(--muted);
          padding-top: 10px;
          border-top: 1px solid var(--border);
          margin-bottom: 12px;
        }
        .mp-agent-wa {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: var(--green);
          text-decoration: none;
          transition: color 0.2s, gap 0.2s;
        }
        .mp-agent-wa:hover { color: var(--copper); gap: 9px; }

        /* ─ Testimonials ─ */
        .mp-test-band { background: var(--green); }
        .mp-test-inner { max-width: 1280px; margin: 0 auto; padding: 96px 64px; }
        .mp-test-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 48px;
        }
        .mp-test-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(192,139,69,0.2);
          border-radius: 4px;
          padding: 28px;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
          position: relative;
        }
        .mp-test-card:hover { background: rgba(255,255,255,0.1); border-color: rgba(192,139,69,0.45); transform: translateY(-3px); }
        .mp-test-quote-icon { color: var(--copper); opacity: 0.4; margin-bottom: 14px; }
        .mp-test-text {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(250,250,245,0.7);
          margin-bottom: 20px;
          font-style: italic;
        }
        .mp-test-author { font-size: 13px; font-weight: 700; color: var(--cream); margin-bottom: 2px; }
        .mp-test-role { font-size: 11px; font-weight: 400; color: rgba(192,139,69,0.7); }
        .mp-test-stars { display: flex; gap: 3px; margin-top: 10px; }
        .mp-star { width: 10px; height: 10px; background: var(--copper); clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%); }

        /* ─ CTA ─ */
        .mp-cta-band { background: var(--dark); padding: 96px 64px; }
        .mp-cta-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .mp-cta-h2 { font-size: clamp(40px, 5vw, 66px); line-height: 1.05; color: var(--cream); letter-spacing: -0.02em; margin-bottom: 14px; }
        .mp-cta-h2 em { font-style: italic; color: var(--copper); }
        .mp-cta-sub { font-size: 15px; font-weight: 300; line-height: 1.8; color: rgba(250,250,245,0.45); }
        .mp-cta-right { display: flex; flex-direction: column; gap: 16px; }
        .mp-cta-wa {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: var(--copper);
          color: var(--dark);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-decoration: none;
          border-radius: 2px;
          width: fit-content;
          transition: background 0.2s, transform 0.2s;
          border: none;
          font-family: inherit;
          cursor: pointer;
        }
        .mp-cta-wa:hover { background: var(--copper-light); transform: translateY(-2px); }
        .mp-cta-detail { display: flex; align-items: center; gap: 9px; font-size: 13px; color: rgba(250,250,245,0.35); }
        .mp-cta-detail-icon { color: rgba(192,139,69,0.5); flex-shrink: 0; }

        /* ─ Footer ─ */
        .mp-footer {
          background: #111;
          padding: 36px 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .mp-footer-name { font-size: 17px; font-weight: 700; color: rgba(250,250,245,0.25); letter-spacing: -0.01em; }
        .mp-footer-copy { font-size: 11px; color: rgba(250,250,245,0.12); letter-spacing: 0.06em; }

        /* ─ Responsive ─ */
        @media (max-width: 1024px) {
          .mp-hero { grid-template-columns: 1fr; min-height: auto; }
          .mp-hero-left { padding: 100px 32px 60px; }
          .mp-hero-right { padding: 48px 32px; }
          .mp-nav, .mp-cta-band, .mp-footer { padding-left: 24px; padding-right: 24px; }
          .mp-wrap, .mp-test-inner { padding-left: 24px; padding-right: 24px; }
          .mp-about-grid { grid-template-columns: 1fr; gap: 48px; }
          .mp-about-img-wrap { height: 320px; }
          .mp-cta-inner { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 900px) {
          .mp-stats-grid { grid-template-columns: 1fr 1fr; }
          .mp-svc-grid { grid-template-columns: repeat(2,1fr); }
          .mp-process-grid { grid-template-columns: 1fr 1fr; }
          .mp-process-card { border: 1px solid var(--border); }
          .mp-team-grid { grid-template-columns: 1fr 1fr; }
          .mp-test-grid { grid-template-columns: 1fr; }
          .mp-nav-links { display: none; }
          .mp-footer { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 560px) {
          .mp-svc-grid, .mp-team-grid, .mp-process-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`mp-nav${navSolid ? ' mp-solid' : ''}`}>
        <div className="mp-nav-inner">
          <div className="mp-logo" onClick={() => scrollTo('mp-top')}>
            <div className="mp-logo-mark" />
            <div>
              <div className="mp-logo-text">{store.shopName}</div>
              <div className="mp-logo-sub">Professional Services</div>
            </div>
          </div>
          <div className="mp-nav-links">
            {[['Services','mp-services'],['About','mp-about'],['Process','mp-process'],['Contact','mp-contact']].map(([l,id]) => (
              <button key={id} className="mp-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <button className="mp-nav-cta" onClick={() => window.open(waBase,'_blank')}>Book a Call</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="mp-top" className="mp-hero">
        <div className="mp-hero-left">
          <div className="mp-hero-eyebrow">Professional Services</div>
          <h1 className={`mp-hero-h1 ${dmSerif.className}`}>
            Strategy.<br /><em>Clarity.</em><br />Results.
          </h1>
          <div className="mp-copper-rule" />
          <p className="mp-hero-desc">
            {tc?.heroDescription || store.description || 'Expert advisory services that cut through complexity and deliver measurable outcomes for ambitious organisations.'}
          </p>
          <div className="mp-hero-btns">
            <button className="mp-btn-copper" onClick={() => scrollTo('mp-services')}>
              Our Services <ArrowRight size={13} />
            </button>
            <button className="mp-btn-outline" onClick={() => scrollTo('mp-about')}>About Us</button>
          </div>
        </div>
        <div className="mp-hero-right" ref={heroStatsRef}>
          <div className="mp-stats-grid">
            {[
              { v: c1, s: '+', l: 'Clients Served', sub: 'across all sectors' },
              { v: c2, s: ' yrs', l: 'Years Experience', sub: 'in the field' },
              { v: c3, s: '%', l: 'Client Retention', sub: 'year-over-year' },
              { v: c4, s: '+', l: 'Industries', sub: 'served globally' },
            ].map(({ v, s, l, sub }, i) => (
              <div key={i} className="mp-stat-box" style={up(heroStatsVis, i * 80)}>
                <div className={`mp-stat-num ${dmSerif.className}`}>{v}<span className="mp-stat-sfx">{s}</span></div>
                <div className="mp-stat-label">{l}</div>
                <div className="mp-stat-sub">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div id="mp-services">
        <div className="mp-wrap" ref={servicesRef}>
          <div style={up(servicesVis)}>
            <div className="mp-eyebrow">What We Offer</div>
            <h2 className={`mp-h2 ${dmSerif.className}`}>Our Services</h2>
          </div>
          <div className="mp-svc-tabs" style={up(servicesVis, 60)}>
            {categories.map(cat => (
              <button key={cat} className={`mp-svc-tab${category === cat ? ' mp-active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="mp-svc-grid">
            {filtered.map((svc, i) => {
              const msg = `Hello ${store.shopName}! I'd like to enquire about ${svc.name}.`;
              return (
                <div key={svc.id} className="mp-svc-card" style={up(servicesVis, 80 + i * 60)}>
                  <div className="mp-svc-cat">{svc.category}</div>
                  <div className={`mp-svc-price ${dmSerif.className}`}>${svc.price}</div>
                  <div className="mp-svc-name">{svc.name}</div>
                  <p className="mp-svc-desc">{svc.description}</p>
                  <a className="mp-svc-wa" href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                    Book Now <ChevronRight size={12} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div id="mp-about" className="mp-about-band">
        <div className="mp-wrap" ref={aboutRef}>
          <div className="mp-about-grid">
            <div style={fromLeft(aboutVis)}>
              <div style={{ position: 'relative' }}>
                <img className="mp-about-img" src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80" alt="Office" />
                <div className="mp-about-img-border" />
                <div className="mp-about-badge">
                  <div className={`mp-badge-n ${dmSerif.className}`}>18+</div>
                  <div className="mp-badge-l">Years of<br/>Expertise</div>
                </div>
              </div>
            </div>
            <div style={fromRight(aboutVis, 100)}>
              <div className="mp-eyebrow">About Us</div>
              <h2 className={`mp-h2 ${dmSerif.className}`}>We Build<br /><em>Lasting Value.</em></h2>
              <p className="mp-about-text" style={{ marginTop: 16 }}>
                {store.shopName} was founded on a simple conviction: that great advice should lead to real-world results. Since our founding, we've partnered with organisations at every stage of growth.
              </p>
              <p className="mp-about-text">
                Our approach is collaborative by design. We work alongside your team, not above it — bringing external perspective without losing sight of your internal realities.
              </p>
              <div className="mp-about-checks">
                {['Industry-specialist consultants on every engagement','Fixed-scope projects with clear deliverables','Transparent reporting throughout','Post-engagement support included'].map(c => (
                  <div key={c} className="mp-about-check">
                    <CheckCircle size={15} className="mp-check-icon" />
                    {c}
                  </div>
                ))}
              </div>
              <button className="mp-text-link" onClick={() => scrollTo('mp-contact')}>
                Talk to our team <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROCESS ── */}
      <div id="mp-process">
        <div className="mp-wrap" ref={processRef}>
          <div style={up(processVis)}>
            <div className="mp-eyebrow">How It Works</div>
            <h2 className={`mp-h2 ${dmSerif.className}`}>Our Process</h2>
          </div>
          <div className="mp-process-grid">
            {PROCESS.map((p, i) => (
              <div key={i} className="mp-process-card" style={up(processVis, 80 + i * 90)}>
                <div className={`mp-process-num ${dmSerif.className}`}>{p.num}</div>
                <div className="mp-process-title">{p.title}</div>
                <p className="mp-process-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div className="mp-team-band">
        <div className="mp-wrap" ref={teamRef}>
          <div style={up(teamVis)}>
            <div className="mp-eyebrow">Our Experts</div>
            <h2 className={`mp-h2 ${dmSerif.className}`}>Meet the Team</h2>
          </div>
          <div className="mp-team-grid">
            {TEAM.map((t, i) => (
              <div key={i} className="mp-agent-card" style={up(teamVis, 80 + i * 90)}>
                <img className="mp-agent-photo" src={t.img} alt={t.name} />
                <div className="mp-agent-bar" />
                <div className="mp-agent-body">
                  <div className="mp-agent-name">{t.name}</div>
                  <div className="mp-agent-role">{t.title}</div>
                  <div className="mp-agent-years">{t.years} years of experience</div>
                  <a className="mp-agent-wa" href={`${waBase}?text=${encodeURIComponent(`Hello, I'd like to speak with ${t.name} at ${store.shopName}.`)}`} target="_blank" rel="noopener noreferrer">
                    Connect <ChevronRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="mp-test-band" ref={testRef}>
        <div className="mp-test-inner">
          <div style={up(testVis)}>
            <div className="mp-eyebrow" style={{ color: 'rgba(192,139,69,0.8)' }}>Client Feedback</div>
            <h2 className={`mp-h2 ${dmSerif.className}`} style={{ color: 'var(--cream)' }}>What They Say</h2>
          </div>
          <div className="mp-test-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="mp-test-card" style={up(testVis, 80 + i * 90)}>
                <Quote size={24} className="mp-test-quote-icon" />
                <p className="mp-test-text">&ldquo;{t.quote}&rdquo;</p>
                <div className="mp-test-stars">{[0,1,2,3,4].map(s => <div key={s} className="mp-star" />)}</div>
                <div className="mp-test-author" style={{ marginTop: 12 }}>{t.author}</div>
                <div className="mp-test-role">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div id="mp-contact" className="mp-cta-band" ref={ctaRef}>
        <div className="mp-cta-inner">
          <div style={fromLeft(ctaVis)}>
            <h2 className={`mp-cta-h2 ${dmSerif.className}`}>
              Let's Build<br /><em>Something Real.</em>
            </h2>
            <p className="mp-cta-sub">
              Book a complimentary 30-minute consultation. No pitch — just an honest conversation about what you need.
            </p>
          </div>
          <div className="mp-cta-right" style={fromRight(ctaVis, 100)}>
            <a className="mp-cta-wa" href={waBase} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Book via WhatsApp
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {(tc?.openingHours || store.openingHours) && <div className="mp-cta-detail"><Clock size={13} className="mp-cta-detail-icon" />{tc?.openingHours || store.openingHours}</div>}
              <div className="mp-cta-detail"><MapPin size={13} className="mp-cta-detail-icon" />City Centre Office</div>
              {store.whatsappNumber && <div className="mp-cta-detail"><Phone size={13} className="mp-cta-detail-icon" />{store.whatsappNumber}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="mp-footer">
        <div className="mp-footer-name">{store.shopName}</div>
        <p className="mp-footer-copy">&copy; {new Date().getFullYear()} {store.shopName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
