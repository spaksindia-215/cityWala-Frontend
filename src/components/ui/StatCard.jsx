/**
 * Shared dashboard stat tile (spec 4.9/4.10). Replaces every bespoke
 * gradient-tile / plain-card variant across user, partner, and admin
 * dashboards with one white-card + icon-chip recipe.
 */
export default function StatCard({ icon, tint = "blue", value, label }) {
  return (
    <div className="cw-card cw-dash-stat">
      <span className={`cw-dash-stat__icon cw-dash-stat__icon--${tint}`}>
        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
      </span>
      <div>
        <div className="cw-dash-stat__value">{value}</div>
        <div className="cw-dash-stat__label">{label}</div>
      </div>
    </div>
  );
}
