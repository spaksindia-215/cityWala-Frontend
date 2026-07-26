# CityWala — UI/UX Redesign Blueprint

**Audience:** Claude Sonnet (implementation engineer)
**Scope:** UI/UX only. Zero changes to APIs, routing, auth, business logic, SEO components, i18n keys, or data flow.
**Master design:** A reference hero screenshot (provided by the user) supersedes the *current coded* hero in `src/pages/Home.jsx:306–493`. The two are different designs — build to the screenshot, not to the existing gradient-glass code. Master hero elements:
- **Header, 3-row stack:** (1) slim ink-900 utility bar — phone + email left, nav links (About Us, List Your Business, Help & Support ▾) right; (2) white main bar — logo mark + wordmark "City Wala" with tagline "Find | Connect | Grow" underneath, centered pill search bar (category icon-select + text input + circular blue search button), then a "Total Users" icon+count stat, then three distinct buttons: **Customer Login** (secondary/outline blue), **Partner Login** (outline orange), **List Business** (solid blue primary).
- **Hero band:** full-bleed warm sunset cityscape photograph with a soft light (near-white/blue) wash overlay — not a solid brand gradient. Content is left-aligned over the photo: small uppercase overline badge "TRUSTED LOCAL BUSINESS DIRECTORY" (blue), large serif display headline in three treatments — ink-900 ("Find Experts,"), ink-900 ("Services") + orange accent ("& More") on one line, gray-600 subtitle paragraph below, then a **solid white** rounded search card (not glass/translucent) containing 4 labeled dropdowns (Select Country, Search State, Search City, Category — each with a small blue leading icon) + a solid blue "Search" pill button with icon+label.
- **Stats band below the hero:** a light gray (`--cw-bg`) full-width strip with 4 evenly-spaced stat items, each a colored icon-in-circle (blue store / orange people / green check-shield / purple shield) + bold number + gray label — not overlaid on the photo, not glass chips.
- Brand gradient (`#1075be → #f46f26 → #29528c`) and the amber `#ffb703` accent still exist in the system (2.1) and are used for CTA banners, featured/plan accents, active states, and small UI accents (icons, the "&" glyph treatment) — but they are **no longer the hero's background**. Do not paint the hero, or any other full-section background, with the solid gradient; reserve solid gradient fills for CTA banners and small accent elements only.
- Every other page inherits this language: photographic/light hero bands with ink display headlines and solid (non-glass) white utility cards, gradient reserved for accents/CTAs, consistent header/stat-band structure.

**Tech context (do not change):** React 18 + Vite, React Router 6, Bootstrap 5.3.2 via CDN (`index.html`), Font Awesome 6 CDN, `react-select`, `react-slick`, i18next (`t()` everywhere — keep every key), `react-helmet-async` SEO components (`src/seo/*` — never touch), Google Translate widget, GTM. Global styles live in `src/index.css` (public) and `src/admin.css` (scoped under `.admin-root`).

---

# Phase 1 — Complete UI Audit

Every issue below states **What / Why / Fix**. File references are exact.

## 1.1 Token & color chaos

- **What:** Only 4 CSS variables exist (`src/index.css:15–20`); everything else is hardcoded hex sprinkled across ~40 files: `#1075be`, `#f46f26`, `#ffb703`, `#0f172a`, `#1a1a2e`, `#111`, `#111827`, `#10b981`, `#f59e0b`, `#8b5cf6`, `#25d366`, `#be123c`, `#065f46`…
- **Why:** Impossible to keep pages consistent; three different "dark" surfaces exist (header-top `#0f172a`, footer `#1a1a2e`, partner sidebar `linear-gradient(180deg,#0f172a,#111827)`, dashboard-sidebar `#111`), and jewel-tone plan gradients (`Plan.jsx:147–163`) belong to no palette.
- **Fix:** Full token layer (Phase 2). Replace every hardcoded color with a `var(--cw-*)` token. One dark surface color for all dark chrome.

- **What:** `index.css:49–79` **overrides Bootstrap utility classes** `.text-primary`, `.bg-primary`, `.text-secondary`, `.bg-secondary`, `.text-dark`, `.bg-dark` globally. Same again in `admin.css`.
- **Why:** Bootstrap's own components (badges, buttons, `bg-primary` banners in `PartnerDetails.jsx:120`) silently render in the orange/blue override, and intent is ambiguous everywhere (`text-primary` sometimes means Bootstrap blue, sometimes CityWala orange).
- **Fix:** Stop overriding Bootstrap classes. Instead redefine Bootstrap's *source variables* once: set `--bs-primary`-family CSS vars (`--bs-primary`, `--bs-primary-rgb`, `--bs-link-color`, etc.) on `:root` to CityWala blue, and introduce namespaced utilities (`.text-accent`, `.bg-accent`) for orange. Then `text-primary` everywhere means one thing.

## 1.2 Duplicate / dead CSS

- **What:** `index.css` defines the same selector twice with conflicting rules: `.testimonial-card` (578 and 1016), `.service-box`/`.service-overlay` (831 and 929), `.dashboard-sidebar` (732 and 895), `.header-actions` (384 and 393), `.about-page` (1117 and 1247), `.section-title` (682 and 1048, the second adding a `::before` bar that leaks onto every page using the class). Huge commented-out blocks (`.profile-card`, old sections).
- **Why:** Last-declared wins unpredictably; editors can't tell which rule is live; the `.section-title::before` blue bar appears/misaligns depending on `position` context.
- **Fix:** Rebuild `index.css` from scratch as a token + component sheet (Phase 2). Delete all dead/duplicate blocks. One definition per component class.

## 1.3 Inline-style sprawl

- **What:** Hundreds of `style={{ }}` objects: the hero shapes (`Home.jsx:315–337`), the glass card (`Home.jsx:384–390`), plan cards (`Plan.jsx:142–163`), partner sidebar (`PartnerLayout.jsx:49–61`), stat tiles (`PartnerLogin.jsx:1420–1440`), nearly all of `PartnerDetails.jsx`, `AuthSelection.jsx`, `Dashboard.jsx`, admin sidebar (`AdminSidebar.jsx:100–120`).
- **Why:** The master theme can't propagate; every tweak requires editing N files; no hover/focus states possible inline (which caused the JS-hover hack below).
- **Fix:** Every repeated inline pattern becomes a CSS class in the new stylesheet (`.cw-hero`, `.cw-glass`, `.cw-stat-tile`, `.cw-sidebar`, …). Inline styles allowed only for truly dynamic values (chart colors from data).

## 1.4 JS-driven hover states

- **What:** `AuthSelection.jsx:36–74` swaps Bootstrap classes and mutates `style` in `onMouseEnter/onMouseLeave`; `AboutUs.jsx:120–121` scales an image the same way.
- **Why:** No keyboard/focus equivalent (accessibility failure), causes React-vs-DOM class drift, unmaintainable.
- **Fix:** Pure CSS `:hover`/`:focus-visible` on a `.cw-choice-card` / `.cw-img-zoom` class. Remove all mouse-event styling handlers (keep navigation `onClick`s untouched).

## 1.5 Header problems (`src/components/Header.jsx`)

- **What:** (a) A public header fetches `/admin/users` and renders "Total Users: N" as a fake button (lines 120–130, 276–281) — the master screenshot keeps this stat but as a small icon+label+count block, not a button. (b) Emoji icons `👤`/`💼` inside login buttons with inline `fontSize` overrides (333–341). (c) Three competing button colors in one row: blue primary, blue outline, Bootstrap green `success` (447) — master screenshot instead uses blue-outline / **orange**-outline / blue-solid for the three CTAs. (d) Top bar is `#0f172a` navy unrelated to the footer's `#1a1a2e`, and currently has no nav links — the master screenshot's top bar carries "About Us / List Your Business / Help & Support ▾" on the right. (e) Raw Google Translate widget with default Google styling. (f) The category `<select>` is a bare Bootstrap select next to a custom search box — two different control styles side by side; master screenshot unifies these into one pill-shaped search bar. (g) Search button positioned with magic numbers (`top:5px right:5px`). (h) No tagline under the logo; master screenshot shows "Find | Connect | Grow" under the wordmark.
- **Why:** The header is the most-seen component and currently reads as three different products; the admin-count call is also a needless request on every page load (keep the call — do not remove logic, only presentation).
- **Fix (visual only):** Rebuild header presentation per Phase 4.1 to match the master screenshot's two-row structure exactly. Replace emojis with Font Awesome icons, adopt the blue/orange/blue three-button pattern, add the top-bar nav links + Help & Support dropdown, add the tagline, unify the search into one pill bar, use one dark token for the top bar, wrap Google Translate in a styled shell (CSS targeting `.goog-te-gadget` already exists — extend it), restyle the users-count as an icon+label+count block.

