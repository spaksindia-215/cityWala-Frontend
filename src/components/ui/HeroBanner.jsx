/**
 * Slim gradient hero band for interior pages (spec 4.11): display h1 +
 * optional subtitle. Photo variant lives on Home.jsx directly
 * (cw-hero-photo markup) since it needs the search-card slot.
 *
 * Interior headers show the page title only — the `breadcrumbs` and `eyebrow`
 * props are accepted but intentionally not rendered, so existing callers keep
 * working without edits.
 */
export default function HeroBanner({ title, subtitle }) {
  return (
    <section className="cw-page-header">
      <div className="container">
        <h1 className="cw-display cw-display--section text-white mb-0">{title}</h1>
        {subtitle && <p className="cw-page-header__desc mt-3 mb-0">{subtitle}</p>}
      </div>
    </section>
  );
}
