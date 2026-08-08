/**
 * A single accordion row. Controlled by the parent so only one FAQ needs to be
 * open at a time (and so the parent can close everything on search).
 *
 * Accessibility: the trigger is a real <button> carrying aria-expanded and
 * aria-controls; the panel is labelled by the trigger via aria-labelledby.
 *
 * The panel stays mounted so the grid-template-rows transition can animate.
 * `hidden` would kill that animation, so collapsed panels are taken out of the
 * a11y tree with inert + aria-hidden instead — which also stops keyboard focus
 * from landing on links inside a closed answer.
 */
export default function FAQItem({ faq, isOpen, onToggle, headingLevel: Heading = "h3" }) {
  const panelId = `faq-panel-${faq._id}`;
  const buttonId = `faq-trigger-${faq._id}`;

  return (
    <div className={`cw-faq-item ${isOpen ? "is-open" : ""}`}>
      <Heading className="cw-faq-item__heading">
        <button
          type="button"
          id={buttonId}
          className="cw-faq-item__trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="cw-faq-item__question">{faq.question}</span>
          <span className="cw-faq-item__icon" aria-hidden="true">
            <i className="fa-solid fa-chevron-down"></i>
          </span>
        </button>
      </Heading>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="cw-faq-item__panel"
        aria-hidden={!isOpen}
        // `inert` is a boolean attribute: React 18 doesn't know it, so it must
        // be passed as "" / undefined rather than true / false.
        inert={isOpen ? undefined : ""}
      >
        <div className="cw-faq-item__panel-inner">
          {/* Answers are stored as sanitized HTML server-side (utils/sanitizeHtml.js),
              which is what makes this dangerouslySetInnerHTML safe — the same
              contract BlogDetail's cw-blog-content relies on. */}
          <div
            className="cw-faq-item__answer"
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </div>
      </div>
    </div>
  );
}
