import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import API from "../../../api/axios";
import AdminLayout from "../AdminLayout";
import DashboardPageHeader from "../../../components/ui/DashboardPageHeader";
import EmptyState from "../../../components/ui/EmptyState";

const DEFAULT_CATEGORIES = [
  "Business Guides", "Local Business", "Travel", "Hotels", "Restaurants",
  "Shopping", "Tourism", "Startup", "Franchise", "Technology",
  "Digital Marketing", "City Guides", "Education", "Real Estate", "Jobs", "Lifestyle",
];

export default function AdminBlogCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: null, name: "", description: "" });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/blog-categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => setForm({ id: null, name: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (form.id) {
        await API.put(`/blog-categories/${form.id}`, { name: form.name, description: form.description });
      } else {
        await API.post("/blog-categories", { name: form.name, description: form.description });
      }
      resetForm();
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => setForm({ id: cat._id, name: cat.name, description: cat.description || "" });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await API.delete(`/blog-categories/${id}`);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const seedDefaults = async () => {
    if (!window.confirm(`Create ${DEFAULT_CATEGORIES.length} default categories?`)) return;
    setSaving(true);
    try {
      for (const name of DEFAULT_CATEGORIES) {
        if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) continue;
        await API.post("/blog-categories", { name });
      }
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Seeding failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <DashboardPageHeader title="Blog Categories" />
      <p className="text-body-secondary mb-4">Manage categories used to classify blog posts</p>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="cw-card">
            <h5 className="mb-3">{form.id ? "Edit Category" : "Add Category"}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Travel"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="nav-btn primary" disabled={saving}>
                  {saving ? "Saving..." : form.id ? "Update" : "Add"}
                </button>
                {form.id && (
                  <button type="button" className="nav-btn outline" onClick={resetForm}>Cancel</button>
                )}
              </div>
            </form>

            {categories.length === 0 && !loading && (
              <button type="button" className="nav-btn outline mt-3 w-100" onClick={seedDefaults} disabled={saving}>
                Seed Default Categories
              </button>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          <div className="cw-card p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table cw-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                  ) : categories.length > 0 ? (
                    categories.map((cat, ind) => (
                      <tr key={cat._id}>
                        <td>{ind + 1}</td>
                        <td className="fw-semibold">{cat.name}</td>
                        <td className="text-body-secondary" style={{ fontSize: 13 }}>{cat.slug}</td>
                        <td className="text-truncate" style={{ maxWidth: 220 }}>{cat.description}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button type="button" className="cw-icon-btn" aria-label="Edit category" onClick={() => handleEdit(cat)}>
                              <CiEdit />
                            </button>
                            <button type="button" className="cw-icon-btn" aria-label="Delete category" onClick={() => handleDelete(cat._id)}>
                              <FaRegTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-0">
                        <EmptyState icon="fa-tags" title="No blog categories yet" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
