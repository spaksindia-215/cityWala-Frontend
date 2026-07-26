// Prerenders a bounded set of high-value crawlable routes (static pages +
// category pages) to static HTML snapshots after the SPA build, so
// non-JS crawlers and social-link-preview scrapers (which don't execute
// client-side JS) see real per-page <title>/meta/OG/JSON-LD instead of the
// generic index.html shell.
//
// Deliberately scoped to static + category pages only (not the full business
// catalog) to keep build time/size bounded — business detail pages remain
// client-rendered only; Google's own crawler still indexes them via JS
// rendering, but link previews on those specific URLs stay generic until a
// real SSR migration.
//
// How it works: builds the <head> tags directly as strings — title, meta,
// OG, Twitter, JSON-LD — mirroring exactly what src/seo/DefaultSeo.jsx +
// src/seo/Seo.jsx render client-side for each route, then splices them into
// a copy of the built dist/index.html. No headless browser involved: an
// earlier Puppeteer-based version of this script reliably crashed/hung the
// production build on memory-constrained hosts (Chromium needs far more
// RAM/shared-memory than this box's build container provides), and a kernel
// OOM-kill takes the whole build down with it, bypassing any in-script
// error handling. Pure string templating can't hang or get OOM-killed the
// same way. Trade-off: only <head> is prerendered, not the React-rendered
// body — crawlers get correct metadata, real users get the normal SPA via
// hydration same as before.
//
// NOTE: the constants below intentionally duplicate src/seo/config.js and
// src/seo/schema.js rather than importing them, because those files read
// `import.meta.env`, which only exists under Vite's build-time replacement,
// not under a plain Node `require`/`import` of the source file. Keep this
// file in sync by hand if config.js or schema.js change.

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const DIST_DIR = path.resolve(__dirname, "../dist");
const API_BASE =
  process.env.VITE_API_URL?.replace(/\/+$/, "").replace(/\/api$/, "") ||
  "http://localhost:5000";
const API_URL = `${API_BASE}/api`;

// ---- mirrors src/seo/config.js ----
const SITE_URL = "https://www.citywala.com";
const SITE_NAME = "CityWala";
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/headerLogo-BDJ5SL8-.png`;
const DEFAULT_LOCALE = "en_IN";
const TWITTER_CARD = "summary_large_image";
const DEFAULT_TITLE =
  "Business Listing Website in India | Business Directory & Online Marketplace | CityWala";
const DEFAULT_DESCRIPTION =
  "CityWala is a leading business listing website and online marketplace in India. Discover verified businesses, B2B companies, MSMEs, exporters, importers, wholesalers, and list your business for free.";
const DEFAULT_KEYWORDS = [
  "Business Listing Website",
  "online marketplace in india",
  "india business listing website",
  "b2b business to business",
  "business listing sites for india",
  "wholesale websites india",
  "market in india today",
  "Business Directory India",
  "business directory website in india",
  "exporter importer directory",
  "free business listings in india",
  "India Business Directory",
  "micro small enterprises",
  "Small Business Directory",
  "exporters business directory",
];
const GSC_VERIFICATION =
  process.env.VITE_GSC_VERIFICATION || "google02a48cab93c28462";
const CATEGORY_LABELS = {
  "abroad-education--jobs": "Abroad Education & Jobs",
  agriculture: "Agriculture",
  "daily-necessity": "Daily Necessity",
  education: "Education",
  "electrical--electronics": "Electrical & Electronics",
  "financial--accounting": "Financial & Accounting",
  food: "Food",
  "furniture-business-and-services": "Furniture Business & Services",
  health: "Health",
  industries: "Industries",
  "insurance-agents--companies": "Insurance Agents & Companies",
  "it-web-developer--digital-marketing": "IT, Web Developer & Digital Marketing",
  "jewellery--clothes": "Jewellery & Clothes",
  "job-placement--vacancies": "Job Placement & Vacancies",
  "legal-document-writer": "Legal Document Writer",
  matrimonial: "Matrimonial",
  "pandit--astrologer": "Pandit & Astrologer",
  "real-estate": "Real Estate",
  "tour-and-travels": "Tour & Travels",
  transporters: "Transporters",
  "wedding-and-events": "Wedding & Events",
};
const humanizeSlug = (slug = "") =>
  slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
const buildCanonical = (routePath = "/") => {
  const cleanPath =
    routePath === "/" ? "/" : `/${routePath.replace(/^\/+|\/+$/g, "")}`;
  return `${SITE_URL}${cleanPath}`;
};

// ---- mirrors src/seo/schema.js ----
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const organizationSchema = () => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: DEFAULT_OG_IMAGE,
  description:
    "CityWala is a business listing website and online marketplace in India connecting businesses, MSMEs, exporters, importers, wholesalers, retailers, and customers.",
  sameAs: [],
});
const websiteSchema = () => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  publisher: { "@id": ORG_ID },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  inLanguage: "en-IN",
});
const webPageSchema = ({ path: p, name, description }) => ({
  "@type": "WebPage",
  "@id": `${buildCanonical(p)}#webpage`,
  url: buildCanonical(p),
  name: name || SITE_NAME,
  description: description || DEFAULT_DESCRIPTION,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": ORG_ID },
  inLanguage: "en-IN",
});
const categorySchema = ({ path: p, name, description }) => ({
  "@type": "CollectionPage",
  "@id": `${buildCanonical(p)}#category`,
  url: buildCanonical(p),
  name,
  description: description || `Browse verified ${name} businesses on CityWala.`,
  isPartOf: { "@id": WEBSITE_ID },
});
const graph = (...nodes) => ({
  "@context": "https://schema.org",
  "@graph": nodes.flat().filter(Boolean),
});

