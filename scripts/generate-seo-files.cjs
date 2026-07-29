// Generates public/sitemap.xml and public/robots.txt at build time.
//
// This is a Vite SPA (no server-side rendering), so sitemap.xml can't be a
// dynamic route the way it would be in Next.js — instead we fetch the live
// category/business data from the backend once per build and write static
// files into public/, which Vite then copies into dist/ verbatim. Re-running
// `npm run build` picks up newly added categories/partners automatically.
//
// Network failures (backend unreachable at build time) must not break the
// build: we fall back to the static top-level pages only and log a warning,
// so a CI/deploy build never hard-fails just because the API was briefly down.

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const SITE_URL = "https://www.citywala.com";
const API_BASE =
  process.env.VITE_API_URL?.replace(/\/+$/, "").replace(/\/api$/, "") ||
  "http://localhost:5000";
const API_URL = `${API_BASE}/api`;

const STATIC_PAGES = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/about-us", changefreq: "monthly", priority: "0.8" },
  { loc: "/contact-us", changefreq: "monthly", priority: "0.8" },
  { loc: "/plan", changefreq: "monthly", priority: "0.7" },
  { loc: "/privacy-policy", changefreq: "yearly", priority: "0.5" },
  { loc: "/terms-and-conditions", changefreq: "yearly", priority: "0.5" },
];

const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const urlEntry = ({ loc, changefreq, priority, lastmod }) => `<url>
<loc>${xmlEscape(`${SITE_URL}${loc}`)}</loc>
${lastmod ? `<lastmod>${lastmod}</lastmod>\n` : ""}<changefreq>${changefreq}</changefreq>
<priority>${priority}</priority>
</url>`;

async function fetchCategories() {
  try {
    const res = await axios.get(`${API_URL}/categories`, { timeout: 10000 });
    const categories = res.data?.categories || res.data || [];
    return Array.isArray(categories) ? categories : [];
  } catch (err) {
    console.warn(
      `[generate-seo-files] Could not fetch categories from ${API_URL}/categories (${err.message}). Sitemap will only include static pages.`
    );
    return [];
  }
}

async function fetchPartners() {
  try {
    const res = await axios.get(`${API_URL}/partner/sitemap/list`, { timeout: 15000 });
    return res.data?.partners || [];
  } catch (err) {
    console.warn(
      `[generate-seo-files] Could not fetch partners from ${API_URL}/partner/sitemap/list (${err.message}). Sitemap will not include business detail pages.`
    );
    return [];
  }
}

async function fetchBlogs() {
  try {
    const res = await axios.get(`${API_URL}/blogs/sitemap/list`, { timeout: 15000 });
    return res.data?.blogs || [];
  } catch (err) {
    console.warn(
      `[generate-seo-files] Could not fetch blogs from ${API_URL}/blogs/sitemap/list (${err.message}). Sitemap will not include blog pages.`
    );
    return [];
  }
}

/** Builds the full slug path (parent/child/grandchild) for every category. */
function buildCategoryPaths(categories) {
  const byId = new Map(categories.map((c) => [String(c._id), c]));
  const pathFor = (cat, seen = new Set()) => {
    const id = String(cat._id);
    if (seen.has(id)) return [cat.slug]; // cycle guard
    seen.add(id);
    const parentId = cat.parentId ? String(cat.parentId?._id || cat.parentId) : null;
    const parent = parentId ? byId.get(parentId) : null;
    if (!parent) return [cat.slug];
    return [...pathFor(parent, seen), cat.slug];
  };
  return categories.map((cat) => ({
    ...cat,
    fullPath: pathFor(cat).filter(Boolean).join("/"),
    isLeaf: !categories.some((c) => String(c.parentId?._id || c.parentId || "") === String(cat._id)),
  }));
}

async function generateSitemap() {
  const [categories, partners, blogs] = await Promise.all([
    fetchCategories(),
    fetchPartners(),
    fetchBlogs(),
  ]);
  const categoriesWithPaths = buildCategoryPaths(categories);

  const urls = [
    ...STATIC_PAGES.map(urlEntry),
    urlEntry({ loc: "/blogs", changefreq: "daily", priority: "0.9" }),
    ...categoriesWithPaths.map((cat) =>
      urlEntry({
        loc: `/categories/${cat.fullPath}`,
        changefreq: "weekly",
        // Top-level categories are higher priority than deep subcategories,
        // matching the PDF's 0.9 priority for the (top-level) category list.
        priority: cat.parentId ? "0.7" : "0.9",
        lastmod: cat.updatedAt ? new Date(cat.updatedAt).toISOString().split("T")[0] : undefined,
      })
    ),
    ...partners.map((partner) =>
      urlEntry({
        loc: `/partner/details/${partner.id}`,
        changefreq: "weekly",
        priority: "0.6",
        lastmod: partner.updatedAt
          ? new Date(partner.updatedAt).toISOString().split("T")[0]
          : undefined,
      })
    ),
    ...blogs.map((blog) =>
      urlEntry({
        loc: `/blogs/${blog.slug}`,
        changefreq: "weekly",
        priority: "0.7",
        lastmod: blog.updatedAt ? new Date(blog.updatedAt).toISOString().split("T")[0] : undefined,
      })
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  const outPath = path.resolve(__dirname, "../public/sitemap.xml");
  await fs.writeFile(outPath, xml, "utf8");
  console.log(
    `[generate-seo-files] Wrote sitemap.xml with ${STATIC_PAGES.length} static pages, ${categoriesWithPaths.length} categories, ${partners.length} business pages, ${blogs.length} blog pages.`
  );
}

async function generateRobotsTxt() {
  const robots = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /login
Disallow: /partner/login
Disallow: /partner/dashboard
Disallow: /partner/add-profile
Disallow: /partner/plan
Disallow: /partner/my-plan
Disallow: /partner/payment-history
Disallow: /account/dashboard
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-otp
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  const outPath = path.resolve(__dirname, "../public/robots.txt");
  await fs.writeFile(outPath, robots, "utf8");
  console.log("[generate-seo-files] Wrote robots.txt");
}

async function main() {
  await Promise.all([generateSitemap(), generateRobotsTxt()]);
}

main().catch((err) => {
  console.error("[generate-seo-files] Unexpected failure:", err);
  // Never fail the build over sitemap generation — a missing/stale sitemap
  // is far less damaging than a blocked deploy.
  process.exit(0);
});
