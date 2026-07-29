import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, DEFAULT_DESCRIPTION, buildCanonical } from "./config";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const organizationSchema = () => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: DEFAULT_OG_IMAGE,
  description:
    "CityWala is a business listing website and online marketplace in India connecting businesses, MSMEs, exporters, importers, wholesalers, retailers, and customers.",
  sameAs: [
    "https://www.facebook.com/profile",
    "https://www.instagram.com/citywala1959/",
    "https://x.com/MyCitywala",
  ],
});

export const websiteSchema = () => ({
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

export const webPageSchema = ({ path, name, description }) => ({
  "@type": "WebPage",
  "@id": `${buildCanonical(path)}#webpage`,
  url: buildCanonical(path),
  name: name || SITE_NAME,
  description: description || DEFAULT_DESCRIPTION,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": ORG_ID },
  inLanguage: "en-IN",
});

/**
 * @param crumbs - array of { name, path } in order from Home to current page.
 * `path` omitted/undefined on the last crumb is fine (current page needs no link).
 */
export const breadcrumbSchema = (crumbs = []) => ({
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    ...(crumb.path ? { item: buildCanonical(crumb.path) } : {}),
  })),
});

export const categorySchema = ({ path, name, description }) => ({
  "@type": "CollectionPage",
  "@id": `${buildCanonical(path)}#category`,
  url: buildCanonical(path),
  name,
  description: description || `Browse verified ${name} businesses on CityWala.`,
  isPartOf: { "@id": WEBSITE_ID },
});

/**
 * LocalBusiness schema for a partner/business detail page. Only includes
 * fields actually present on the partner record — schema.org validators flag
 * empty-string/null properties, so we build up the object conditionally.
 */
export const localBusinessSchema = (partner, path) => {
  const schema = {
    "@type": "LocalBusiness",
    "@id": `${buildCanonical(path)}#business`,
    name: partner.company_name || partner.name,
    url: buildCanonical(path),
  };

  if (partner.company_short_desc) schema.description = partner.company_short_desc;
  if (partner.company_logo) schema.image = partner.company_logo;
  if (partner.mobile) schema.telephone = `${partner.country_code || "+91"}${partner.mobile}`;
  if (partner.email) schema.email = partner.email;
  if (partner.company_url) {
    schema.sameAs = [
      partner.company_url.startsWith("http")
        ? partner.company_url
        : `https://${partner.company_url}`,
    ];
  }
  if (partner.address || partner.postal_code) {
    schema.address = {
      "@type": "PostalAddress",
      ...(partner.address ? { streetAddress: partner.address } : {}),
      ...(partner.postal_code ? { postalCode: partner.postal_code } : {}),
      addressCountry: "IN",
    };
  }

  return schema;
};

export const faqSchema = (faqs = []) => ({
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

/**
 * Article/BlogPosting schema for a blog detail page. `blog` is the API blog
 * object (title, shortDescription, featuredImage, author, category,
 * publishedAt/createdAt, updatedAt, seo.schemaType).
 */
export const blogPostSchema = (blog, path) => {
  const schema = {
    "@type": blog?.seo?.schemaType || "BlogPosting",
    "@id": `${buildCanonical(path)}#article`,
    headline: blog.seo?.seoTitle || blog.title,
    description: blog.seo?.metaDescription || blog.shortDescription || DEFAULT_DESCRIPTION,
    url: buildCanonical(path),
    mainEntityOfPage: { "@id": `${buildCanonical(path)}#webpage` },
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt,
    publisher: { "@id": ORG_ID },
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };

  if (blog.featuredImage) schema.image = [blog.featuredImage];
  if (blog.category?.name) schema.articleSection = blog.category.name;
  if (blog.tags?.length) schema.keywords = blog.tags.join(", ");

  return schema;
};

/** CollectionPage schema for the /blogs listing page. */
export const blogListSchema = ({ path, name = "Blog", description } = {}) => ({
  "@type": "CollectionPage",
  "@id": `${buildCanonical(path)}#bloglist`,
  url: buildCanonical(path),
  name,
  description: description || "Guides on local businesses, travel, hotels, restaurants and more from CityWala.",
  isPartOf: { "@id": WEBSITE_ID },
});

/** Wraps one or more schema nodes in the shared @graph/@context envelope. */
export const graph = (...nodes) => ({
  "@context": "https://schema.org",
  "@graph": nodes.flat().filter(Boolean),
});