// ---- static, per-page SEO values (mirror each page's <Seo> call) ----
const STATIC_PAGES = [
  {
    path: "/",
    fullTitle: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    jsonLdNodes: [webPageSchema({ path: "/", name: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION })],
  },
  {
    path: "/about-us",
    title: "About Us",
    description:
      "Learn about CityWala's mission to connect verified businesses, MSMEs, exporters, importers, and wholesalers across India through our business listing platform and online marketplace.",
  },
  {
    path: "/contact-us",
    title: "Contact Us",
    description:
      "Get in touch with CityWala for support, partnership queries, or business listing assistance. Reach our team via phone, email, or the contact form.",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy",
    description:
      "Read CityWala's Privacy Policy to understand how we collect, use, and protect your personal and business information across our platform.",
  },
  {
    path: "/terms-and-conditions",
    title: "Terms & Conditions",
    description:
      "Read CityWala's Terms & Conditions governing the use of our business listing platform, marketplace services, and partner registrations.",
  },
].map((page) => ({
  ...page,
  jsonLdNodes:
    page.jsonLdNodes ||
    [webPageSchema({ path: page.path, name: page.title, description: page.description })],
}));

async function fetchCategoryPages() {
  try {
    const res = await axios.get(`${API_URL}/categories`, { timeout: 10000 });
    const categories = res.data?.categories || res.data || [];
    if (!Array.isArray(categories) || categories.length === 0) return [];

    const byId = new Map(categories.map((c) => [String(c._id), c]));
    const slugChainFor = (cat, seen = new Set()) => {
      const id = String(cat._id);
      if (seen.has(id)) return [cat.slug];
      seen.add(id);
      const parentId = cat.parentId ? String(cat.parentId?._id || cat.parentId) : null;
      const parent = parentId ? byId.get(parentId) : null;
      if (!parent) return [cat.slug];
      return [...slugChainFor(parent, seen), cat.slug];
    };

    return categories
      .filter((c) => c.slug)
      .map((cat) => {
        const categoryPath = `/categories/${slugChainFor(cat).filter(Boolean).join("/")}`;
        const displayName = cat.name || CATEGORY_LABELS[cat.slug] || humanizeSlug(cat.slug);
        const description =
          cat.description ||
          `Browse verified ${displayName} businesses, service providers, and partners listed on CityWala.`;
        return {
          path: categoryPath,
          title: displayName,
          description,
          jsonLdNodes: [
            categorySchema({ path: categoryPath, name: displayName, description }),
            webPageSchema({ path: categoryPath, name: displayName, description }),
          ],
        };
      });
  } catch (err) {
    console.warn(
      `[prerender] Could not fetch categories (${err.message}). Skipping category page prerendering.`
    );
    return [];
  }
}

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function buildHeadTags({ title, fullTitle, description, path: routePath, jsonLdNodes }) {
  const canonical = buildCanonical(routePath);
  const resolvedTitle = fullTitle || (title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE);
  const robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const imageAlt = `${SITE_NAME} - Business Listing Website in India`;

  const tags = [
    `<title>${escapeHtml(resolvedTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="keywords" content="${escapeHtml(DEFAULT_KEYWORDS.join(", "))}" />`,
    `<meta name="author" content="${SITE_NAME}" />`,
    `<meta name="creator" content="${SITE_NAME}" />`,
    `<meta name="publisher" content="${SITE_NAME}" />`,
    `<meta name="application-name" content="${SITE_NAME}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta name="google-site-verification" content="${GSC_VERIFICATION}" />`,
    `<meta name="theme-color" content="#1075be" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(resolvedTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />`,
    `<meta property="og:image:secure_url" content="${DEFAULT_OG_IMAGE}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`,
    `<meta property="og:locale" content="${DEFAULT_LOCALE}" />`,
    `<meta name="twitter:card" content="${TWITTER_CARD}" />`,
    `<meta name="twitter:title" content="${escapeHtml(resolvedTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`,
    // DefaultSeo's site-wide graph (Organization + WebSite) is rendered on
    // every route alongside the page's own graph — react-helmet-async
    // doesn't dedupe <script> tags, so both appear in the real client-side
    // merge and we reproduce that here.
    `<script type="application/ld+json">${JSON.stringify(graph(organizationSchema(), websiteSchema()))}</script>`,
    `<script type="application/ld+json">${JSON.stringify(graph(...jsonLdNodes))}</script>`,
  ];

  return tags.join("\n    ");
}

