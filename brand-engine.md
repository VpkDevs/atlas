---
name: atlas-brand-engine
description: Loaded during Phase 6 (Marketing) and on demand via /atlas brand. Establishes the complete visual brand system for a product — color palette, typography, motion language, aesthetic parameters — and applies it consistently across every generated asset. Runs a visual QA loop using Playwright screenshots + Claude vision to verify output before committing. The brand engine is why Atlas output looks like something instead of generic.
---

# Atlas Brand Engine

**Input:** Business Context + founder aesthetic preferences (inferred from code + stated preferences)
**Purpose:** Make every visual output — landing pages, social cards, marketing assets, UI components — unmistakably cohesive and intentionally designed.

## The Brand Doctrine

An AI that ships ugly products is a liability. Atlas does not ship ugly products.

The brand engine runs in every phase that produces visible output. It is not a marketing nicety — it is an execution requirement. A product with great code and generic visuals loses to a product with decent code and a strong visual identity.

**The brand system is established once (this module) and applied everywhere (every subsequent module).**

---

## Step 1: Brand Context Extraction

Before generating anything, read these signals to understand the founder's aesthetic intent:

### From the codebase
```bash
# Detect existing color tokens
grep -rn "colors\|palette\|theme\|--color\|$color" \
  src/ styles/ tailwind.config.* theme.* --include="*.ts" --include="*.css" --include="*.json" 2>/dev/null | head -30

# Detect typography
grep -rn "font-family\|fontFamily\|Inter\|Geist\|Neue\|Mono" \
  src/ styles/ tailwind.config.* 2>/dev/null | head -20

# Detect existing brand references
grep -rni "dark\|neon\|gradient\|glassmorphism\|brutalist\|minimal\|haunted\|vaporwave\|glitch" \
  src/ styles/ README.md 2>/dev/null | head -20
```

### From stated preferences
Read from `~/.atlas/founder-profile.json`:
```json
{
  "aesthetic_preferences": {
    "stated": "[whatever the founder has said about visual style]",
    "inferred": "[from codebase signals]",
    "vibe_keywords": ["dark", "glitchy", "vaporwave", "technical", "clean"]
  }
}
```

If `aesthetic_preferences` is empty, ask exactly one question in the onboarding pass:
```
Describe the aesthetic for [Product Name] in 3–5 words.
Examples: "dark and technical", "clean and minimal", "bold and playful", "haunted glitchy vaporwave"
```

---

## Step 2: Brand System Generation

Generate a complete brand specification and save to `docs/brand/BRAND_SYSTEM.md`:

### 2a: Color Palette Generation

Based on aesthetic keywords, generate a full color system:

**For "dark haunted glitchy vaporwave" aesthetic:**
```css
:root {
  /* Core palette */
  --color-bg-primary: #0a0a0f;          /* Near-black with blue undertone */
  --color-bg-secondary: #0f0f1a;        /* Slightly lighter panel bg */
  --color-bg-tertiary: #1a1a2e;         /* Card/elevated surface */
  
  /* Brand accent — vaporwave spectrum */
  --color-accent-primary: #ff2d78;      /* Hot pink / neon rose */
  --color-accent-secondary: #00f5ff;    /* Cyan */
  --color-accent-tertiary: #bf00ff;     /* Purple */
  --color-accent-gold: #ffd700;         /* Highlight / warning */
  
  /* Gradients */
  --gradient-brand: linear-gradient(135deg, #ff2d78 0%, #bf00ff 50%, #00f5ff 100%);
  --gradient-dark: linear-gradient(180deg, #0a0a0f 0%, #1a0a2e 100%);
  --gradient-glow: radial-gradient(ellipse at center, rgba(255,45,120,0.15) 0%, transparent 70%);
  
  /* Text */
  --color-text-primary: #f0f0ff;        /* Slightly cool white */
  --color-text-secondary: #9090b0;      /* Muted lavender-gray */
  --color-text-accent: #ff2d78;         /* Accent for highlights */
  
  /* Borders & glow effects */
  --color-border: rgba(255, 45, 120, 0.2);
  --color-border-hover: rgba(255, 45, 120, 0.6);
  --glow-accent: 0 0 20px rgba(255, 45, 120, 0.4), 0 0 40px rgba(191, 0, 255, 0.2);
  --glow-cyan: 0 0 20px rgba(0, 245, 255, 0.4);
}
```

For other aesthetics, generate equivalent complete systems:
- **"clean minimal"**: Near-white bg, single accent color, generous whitespace, no gradients
- **"bold playful"**: Vibrant saturated palette, rounded forms, energetic
- **"technical/dev-tool"**: Monospace-forward, code-like, syntax highlighting-inspired
- **"luxury"**: Deep blacks, gold accents, serif touches

### 2b: Typography System

