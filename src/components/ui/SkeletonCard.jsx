/**
 * Shimmering placeholder matching CategoryCard/BusinessCard geometry (2.24).
 * `variant`: "category" | "business".
 */
export default function SkeletonCard({ variant = "category" }) {
  if (variant === "business") {
    return (
      <div className="cw-card cw-skeleton-card cw-skeleton-card--business">
        <div className="cw-skeleton cw-skeleton--avatar" />
        <div className="flex-grow-1">
          <div className="cw-skeleton cw-skeleton--line" style={{ width: "60%" }} />
          <div className="cw-skeleton cw-skeleton--line" style={{ width: "40%" }} />
          <div className="cw-skeleton cw-skeleton--line" style={{ width: "80%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="cw-card cw-skeleton-card cw-skeleton-card--category text-center">
      <div className="cw-skeleton cw-skeleton--circle mx-auto" />
      <div className="cw-skeleton cw-skeleton--line mx-auto" style={{ width: "70%" }} />
      <div className="cw-skeleton cw-skeleton--line mx-auto" style={{ width: "50%" }} />
    </div>
  );
}
