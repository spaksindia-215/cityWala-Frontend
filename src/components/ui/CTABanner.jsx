/**
 * Master-gradient call-to-action band (spec 4.3/2.8). Two action slots:
 * primary (on-dark) and secondary (outline-on-dark).
 */
export default function CTABanner({ title, subtitle, primaryAction, secondaryAction }) {
  return (
    <section className="cw-section cw-cta-banner" style={{ paddingTop: "var(--cw-s6)", paddingBottom: "var(--cw-s6)" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9 text-center">
            <h2 className="cw-display cw-display--cta text-white mb-3">{title}</h2>
            {subtitle && (
              <p className="text-white mb-4" style={{ opacity: .85, fontSize: 16 }}>{subtitle}</p>
            )}

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">
              {primaryAction && (
                <a href={primaryAction.href} target={primaryAction.target} rel={primaryAction.target ? "noopener noreferrer" : undefined} className="nav-btn cw-btn-on-dark cta-btn w-100 w-sm-auto">
                  {primaryAction.icon && <i className={`fa-solid ${primaryAction.icon}`} aria-hidden="true"></i>}
                  {primaryAction.label}
                </a>
              )}
              {secondaryAction && (
                <a href={secondaryAction.href} target={secondaryAction.target} rel={secondaryAction.target ? "noopener noreferrer" : undefined} className="nav-btn cw-btn-outline-on-dark cta-btn w-100 w-sm-auto">
                  {secondaryAction.icon && <i className={`fa-solid ${secondaryAction.icon}`} aria-hidden="true"></i>}
                  {secondaryAction.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
