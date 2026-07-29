import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import API from "../../../api/axios";
import AdminLayout from "../AdminLayout";
import Pagination from "../../../components/Pagination";
import DashboardPageHeader from "../../../components/ui/DashboardPageHeader";
import EmptyState from "../../../components/ui/EmptyState";

const STATUS_BADGE = {
  published: "cw-badge--success",
  draft: "cw-badge--warning",
  archived: "cw-badge--danger",
};

export default function AdminAllBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const navigate = useNavigate();
  const startIndex = (page - 1) * limit;

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);

      const res = await API.get(`/admin/blogs?${params.toString()}`);
      setBlogs(res.data.blogs || []);
      setPagination(res.data.pagination || {});
      setSelectedIds([]);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    API.get("/blog-categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadBlogs();
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === blogs.length ? [] : blogs.map((b) => b._id));
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm("Delete this blog? This cannot be undone.")) return;
    try {
      await API.delete(`/admin/blogs/${id}`);
      loadBlogs();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/admin/blogs/${id}/status`, { status });
      loadBlogs();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await API.post(`/admin/blogs/${id}/duplicate`);
      navigate(`/admin/blogs/edit/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Duplicate failed");
    }
  };

  const handleBulk = async (action) => {
    if (!selectedIds.length) return;
    const confirmMsg =
      action === "delete"
        ? `Delete ${selectedIds.length} blog(s)? This cannot be undone.`
        : `${action} ${selectedIds.length} blog(s)?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await API.post("/admin/blogs/bulk", { ids: selectedIds, action });
      loadBlogs();
    } catch (err) {
      alert(err.response?.data?.message || "Bulk action failed");
    }
  };

  return (
    <AdminLayout>
      <DashboardPageHeader
        title="Blogs"
        action={
          <div className="d-flex gap-2">
            <button type="button" className="nav-btn outline" onClick={() => navigate("/admin/blogs/categories")}>
              <i className="fa-solid fa-tags" aria-hidden="true"></i>
              Categories
            </button>
            <button type="button" className="nav-btn primary" onClick={() => navigate("/admin/blogs/add")}>
              <i className="fa-solid fa-plus" aria-hidden="true"></i>
              Add Blog
            </button>
          </div>
        }
      />
      <p className="text-body-secondary mb-4">Manage blog posts, SEO, and publishing status</p>

      <div className="cw-card mb-3">
        <form onSubmit={handleSearchSubmit} className="d-flex gap-2 flex-wrap align-items-center p-3">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 280 }}
            placeholder="Search title, tags, content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: 180 }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            className="form-select"
            style={{ maxWidth: 220 }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="nav-btn outline">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            Search
          </button>
        </form>
      </div>

      {selectedIds.length > 0 && (
        <div className="cw-card mb-3 p-3 d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-semibold">{selectedIds.length} selected</span>
          <button type="button" className="nav-btn outline" onClick={() => handleBulk("publish")}>Publish</button>
          <button type="button" className="nav-btn outline" onClick={() => handleBulk("unpublish")}>Unpublish</button>
          <button type="button" className="nav-btn outline" onClick={() => handleBulk("archive")}>Archive</button>
          <button type="button" className="nav-btn ghost-danger" onClick={() => handleBulk("delete")}>Delete</button>
        </div>
      )}

      <div className="cw-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table cw-table align-middle mb-0">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={blogs.length > 0 && selectedIds.length === blogs.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>#</th>
                <th>Thumbnail</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Views</th>
                <th>Published</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-4">Loading blogs...</td>
                </tr>
              ) : blogs.length > 0 ? (
                blogs.map((blog, ind) => (
                  <tr key={blog._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(blog._id)}
                        onChange={() => toggleSelect(blog._id)}
                      />
                    </td>
                    <td>{startIndex + ind + 1}</td>
                    <td>
                      {blog.featuredImage ? (
                        <img
                          src={blog.featuredImage}
                          alt=""
                          aria-hidden="true"
                          style={{ width: 56, height: 40, borderRadius: "var(--cw-r-md)", objectFit: "cover", border: "1px solid var(--cw-gray-200)" }}
                        />
                      ) : (
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{ width: 56, height: 40, borderRadius: "var(--cw-r-md)", background: "var(--cw-gray-100)", fontSize: 10, color: "var(--cw-gray-500)" }}
                        >
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="fw-semibold" style={{ maxWidth: 260 }}>
                      <div className="text-truncate">{blog.title}</div>
                      {blog.isTrending && <span className="cw-badge cw-badge--info ms-1">Trending</span>}
                    </td>
                    <td>{blog.category?.name || "-"}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 130 }}
                        value={blog.status}
                        onChange={(e) => handleStatusChange(blog._id, e.target.value)}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge rounded-pill cw-badge ${blog.isFeatured ? "cw-badge--success" : "cw-badge--neutral"}`}>
                        {blog.isFeatured ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>{blog.viewCount ?? 0}</td>
                    <td style={{ fontSize: 13 }}>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "-"}</td>
                    <td style={{ fontSize: 13 }}>{blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : "-"}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="cw-icon-btn"
                          aria-label="Edit blog"
                          onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)}
                        >
                          <CiEdit />
                        </button>
                        <a
                          className="cw-icon-btn"
                          aria-label="Preview blog"
                          href={`/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="fa-solid fa-eye" aria-hidden="true"></i>
                        </a>
                        <button
                          type="button"
                          className="cw-icon-btn"
                          aria-label="Duplicate blog"
                          onClick={() => handleDuplicate(blog._id)}
                        >
                          <i className="fa-solid fa-copy" aria-hidden="true"></i>
                        </button>
                        <button
                          type="button"
                          className="cw-icon-btn"
                          aria-label="Delete blog"
                          onClick={() => handleDeleteOne(blog._id)}
                        >
                          <FaRegTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="p-0">
                    <EmptyState
                      icon="fa-newspaper"
                      title="No blogs found"
                      primaryAction={{ label: "Add Blog", onClick: () => navigate("/admin/blogs/add") }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={pagination?.totalPages || 1}
        onPageChange={setPage}
        limit={limit}
        setLimit={setLimit}
      />
    </AdminLayout>
  );
}
