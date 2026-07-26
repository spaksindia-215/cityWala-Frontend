/**
 * Slim gradient hero band for interior pages (spec 4.11): breadcrumb slot +
 * overline + display h1 + optional subtitle. Photo variant lives on Home.jsx
 * directly (cw-hero-photo markup) since it needs the search-card slot.
 */
export default function HeroBanner({ breadcrumbs, eyebrow, title, subtitle }) {
  return (
    <section className="cw-page-header">
      <div className="container">
        {breadcrumbs}
        {eyebrow && (
          <span className="cw-overline d-block mb-2" style={{ color: "rgba(255,255,255,.85)" }}>
            {eyebrow}
          </span>
        )}
        <h1 className="cw-display cw-display--section text-white mb-0">{title}</h1>
        {subtitle && <p className="cw-page-header__desc mt-3 mb-0">{subtitle}</p>}
      </div>
    </section>
  );
}
