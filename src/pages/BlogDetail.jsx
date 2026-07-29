import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import BlogCard from "../components/ui/BlogCard";
import EmptyState from "../components/ui/EmptyState";
import Seo from "../seo/Seo";
import {
  blogPostSchema,
  breadcrumbSchema,
  faqSchema,
  graph,
  webPageSchema,
} from "../seo/schema";
import { SITE_URL, buildCanonical } from "../seo/config";

// Adds a stable `id` to every h2-h4 in the sanitized HTML so the auto-built
// Table of Contents can deep-link into the article body via #anchors.
const injectHeadingIds = (html) => {
  if (typeof window === "undefined" || !html) return { html, headings: [] };
  const container = document.createElement("div");
  container.innerHTML = html;
  const headings = [];
  const slugCounts = {};

  container.querySelectorAll("h2, h3, h4").forEach((el) => {
    const text = el.textContent.trim();
    if (!text) return;
    let slug = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    slugCounts[slug] = (slugCounts[slug] || 0) + 1;
    if (slugCounts[slug] > 1) slug = `${slug}-${slugCounts[slug]}`;
    el.id = slug;
    headings.push({ id: slug, text, level: Number(el.tagName[1]) });
  });

  return { html: container.innerHTML, headings };
};

const SHARE_LINKS = (url, title) => [
  { label: "Facebook", icon: "fa-brands fa-facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { label: "Twitter / X", icon: "fa-brands fa-x-twitter", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  { label: "LinkedIn", icon: "fa-brands fa-linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  { label: "WhatsApp", icon: "fa-brands fa-whatsapp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
];

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    API.get(`/blogs/${slug}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  const { html: contentWithIds, headings } = useMemo(
    () => injectHeadingIds(data?.blog?.content),
    [data?.blog?.content]
  );

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </div>
    );
  }

  if (notFound || !data?.blog) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="fa-triangle-exclamation"
          title="Article not found"
          description="This article may have been removed or unpublished."
          primaryAction={{ label: "Back to Blog", onClick: () => navigate("/blogs") }}
        />
      </div>
    );
  }

  const { blog, related, previous, next } = data;
  const path = `/blogs/${blog.slug}`;
  const canonicalUrl = blog.seo?.canonicalUrl || buildCanonical(path);
  const shareUrl = canonicalUrl;
  const dateLabel = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const updatedLabel =
    blog.updatedAt && blog.publishedAt && new Date(blog.updatedAt) - new Date(blog.publishedAt) > 86400000
      ? new Date(blog.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : null;

  const jsonLdNodes = [
    blogPostSchema(blog, path),
    webPageSchema({ path, name: blog.title, description: blog.shortDescription }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blogs" },
      { name: blog.category?.name || "Article", path: blog.category?.slug ? `/blogs?category=${blog.category._id}` : undefined },
      { name: blog.title },
    ]),
  ];
  if (blog.faqs?.length) jsonLdNodes.push(faqSchema(blog.faqs));

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // clipboard API unavailable — silently ignore, share buttons still work
    }
  };

  return (
    <div className="container py-5">
      <Seo
        title={blog.seo?.seoTitle || blog.title}
        description={blog.seo?.metaDescription || blog.shortDescription}
        path={path}
        image={blog.featuredImage || blog.seo?.ogImage}
        imageAlt={blog.altText || blog.title}
        type="article"
        keywords={blog.tags}
        jsonLd={graph(...jsonLdNodes)}
      >
        {blog.seo?.canonicalUrl && <link rel="canonical" href={blog.seo.canonicalUrl} />}
      </Seo>

      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb" style={{ fontSize: 14 }}>
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/blogs">Blog</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{blog.title}</li>
        </ol>
      </nav>

      <div className="row g-4">
        <div className="col-lg-8">
          <article>
            {blog.category?.name && (
              <Link to={`/blogs?category=${blog.category._id}`} className="cw-badge cw-badge--info mb-2 d-inline-block text-decoration-none">
                {blog.category.name}
              </Link>
            )}
            <h1 className="mb-3">{blog.title}</h1>

            <div className="d-flex flex-wrap gap-3 text-body-secondary mb-4" style={{ fontSize: 14 }}>
              {blog.author?.email && (
                <span><i className="fa-solid fa-user me-1" aria-hidden="true"></i>{blog.author.email.split("@")[0]}</span>
              )}
              {dateLabel && <span><i className="fa-regular fa-calendar me-1" aria-hidden="true"></i>{dateLabel}</span>}
              {updatedLabel && <span><i className="fa-solid fa-rotate me-1" aria-hidden="true"></i>Updated {updatedLabel}</span>}
              {blog.readingTime && <span><i className="fa-regular fa-clock me-1" aria-hidden="true"></i>{blog.readingTime} min read</span>}
            </div>

            {blog.featuredImage && (
              <figure className="mb-4">
                <img
                  src={blog.featuredImage}
                  alt={blog.altText || blog.title}
                  className="w-100 rounded"
                  style={{ maxHeight: 460, objectFit: "cover" }}
                  loading="eager"
                />
                {blog.imageCaption && (
                  <figcaption className="text-body-secondary text-center mt-2" style={{ fontSize: 13 }}>
                    {blog.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Share buttons */}
            <div className="d-flex align-items-center gap-2 flex-wrap mb-4">
              <span className="fw-semibold" style={{ fontSize: 13 }}>Share:</span>
              {SHARE_LINKS(shareUrl, blog.title).map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cw-icon-btn"
                  aria-label={`Share on ${s.label}`}
                >
                  <i className={s.icon} aria-hidden="true"></i>
                </a>
              ))}
              <button type="button" className="cw-icon-btn" aria-label="Copy link" onClick={handleCopyLink}>
                <i className={`fa-solid ${copied ? "fa-check" : "fa-link"}`} aria-hidden="true"></i>
              </button>
            </div>

            {/* Mobile TOC (collapsible) shown above content on small screens via CSS */}
            {headings.length > 0 && (
              <div className="cw-toc d-lg-none mb-4">
                <h5>Table of Contents</h5>
                <ul>
                  {headings.map((h) => (
                    <li key={h.id} style={{ marginLeft: (h.level - 2) * 12 }}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              ref={contentRef}
              className="cw-blog-content"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {blog.tags?.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-4">
                {blog.tags.map((tag) => (
                  <Link key={tag} to={`/blogs?tag=${tag}`} className="cw-badge cw-badge--neutral text-decoration-none">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {blog.faqs?.length > 0 && (
              <section className="mt-5">
                <h2>Frequently Asked Questions</h2>
                <div className="accordion mt-3" id="blogFaqAccordion">
                  {blog.faqs.map((faq, i) => (
                    <div className="accordion-item" key={i}>
                      <h3 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#faq-${i}`}
                        >
                          {faq.question}
                        </button>
                      </h3>
                      <div id={`faq-${i}`} className="accordion-collapse collapse" data-bs-parent="#blogFaqAccordion">
                        <div className="accordion-body">{faq.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA section — routes readers toward CityWala listings. Uses
                the categories/businesses the editor explicitly attached to
                this post (relatedCategoryRefs/relatedPartnerRefs) so links
                always point at real, existing slugs rather than guessed
                ones — falls back to the generic /categories browse page
                when the editor didn't attach anything specific. */}
            <div className="cw-card cw-cta-banner mt-5">
              <h3>Explore More on CityWala</h3>
              <p className="text-body-secondary">
                Discover verified local businesses, hotels, restaurants and services related to this article.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {blog.relatedCategoryRefs?.length > 0 ? (
                  blog.relatedCategoryRefs.map((cat) => (
                    <Link key={cat._id} to={`/categories/${cat.slug}`} className="nav-btn outline">
                      Explore {cat.name}
                    </Link>
                  ))
                ) : (
                  <Link to="/categories" className="nav-btn primary">Find Local Businesses</Link>
                )}
                {blog.relatedPartnerRefs?.slice(0, 2).map((partner) => (
                  <Link key={partner._id} to={`/partner/details/${partner._id}`} className="nav-btn outline">
                    View {partner.company_name || partner.name}
                  </Link>
                ))}
                <Link to="/register-business" className="nav-btn outline-accent">List Your Business</Link>
              </div>
            </div>

            {/* Prev / Next */}
            {(previous || next) && (
              <div className="row g-3 mt-4">
                {previous && (
                  <div className="col-md-6">
                    <Link to={`/blogs/${previous.slug}`} className="cw-card cw-lift d-block text-decoration-none p-3">
                      <span className="text-body-secondary d-block mb-1" style={{ fontSize: 12 }}>
                        <i className="fa-solid fa-arrow-left me-1" aria-hidden="true"></i>Previous
                      </span>
                      <span className="fw-semibold">{previous.title}</span>
                    </Link>
                  </div>
                )}
                {next && (
                  <div className="col-md-6">
                    <Link to={`/blogs/${next.slug}`} className="cw-card cw-lift d-block text-decoration-none p-3 text-md-end">
                      <span className="text-body-secondary d-block mb-1" style={{ fontSize: 12 }}>
                        Next<i className="fa-solid fa-arrow-right ms-1" aria-hidden="true"></i>
                      </span>
                      <span className="fw-semibold">{next.title}</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Comments placeholder — designed so a real commenting backend
                can be wired in later without changing this section's shape. */}
            <section className="mt-5" id="comments">
              <h3>Comments</h3>
              <EmptyState
                icon="fa-comments"
                title="Comments are coming soon"
                description="We're working on adding a comments section to this article."
              />
            </section>
          </article>
        </div>

        {/* Sidebar: desktop TOC + related */}
        <div className="col-lg-4">
          <div className="cw-sticky-sidebar">
            {headings.length > 0 && (
              <div className="cw-toc d-none d-lg-block mb-4">
                <h5>Table of Contents</h5>
                <ul>
                  {headings.map((h) => (
                    <li key={h.id} style={{ marginLeft: (h.level - 2) * 12 }}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {related?.length > 0 && (
              <div>
                <h5 className="mb-3">Related Articles</h5>
                <div className="d-flex flex-column gap-3">
                  {related.map((r) => (
                    <BlogCard blog={r} key={r._id} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