## 1.6 Route-change fake loader (`src/components/Loader.jsx`)

- **What:** Every route change shows a full-screen overlay spinner for a hard-coded 500 ms even when the page is already rendered.
- **Why:** Adds artificial latency to every navigation; overlay + `zIndex 9999` blocks interaction; spinner color var may not resolve (`color="var(--primary-color)"` passed as SVG attr).
- **Fix (visual/UX, no logic removal):** Replace the full-screen overlay with a slim 3px top progress bar in the hero gradient (fixed top, animates across, fades). Same component API, same mount point in `App.jsx`.

## 1.7 Typography issues

- **What:** Playfair Display serif is forced on *all* `h1–h6` globally (`index.css:37–47`) — including admin tables, dashboards, form section titles, modals. Body is Lato. Font sizes are ad-hoc: `13px`, `0.65rem`, `0.7rem`, `0.75rem`, `fs-7` (not a real Bootstrap class), `22px`, `52px` inline.
- **Why:** Serif headings on data-dense dashboards look dated and hurt scanability; `fs-7` silently does nothing; micro-labels at `0.65rem` are below accessible minimums.
- **Fix:** Serif (Playfair) reserved for *display* headings on public marketing surfaces (hero H1, section titles, CTA banner) via `.cw-display`. All UI chrome, dashboards, forms, cards use Lato with the Phase 2 type scale. Minimum text size 12px; micro-labels become 11px uppercase with letter-spacing only where legally short (overline labels).

## 1.8 Spacing & radius inconsistency

- **What:** Radii in active use: 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 50px + `rounded-3/4` + pills. Section paddings: `py-3/4/5`, `90px 0 80px`, `110px 20px 90px`, `40px 20px 100px`. Card paddings: 15, 18, 20, 24, 25, 28, 30, 35px.
- **Why:** Pages feel stitched together; nothing lines up vertically.
- **Fix:** Radius scale (Phase 2.6) and an 8-pt spacing scale; every section uses `.cw-section` (one vertical rhythm), every card uses card tokens.

## 1.9 Category & listing pages (`src/pages/AllCategories.jsx`)

- **What:** (a) `console.log` debug noise renders inside JSX (`{console.log(...)}` at 492, 598). (b) Empty states are default Bootstrap `alert-info` boxes (371, 511, 639). (c) Loading is a bare `spinner-border`. (d) Business cards are hand-built twice (515–588 and 642–715) with identical inline-styled 90px logo blocks. (e) Root category cards (336–366) are default Bootstrap `.card` with `minHeight:'180px'` — a different card style from the homepage's `.category-card-v2`. (f) Subcategory rows use numbered blue circles + chevrons — a third list style. (g) Section headers use three different treatments on one page (border-start bar at 380, `.section-title` with `::before` at 498, plain h5 at 630).
- **Why:** The highest-traffic browse surface has four card languages and developer artifacts visible in production paths.
- **Fix:** Phase 4.4/4.5 — one `BusinessCard`, one `CategoryCard`, one `SubcategoryRow`, one `SectionHeader`, real `EmptyState` and `SkeletonCard` components. Remove JSX-embedded `console.log` calls (pure render cleanup, not logic).

## 1.10 Business detail page (`src/pages/PartnerDetails.jsx`)

- **What:** (a) Cover banner is flat `bg-gradient bg-primary` — which, due to the utility override, renders *orange*, not the master gradient. (b) Public page shows internal moderation status badge ("approved/pending/rejected", lines 121–128) — internal state leaked to customers. (c) Fallback logo is a random Unsplash office photo (139–145). (d) Plan tier badge ("Diamond Plan") shown to visitors. (e) Non-existent utility classes: `fs-7`, `py-2.5`, `px-2.5`, `tracking-wider` (Tailwind-ism) — all silently no-ops.
- **Why:** Trust page for a directory must look intentional; leaking moderation status and plan tier is confusing to consumers; broken utility classes mean the intended sizing never applied.
- **Fix:** Master-gradient cover, monogram fallback (brand-styled initial, same as listing card), hide/restyle status as a "Verified" chip only when approved (presentation-level conditional on the same data — no API change), replace fake utilities with real classes.

## 1.11 Plans page (`src/pages/Plan.jsx`)

