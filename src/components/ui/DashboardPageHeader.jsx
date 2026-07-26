/**
 * Shared dashboard page title row (spec 4.9). h1 + optional action slot.
 */
export default function DashboardPageHeader({ title, action }) {
  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
      <h1 className="h4 mb-0">{title}</h1>
      {action}
    </div>
  );
}
