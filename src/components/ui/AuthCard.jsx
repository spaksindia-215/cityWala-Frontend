/**
 * Shared auth screen shell (spec 4.8). Split layout ≥lg: gradient brand panel
 * (left) + white form column (right). Below lg the gradient becomes a slim
 * top band. Pure presentational — pages own all form state/handlers.
 *
 * `variant`: "default" (blue/orange brand gradient) | "admin" (dark ink panel).
 */
export default function AuthCard({
  variant = "default",
  eyebrow,
  title,
  subtitle,
  bullets = [],
  children,
}) {
  return (
    <div className="cw-auth-page">
    <div className={`cw-auth-shell${variant === "admin" ? " cw-auth-shell--admin" : ""}`}>
      <div className="cw-auth-shell__panel">
        {eyebrow && <span className="dc-hero__badge">{eyebrow}</span>}
        {title && <h1 className="dc-auth__title">{title}</h1>}
        {subtitle && <p className="dc-auth__text">{subtitle}</p>}
        {bullets.length > 0 && (
          <ul className="list-unstyled d-none d-lg-flex flex-column gap-3 mb-0">
            {bullets.map((b, i) => (
              <li key={i} className="dc-auth__perk">
                <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="cw-auth-shell__form">
        <div className="cw-auth-shell__form-inner">
          {children}
        </div>
      </div>
    </div>
    </div>
  );
}
