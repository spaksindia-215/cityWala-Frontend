import { Link, useLocation } from "react-router-dom";

/**
 * Shared dashboard sidebar shell (spec 4.9/4.10) — one ink-900 recipe reused
 * by the partner and admin layouts. `items`: array of
 * { to, icon, label } | { label, icon, children: [{ to, label }] } for a
 * collapsible group (e.g. "Plans").
 */
export default function Sidebar({ logo, panelTitle, items, onLogout, logoutLabel }) {
  const location = useLocation();
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <>
      <div className="cw-sidebar__brand">
        <Link to="/">
          <img src={logo} alt="CityWala" />
        </Link>
        {panelTitle && <h6 className="cw-sidebar__panel-title">{panelTitle}</h6>}
      </div>

      <nav className="cw-sidebar__nav">
        {items.map((item, i) =>
          item.children ? (
            <div key={i} className="cw-sidebar__group">
              <a
                className="cw-sidebar__link"
                data-bs-toggle="collapse"
                href={`#sidebarGroup${i}`}
                role="button"
              >
                <span>
                  <i className={`fa-solid ${item.icon}`} aria-hidden="true"></i>
                  {item.label}
                </span>
                <i className="fa-solid fa-chevron-down cw-sidebar__chevron" aria-hidden="true"></i>
              </a>
              <div className="collapse" id={`sidebarGroup${i}`}>
                {item.children.map((child) => (
                  <Link
                    key={child.to}
                    to={child.to}
                    className={`cw-sidebar__sublink${isActive(child.to) ? " is-active" : ""}`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.to}
              to={item.to}
              className={`cw-sidebar__link${isActive(item.to) ? " is-active" : ""}`}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden="true"></i>
              {item.label}
            </Link>
          )
        )}

        <button type="button" onClick={onLogout} className="cw-sidebar__logout">
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
          {logoutLabel}
        </button>
      </nav>
    </>
  );
}
