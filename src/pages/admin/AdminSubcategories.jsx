import { Fragment, useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "./AdminLayout";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";

function AdminSubcategories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // NOTE: /location/categories doesn't return parentId, so subcategory filter breaks.
      // For admin "category-wise subcategories", we need full category objects with parentId.
      const res = await API.get("/categories");
      const data = res.data.categories || res.data || [];
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const rootCategories = useMemo(
    () => categories
      .filter((c) => !c.parentId)
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [categories]
  );

  const childrenByParent = useMemo(() => {
    const m = new Map();
    for (const c of categories) {
      const pid = c.parentId ? String(c.parentId) : "";
      if (!m.has(pid)) m.set(pid, []);
      m.get(pid).push(c);
    }
    for (const [, arr] of m) arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return m;
  }, [categories]);

  // Show all descendants (tree) under selected root. Works for deep nesting (20+ levels).
  const subCategories = useMemo(() => {
    if (!selectedCategory) return [];
    const out = [];
    const walk = (pid, depth) => {
      for (const c of childrenByParent.get(String(pid)) || []) {
        out.push({ cat: c, depth });
        walk(c._id, depth + 1);
      }
    };
    walk(selectedCategory, 0);
    return out;
  }, [childrenByParent, selectedCategory]);

  return (
    <AdminLayout>
      <DashboardPageHeader title="Subcategories (Category-wise)" />

      <div className="cw-card">
        <div className="row mb-4">
          <div className="col-md-4">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {rootCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table cw-table align-middle">
            <thead>
              <tr>
                <th>S no</th>
                <th>Subcategory Name</th>
                <th>Level</th>
              </tr>
            </thead>

            <tbody>
              {!selectedCategory ? (
                <tr>
                  <td colSpan="3" className="text-center text-body-secondary">
                    Please select a category
                  </td>
                </tr>
              ) : subCategories.length > 0 ? (
                subCategories.map(({ cat: sub, depth }, i) => {
                  if (depth !== 0) return null;

                  const children = subCategories.filter(
                    (c) => String(c.cat.parentId) === String(sub._id)
                  );

                  return (
                    <Fragment key={sub._id}>
                      <tr>
                        <td>{i + 1}</td>
                        <td className="fw-semibold">{sub.name}</td>
                        <td></td>
                      </tr>

                      {children.map((child, idx) => (
                        <tr key={child.cat._id}>
                          <td></td>
                          <td style={{ paddingLeft: 30 }}>
                            {String.fromCharCode(97 + idx)}. {child.cat.name}
                          </td>
                          <td className="text-body-secondary small">{depth + 1}</td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-body-secondary">
                    No subcategories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSubcategories;
