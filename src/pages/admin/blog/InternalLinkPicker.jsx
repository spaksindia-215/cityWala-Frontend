import { useEffect, useMemo, useState } from "react";
import API from "../../../api/axios";

/**
 * Lets an editor insert a link to a Business Listing or Category without
 * ever typing/pasting a URL. Resolves the resource path itself and hands the
 * finished { url, label } back to the caller, which inserts it into the
 * CKEditor selection (see AdminBlogForm's `handleInsertLink`).
 *
 * Cities are intentionally not offered here: the frontend has no standalone
 * public city-detail route (browsing is category-first via
 * /categories/:level1/:level2/:level3), so a "city" link would have nowhere
 * real to point. relatedCityRefs (used for the CTA section, not inline
 * links) still lets editors tag a blog with a City document directly.
 */
export default function InternalLinkPicker({ show, onClose, onInsert }) {
  const [type, setType] = useState("category");
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (type === "category") {
          const res = await API.get("/categories");
          if (!cancelled) {
            setOptions(
              (res.data.categories || []).map((c) => ({
                id: c._id,
                label: c.name,
                url: `/categories/${c.slug}`,
              }))
            );
          }
        } else if (type === "business") {
          const res = await API.get("/partner/all?limit=100");
          if (!cancelled) {
            setOptions(
              (res.data.partners || []).map((p) => ({
                id: p._id,
                label: p.company_name || p.name,
                url: `/partner/details/${p._id}`,
              }))
            );
          }
        }
      } catch (err) {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [show, type]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label?.toLowerCase().includes(q));
  }, [options, query]);

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(15,23,42,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content cw-card">
          <div className="modal-header">
            <h5 className="modal-title">Insert Internal Link</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="d-flex gap-2 mb-3">
              {["category", "business"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`nav-btn ${type === t ? "primary" : "outline"}`}
                  style={{ height: 36, fontSize: 13 }}
                  onClick={() => setType(t)}
                >
                  {t === "category" ? "Category" : "Business Listing"}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="form-control mb-3"
              placeholder={`Search ${type === "category" ? "categories" : "businesses"}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {loading ? (
                <p className="text-body-secondary text-center py-3">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="text-body-secondary text-center py-3">No results found</p>
              ) : (
                <ul className="list-group">
                  {filtered.map((opt) => (
                    <li
                      key={opt.id}
                      className="list-group-item list-group-item-action"
                      role="button"
                      onClick={() => onInsert(opt)}
                    >
                      <div className="fw-semibold">{opt.label}</div>
                      <div className="text-body-secondary" style={{ fontSize: 12 }}>{opt.url}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
