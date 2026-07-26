import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { breadcrumbSchema, graph } from "../seo/schema";

/**
 * Renders a visible breadcrumb trail and emits matching BreadcrumbList JSON-LD.
 * `items`: array of { name, path? } from Home to current page; omit `path`
 * on the last (current) item since it shouldn't be a link.
 * Pass `onDark` when the breadcrumb sits over a gradient/photo hero.
 */
export default function Breadcrumbs({ items = [], onDark = false }) {
  if (!items.length) return null;

  const withHome = [{ name: "Home", path: "/" }, ...items];

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(graph(breadcrumbSchema(withHome)))}
        </script>
      </Helmet>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className={`breadcrumb cw-breadcrumbs mb-0 flex-wrap${onDark ? " cw-breadcrumbs--on-dark" : ""}`}>
          {withHome.map((crumb, i) => {
            const isLast = i === withHome.length - 1;
            return (
              <li
                key={`${crumb.name}-${i}`}
                className={`breadcrumb-item${isLast ? " active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {isLast || !crumb.path ? (
                  crumb.name
                ) : (
                  <Link to={crumb.path}>{crumb.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