```css
/* Font stack based on aesthetic */

/* Dark/technical aesthetic */
--font-display: 'Space Grotesk', 'Inter', system-ui;      /* Headlines */
--font-body: 'Inter', system-ui;                           /* Body text */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;    /* Code, data */
--font-accent: 'Space Mono', monospace;                    /* Special accent text */

/* Type scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--text-5xl: 3rem;
--text-hero: clamp(2.5rem, 8vw, 6rem);

/* Letter spacing for vaporwave aesthetic */
--tracking-display: -0.02em;    /* Tight for large headlines */
--tracking-accent: 0.15em;      /* Wide tracking for small caps / labels */
```

Google Fonts to load (committed in HTML `<head>` or layout):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

### 2c: Motion Language

```css
/* Animation system — committed to global CSS */

/* Duration tokens */
--duration-instant: 50ms;
--duration-fast: 120ms;
--duration-normal: 240ms;
--duration-slow: 400ms;
--duration-glacial: 800ms;

/* Easing tokens */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);        /* Overshoot spring */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);             /* Material ease */
--ease-glitch: steps(3, end);                              /* Glitch step frames */
--ease-decay: cubic-bezier(0.7, 0, 1, 1);                /* Fast start, slow end */

/* The glitch effect (vaporwave/haunted aesthetic) */
@keyframes glitch {
  0%, 100% { transform: translate(0); filter: none; }
  20% { transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
  40% { transform: translate(2px, -1px); filter: hue-rotate(-90deg); }
  60% { transform: translate(-1px, 2px) skewX(2deg); }
  80% { transform: translate(1px, -2px); clip-path: inset(10% 0 60% 0); }
}

@keyframes scan-line {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

@keyframes flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.4; }
}

/* Apply sparingly — glitch on hover for key brand elements */
.brand-glitch:hover {
  animation: glitch var(--duration-fast) var(--ease-glitch) infinite;
}
```

### 2d: Component Design Tokens

```css
/* Spacing rhythm */
--space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
--space-4: 1rem;     --space-6: 1.5rem;   --space-8: 2rem;
--space-12: 3rem;    --space-16: 4rem;    --space-24: 6rem;

/* Border radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

/* Shadows (glow-forward for dark aesthetic) */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.5);
--shadow-md: 0 4px 12px rgba(0,0,0,0.6);
--shadow-brand: 0 0 24px rgba(255,45,120,0.3), 0 4px 12px rgba(0,0,0,0.6);
--shadow-inset: inset 0 1px 0 rgba(255,255,255,0.05);

/* Backdrop blur */
--blur-glass: blur(12px) saturate(180%);
```

---

## Step 3: Commit the Brand System to the Codebase

### For Next.js / React projects:
1. Write all CSS variables to `styles/brand.css` (global import)
2. Update `tailwind.config.js` with brand colors and fonts
3. Create `components/ui/brand.ts` — typed brand token exports for use in JS
4. Update `app/layout.tsx` to include Google Fonts + brand CSS

### For vanilla HTML / static sites:
1. Write `styles/brand.css` as a standalone file
2. Import in all HTML templates

### For any project:
Commit `docs/brand/BRAND_SYSTEM.md` — the human-readable brand guide that documents every decision.

---

## Step 4: Apply Brand to All Generated Assets

When any other module generates a visual asset, the brand engine specification is applied:

### Landing Page Template
If Atlas generates a landing page (launch strategy, marketing playbook), it uses:
- Full color system (dark bg, gradient accents)
- GSAP + ScrollTrigger for scroll animations (always commit this for vaporwave/technical aesthetics)
- Glitch effect on hero headline (brand-glitch class)
- Scan-line overlay CSS on hero section
- Typed text effect for dynamic hero copy

```html
<!-- Standard brand landing page structure -->
<section class="hero" data-brand="hero">
  <div class="scan-overlay"></div>          <!-- CSS scan-line effect -->
  <div class="noise-overlay"></div          <!-- CSS grain texture -->
  <h1 class="brand-glitch" data-text="[headline]">[headline]</h1>
  <p class="hero-sub">[subheadline]</p>
  <div class="cta-group">
    <a href="[cta_url]" class="btn-primary">[cta_text]</a>
  </div>
  <div class="hero-glow"></div>             <!-- radial gradient glow -->
</section>
```

### Social Media Cards (OG Images)
Generated using Satori (if Next.js) or Playwright screenshot:
- Dark background with brand gradient
- Product name in display font, wide tracking
- Tagline in body font, muted color
- Brand accent glow border

```typescript
// For Next.js: app/og/route.tsx using @vercel/og
// For others: generate via Playwright screenshot of branded HTML template
```

### Email Templates
```html
<!-- Brand email template structure -->
<table style="background: #0a0a0f; font-family: Inter, system-ui;">
  <tr>
    <td style="border-top: 2px solid; border-image: linear-gradient(135deg, #ff2d78, #bf00ff, #00f5ff) 1;">
      <!-- content -->
    </td>
  </tr>
</table>
```

---

## Step 5: Visual QA Loop

**Every generated visual asset goes through this loop before being committed.**

