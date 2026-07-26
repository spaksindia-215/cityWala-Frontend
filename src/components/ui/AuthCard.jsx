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
    <div className={`cw-auth-shell${variant === "admin" ? " cw-auth-shell--admin" : ""}`}>
      <div className="cw-auth-shell__panel">
        {eyebrow && <span className="cw-overline d-block mb-3" style={{ color: "rgba(255,255,255,.85)" }}>{eyebrow}</span>}
        {title && <h1 className="cw-display cw-display--section text-white mb-3">{title}</h1>}
        {subtitle && <p className="mb-4" style={{ color: "rgba(255,255,255,.85)", fontSize: 15, lineHeight: 1.7 }}>{subtitle}</p>}
        {bullets.length > 0 && (
          <ul className="list-unstyled d-none d-lg-block">
            {bullets.map((b, i) => (
              <li key={i} className="d-flex align-items-center gap-2 mb-2" style={{ color: "rgba(255,255,255,.85)", fontSize: 14 }}>
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
  );
}
