import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../api/axios";
import AdminLayout from "../AdminLayout";
import DashboardPageHeader from "../../../components/ui/DashboardPageHeader";
import { useToast } from "../../../context/ToastContext";

// Kept in sync with utils/faqValidation.js on the backend — the server is the
// authority, these bounds just give immediate feedback before a round trip.
const QUESTION_MAX = 300;
const ANSWER_MAX = 10000;

const EMPTY_FORM = {
  question: "",
  answer: "",
  status: "draft",
  displayOrder: "",
  category: "",
};

/**
 * Add/Edit FAQ. A single component serves both routes — `id` in the URL
 * switches it to edit mode — so the field set, validation and submit logic
 * exist in exactly one place.
 */
export default function AdminFaqForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    // Optional grouping reuses the existing blog-content taxonomy; if the
    // request fails the field simply stays empty rather than blocking the form.
    API.get("/blog-categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;

    setLoading(true);
    setLoadError("");
    API.get(`/admin/faqs/${id}`)
      .then((res) => {
        if (cancelled) return;
        const f = res.data || {};
        setForm({
          question: f.question || "",
          answer: f.answer || "",
          status: f.status || "draft",
          displayOrder: f.displayOrder ?? "",
          category: f.category?._id || f.category || "",
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.response?.data?.message || "Unable to load this FAQ.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next = {};

    const question = form.question.trim();
    if (!question) next.question = "Question is required.";
    else if (question.length < 5) next.question = "Question must be at least 5 characters.";
    else if (question.length > QUESTION_MAX) next.question = `Question must be ${QUESTION_MAX} characters or less.`;

    const answer = form.answer.trim();
    if (!answer) next.answer = "Answer is required.";
    else if (answer.length < 5) next.answer = "Answer must be at least 5 characters.";
    else if (answer.length > ANSWER_MAX) next.answer = `Answer must be ${ANSWER_MAX} characters or less.`;

    if (form.displayOrder !== "" && form.displayOrder !== null) {
      const order = Number(form.displayOrder);
      if (!Number.isInteger(order) || order < 0) {
        next.displayOrder = "Display order must be a whole number of 0 or more.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e, overrideStatus) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        status: overrideStatus || form.status,
        // Omit rather than send "" so the backend can apply its
        // "append to end" default on create.
        ...(form.displayOrder === "" ? {} : { displayOrder: Number(form.displayOrder) }),
        category: form.category || undefined,
      };

      if (isEdit) {
        await API.put(`/admin/faqs/${id}`, payload);
        showToast("FAQ updated successfully.", "success");
      } else {
        await API.post("/admin/faqs", payload);
        showToast("FAQ created successfully.", "success");
      }
      // Matches the blog form's UX: return to the list after a successful save.
      navigate("/admin/faqs");
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed. Please try again.", "danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <span className="visually-hidden">Loading FAQ...</span>
        </div>
      </AdminLayout>
    );
  }

  if (loadError) {
    return (
      <AdminLayout>
        <DashboardPageHeader title="Edit FAQ" />
        <div className="cw-card p-4 text-center">
          <p className="mb-3">{loadError}</p>
          <div className="d-flex gap-2 justify-content-center">
            <button type="button" className="nav-btn outline" onClick={() => navigate("/admin/faqs")}>
              Back to FAQs
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <DashboardPageHeader
        title={isEdit ? "Edit FAQ" : "Add FAQ"}
        action={
          <button type="button" className="nav-btn outline" onClick={() => navigate("/admin/faqs")}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
            Back to FAQs
          </button>
        }
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="cw-card p-4">
              <div className="mb-3">
                <label htmlFor="faq-question" className="form-label fw-semibold">
                  Question <span className="text-danger">*</span>
                </label>
                <input
                  id="faq-question"
                  type="text"
                  className={`form-control ${errors.question ? "is-invalid" : ""}`}
                  value={form.question}
                  maxLength={QUESTION_MAX}
                  placeholder="e.g. How do I add my business to CityWala?"
                  onChange={(e) => setField("question", e.target.value)}
                  aria-describedby="faq-question-help"
                />
                {errors.question && <div className="invalid-feedback">{errors.question}</div>}
                <div id="faq-question-help" className="form-text">
                  {form.question.length}/{QUESTION_MAX} characters
                </div>
              </div>

              <div className="mb-2">
                <label htmlFor="faq-answer" className="form-label fw-semibold">
                  Answer <span className="text-danger">*</span>
                </label>
                {/* Plain textarea for now. The backend stores and sanitizes
                    this field as rich text, so swapping in the CKEditor build
                    the blog form already uses needs no API/schema change. */}
                <textarea
                  id="faq-answer"
                  className={`form-control ${errors.answer ? "is-invalid" : ""}`}
                  rows={8}
                  value={form.answer}
                  maxLength={ANSWER_MAX}
                  placeholder="Write a clear, complete answer..."
                  onChange={(e) => setField("answer", e.target.value)}
                  aria-describedby="faq-answer-help"
                />
                {errors.answer && <div className="invalid-feedback">{errors.answer}</div>}
                <div id="faq-answer-help" className="form-text">
                  {form.answer.length}/{ANSWER_MAX} characters
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="cw-card p-4">
              <div className="mb-3">
                <label htmlFor="faq-status" className="form-label fw-semibold">Status</label>
                <select
                  id="faq-status"
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <div className="form-text">Only published FAQs appear on the website.</div>
              </div>

              <div className="mb-3">
                <label htmlFor="faq-order" className="form-label fw-semibold">Display Order</label>
                <input
                  id="faq-order"
                  type="number"
                  min="0"
                  className={`form-control ${errors.displayOrder ? "is-invalid" : ""}`}
                  value={form.displayOrder}
                  placeholder="Auto"
                  onChange={(e) => setField("displayOrder", e.target.value)}
                />
                {errors.displayOrder && <div className="invalid-feedback">{errors.displayOrder}</div>}
                <div className="form-text">Lower numbers appear first. Leave blank to add to the end.</div>
              </div>

              <div className="mb-4">
                <label htmlFor="faq-category" className="form-label fw-semibold">Category</label>
                <select
                  id="faq-category"
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <div className="form-text">Optional grouping for the FAQ section.</div>
              </div>

              <div className="d-flex flex-column gap-2">
                <button type="submit" className="nav-btn primary" disabled={saving}>
                  {saving ? "Saving..." : isEdit ? "Save Changes" : "Create FAQ"}
                </button>

                {/* Shortcut so a new FAQ can go live without a second edit. */}
                {form.status !== "published" && (
                  <button
                    type="button"
                    className="nav-btn outline"
                    disabled={saving}
                    onClick={(e) => handleSubmit(e, "published")}
                  >
                    {isEdit ? "Save & Publish" : "Create & Publish"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
