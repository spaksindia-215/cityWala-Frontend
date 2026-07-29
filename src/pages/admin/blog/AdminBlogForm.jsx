import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Select from "react-select";
import API from "../../../api/axios";
import AdminLayout from "../AdminLayout";
import DashboardPageHeader from "../../../components/ui/DashboardPageHeader";
import InternalLinkPicker from "./InternalLinkPicker";

const genrateSlug = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const EMPTY_SEO = {
  seoTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  ogImage: "",
  schemaType: "BlogPosting",
};

const EMPTY_FORM = {
  title: "",
  slug: "",
  shortDescription: "",
  content: "",
  altText: "",
  imageCaption: "",
  category: "",
  tags: [],
  isFeatured: false,
  isTrending: false,
  status: "draft",
  faqs: [],
  relatedCategoryRefs: [],
  relatedPartnerRefs: [],
  seo: EMPTY_SEO,
  featuredImage: null, // File (new upload) or existing URL string
};

export default function AdminBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [businessCategories, setBusinessCategories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    API.get("/blog-categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
    API.get("/categories")
      .then((res) => setBusinessCategories(res.data.categories || []))
      .catch(() => setBusinessCategories([]));
    API.get("/partner/all?limit=200")
      .then((res) => setPartners(res.data.partners || []))
      .catch(() => setPartners([]));
  }, []);

  const businessCategoryOptions = businessCategories.map((c) => ({ value: c._id, label: c.name }));
  const partnerOptions = partners.map((p) => ({ value: p._id, label: p.company_name || p.name }));

  useEffect(() => {
    if (!isEdit) return;
    API.get(`/admin/blogs/${id}`)
      .then((res) => {
        const b = res.data;
        setForm({
          title: b.title || "",
          slug: b.slug || "",
          shortDescription: b.shortDescription || "",
          content: b.content || "",
          altText: b.altText || "",
          imageCaption: b.imageCaption || "",
          category: b.category?._id || "",
          tags: b.tags || [],
          isFeatured: !!b.isFeatured,
          isTrending: !!b.isTrending,
          status: b.status || "draft",
          faqs: b.faqs || [],
          relatedCategoryRefs: (b.relatedCategoryRefs || []).map((c) => c._id || c),
          relatedPartnerRefs: (b.relatedPartnerRefs || []).map((p) => p._id || p),
          seo: { ...EMPTY_SEO, ...(b.seo || {}) },
          featuredImage: b.featuredImage || null,
        });
        setSlugTouched(true);
      })
      .catch((err) => alert(err.response?.data?.message || "Failed to load blog"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleTitleChange = (title) => {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : genrateSlug(title) }));
  };

  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (value && !form.tags.includes(value)) {
      setForm((f) => ({ ...f, tags: [...f.tags, value] }));
    }
    setTagInput("");
  };

  const removeTag = (tag) => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const addFaq = () => setForm((f) => ({ ...f, faqs: [...f.faqs, { question: "", answer: "" }] }));
  const updateFaq = (i, key, value) =>
    setForm((f) => ({ ...f, faqs: f.faqs.map((faq, idx) => (idx === i ? { ...faq, [key]: value } : faq)) }));
  const removeFaq = (i) => setForm((f) => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }));

  const handleInsertLink = (opt) => {
    const editor = editorRef.current;
    if (editor) {
      editor.model.change((writer) => {
        const insertPosition = editor.model.document.selection.getFirstPosition();
        const linkText = writer.createText(opt.label, { linkHref: opt.url });
        editor.model.insertContent(linkText, insertPosition);
      });
    }
    setShowLinkPicker(false);
  };

  const handleSubmit = async (e, overrideStatus) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category || !form.content.trim()) {
      alert("Title, category, and content are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = overrideStatus ? { ...form, status: overrideStatus } : form;
      const fd = new FormData();
      fd.append("title", payload.title);
      if (slugTouched) fd.append("slug", payload.slug);
      fd.append("shortDescription", payload.shortDescription);
      fd.append("content", payload.content);
      fd.append("altText", payload.altText);
      fd.append("imageCaption", payload.imageCaption);
      fd.append("category", payload.category);
      fd.append("tags", JSON.stringify(payload.tags));
      fd.append("isFeatured", String(payload.isFeatured));
      fd.append("isTrending", String(payload.isTrending));
      fd.append("status", payload.status);
      fd.append("faqs", JSON.stringify(payload.faqs.filter((f) => f.question.trim() && f.answer.trim())));
      fd.append("relatedCategoryRefs", JSON.stringify(payload.relatedCategoryRefs));
      fd.append("relatedPartnerRefs", JSON.stringify(payload.relatedPartnerRefs));
      fd.append("seo", JSON.stringify(payload.seo));
      if (payload.featuredImage instanceof File) {
        fd.append("featuredImage", payload.featuredImage);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (isEdit) {
        await API.put(`/admin/blogs/${id}`, fd, config);
        alert("Blog updated successfully");
      } else {
        await API.post("/admin/blogs", fd, config);
        alert("Blog created successfully");
      }
      navigate("/admin/blogs");
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </AdminLayout>
    );
  }

  const imagePreviewSrc =
    form.featuredImage instanceof File ? URL.createObjectURL(form.featuredImage) : form.featuredImage;

  return (
    <AdminLayout>
      <DashboardPageHeader
        title={isEdit ? "Edit Blog" : "Add Blog"}
        action={
          form.slug && (
            <a
              className="nav-btn outline"
              href={`/blogs/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-eye" aria-hidden="true"></i>
              Preview
            </a>
          )
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="cw-card mb-3">
              <div className="mb-3">
                <label className="form-label fw-semibold">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Slug</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: genrateSlug(e.target.value) }));
                  }}
                  placeholder="auto-generated-from-title"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Short Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  maxLength={500}
                  value={form.shortDescription}
                  onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                />
              </div>

              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <label className="form-label fw-semibold mb-0">Content</label>
                  <button
                    type="button"
                    className="nav-btn outline"
                    style={{ height: 32, fontSize: 12 }}
                    onClick={() => setShowLinkPicker(true)}
                  >
                    <i className="fa-solid fa-link" aria-hidden="true"></i>
                    Insert Internal Link
                  </button>
                </div>
                <div className="cw-editor-wrap">
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.content}
                    onReady={(editor) => { editorRef.current = editor; }}
                    config={{
                      toolbar: [
                        "heading", "|",
                        "bold", "italic", "underline", "|",
                        "link", "bulletedList", "numberedList", "|",
                        "blockQuote", "insertTable", "mediaEmbed", "|",
                        "imageUpload", "|",
                        "undo", "redo",
                      ],
                      heading: {
                        options: [
                          { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
                          { model: "heading1", view: "h1", title: "Heading 1" },
                          { model: "heading2", view: "h2", title: "Heading 2" },
                          { model: "heading3", view: "h3", title: "Heading 3" },
                          { model: "heading4", view: "h4", title: "Heading 4" },
                        ],
                      },
                    }}
                    onChange={(event, editor) => setForm((f) => ({ ...f, content: editor.getData() }))}
                  />
                </div>
                <p className="text-body-secondary mt-2" style={{ fontSize: 12 }}>
                  Headings (H1-H4) are used to auto-generate the Table of Contents on the public page.
                </p>
              </div>
            </div>

            {/* FAQs */}
            <div className="cw-card mb-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">FAQs (optional)</h5>
                <button type="button" className="nav-btn outline" style={{ height: 32, fontSize: 12 }} onClick={addFaq}>
                  <i className="fa-solid fa-plus" aria-hidden="true"></i> Add FAQ
                </button>
              </div>
              <p className="text-body-secondary mb-3" style={{ fontSize: 12 }}>
                Adding FAQs here automatically generates FAQ schema markup for rich results.
              </p>
              {form.faqs.map((faq, i) => (
                <div key={i} className="border rounded p-3 mb-2">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold" style={{ fontSize: 13 }}>FAQ {i + 1}</span>
                    <button type="button" className="cw-icon-btn" aria-label="Remove FAQ" onClick={() => removeFaq(i)}>
                      <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Question"
                    value={faq.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                  />
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* SEO */}
            <div className="cw-card mb-3">
              <h5 className="mb-3">SEO</h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">SEO Title</label>
                <input
                  type="text"
                  className="form-control"
                  maxLength={70}
                  value={form.seo.seoTitle}
                  onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, seoTitle: e.target.value } }))}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Meta Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  maxLength={300}
                  value={form.seo.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))}
                />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Focus Keyword</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.seo.focusKeyword}
                    onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, focusKeyword: e.target.value } }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Canonical URL</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Leave blank to use default"
                    value={form.seo.canonicalUrl}
                    onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, canonicalUrl: e.target.value } }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Schema Type</label>
                  <select
                    className="form-select"
                    value={form.seo.schemaType}
                    onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, schemaType: e.target.value } }))}
                  >
                    <option value="BlogPosting">BlogPosting</option>
                    <option value="Article">Article</option>
                    <option value="NewsArticle">NewsArticle</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Publish */}
            <div className="cw-card mb-3">
              <h5 className="mb-3">Publish</h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isFeatured"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="isFeatured">Featured</label>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isTrending"
                  checked={form.isTrending}
                  onChange={(e) => setForm((f) => ({ ...f, isTrending: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="isTrending">Trending</label>
              </div>

              <div className="d-flex flex-column gap-2">
                <button type="submit" className="nav-btn primary" disabled={saving}>
                  {saving ? "Saving..." : isEdit ? "Update Blog" : "Save Blog"}
                </button>
                {form.status !== "published" && (
                  <button
                    type="button"
                    className="nav-btn outline"
                    disabled={saving}
                    onClick={(e) => handleSubmit(e, "published")}
                  >
                    Publish Now
                  </button>
                )}
                {form.status !== "draft" && (
                  <button
                    type="button"
                    className="nav-btn outline"
                    disabled={saving}
                    onClick={(e) => handleSubmit(e, "draft")}
                  >
                    Unpublish (Save as Draft)
                  </button>
                )}
                {form.status !== "archived" && isEdit && (
                  <button
                    type="button"
                    className="nav-btn ghost-danger"
                    disabled={saving}
                    onClick={(e) => handleSubmit(e, "archived")}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>

            {/* Category & Tags */}
            <div className="cw-card mb-3">
              <div className="mb-3">
                <label className="form-label fw-semibold">Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label fw-semibold">Tags</label>
                <div className="d-flex gap-2 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTag(); }
                    }}
                  />
                  <button type="button" className="nav-btn outline" onClick={addTag}>Add</button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="cw-badge cw-badge--neutral d-flex align-items-center gap-1">
                      {tag}
                      <i
                        className="fa-solid fa-xmark"
                        role="button"
                        aria-label={`Remove tag ${tag}`}
                        onClick={() => removeTag(tag)}
                      ></i>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Related listings — power the public detail page's CTA
                section ("Find Local Businesses" / "Explore Hotels" etc.) */}
            <div className="cw-card mb-3">
              <h5 className="mb-3">Related Listings (CTA)</h5>
              <p className="text-body-secondary mb-3" style={{ fontSize: 12 }}>
                Businesses and categories readers are directed to at the end of this article.
              </p>
              <div className="mb-3">
                <label className="form-label fw-semibold">Related Categories</label>
                <Select
                  isMulti
                  options={businessCategoryOptions}
                  value={businessCategoryOptions.filter((o) => form.relatedCategoryRefs.includes(o.value))}
                  onChange={(selected) =>
                    setForm((f) => ({ ...f, relatedCategoryRefs: (selected || []).map((s) => s.value) }))
                  }
                  placeholder="Select categories..."
                  classNamePrefix="cw-select"
                />
              </div>
              <div>
                <label className="form-label fw-semibold">Related Businesses</label>
                <Select
                  isMulti
                  options={partnerOptions}
                  value={partnerOptions.filter((o) => form.relatedPartnerRefs.includes(o.value))}
                  onChange={(selected) =>
                    setForm((f) => ({ ...f, relatedPartnerRefs: (selected || []).map((s) => s.value) }))
                  }
                  placeholder="Select businesses..."
                  classNamePrefix="cw-select"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="cw-card mb-3">
              <h5 className="mb-3">Featured Image</h5>
              <div
                className="text-center mb-3"
                style={{
                  border: "2px dashed #d1d5db",
                  borderRadius: "16px",
                  padding: "20px",
                  background: "#f9fafb",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("blogFeaturedImageInput").click()}
              >
                {imagePreviewSrc ? (
                  <img src={imagePreviewSrc} alt="" style={{ maxWidth: "100%", maxHeight: 180, borderRadius: "var(--cw-r-md)" }} />
                ) : (
                  <div className="text-body-secondary py-4">
                    <i className="fa-solid fa-cloud-arrow-up fa-2x mb-2 d-block" aria-hidden="true"></i>
                    Click to upload (JPG, PNG, WEBP — max 5MB)
                  </div>
                )}
                <input
                  id="blogFeaturedImageInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  hidden
                  onChange={(e) => setForm((f) => ({ ...f, featuredImage: e.target.files[0] || f.featuredImage }))}
                />
              </div>
              {imagePreviewSrc && (
                <button
                  type="button"
                  className="nav-btn ghost-danger w-100 mb-3"
                  onClick={() => setForm((f) => ({ ...f, featuredImage: null }))}
                >
                  Remove Image
                </button>
              )}
              <div className="mb-3">
                <label className="form-label fw-semibold">Alt Text</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.altText}
                  onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label fw-semibold">Caption</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.imageCaption}
                  onChange={(e) => setForm((f) => ({ ...f, imageCaption: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <InternalLinkPicker
        show={showLinkPicker}
        onClose={() => setShowLinkPicker(false)}
        onInsert={handleInsertLink}
      />
    </AdminLayout>
  );
}
