/**
 * Shared section heading (spec 4.3/4.9): overline + title + subtitle + action slot.
 */
export default function SectionHeader({ overline, title, subtitle, action, as: Tag = "h2" }) {
  return (
    <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
      <div>
        {overline && <span className="cw-overline d-block mb-1">{overline}</span>}
        <Tag className="h5 mb-0">{title}</Tag>
        {subtitle && <p className="text-body-secondary small mb-0 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
