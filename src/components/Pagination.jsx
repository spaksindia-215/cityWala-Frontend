import React from "react";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  limit,
  setLimit
}) {
  // Pages with "..."
  const getPages = () => {
    const pages = [];
    const delta = 2;

    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  // Fixed limits (DON'T depend on total)
  const limits = [10, 25, 50, 100];

  return (
    <div className="cw-pagination d-flex my-5 justify-content-between align-items-center flex-wrap gap-3">

      {/* LIMIT DROPDOWN */}
      <label className="cw-pagination__limit d-flex align-items-center gap-2 mb-0">
        <span>Rows per page</span>
        <select
          className="form-select form-select-sm w-auto"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            onPageChange(1); // reset page
          }}
        >
          {limits.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>

      {/* PAGINATION */}
      <div className="d-flex align-items-center gap-2">

        {/* Prev */}
        <button
          type="button"
          className="cw-page-btn"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>

        {/* Pages */}
        {getPages().map((p, i) => (
          <button
            key={i}
            type="button"
            className={`cw-page-btn${p === page ? " is-active" : ""}${p === "..." ? " is-ellipsis" : ""}`}
            disabled={p === "..."}
            aria-current={p === page ? "page" : undefined}
            aria-label={typeof p === "number" ? `Page ${p}` : undefined}
            onClick={() => typeof p === "number" && onPageChange(p)}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          type="button"
          className="cw-page-btn"
          aria-label="Next page"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>

      </div>

    </div>
  );
}