This is how Atlas ensures "no typos, no embarrassing mistakes, no off-brand output."

```
VISUAL QA PROCEDURE:

FOR EACH generated visual asset (landing page, OG image, email template):

1. RENDER: Use Playwright to screenshot the asset at multiple sizes:
   - Desktop: 1440×900
   - Mobile: 390×844
   - OG card: 1200×630

2. INSPECT (Claude vision analysis):
   Prompt: "Review this screenshot for:
   a) Any visible typos or spelling errors in text
   b) Text that is truncated, overflowing, or cut off
   c) Layout issues: overlapping elements, misaligned content
   d) Color contrast issues: is text readable against background?
   e) Brand consistency: does it match dark/glitchy/vaporwave aesthetic?
   f) Anything visually embarrassing or unprofessional
   List each issue found as: [CRITICAL|WARN|INFO] [location] [description]"

3. FIX AND RETRY:
   - CRITICAL issues → fix immediately, re-screenshot, re-inspect
   - WARN issues → fix if < 5 min, otherwise surface as userMust
   - INFO → log only
   - Maximum 3 fix iterations per asset

4. PASS CRITERIA:
   - 0 CRITICAL issues
   - Typography renders correctly at all sizes
   - No text overflow or truncation
   - Brand colors visible and correct
   - Product name spelled correctly (verify against Business Context)

5. COMMIT when passes QA.
```

If Playwright MCP is not available: generate a `userMust` for the founder to visually review the specified asset, with the exact QA checklist above.

---

## Step 6: Brand Consistency Check (Ongoing)

Before every commit of any visual file, run:

```bash
# Check for hardcoded colors that aren't brand variables
grep -rn "#[0-9a-fA-F]\{3,6\}" src/ --include="*.css" --include="*.tsx" --include="*.jsx" | \
  grep -v "brand\|variable\|token\|comment" | grep -v "000\|fff\|transparent" | head -20
```

Any hardcoded hex color that doesn't match the brand palette = flag for replacement with CSS variable.

---

## Brand Profile Save

After Step 2, update `~/.atlas/founder-profile.json`:
```json
{
  "aesthetic_preferences": {
    "stated": "[founder's words]",
    "resolved": {
      "style": "dark haunted glitchy vaporwave",
      "primary_accent": "#ff2d78",
      "secondary_accent": "#00f5ff",
      "bg_primary": "#0a0a0f",
      "font_display": "Space Grotesk",
      "font_mono": "JetBrains Mono",
      "motion_intensity": "high",
      "glitch_on_hover": true,
      "scroll_animations": "gsap-scrolltrigger"
    }
  }
}
```

This profile is read by every subsequent Atlas run — the brand system carries across projects.

---

## Output

- `styles/brand.css` — complete CSS variable system committed
- `tailwind.config.js` — updated with brand tokens
- `docs/brand/BRAND_SYSTEM.md` — human-readable brand guide
- All generated assets passed through Visual QA loop
- `~/.atlas/founder-profile.json` — aesthetic preferences saved for all future projects
- Git commit + push

---

## Acceptance Test

- [ ] `styles/brand.css` exists and contains full color system
- [ ] Landing page (if generated) screenshotted and QA-passed at 1440px + 390px
- [ ] OG image (if generated) screenshotted and QA-passed at 1200×630
- [ ] 0 CRITICAL issues from Visual QA
- [ ] Product name spelled correctly in all generated assets
- [ ] Google Fonts linked in layout
- [ ] `docs/brand/BRAND_SYSTEM.md` committed

---

## Checkpoint

```
─────────────────────────────────────────────────────
BRAND ENGINE COMPLETE

Atlas did:
  ✓ Brand system generated: [aesthetic style]
  ✓ Color palette: [N] tokens committed to styles/brand.css
  ✓ Typography: [fonts] committed + Google Fonts linked
  ✓ Motion language: [N] animations committed
  ✓ Visual QA: [N] assets screenshotted and reviewed
  ✓ [N] QA issues found and fixed
  ✓ Brand profile saved to ~/.atlas/founder-profile.json
  ✓ BRAND_SYSTEM.md committed

QA summary:
  ✅ Landing page: desktop + mobile PASS
  ✅ OG image: PASS
  [⚠️ Email template: 1 truncation warn — surfaced as userMust]

Sovereign Score: [X] → [Y]

── BRAND ENGINE ACTIVE — all subsequent assets apply this system ──
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Generating visual assets without specifying concrete CSS values
- ❌ Skipping Visual QA because "it looks fine"
- ❌ Using hardcoded colors instead of CSS variables
- ❌ Applying brand inconsistently across landing page vs. email vs. social cards
- ❌ Generating a "brand guide" doc without committing the actual CSS
- ❌ Not saving the aesthetic profile for future projects
- ❌ Generic "modern dark theme" instead of the founder's specific aesthetic
- ❌ Committing an asset with a typo in the product name
- ❌ Not running Visual QA on mobile breakpoint
