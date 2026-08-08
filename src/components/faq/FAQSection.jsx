import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import API from "../../api/axios";
import FAQItem from "./FAQItem";
import { faqSchema, graph } from "../../seo/schema";

// Block-level tags become a space (so "</p><p>" doesn't glue two sentences
// together) while inline tags collapse to nothing (so "<b>directory</b>."
// yields "directory." and not "directory ."). Structured data has to match the
// visible answer text exactly, so this distinction matters.
const BLOCK_TAG_RE = /<\/?(p|div|br|li|ul|ol|h[1-6]|table|tr|td|th|blockquote|pre|figure|figcaption)\b[^>]*>/gi;

const ENTITIES = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

export const htmlToText = (html) =>
  String(html || "")
    .replace(BLOCK_TAG_RE, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENTITIES[m])
    .replace(/\s+/g, " ")
    .trim();

/**
 * Public, reusable FAQ block. Drop it on any page:
 *
 *   <FAQSection />                          // all published FAQs
 *   <FAQSection category={categoryId} />    // scoped to one FAQ category
 *   <FAQSection limit={5} includeSchema={false} />
 *
 * Fetches published FAQs itself (the public API never returns drafts), so a
 * host page doesn't need to know anything about the FAQ data layer. Renders
 * nothing at all when there are no published FAQs and `hideWhenEmpty` is set —
 * useful for embedding on the homepage before any content exists.
 *
 * Visual language follows the homepage `dc-*` sections (eyebrow + Poppins
 * heading, 18px white cards on the muted background) so the block reads as
 * part of the page rather than a bolted-on widget.
 */
export default function FAQSection({
  eyebrow = "FAQ",
  title = "Frequently Asked Questions",
  subtitle,
  category,
  limit,
  includeSchema = true,
  hideWhenEmpty = false,
  headingLevel: Heading = "h2",
  className = "",
}) {
  const [faqs, setFaqs] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [openId, setOpenId] = useState(null);

  const loadFaqs = useCallback(async () => {
    setStatus("loading");
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (limit) params.set("limit", String(limit));

      const query = params.toString();
      const res = await API.get(`/faqs${query ? `?${query}` : ""}`);
      setFaqs(Array.isArray(res.data?.faqs) ? res.data.faqs : []);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
    }
  }, [category, limit]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  const handleToggle = (id) => setOpenId((current) => (current === id ? null : id));

  // Structured data reflects exactly what is rendered — published FAQs only
  // (the API guarantees that), with answers reduced to their visible text.
  const schemaFaqs = useMemo(
    () =>
      faqs
        .map((faq) => ({ question: faq.question, answer: htmlToText(faq.answer) }))
        // A Question node with an empty answer is invalid structured data.
        .filter((faq) => faq.question && faq.answer),
    [faqs]
  );

  if (hideWhenEmpty && status === "ready" && faqs.length === 0) return null;

  return (
    <section className={`cw-faq ${className}`} aria-labelledby="faq-heading">
      {includeSchema && schemaFaqs.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(graph(faqSchema(schemaFaqs)))}
          </script>
        </Helmet>
      )}

      <div className="cw-faq__header">
        {eyebrow && <div className="dc-eyebrow">{eyebrow}</div>}
        <Heading id="faq-heading" className="dc-h2 cw-faq__title">
          {title}
        </Heading>
        {subtitle && <p className="cw-faq__subtitle">{subtitle}</p>}
      </div>

      {status === "loading" && (
        <div className="cw-faq__list" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="cw-faq-item cw-faq-item--skeleton" aria-hidden="true">
              <span className="cw-faq-skeleton__bar" />
            </div>
          ))}
          <p className="visually-hidden" role="status">Loading FAQs...</p>
        </div>
      )}

      {status === "error" && (
        <div className="cw-faq__state" role="alert">
          <p className="cw-faq__state-title">Unable to load FAQs.</p>
          <button type="button" className="dc-btn dc-btn--primary" onClick={loadFaqs}>
            Try Again
          </button>
        </div>
      )}

      {status === "ready" && faqs.length === 0 && (
        <div className="cw-faq__state">
          <p className="cw-faq__state-text">
            No frequently asked questions are available yet.
          </p>
        </div>
      )}

      {status === "ready" && faqs.length > 0 && (
        <div className="cw-faq__list">
          {faqs.map((faq) => (
            <FAQItem
              key={faq._id}
              faq={faq}
              isOpen={openId === faq._id}
              onToggle={() => handleToggle(faq._id)}
              headingLevel={Heading === "h2" ? "h3" : "h4"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
