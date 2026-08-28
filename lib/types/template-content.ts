/** Item used in galleries, lookbook grids, feature carousels. */
export interface TemplateContentItem {
  name: string;
  imageUrl: string;
}

/** A single customer review / testimonial. */
export interface TemplateContentReview {
  quote: string;
  name: string;
}

/**
 * Universal editable content for every storefront template.
 * All fields are optional — templates fall back to their built-in defaults.
 * Persisted to localStorage keyed by store slug (key: `shoplink_tpl_<slug>`).
 */
export interface TemplateContent {
  // ── Navigation ────────────────────────────────────────────────────────
  /** Comma-separated nav links, e.g. "Menu,About,Contact" */
  navLinks?: string;

  // ── Hero ──────────────────────────────────────────────────────────────
  heroEyebrow?: string;
  /** Single-line headline (most templates) */
  heroTitle?: string;
  /** Split headline line 1 (clothing templates) */
  heroTitleLine1?: string;
  /** Split headline line 2 (clothing templates) */
  heroTitleLine2?: string;
  /** Accent-coloured portion of headline (clothing templates) */
  heroTitleEmphasis?: string;
  /** Restaurant: "enjoy the finest…" secondary line */
  heroTitleEnjoyLine?: string;
  /** Restaurant: accent word inside the hero title */
  heroHighlight?: string;
  heroDescription?: string;
  heroImageUrl?: string;
  primaryCta?: string;
  secondaryCta?: string;
  heroBadgeLabel?: string;
  heroBadgeSubtitle?: string;

  // ── Restaurant floating sidebar card ─────────────────────────────────
  floatingCardName?: string;
  floatingCardBlurb?: string;
  floatingCardImageUrl?: string;

  // ── Opening hours (restaurants / services) ────────────────────────
  openingHours?: string;

  // ── Scrolling ticker / marquee ────────────────────────────────────
  tickerText?: string;

  // ── Products / menu / services section ───────────────────────────
  productsEyebrow?: string;
  productsTitle?: string;
  productsCta?: string;

  // ── Brand story / about ───────────────────────────────────────────
  brandStoryQuote?: string;
  footerAbout?: string;

  // ── Lookbook / gallery (clothing) ────────────────────────────────
  lookbookEyebrow?: string;
  lookbookTitle?: string;
  lookbookLinkLabel?: string;
  lookbookItems?: TemplateContentItem[];

  // ── Testimonials / reviews ────────────────────────────────────────
  testimonialsEyebrow?: string;
  testimonialsTitle?: string;
  testimonials?: TemplateContentReview[];

  // ── Newsletter / subscribe ────────────────────────────────────────
  newsletterEyebrow?: string;
  newsletterTitle?: string;
  newsletterBody?: string;
  newsletterButton?: string;
  newsletterPlaceholder?: string;

  // ── Footer ────────────────────────────────────────────────────────
  /** Comma-separated social platform names, e.g. "Instagram,TikTok,Facebook" */
  footerSocialLinks?: string;
}
