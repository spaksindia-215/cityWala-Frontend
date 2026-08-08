import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import API from "../../../api/axios";
import AdminLayout from "../AdminLayout";
import Pagination from "../../../components/Pagination";
import DashboardPageHeader from "../../../components/ui/DashboardPageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import DeleteFAQModal from "./DeleteFAQModal";
import { htmlToText } from "../../../components/faq/FAQSection";
import { useToast } from "../../../context/ToastContext";

const STATUS_BADGE = {
  published: "cw-badge--success",
  draft: "cw-badge--warning",
};

const STATUS_LABEL = {
  published: "Published",
  draft: "Draft",
};

export default function AdminAllFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [faqToDelete, setFaqToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast();
  const startIndex = (page - 1) * limit;

  const loadFaqs = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const params = new URLSearchParams({ page, limit });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);

      const res = await API.get(`/admin/faqs?${params.toString()}`);
      setFaqs(res.data.faqs || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      setLoadError(err.response?.data?.message || "Unable to load FAQs.");
      setFaqs([]);
    } finally {
      setLoading(false);
    }
    // `search` is intentionally excluded — it is applied on submit, not on
    // every keystroke (matches the blog list's behaviour).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (page !== 1) setPage(1);
    else loadFaqs();
  };

  const handleToggleStatus = async (faq) => {
    const next = faq.status === "published" ? "draft" : "published";
    setBusyId(faq._id);
    try {
      await API.put(`/admin/faqs/${faq._id}/status`, { status: next });
      // Patch in place so the row doesn't jump while the admin is working.
      setFaqs((prev) => prev.map((f) => (f._id === faq._id ? { ...f, status: next } : f)));
      showToast(next === "published" ? "FAQ published." : "FAQ moved to draft.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Status update failed.", "danger");
    } finally {
      setBusyId(null);
    }
  };

  const handleOrderChange = async (faq, rawValue) => {
    const displayOrder = Number(rawValue);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      showToast("Display order must be a whole number of 0 or more.", "warning");
      return;
    }
    if (displayOrder === faq.displayOrder) return;

    setBusyId(faq._id);
    try {
      await API.put(`/admin/faqs/${faq._id}`, { displayOrder });
      showToast("Display order updated.", "success");
      loadFaqs();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update order.", "danger");
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await API.delete(`/admin/faqs/${faqToDelete._id}`);
      setFaqToDelete(null);
      showToast("FAQ deleted successfully.", "success");

      // Step back a page if the last row on this page was just removed.
      if (faqs.length === 1 && page > 1) setPage((p) => p - 1);
      else loadFaqs();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const colSpan = 7;

  return (
    <AdminLayout>
      <DashboardPageHeader
        title="FAQs"
        action={
          <button type="button" className="nav-btn primary" onClick={() => navigate("/admin/faqs/add")}>
            <i className="fa-solid fa-plus" aria-hidden="true"></i>
            Add FAQ
          </button>
        }
      />
      <p className="text-body-secondary mb-4">
        Manage the questions shown in the public FAQ section. Only published FAQs are visible on the website.
      </p>

      <div className="cw-card mb-3">
        <form onSubmit={handleSearchSubmit} className="d-flex gap-2 flex-wrap align-items-center p-3">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 280 }}
            placeholder="Search question or answer..."
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
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button type="submit" className="nav-btn outline">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            Search
          </button>
        </form>
      </div>

      <div className="cw-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table cw-table align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ width: 110 }}>Order</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="text-center py-4">Loading FAQs...</td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={colSpan} className="p-0">
                    <EmptyState
                      icon="fa-triangle-exclamation"
                      title="Unable to load FAQs."
                      description={loadError}
                      primaryAction={{ label: "Try Again", onClick: loadFaqs }}
                    />
                  </td>
                </tr>
              ) : faqs.length > 0 ? (
                faqs.map((faq, ind) => (
                  <tr key={faq._id}>
                    <td>{startIndex + ind + 1}</td>
                    <td style={{ maxWidth: 340, minWidth: 220 }}>
                      <div className="fw-semibold text-truncate" title={faq.question}>
                        {faq.question}
                      </div>
                      <div
                        className="text-body-secondary text-truncate"
                        style={{ fontSize: 12 }}
                        title={htmlToText(faq.answer)}
                      >
                        {htmlToText(faq.answer)}
                      </div>
                    </td>
                    <td>{faq.category?.name || "—"}</td>
                    <td>
                      <span className={`badge rounded-pill cw-badge ${STATUS_BADGE[faq.status] || "cw-badge--neutral"}`}>
                        {STATUS_LABEL[faq.status] || faq.status}
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm"
                        style={{ width: 84 }}
                        defaultValue={faq.displayOrder ?? 0}
                        disabled={busyId === faq._id}
                        aria-label={`Display order for ${faq.question}`}
                        onBlur={(e) => handleOrderChange(faq, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                        }}
                      />
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {faq.updatedAt ? new Date(faq.updatedAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="cw-icon-btn"
                          aria-label={faq.status === "published" ? "Unpublish FAQ" : "Publish FAQ"}
                          title={faq.status === "published" ? "Unpublish" : "Publish"}
                          disabled={busyId === faq._id}
                          onClick={() => handleToggleStatus(faq)}
                        >
                          <i
                            className={`fa-solid ${faq.status === "published" ? "fa-eye-slash" : "fa-eye"}`}
                            aria-hidden="true"
                          ></i>
                        </button>
                        <button
                          type="button"
                          className="cw-icon-btn"
                          aria-label="Edit FAQ"
                          title="Edit"
                          onClick={() => navigate(`/admin/faqs/edit/${faq._id}`)}
                        >
                          <CiEdit />
                        </button>
                        <button
                          type="button"
                          className="cw-icon-btn"
                          aria-label="Delete FAQ"
                          title="Delete"
                          onClick={() => {
                            setDeleteError("");
                            setFaqToDelete(faq);
                          }}
                        >
                          <FaRegTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={colSpan} className="p-0">
                    <EmptyState
                      icon="fa-circle-question"
                      title={search || statusFilter ? "No FAQs match your filters" : "No FAQs yet."}
                      description={
                        search || statusFilter
                          ? "Try a different search term or status filter."
                          : "Create your first FAQ to get started."
                      }
                      primaryAction={{ label: "+ Add FAQ", onClick: () => navigate("/admin/faqs/add") }}
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

      <DeleteFAQModal
        faq={faqToDelete}
        deleting={deleting}
        error={deleteError}
        onCancel={() => setFaqToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}