async function writeSnapshot(baseTemplate, page) {
  const routePath = page.path === "/" ? "/" : page.path.replace(/\/+$/, "");
  const outDir = routePath === "/" ? DIST_DIR : path.join(DIST_DIR, routePath);
  const headTags = buildHeadTags(page);
  const html = baseTemplate
    .replace(/<title>.*?<\/title>\s*/i, "")
    .replace("</head>", `${headTags}\n  </head>`);

  await fs.ensureDir(outDir);
  await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
}

async function main() {
  if (!(await fs.pathExists(DIST_DIR))) {
    console.warn("[prerender] dist/ not found — run `vite build` first. Skipping.");
    return;
  }

  const baseTemplate = await fs.readFile(path.join(DIST_DIR, "index.html"), "utf8");
  const categoryPages = await fetchCategoryPages();
  const pages = [...STATIC_PAGES, ...categoryPages];

  let succeeded = 0;
  for (const page of pages) {
    try {
      await writeSnapshot(baseTemplate, page);
      succeeded++;
    } catch (err) {
      console.warn(`[prerender] Failed to prerender ${page.path}: ${err.message}`);
    }
  }

  console.log(`[prerender] Prerendered ${succeeded}/${pages.length} routes.`);
}

main().catch((err) => {
  console.error("[prerender] Unexpected failure:", err);
  // A missing prerender snapshot degrades gracefully to the normal SPA
  // shell — never worth failing the whole deploy over.
  process.exit(0);
});
