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
 * Version of the TemplateContent shape itself, stored alongside the content so a future field
 * rename/restructure can detect old saved blobs and upgrade them — see migrateTemplateContent()
 * in lib/utils/template-content.ts. Bump this whenever the shape changes in a way old data
 * wouldn't already satisfy.
 */
export const CURRENT_TEMPLATE_CONTENT_SCHEMA_VERSION = 1;

/**
 * Universal editable content for every storefront template.
 * All fields are optional — templates fall back to their built-in defaults.
 * Persisted to the backend (store_theme_content table) as draft/published JSON, with a local
 * live-preview mirror in localStorage — see lib/utils/template-content.ts.
 */
export interface TemplateContent {
  /** Schema version this blob was saved under — see CURRENT_TEMPLATE_CONTENT_SCHEMA_VERSION. */
  schemaVersion?: number;

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