- **What:** Diamond/Ruby/Emerald cards use black, crimson, and green gradients (147–163) with colored borders; Razorpay button is generic `btn-primary`; PayPal renders its gold widget; `alert()` used for feedback (277–293).
- **Why:** Three saturated gradients unrelated to brand; on a page asking for money, visual trust matters most.
- **Fix:** Phase 4.7 — white cards on the shared card recipe, tier expressed by an accent chip + icon color only; featured tier gets the master gradient header strip. `alert()` calls stay functionally (they're logic) but Phase 9 adds a Toast component the engineer swaps in (same trigger points, presentation change).

## 1.12 Dashboards (user / partner / admin)

- **What:** Three unrelated shells: user dashboard is a card inside the public layout (`Dashboard.jsx`), partner has a fixed 260px gradient sidebar (`PartnerLayout.jsx`), admin has a sticky `col-lg-2` navy sidebar (`AdminSidebar.jsx`) with inline active-state styles. Stat tiles differ per dashboard (solid gradient tiles in `PartnerLogin.jsx:1420`, icon cards in `Dashboard.jsx:34`, Chart.js defaults in `AdminDashboard.jsx`/`Analytics.jsx`). Sidebar link styles exist in triplicate (`.sidebar-link`, `.sidebar-item`, inline).
- **Why:** Same product, three admin identities; maintenance burden triples.
- **Fix:** One `Sidebar` visual recipe (`.cw-sidebar`, dark ink surface, brand-blue active rail), one `StatCard`, one `DashboardPageHeader`, shared table/chart styling. Layout components keep their own route logic — only markup/classes change.

## 1.13 Pagination (`src/components/Pagination.jsx`)

- **What:** `btn-dark`/`btn-outline-dark` buttons — brandless; limit `<select>` floats unlabeled; prev/next are text-only.
- **Fix:** Restyle with brand tokens per Phase 2.20; add "per page" label; chevron icons with `aria-label`s.

## 1.14 Accessibility problems

- **What:**
  1. Clickable `<div>`s everywhere (category cards `Home.jsx:569`, business cards `AllCategories.jsx:518`, subcategory rows) — no `role="button"`, no `tabIndex`, no keyboard handler.
  2. Icon-only buttons without `aria-label` (hero search `Home.jsx:455`, header search, scroll arrows `Home.jsx:638`).
  3. JS hover with no focus parity (1.4).
  4. Text at 11–10px (`expert-card p` 12px→11px mobile, `0.65rem` labels).
  5. Contrast: `text-white-50` on gradient (hero stats), `#888` subtitle on `#f8fbff`, amber `#ffb703` button with black text is fine, but `.text-muted` on `bg-light-subtle` is borderline.
  6. `alt="img"` on logos (`PartnerLayout.jsx:123`, `AdminSidebar.jsx:86`); decorative shapes not `aria-hidden`.
  7. Heading order: cards use `h6` before any `h2` context; hero pages sometimes lack a single `h1` (dashboard pages start at `h4`).
  8. Focus styles: default outline removed by Bootstrap `shadow-none` on the navbar toggler; custom controls define none.
- **Why:** Keyboard and screen-reader users cannot operate the browse flow at all.
- **Fix:** Interactive cards become `<Link>`/`<button>` styled as cards (markup change, same handlers); every icon-only control gets `aria-label` (i18n-keyed); global visible `:focus-visible` ring token (`--cw-ring`); minimum 12px text; raise muted text to a 4.5:1 token; correct alt text; `aria-hidden="true"` on decorative shape divs; each page exactly one `h1`.

## 1.15 Mobile responsiveness issues

- **What:** (a) Hero search card: 4 selects + icon button stack to full width but the submit button becomes a mystery icon-only bar (`col-lg-1`). (b) Header collapse dumps search + category select + 4 buttons in an unstyled column. (c) Admin tables (`adminPartner.jsx`, `AllPlans.jsx`, `AdminAllCategories.jsx`) have no `.table-responsive` wrapper pattern. (d) Floating WhatsApp + call buttons stack over content and over each other's tap zones (50px circles 10px apart, `Footer.jsx:141–146`). (e) `expert-card img` fixed `123×72` overflows its `min-width:115px` card. (f) Testimonial slider dots overlap next section (slick default margin).
- **Fix:** Phase 6 details per breakpoint; search submit gets a labeled full-width button on mobile; tables get a standard responsive wrapper + card-collapse pattern on `<576px`; floating buttons merge into one FAB stack with safe-area margins.

## 1.16 Content/visual debt

- **What:** Hot-linked third-party images as UI content (istockphoto avatar fallback `Home.jsx:665`, Unsplash fallbacks, external service photos in Repairs/Daily Needs with broken-URL onError chains that concatenate an id onto a jpg URL — `Home.jsx:794–797`); payment strip icons loaded from production domain; footer social links to `#`.
- **Why:** External hotlinks break, look inconsistent, and are a privacy leak.
- **Fix:** Local asset placeholders (add to `src/assets/` or `public/`): one branded monogram avatar SVG, one branded 16:9 placeholder. Presentation change only — swap URLs, keep the onError pattern but point at the local asset.
- **New requirement from the master screenshot:** the hero now needs a real cityscape/sunset photo asset (`.cw-hero-photo` background, per 2.1). Source a properly licensed high-resolution image (stock library the project already has rights to, or a commissioned/generated asset) and add it to `src/assets/hero-cityscape.jpg` (or `.webp` with a jpg fallback) — do not hotlink a third-party URL for this, since it's now a primary brand asset, not a fallback. Optimize to ≤300KB, provide at least a 1600px-wide source, and set `loading="eager"`/`fetchpriority="high"` since it's above-the-fold LCP content.

## 1.17 Components that must be merged into reusable components

| Duplicated today | Locations | Becomes |
|---|---|---|
| Business/partner card | `AllCategories.jsx` ×2 | `BusinessCard` |
| Hero + gradient + shapes | `Home.jsx`, `AboutUs.jsx`, `ContactUs.jsx` (copy-pasted 40-line blocks) | `HeroBanner` |
| Section heading (label + title + subtitle + action) | 6+ variants | `SectionHeader` |
| Stat tile | `Home.jsx` hero stats, `Dashboard.jsx`, `PartnerLogin.jsx`, `AdminDashboard.jsx`, AboutUs `.stat-box` | `StatCard` |
| Sidebar chrome | Partner, Admin | shared `.cw-sidebar` classes (layouts stay separate files) |
| Category tile | `.category-card` (dead), `.category-card-v2`, `.expert-card`, Bootstrap card in AllCategories | `CategoryCard` (2 sizes) |
| Empty state | `alert-info` in 5 places | `EmptyState` |
| Page loader | spinner-border in 6 places | `Spinner` + `SkeletonCard` |
| Auth card shell | Login, Register, Forgot, Reset, VerifyOtp, AdminLogin, PartnerLogin | `AuthCard` layout recipe |
| CTA banner | Home CTA, AboutUs `.bottom` | `CTABanner` |

---

# Phase 2 — Design System Specification

All tokens are CSS custom properties declared once on `:root` in `src/index.css` (and mirrored in `admin.css` under `.admin-root` only if needed — prefer `:root` so both share). Prefix: `--cw-`.

## 2.1 Color palette

Derived from the master hero screenshot (photo + ink headline + blue/orange accents) with the brand gradient retained as an accent-only device.

**Brand**
- `--cw-blue-600: #1075be` — primary brand & primary actions (search button, primary buttons, links, icon accents)
- `--cw-blue-700: #0d5f9b` — primary hover
- `--cw-blue-800: #29528c` — deep blue (headings-on-light emphasis, gradient end)
- `--cw-blue-50: #eef7ff` — tint surface (icon chips, selected states, stat icon circle)
- `--cw-orange-500: #f46f26` — accent: the "& More" headline treatment, Partner Login outline, active markers, CTA/plan accents. Never a full-section background fill.
- `--cw-orange-50: #fff3eb` — accent tint (stat icon circle)
- `--cw-amber-400: #ffb703` — reserved conversion accent for small CTA elements on gradient surfaces (e.g., CTA banner button, featured plan badge). Text on amber is always `--cw-ink-900`.

**Gradients (accent-only — never a full hero/section background)**
- `--cw-gradient-hero: linear-gradient(135deg,#1075be 0%,#f46f26 45%,#29528c 100%)` — CTA banners, featured pricing-card top rail, small decorative accents (e.g. footer top rail). **Do not** use as the homepage/page hero background — the hero uses the photo treatment in 4.1a instead.
- `--cw-gradient-soft: linear-gradient(135deg,rgba(16,117,190,.07),rgba(244,111,38,.07))` — tinted section backgrounds (testimonials, alternating content bands).

**Neutrals (one dark, one gray ramp — replaces `#0f172a/#1a1a2e/#111/#111827/#333334`)**
- `--cw-ink-900: #0f172a` — all dark chrome: header top bar, footer, sidebars, dark cards
- `--cw-ink-800: #1e293b` — dark hover/active surface
- `--cw-gray-700: #334155` — primary body text
- `--cw-gray-500: #64748b` — secondary text (min contrast on white — replaces `#888/#999/#aaa` on light)
- `--cw-gray-300: #cbd5e1` — borders strong / text on dark secondary
- `--cw-gray-200: #e2e8f0` — default borders
- `--cw-gray-100: #f1f5f9` — subtle fills
- `--cw-surface: #ffffff`; `--cw-bg: #f6f8fb` (page background, replaces `#f5f5f5/#f8fbff/#fafafa/#f8f9fa`)

**Semantic**
- `--cw-success: #12805c` (+ `--cw-success-50: #e7f6ef`)
- `--cw-warning: #b45309` (+ `--cw-warning-50: #fef3e2`)
- `--cw-danger: #b3261e` (+ `--cw-danger-50: #fdecea`)
- `--cw-info: var(--cw-blue-600)` (+ blue-50)
- `--cw-violet-500: #7c3aed` (+ `--cw-violet-50: #f2ebfe`) — 4th stat-band icon tint only (e.g. "Verified Professionals"), not used elsewhere.
- WhatsApp FAB keeps `#25d366` (recognizability).

**Photo-hero overlay recipe (signature, from the master screenshot)**
- `--cw-hero-wash: linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.72) 38%, rgba(255,255,255,.25) 65%, rgba(255,255,255,0) 85%)` layered over the cityscape photo so left-aligned dark text stays readable while the photo shows through on the right; photo `object-fit: cover`, section min-height ~560px desktop. Class: `.cw-hero-photo`.
- Search card on the hero is **solid white** (`--cw-surface`), not glass: radius `--cw-r-xl`, shadow `--cw-shadow-lg`, padding `s5`, no backdrop-filter, no translucency. Class: `.cw-hero-search-card`.
- Reserve an actual glass/blur treatment (`backdrop-filter: blur(18px)`, semi-transparent white/dark fill) only for small overlays directly on the CTA-banner gradient (e.g. a badge chip inside `CTABanner`) — not for the hero search card.

**Bootstrap bridge:** set `--bs-primary: #1075be`, `--bs-primary-rgb: 16,117,190`, `--bs-link-color`, `--bs-border-radius: .75rem`, `--bs-body-color: var(--cw-gray-700)`, `--bs-body-bg: var(--cw-bg)`, `--bs-font-sans-serif: 'Lato', sans-serif` on `:root`. Delete the `.text-primary`/`.bg-primary` overrides.

## 2.2 Typography hierarchy

Fonts stay Playfair Display + Lato (already imported at `index.css:1–2`).

- **Display (Playfair, weight 700):** only via `.cw-display`. Hero H1 `clamp(2rem,5vw,3.5rem)/1.15`; Section title `clamp(1.5rem,3vw,2rem)/1.2`; CTA title `clamp(1.5rem,4vw,2.5rem)`.
- **UI (Lato):** remove the global serif `h1–h6` rule.
  - `h1` 32/1.2 · 700 — page titles (listing pages, dashboards)
  - `h2` 24/1.25 · 700
  - `h3` 20/1.3 · 700 — card group titles
  - `h4` 17/1.35 · 700 — card titles
  - `h5/h6` 15/1.4 · 700
  - Body 15/1.65 · 400 (16 on marketing paragraphs)
  - Small 13/1.5; Caption 12/1.4
  - Overline label 11/1.3 · 700 · uppercase · `letter-spacing: .08em` · `--cw-gray-500` (replaces every `0.65rem`/`0.7rem` micro-label)
- Long-form legal pages (`TermConditions`, `PrivacyPolicy`): body 16/1.8, max line width `72ch`.

## 2.3 Spacing scale

8-pt: `--cw-s1: 4px` … `--cw-s2: 8` · `s3: 12` · `s4: 16` · `s5: 24` · `s6: 32` · `s7: 48` · `s8: 64` · `s9: 96`.
Rules: card padding `s5` (compact `s4`); gap inside cards `s3/s4`; grid gutters `s4` (Bootstrap `g-4`); section rhythm via `.cw-section { padding: var(--cw-s8) 0 }` desktop → `s7` tablet → `s6` mobile. Hero: `96px 0 80px` desktop → `64px 0 56px` mobile.

## 2.4 Grid & container widths

Keep Bootstrap's grid. Standard container `max-width: 1320px` (`container-xxl` behavior) for public pages; long-form text pages constrain content to `col-lg-8`. Dashboards: sidebar fixed `260px` + fluid content with `s5` padding. Listing grids: 4-up ≥1200, 3-up ≥992, 2-up ≥576, 1-up below. Category tiles: 6-up ≥1200 (`col-xl-2`), matching current Home grid.

## 2.5 Border radius

- `--cw-r-sm: 8px` — inputs, chips, small buttons
- `--cw-r-md: 12px` — buttons, dropdown menus, thumbnails
- `--cw-r-lg: 16px` — cards (the default)
- `--cw-r-xl: 24px` — hero search card, feature panels, modals
- `--cw-r-pill: 999px` — badges, pills, avatar
Kill every other value (6, 10, 14, 18, 20, 22, 28).

## 2.6 Elevation / shadows

- `--cw-shadow-sm: 0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)` — resting cards
- `--cw-shadow-md: 0 8px 24px rgba(15,23,42,.08)` — hover cards, dropdowns, sticky header
- `--cw-shadow-lg: 0 20px 48px rgba(15,23,42,.16)` — modals, hero search card
- Hover motion recipe (site-wide, replaces the six variants): `transform: translateY(-4px); box-shadow: var(--cw-shadow-md); transition: transform .25s ease, box-shadow .25s ease;` wrapped in `@media (prefers-reduced-motion: no-preference)`.

## 2.7 Icon style

Font Awesome 6 solid (already loaded) at 4 sizes: 14 inline, 16 buttons, 20 nav, 24 feature. Icon chips: 44×44 (`--cw-r-md`) tinted `--cw-blue-50`/`--cw-orange-50` with brand-color glyph — pattern from `ContactUs` `.info-box .icon`, promoted site-wide. Delete all emoji-as-icon usage. Category icon bubble: 72px circle, `linear-gradient(135deg, var(--cw-orange-50), var(--cw-blue-50))` (keep from `.category-card-v2 .icon-box`).

## 2.8 Buttons

Class family `.cw-btn` (or restyled `.btn` variants — engineer's choice, one mechanism):

| Variant | Fill | Text | Border | Hover | Use |
|---|---|---|---|---|---|
| Primary | blue-600 | white | none | blue-700 + lift | default action |
| Accent (CTA) | amber-400 | ink-900 | none | brightness .95 + lift | hero search, "List your business" on gradient |
| Secondary | transparent | blue-600 | 1.5px blue-600 | blue-50 fill | secondary actions |
| Ghost | transparent | gray-700 | none | gray-100 fill | tertiary, table row actions |
| Danger | danger | white | none | darken | destructive (logout keeps ghost-danger text style) |
| On-dark | white | blue-800 | none | gray-100 | CTA banner primary |
| Outline-on-dark | transparent | white | 1.5px rgba(255,255,255,.6) | white/10 fill | CTA banner secondary |

Sizes: sm 32px/13px, md 44px/15px (default), lg 52px/16px. Radius `--cw-r-md`. Weight 600. Icon gap `s2`. Focus: `outline: 3px solid rgba(16,117,190,.35); outline-offset: 2px` (`--cw-ring`). Disabled: 55% opacity, no lift. Full-width on mobile where specified. Replaces: `.nav-btn.*`, `.btn-viewall`, `.view-btn`, `.primary-btn`, `.secondary-btn`, `.cta-btn`, `.scroll-btn` (scroll arrows become 40px circular ghost buttons with border).

## 2.9 Inputs

Height 48px (md), radius `--cw-r-sm`+4 = 12px, border `1px solid var(--cw-gray-200)`, bg white (on-white forms may use `--cw-gray-100` fill with transparent border, focus → white + blue border — the `ContactUs` pattern, adopted globally). Focus: border blue-600 + `--cw-ring`. Label above input: 13px/600/gray-700, gap `s1`. Placeholder gray-500. Error: border danger + 12px danger caption with icon below. Textareas min-height 120px. Phone input (`react-phone-input-2`) styled to same height/border via CSS override.

## 2.10 Dropdowns & selects

Native selects match input recipe. `react-select` (`SearchableSelect.jsx`): update `customStyles` to tokens — control 48px, radius 12, border gray-200, focus blue ring; menu radius 12, shadow-md, option selected bg blue-600, focused bg blue-50; keep `zIndex: 9999`. Bootstrap dropdown menus (header profile): radius 12, shadow-md, border gray-200, item hover gray-100, 8px padding, danger item for logout.

## 2.11 Search bars

Two blessed patterns only:
1. **Hero search (solid card):** `.cw-hero-search-card` — solid white, shadow-lg, radius xl (per 2.1 photo-hero recipe). Inside: 4 labeled fields in a row (Select Country / Search State / Search City / Category), each a bordered `--cw-r-sm` field with a small leading blue icon (globe, pin, building, grid — matching the screenshot) and a light gray-100 fill; trailing solid blue-600 "Search" pill button with icon+label (`fa-magnifying-glass` + text), never icon-only at any width down to `md`. Below `md` the button becomes full-width, still labeled.
2. **Compact search (header):** the pill-shaped bar centered in the main header row: leading category icon-select (borderless) + divider + text input + trailing circular blue-600 icon-button, `aria-label="Search"`, whole bar `--cw-r-pill`, white fill, `--cw-shadow-sm`, sitting on the white header row per the screenshot. Suggestion dropdown: shadow-md, radius 12, 12px items, hover gray-100, highlighted text in blue.

## 2.12 Cards

Base `.cw-card`: white, radius `--cw-r-lg`, border `1px solid var(--cw-gray-200)`, shadow-sm, padding `s5`. Interactive cards add the hover lift recipe and are rendered as `<Link>`/`<button>`. Variants: `--flat` (no shadow, for dashboard interiors), `--feature` (radius xl, padding s6), `--dark` (ink-900, for stats-on-dark). Media cards: image top with radius-inherit, 16:9.

## 2.13 Badges & 2.14 Chips

- **Badge** (status): pill, 12px/700, padding 4px 12px, tinted bg + dark semantic text: success-50/success ("Active", "Verified", "approved"), warning-50/warning ("Pending"), danger-50/danger ("Rejected"), blue-50/blue-600 (informational, plan tier), gray-100/gray-700 (neutral). Never solid Bootstrap `bg-success` pills.
- **Chip** (interactive/filter): pill, 13px/600, 32px height, border gray-200, white bg; selected: blue-50 bg, blue-600 text+border. Used for: trusted-badge on hero (glass variant: white/15 bg, white text), category quick filters, "10K+ businesses" header stat.

## 2.15 Tables (admin + payment history)

Wrapper: `.cw-card` (flat) + `.table-responsive`. Header row: gray-100 bg, 12px uppercase overline gray-500, sticky within scroll. Rows: 15px, 14px secondary, 56px height, border-bottom gray-200 only, hover gray-100/50. Numeric right-aligned. Row actions: ghost icon buttons revealed at rest (not hover-only). Status columns use Badge. Below 576px: collapse to stacked definition cards (CSS-only `data-label` pattern) for partner-facing tables; admin may keep horizontal scroll.

## 2.16 Forms

Two-column `row g-4` on ≥md, single below. Long forms (AddProfile, AddPlans, PartnerRegister) are split into sectioned `.cw-card`s, each with a `SectionHeader` (overline + h3) — structure `AddProfile.jsx` already has; restyle its `card p-3` blocks. Required marker: orange asterisk. Submit row: right-aligned on desktop (primary + ghost cancel), full-width stacked on mobile, `s6` top margin. File upload: dashed-border drop-zone card (radius 12, gray-200 dashes, blue on dragover) with filename + "Uploaded" badge.

## 2.17 Modals

(SessionTimeoutModal + any Bootstrap modals.) Radius `--cw-r-xl`, shadow-lg, no header border; title h3 Lato, close = ghost icon button top-right; padding s6; footer buttons right-aligned (primary rightmost); backdrop `rgba(15,23,42,.5)`; max-width 480 (alert) / 640 (form). Session-timeout modal restyled to this recipe (replace `styles/SessionTimeoutModal.css` contents; keep countdown logic).

## 2.18 Alerts / toasts

Inline alert: radius 12, tinted bg (semantic-50), 4px left rail in semantic color, icon, 14px text, optional dismiss ghost icon. Replaces every `alert-info/success/danger`. Toast (Phase 9, replacing `alert()` presentation): fixed top-right (bottom-center mobile), white card radius 12 shadow-md, semantic left rail + icon, auto-dismiss 4s.

## 2.19 Pagination

Center-aligned group of 36px square (radius 8) ghost buttons; current page = solid blue-600 white; ellipsis plain text; prev/next chevron icon buttons with `aria-label`; "Rows per page" labeled 13px select left-aligned. Wrap layout kept from existing component.

## 2.20 Breadcrumbs

Restyle Bootstrap `.breadcrumb`: 13px, links gray-500 → hover blue-600, separator `/` gray-300, current gray-700/600 weight, `s4` bottom margin. On gradient heroes: white/70 links, white current (`.cw-breadcrumbs--on-dark`). Component `Breadcrumbs.jsx` unchanged structurally (keeps JSON-LD).

## 2.21 Tabs

(Email/phone toggle on Login, dashboard filters.) Underline style: 44px row, 15px/600 gray-500 items, active blue-600 with 2px blue underline; container bottom border gray-200. Pill-segmented variant for binary toggles (email/phone): gray-100 track radius pill, active segment white with shadow-sm.

## 2.22 Accordions

(FAQ potential, admin CategoriesTree, partner sidebar "Plans" collapse.) Chevron rotates 180°; header 48px, 15px/600; open header text blue-600; body 14px gray-500; dividers gray-200; no boxed borders inside sidebars (indent children `s5` with left rail gray-300 → active blue).

## 2.23 Empty states

`EmptyState` component: centered, `s8` vertical padding; 64px icon chip (blue-50 circle, blue-600 icon); h4 title; 14px gray-500 description (max 40ch); optional primary/secondary action. Used for: no businesses in category, no categories, empty payment history, empty dashboard lists, 404 page body.

## 2.24 Loading states

- Route transition: 3px top progress bar in hero gradient (Loader.jsx presentation swap).
- Content loads: skeletons — `SkeletonCard` (shimmering gray-100 blocks matching BusinessCard/CategoryCard geometry), skeleton rows for tables. Shimmer: 1.2s gradient sweep, disabled under `prefers-reduced-motion`.
- Inline/button busy: 16px spinner replacing the icon, label persists ("Registering…" pattern kept).
- `Spinner` component wraps the existing spinner-border with brand color for small in-context waits.

## 2.25 Error & success states

- Form field errors: per 2.9. Page-level errors: inline Alert (danger) with retry button — replaces `alert-danger` blocks in `PartnerDetails.jsx:50–58`.
- Success: inline Alert (success) for form confirmations (ContactUs message area), toast for async confirmations (payments).
- 404 (`NotFound.jsx`): mini gradient hero band + EmptyState with "Back to home" primary.

---

# Phase 3 — Page Inventory

| # | Route | File | Purpose | Current layout | Reusable after redesign | Redesign work |
|---|---|---|---|---|---|---|
| 1 | `/` | `pages/Home.jsx` | Landing: hero search, categories, services, testimonials, CTA | Hero (gradient+glass, superseded) + stats + 4 sections | New photo hero is the source of truth once rebuilt | Rebuild hero to master screenshot; extract components; polish sections (4.3) |
| 2 | `/categories` + `/:l1/:l2/:l3` | `pages/AllCategories.jsx` | Browse tree + listings | Container, mixed card styles | Breadcrumbs | New PageHeader, CategoryCard, SubcategoryRow, BusinessCard, EmptyState, Skeletons (4.4/4.5) |
| 3 | `/partner/details/:id` | `pages/PartnerDetails.jsx` | Business detail | Cover + 2-col info | Breadcrumbs, layout bones | Gradient cover, chips, info cards (4.6) |
| 4 | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-otp` | `pages/Login.jsx`, `ResetPassword.jsx`, `components/VerifyOtp.jsx` | Customer auth | Assorted centered cards | PasswordStrengthMeter (restyle) | AuthCard shell, tabs, inputs (4.8) |
| 5 | `/auth` | `pages/AuthSelection.jsx` | Role chooser | Card with 2 JS-hover buttons | — | Split gradient panel + choice cards (4.8) |
| 6 | `/partner/login`, `/register-business` | `pages/partner/PartnerLogin.jsx` | Partner auth + register | Same as customer | AuthCard | Same shell, partner accent (4.8) |
| 7 | `/plan`, `/partner/plan` | `pages/Plan.jsx` | Pricing/payment | Jewel gradient cards | Grid | PricingCard on brand (4.7) |
| 8 | `/account/dashboard` | `pages/Dashboard.jsx` | User dashboard | Card sidebar + stats | StatCard, quick links | Restyle on tokens (4.9) |
| 9 | `/partner/dashboard` etc. | `PartnerLayout.jsx` + pages | Partner console | Fixed dark sidebar | Sidebar recipe, StatCard, tables | 4.9 |
| 10 | `/partner/add-profile` | `AddProfile.jsx` | Business profile form | Stacked cards | Form system | Sectioned form cards (4.9) |
| 11 | `/partner/my-plan`, `/partner/payment-history` | `MyPlan.jsx`, `PaymentHistory.jsx` | Plan status, invoices | Cards/table | PricingCard, Table | 4.9 |
| 12 | `/admin/*` (12 routes) | `pages/admin/*` | Admin console | Sticky navy sidebar + tables/charts | Sidebar, Table, StatCard, forms | 4.10 |
| 13 | `/about-us` | `AboutUs.jsx` | Marketing | Hero (old gradient, same code as Home's — also needs rebuild) + rows | HeroBanner, CTABanner, StatCard | Rebuild hero to master pattern (photo or slim, per 4.11) + normalize tokens (4.11) |
| 14 | `/contact-us` | `ContactUs.jsx` | Contact form + map | Hero + 2-col + map | HeroBanner, form recipe, icon chips | Normalize (4.11) |
| 15 | `/terms-and-conditions`, `/privacy-policy` | `TermConditions.jsx`, `PrivacyPolicy.jsx` | Legal | Long text | HeroBanner (slim) | Prose styling (4.11) |
| 16 | `*` | `NotFound.jsx` | 404 | Bare | EmptyState | 4.11 |

(Shared chrome: `Header.jsx`, `Footer.jsx`, `PublicLayout.jsx`, `Loader.jsx`, `Pagination.jsx`, `SessionTimeoutModal.jsx` — Phase 4.1/4.2.)

---

# Phase 4 — Page-by-Page Redesign Plan

## 4.1 Header (global)

**Problems:** see 1.5. **Redesign target:** matches the master screenshot's 2-row header exactly.
**Redesign:**
- **Row 1 — top utility bar** (`--cw-ink-900`, ~36–40px): left — phone + email links, 13px white/gray-300, icons 14px; right — nav links "About Us", "List Your Business" (13px white/85, hover white+orange underline) and a "Help & Support ▾" dropdown (same treatment, chevron rotates on open, menu per 2.10). Google Translate widget relocates into the Help & Support dropdown or sits inline right of it in a styled shell (restyle `.goog-te-gadget select` to a 28px ghost select, white text) — pick whichever keeps the row uncluttered; do not drop the widget. Hidden below `md` except translate, which moves into the mobile drawer.
- **Row 2 — main bar** (white, sticky, hairline border-bottom gray-200, shadow-sm only once scrolled): left — logo mark (icon glyph, per screenshot's circular blue/orange building icon) + wordmark "City Wala" in ink-900 with the small gray tagline "Find | Connect | Grow" beneath it; center — compact pill search bar (2.11.2), flex-1, max-width ~560, centered; right, in a row — "Total Users" stat (small `fa-users` icon + "Total Users" label stacked over the live count, gray-500/ink-900 — restyled from the current fake button, same data source), then three distinct buttons: **Customer Login** (secondary/outline blue sm), **Partner Login** (outline **orange** sm — matches screenshot, not ghost), **List Business** (primary solid blue sm). Logged-in: avatar chip button (32px circle blue-600 initial + name) with dropdown (2.10) replaces Customer/Partner Login; partner role additionally gets a "Dashboard" ghost button.
- Icons: FA `fa-user`, `fa-briefcase`/`fa-store`, `fa-users` — no emoji, matching the line-icon style in the screenshot (outline-weight, not solid blobs) where FA's regular/light style is unavailable substitute solid at small size with generous padding.
- **Mobile:** logo + tagline (tagline may hide <400px) + search icon + hamburger (44px targets). Hamburger opens an offcanvas drawer (white, radius-left xl): search field on top, category list, then stacked full-width action buttons (Customer/Partner/List Business in that order), Help & Support + translate at bottom. Search icon expands a full-width search row under the bar.

## 4.2 Footer (global)

**Problems:** third dark color `#1a1a2e`; `#` social links; hotlinked payment icons; cramped hierarchy.
**Redesign:** bg `--cw-ink-900` with a 4px top rail in `--cw-gradient-hero` (ties footer to master theme). 4 columns ≥lg (brand+social / Quick Links / Useful Links / Communication), 2 columns md, accordion-free stacked on mobile. Brand column: white logo, 14px gray-300 tagline (max 32ch), social icon buttons 36px circle white/10 → hover blue-600. Link lists: 14px gray-300 → hover white with 2px orange underline offset; overline column titles (2.2). Contact rows use icon-chip pattern (dark variant). Bottom bar: hairline white/10, 13px copyright left, payment icons right (local assets, height 20, grayscale → color on hover). Floating buttons: single stack bottom-right — WhatsApp 52px + call 44px, 12px gap, `bottom: max(16px, env(safe-area-inset-bottom))`, shadow-md, hidden on print.

## 4.3 Homepage (`Home.jsx`)

**Problems:** current coded hero (solid tri-color gradient + glass card) does not match the master screenshot (photo hero + solid white card + ink headline); sections below it also drift (three section-header styles, hotlinked service images, slick default dots, inline everything).
**Redesign (order unchanged — hero → stats band → categories → find-experts scroll → services → testimonials → CTA):**
- **Hero — rebuild to the screenshot, not the current code:** replace the `linear-gradient(135deg,#1075be...)` section background with `.cw-hero-photo` (2.1 photo-hero recipe) using a licensed/local cityscape (or similarly premium local) photo asset + the white-to-transparent wash; remove the two `aria-hidden` gradient circle shapes (they belonged to the old glass treatment) or repurpose them as very subtle photo-side accents only if they don't fight the photo. Content left-aligned over the wash: overline badge "TRUSTED LOCAL BUSINESS DIRECTORY" (blue-600, white/90 pill bg per current badge style is fine since it now sits on light wash — swap to `--cw-blue-50` bg + blue-600 text), `.cw-display` H1 in ink-900 with the orange accent span exactly as shown ("Find Experts," / "Services **& More**"), gray-600 subtitle 16/1.6 max 560px. Below: `.cw-hero-search-card` (solid white, per 2.1) replacing `.cw-glass`, 4 labeled icon-fields + solid blue "Search" button (2.11.1) replacing the amber icon-only submit.
- **Stats band:** move out of the hero photo entirely into its own light (`--cw-bg`) full-width strip directly below the hero, per the screenshot. Four `StatCard --icon-circle` items (not glass chips): colored icon-in-circle (blue store / orange people / green check / purple shield — rotate through `--cw-blue-50`, `--cw-orange-50`, `--cw-success-50`, a new `--cw-violet-50` tint if a 4th semantic tint is needed) + bold 22/800 ink number + 13 gray-500 label, evenly spaced in a row ≥md, 2×2 grid on mobile.
- **Popular categories:** `SectionHeader` (overline `home.explore`, display title, subtitle, no action). Grid `col-xl-2 col-lg-3 col-md-4 col-6 g-4` of `CategoryCard` (current `.category-card-v2` promoted: icon bubble 72px, name 15/700, "Explore now" 13 blue-600; hover lift + orange border). Cards become buttons (keyboard-safe) preserving `handleCategory`.
- **Find Experts scroll:** `SectionHeader` with paired 40px circular ghost scroll arrows (aria-labels). `CategoryCard --compact` tiles (140px, icon bubble 48, 13px name) — replace the current stretched 123×72 images with contained 48px icons; local monogram fallback.
- **Repairs & Daily Needs:** keep the two `.service-card-wrap` panels (radius xl, padding s6). Each image tile gets its overlay caption back (`.service-overlay` with item name — the name exists in data but is currently unused) and local placeholder fallbacks. "View all" = secondary sm button.
- **Testimonials:** section bg `--cw-gradient-soft`. `TestimonialCard` on `.cw-card`: 20px orange quote icon, 15/1.7 text clamped to 4 lines, 44px avatar, name 15/700, 5 amber stars 13px. Slick dots restyled: 8px gray-300 dots, active 24px pill blue-600; `s6` gap below.
- **CTA:** `CTABanner` — master gradient, `aria-hidden` shapes, display title, white/85 subtitle, buttons On-dark + Outline-on-dark (2.8).

## 4.4 All Categories root (`/categories`)

**Problems:** default Bootstrap cards, alert-info empty state, three header styles.
**Redesign:** Slim gradient page header band (64px padding): breadcrumbs on-dark, overline "Browse collection", h1 display white. Body on `--cw-bg`: grid of `CategoryCard` (media variant when `youtubeUrl` thumb exists: 16:9 top image with centered 40px play chip; else icon bubble), 4-up ≥lg. Loading: 8 `SkeletonCard`s. Empty: `EmptyState` (icon `fa-layer-group`, existing i18n copy).

## 4.5 Category / listing pages (`/categories/:slug…`)

**Redesign top-to-bottom:**
1. Same slim gradient header: breadcrumbs, overline, h1 = category name, description (white/85, 16/1.7, max 720px, `clamp` to 3 lines with the existing read-more toggle restyled as white underlined link-button), optional video thumb as 240px radius-12 card with play chip.
2. **Subcategories:** `SectionHeader` ("Subcategories" + count Badge). `SubcategoryRow` cards in a 2-col grid ≥lg (not full-width rows — halves scroll length): radius lg, padding s4, hover lift; left 40px icon chip (replace number circles with `fa-folder-open` in blue-50 chip), name 15/700, description 13 gray-500 clamped 2 lines with read-more, right chevron gray-300 → blue on hover; optional 64×40 video thumb. Entire card is a link; inner video/read-more keep `stopPropagation`.
3. **Businesses:** `SectionHeader` ("Registered Businesses" + count Badge). Grid 3-up ≥lg of `BusinessCard`: radius lg, padding s4, hover lift; 72px logo (radius 12, gray-200 border, contain) or 72px monogram (blue-600 bg, white initial); name h4, company 13 blue-600/600, short-desc 13 gray-500 2-line clamp, footer row: "View details" secondary sm + phone ghost icon-button (`tel:` if mobile present — data already fetched). One card component used by both `showListings` and `showMixed` branches.
4. Loading: skeleton grid. Empty: `EmptyState` with "no businesses" copy + "Browse other categories" secondary. Remove `{console.log(...)}` from JSX.

## 4.6 Business detail (`PartnerDetails.jsx`)

**Redesign:**
- Breadcrumbs + ghost back-button row (existing pill button restyled ghost sm).
- **Profile header card** (radius xl, overflow hidden): 180px cover in `--cw-gradient-hero` with the two `aria-hidden` circle shapes; logo 140px white frame (radius lg, shadow-md) overlapping −70px; right of logo: h1 company name + Badge row — "Verified" (success tint, only when `status === 'approved'`); plan tier badge only as subtle blue tint chip if product wants it kept, otherwise omit from public view (presentation-level); pending/rejected show nothing to visitors. Tagline 15 gray-500. Actions right: Call (primary, `fa-phone`) + Email (secondary) — full-width stacked on mobile, sticky bottom action bar on `<md` (fixed, white, shadow-md, safe-area padding).
- **Left column (lg-4):** "Contact details" card — overline title, rows as icon-chip + label(overline)/value(15/600); website card merged in as another row with external-link icon.
- **Right column (lg-8):** "Business overview" card — About block (16/1.8, left-aligned, no `text-align: justify`), then 2-col metadata tiles (gray-100 fill radius 12, overline label + 15/700 value): registered name, postal code, full-width address row with `fa-location-dot` blue-600 (not red).
- Error/unavailable states → `EmptyState` in a card with Go-back primary.

## 4.7 Plans (`Plan.jsx`, reused at `/partner/plan`; also `MyPlan.jsx`)

**Redesign:** Slim gradient header (h1 "Choose your plan", subtitle). Cards 3-up ≥lg (xl-3 grid kept): white `.cw-card --feature`, top: tier chip (blue tint, tier icon `fa-gem/fa-crown/fa-star`), tier name h3, price row — 44/800 ink + `/duration` 14 gray-500; divider; features list `fa-circle-check` blue-600 15/1.6; footer: Razorpay primary full-width + PayPal container below (PayPal widget renders itself; wrap with 12px radius clip). "Most popular" (index 1): 2px blue-600 border, master-gradient 6px top rail, floating amber "Most popular" badge, `transform: scale(1.02)` ≥lg. `MyPlan`: current plan as feature card with "Active" badge + renewal metadata tiles; upgrade options as standard cards.

## 4.8 Auth pages (Login, Register, Forgot, Reset, VerifyOtp, AuthSelection, PartnerLogin/Register, AdminLogin)

**Shared `AuthCard` recipe:** full-height split layout ≥lg — left 45%: master-gradient panel with shapes, white logo, display headline, 3 checkmark value props (white/85); right 55%: white surface, centered 440px form column. Below lg: gradient becomes a slim top band (logo + headline), card below. Form: h2 title + 14 gray-500 subtitle, inputs per 2.9, segmented email/phone toggle (2.21), primary full-width submit with busy state, 14px links (blue-600) for forgot/switch, divider + secondary path. Errors: inline Alert above form. OTP: 6 individual 48px boxes (visual only if current input is single — else style the single input 20px letter-spaced center). PasswordStrengthMeter: 4-segment 6px bars gray-200 → semantic fills, 12px caption.
**AuthSelection:** same shell; right side = two `ChoiceCard`s (radius lg, 2px gray-200 border, icon chip, h4, 13 caption; hover/focus: blue border + blue-50 tint — CSS only, delete all mouse handlers) + two ghost register buttons below.
**Partner/Admin variants:** identical shell; partner left-panel copy differs; admin uses dark ink left panel with gradient rail (differentiates console).

## 4.9 User & partner dashboards

**Shared shell (`.cw-sidebar`):** 260px, `--cw-ink-900`, white logo block (correct alt), nav links 44px radius-10: 14/600 gray-300, icon 18; hover ink-800; active white + blue-600 4px left rail + blue-50/10 bg. Collapsible "Plans" per 2.22. Logout: ghost-danger at sidebar bottom (not a red block button). Mobile: existing offcanvas kept, restyled to same classes. Content area: `--cw-bg`, padding s5, each page starts with `DashboardPageHeader` (h1 24 Lato + optional action button).
**Partner dashboard:** stat row = 4 `StatCard`s: white card, 44px icon chip (semantic tint per metric), value 28/800 ink, label 13 gray-500 — replaces solid gradient tiles. Below (existing content blocks): tables/lists per 2.15.
**User dashboard (`Dashboard.jsx`):** left profile card: 80px monogram avatar (blue-600), name h3, email 13 gray-500, divider, vertical ghost menu buttons (browse/plans/logout). Right: welcome h1, 3 `StatCard`s, "Quick links" card with 4 icon-chip tiles (radius 12, gray-100 hover blue-50).
**AddProfile:** sectioned form per 2.16 — each existing `card p-3` becomes `.cw-card` with `SectionHeader`; uploads use drop-zone recipe; sticky save bar on mobile.
**PaymentHistory:** `.cw-card` + table per 2.15, status Badges, empty `EmptyState`.

## 4.10 Admin console (`pages/admin/*`, `admin.css`)

Same `.cw-sidebar` recipe (replace inline active styles in `AdminSidebar.jsx` with classes). `admin.css` is regenerated as a thin scoped sheet importing the same tokens (or simply `.admin-root` inherits `:root` tokens — preferred; delete duplicated component CSS). Pages:
- **AdminDashboard/Analytics:** `DashboardPageHeader`; `StatCard` grid; charts in `.cw-card` with h3 titles; Chart.js visual config (colors from tokens: blue-600, orange-500, blue-800, amber-400; gridlines gray-200; Lato labels; radius 8 bars) — options-object change only, never data.
- **Tables (Users, Partners, AllPlans, AdminAllCategories, Subcategories):** per 2.15 with search input (compact 2.11) + filters row above; action buttons ghost icon; statuses as Badges; Pagination per 2.19.
- **Forms (AddPlans, category add/edit, TermsCondition editor):** sectioned form cards; CKEditor wrapped in input-style border radius 12 with focus ring.
- **CategoriesTree:** indented accordion rows per 2.22, level rails, drag affordances unchanged functionally.

## 4.11 Static pages

- **AboutUs:** hero currently duplicates Home's old gradient code — rebuild using `HeroBanner` in its **slim gradient** variant (a full photo hero is optional here; a slim gradient band with breadcrumb + display h1 is sufficient and keeps About visually distinct from the homepage while staying on-system) unless the user supplies a matching About-page photo, in which case use the photo variant. Normalize `.about-row` (grid kept), `.feature-box`/`.card`/`.stat-box`/`.bottom` onto card + CTABanner recipes; replace the `.hero` dark-gray legacy block and orange `rgba(255,153,0)` tints with brand tokens; `.about-page { font-family: system-ui }` removed.
- **ContactUs:** hero → `HeroBanner` slim gradient variant (same reasoning as AboutUs). Info panel + form panel = `--feature` cards; icon chips already on-pattern (retint to orange-50/orange-500); form per 2.16; success/error message → inline Alert (replace ✅/⚠️ emoji strings' *presentation* — wrap message in Alert; string content may keep i18n text minus emoji only if trivially safe, else render as-is inside Alert). Map card radius xl, shadow-sm.
- **Terms/Privacy:** slim gradient band (breadcrumb + h1), body `col-lg-8` prose (2.2 legal recipe), sticky in-page section nav ≥lg (optional, links only).
- **NotFound:** per 2.25.

---

# Phase 5 — Reusable Component Mapping

New folder: `src/components/ui/` (pure presentational; no data fetching inside).

| Component | Spec § | Used on |
|---|---|---|
| `Button` (variants/sizes) or `.cw-btn` classes | 2.8 | Everywhere |
| `HeroBanner` (photo variant: bg image + wash + ink headline + search/CTA slot; slim variant: gradient band for interior pages) | 4.3 | Home uses photo variant; About/Contact use photo variant (or slim, per 4.11); slim gradient variant: AllCategories, listings, Plans, Terms/Privacy, 404 |
| `SectionHeader` (overline, title, subtitle, action slot) | 4.3 | Home ×4, listings ×2, dashboards, forms |
| `SearchBarHero` (glass) | 2.11 | Home hero |
| `SearchBarCompact` | 2.11 | Header, admin tables |
| `SearchableSelect` (existing — retheme styles) | 2.10 | Hero, forms |
| `CategoryCard` (default / compact / media) | 4.3–4.5 | Home ×2, AllCategories root |
| `SubcategoryRow` | 4.5 | Listing pages |
| `BusinessCard` | 4.5 | Listing + mixed branches |
| `TestimonialCard` | 4.3 | Home |
| `StatCard` (default / on-gradient / dashboard) | 4.3, 4.9 | Hero stats, About, all 3 dashboards |
| `PricingCard` | 4.7 | Plan, MyPlan |
| `ProfileHeader` (cover + logo + badges + actions) | 4.6 | PartnerDetails |
| `CTABanner` | 4.3 | Home, About |
| `Badge` / `Chip` | 2.13–2.14 | Statuses, tiers, filters, header |
| `EmptyState` | 2.23 | Listings, tables, 404, dashboards |
| `SkeletonCard` / `Spinner` | 2.24 | Listings, dashboards |
| `Alert` (inline) / `Toast` | 2.18 | Forms, payments |
| `AuthCard` layout | 4.8 | 8 auth screens |
| `Pagination` (existing — retheme) | 2.19 | Admin tables |
| `Breadcrumbs` (existing — retheme) | 2.20 | All content pages |
| Sidebar classes `.cw-sidebar` | 4.9 | Partner + Admin layouts |
| `Navbar` (Header restyle) / `Footer` | 4.1–4.2 | PublicLayout |
| Table classes `.cw-table` | 2.15 | Admin, PaymentHistory |
| Form classes (inputs, drop-zone) | 2.9, 2.16 | All forms |

Rule for the engineer: when a page needs a card/button/state, it **must** come from this list; inventing a new variant requires adding it to this table first.

---

# Phase 6 — Responsive Strategy

Breakpoints = Bootstrap's: ≥1200 desktop (xl), 992–1199 laptop (lg), 768–991 tablet (md), <768 mobile (sm/xs). Test at 1440, 1280, 1024, 768, 390, 360.

**Desktop (≥1200):** full header (search 560px); hero H1 3.5rem max; category grid 6-up; listings 3–4-up; dashboards sidebar + fluid; hover lifts active.

**Laptop (992–1199):** identical structure; hero search 4 controls in one row (lg cols already defined); listings 3-up; container gutters s4.

**Tablet (768–991):** header collapses to drawer (4.1); hero search 2×2 controls + full-width labeled amber submit; category tiles 3-up (`col-md-4`); listings 2-up; service panels stack; dashboard sidebars become offcanvas (existing mechanism); stat rows 2×2; auth split becomes stacked band+card; tables horizontal-scroll in cards; footer 2-col.

**Mobile (<768):** section rhythm s6; hero padding 64/56, H1 2rem, subtitle 15px, stats 3 compact chips in one row (13px); search controls stacked full-width, submit lg full-width; category tiles 2-up compact (60px bubble); expert scroll stays horizontal (touch) with edge-fade gradient hint, arrows hidden; listings 1-up; business card keeps horizontal layout (56px logo); detail page actions → sticky bottom bar; pricing cards 1-up, featured first (order swap via CSS `order`); forms single-col, sticky submit; tables → stacked card rows (partner) or scroll (admin); footer stacked, social row centered; FAB stack with safe-area; drawer nav per 4.1; tap targets ≥44px everywhere; testimonial slider 1-up (config exists).

**Interaction changes:** hover lifts disabled on touch (`@media (hover: hover)` guard); focus-visible ring always; reduced-motion kills lifts/shimmer/slider autoplay speed stays (logic untouched).

---

# Phase 7 — Implementation Roadmap

Each phase is independently shippable; do them in order — later phases depend on earlier ones. **Global constraints for every phase:** don't touch `src/seo/*`, `src/api/*`, `src/context/*`, `src/i18n/*`, routing in `App.jsx` (except className wrappers), any handler logic, or backend. Keep every `t()` key. Keep Bootstrap CDN. Verify each phase at the six test widths.

**P1 — Foundations.** Objective: token layer + reset. Rewrite `src/index.css` head: `:root` tokens (2.1–2.7), Bootstrap variable bridge, remove utility overrides + global serif headings, add `.cw-display`, `.cw-section`, `.cw-hero-photo`, `.cw-hero-search-card`, hover/focus/reduced-motion recipes; delete duplicate/dead CSS blocks; slim `admin.css` to scoped extras. Dependencies: none. Outcome: site renders with new type/colors; some pages temporarily off until later phases. Constraints: audit every usage of `.text-primary`/`.bg-primary`/`.text-secondary` while removing overrides (they change meaning — fix call sites to `.text-accent` etc. where orange was intended). Source the hero photo asset (see 1.16) during this phase so P3 isn't blocked.

**P2 — Core components & chrome.** Objective: `src/components/ui/` primitives (Button classes, Badge, Chip, Alert, EmptyState, Skeleton, Spinner, SectionHeader, StatCard, cards, table/form/pagination/breadcrumb CSS) + Header 4.1, Footer 4.2, Loader progress-bar swap, SessionTimeoutModal restyle, Pagination/Breadcrumbs retheme, SearchableSelect retheme. Dependencies: P1. Outcome: shared chrome on-brand on every page. Constraints: Header keeps all fetches/handlers; only presentation changes.

**P3 — Homepage.** Objective: 4.3 — extract HeroBanner/SearchBarHero/CategoryCard/TestimonialCard/CTABanner from existing markup, restyle sections, local fallback assets, slick dot theme. Dependencies: P2. Outcome: master page pixel-clean; components ready for reuse.

**P4 — Category browse.** Objective: 4.4 — root categories page: slim hero, CategoryCard grid, skeletons, empty states. Dependencies: P3 (CategoryCard, HeroBanner slim).

**P5 — Listing pages.** Objective: 4.5 — SubcategoryRow, BusinessCard, section headers, skeleton/empty, remove JSX console.logs. Dependencies: P4. Outcome: entire browse funnel coherent. Constraints: preserve `location.search` propagation and all click handlers/stopPropagation.

**P6 — Business detail.** Objective: 4.6 — ProfileHeader, info cards, status→Verified chip logic (render-condition only), sticky mobile actions. Dependencies: P5 (shares Badge/monogram).

**P7 — Auth.** Objective: 4.8 — AuthCard shell applied to Login/Register/Forgot/Reset/VerifyOtp/AuthSelection/PartnerLogin/PartnerRegister/AdminLogin; delete JS-hover; segmented toggle; strength meter restyle. Dependencies: P2. Constraints: `Login.jsx` and `PartnerLogin.jsx` are monoliths with multiple exports — restyle in place, do not split files or change exports.

**P8 — Dashboards.** Objective: 4.9 + 4.10 — `.cw-sidebar` in both layouts, DashboardPageHeader, StatCards, tables, forms (AddProfile, AddPlans, admin CRUD), chart theming (Chart.js options only), Plans/MyPlan/PaymentHistory per 4.7. Dependencies: P2 (+P7 for AdminLogin shell). Constraints: keep offcanvas mechanics, collapse ids, Razorpay/PayPal integration untouched (style wrappers only).

**P9 — Static pages & feedback.** Objective: 4.11 (About, Contact, Terms, Privacy, 404) + Toast component wired to existing alert() *call sites' presentation* where a swap is a pure render change; otherwise leave alert(). Dependencies: P3 (HeroBanner, CTABanner).

**P10 — Polish & QA sweep.** Objective: cross-site pass — spacing rhythm audit, focus-visible on every interactive element, aria-labels on icon buttons, alt-text fixes, heading-order per page, contrast spot-check (hero stats, muted-on-tint), reduced-motion audit, 390px walkthrough of every route, dead-CSS purge, verify no non-existent utilities remain (`fs-7`, `py-2.5`, `tracking-*`). Outcome: release-ready. Constraints: no new features; visual diffs only.

---

## Success criteria (definition of done)

1. Every color, radius, shadow, and font-size on the site resolves to a `--cw-*` token or Bootstrap-bridged variable.
2. The hero gradient, glass recipe, amber CTA, and ink-900 chrome appear consistently: hero/CTA/covers use the gradient; all dark surfaces are ink-900; amber appears only on gradient surfaces.
3. No emoji icons, no JS hover handlers, no `console.log` in JSX, no fake utility classes, no duplicate CSS selectors.
4. All interactive cards are focusable elements with visible focus rings; icon-only buttons have aria-labels; text ≥12px.
5. Every route renders correctly at 1440/1024/768/390 with no horizontal scroll.
6. Zero changes to: API calls, route paths, auth flows, i18n keys, SEO components, payment logic.
