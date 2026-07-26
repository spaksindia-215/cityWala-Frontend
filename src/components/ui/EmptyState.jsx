import { Link } from "react-router-dom";

/**
 * Shared empty-state block (spec 2.23). Pure presentational — pass copy via
 * props, actions as { label, to } (internal Link) or { label, href } (external).
 */
export default function EmptyState({
  icon = "fa-inbox",
  title,
  description,
  primaryAction,
  secondaryAction,
}) {
  const renderAction = (action, variant) => {
    if (!action) return null;
    const className = `nav-btn ${variant}`;
    if (action.to) {
      return (
        <Link to={action.to} className={className}>
          {action.label}
        </Link>
      );
    }
    if (action.href) {
      return (
        <a href={action.href} className={className} target={action.target} rel={action.target ? "noopener noreferrer" : undefined}>
          {action.label}
        </a>
      );
    }
    return (
      <button type="button" className={className} onClick={action.onClick}>
        {action.label}
      </button>
    );
  };

  return (
    <div className="cw-empty-state">
      <span className="cw-empty-state__icon">
        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
      </span>
      {title && <h4 className="cw-empty-state__title">{title}</h4>}
      {description && <p className="cw-empty-state__desc">{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
          {renderAction(primaryAction, "primary")}
          {renderAction(secondaryAction, "outline")}
        </div>
      )}
    </div>
  );
}
