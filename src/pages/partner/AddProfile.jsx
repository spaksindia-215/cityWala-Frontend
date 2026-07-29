import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import AvatarPlaceholder from "../../assets/avatar-placeholder.svg";
import { useToast } from "../../context/ToastContext";

const MAX_GALLERY_PHOTOS = 5;

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { updatePartnerData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subSubcategories, setSubSubcategories] = useState([]);

  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await API.get("/categories");
        const sortedCategories = (res.data.categories || []).sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        );
        setCategories(sortedCategories);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    const loadProfile = async () => {
      try {
        const res = await API.get("/partner/profile");
        const partnerData = res.data;
        setProfile(partnerData);
        setGalleryImages(partnerData.gallery_images || []);
        setForm({
          ...partnerData,
          category_id: partnerData.category_id?._id || partnerData.category_id || "",
          subcategory_id: partnerData.subcategory_id?._id || partnerData.subcategory_id || "",
          sub_subcategory_id: partnerData.sub_subcategory_id?._id || partnerData.sub_subcategory_id || "",
        });

        if (partnerData.category_id?._id) {
          const catId =
            partnerData.category_id?._id || partnerData.category_id || "";

          if (catId) await loadSubcategories(catId);

        } else if (partnerData.category_id) {
          await loadSubcategories(partnerData.category_id);
        }

        if (partnerData.subcategory_id?._id) {
          await loadSubSubcategories(partnerData.subcategory_id._id);
        } else if (partnerData.subcategory_id) {
          await loadSubSubcategories(partnerData.subcategory_id);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.response?.status === 401) {
          navigate("/partner/login", { replace: true });
          return;
        }
        setProfileError(true);
      }
    };

    loadCategories();
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadSubcategories = async (categoryId) => {
    try {
      if (!categoryId) {
        setSubcategories([]);
        return;
      }
      const res = await API.get(`/categories/${categoryId}/popular-sub`);
      const sortedSubcategories = (res.data || []).sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
      setSubcategories(sortedSubcategories);
    } catch (err) {
      console.error("Error loading subcategories:", err);
      setSubcategories([]);
    }
  };

  const loadSubSubcategories = async (subcategoryId) => {
    try {
      if (!subcategoryId) {
        setSubSubcategories([]);
        return;
      }
      const res = await API.get(`/categories/sub/${subcategoryId}/popular-subsub`);
      const sortedSubSubcategories = (res.data || []).sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
      setSubSubcategories(sortedSubSubcategories);
    } catch (err) {
      console.error("Error loading sub-subcategories:", err);
      setSubSubcategories([]);
    }
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;

    setForm(prev => ({
      ...prev,
      category_id: categoryId || "",
      subcategory_id: null,
      sub_subcategory_id: null,
    }));

    // Clear before the API call so stale options never flash.
    setSubcategories([]);
    setSubSubcategories([]);

    if (!categoryId) return;

    await loadSubcategories(categoryId);
  };

  const handleSubcategoryChange = async (e) => {
    const subcategoryId = e.target.value;

    setForm(prev => ({
      ...prev,
      subcategory_id: subcategoryId,
      sub_subcategory_id: null,
    }));

    setSubSubcategories([]);

    if (subcategoryId) {
      const res = await API.get(`/categories/sub/${subcategoryId}/popular-subsub`);
      setSubSubcategories(res.data || []);
    }
  };
  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        let value = form[key];

        if (
          key === "city_id" ||
          key === "state_id" ||
          key === "category_id" ||
          key === "subcategory_id" ||
          key === "sub_subcategory_id"
        ) {
          value = value?._id || value;

          if (!value || value === "") return;
        }

        if (value instanceof File) return;

        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      if (form.company_logo instanceof File) {
        formData.append("company_logo", form.company_logo);
      }

      if (form.adhar_card instanceof File) {
        formData.append("adhar_card", form.adhar_card);
      }

      const res = await API.put("/partner/profile", formData);

      setProfile(res.data.partner);
      updatePartnerData(res.data.partner);
      setEdit(null);

      showToast("Profile updated successfully!", "success");
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err.response?.data || err.message || err);
      showToast(err.response?.data?.message || err.message || "Error updating profile", "danger");
    }
  };

  const remainingSlots = MAX_GALLERY_PHOTOS - galleryImages.length;

  const handleGalleryFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    if (files.length > remainingSlots) {
      showToast(
        t("partner_profile.gallery.limit_error", {
          max: MAX_GALLERY_PHOTOS,
          remaining: remainingSlots,
        }),
        "danger"
      );
      return;
    }

    try {
      setGalleryUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("photos", file));

      const res = await API.post("/partner/gallery", formData);
      setGalleryImages(res.data.gallery_images || []);
      showToast(t("partner_profile.gallery.upload_success"), "success");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || t("partner_profile.gallery.upload_error"), "danger");
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleRemovePhoto = async (url) => {
    try {
      setRemovingPhoto(url);
      const res = await API.delete("/partner/gallery", { data: { url } });
      setGalleryImages(res.data.gallery_images || []);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || t("partner_profile.gallery.remove_error"), "danger");
    } finally {
      setRemovingPhoto(null);
    }
  };

  if (profileError) {
    return (
      <div className="p-4">
        <EmptyState
          icon="fa-triangle-exclamation"
          title={t("partner_profile.load_error_title")}
          description={t("partner_profile.load_error_description")}
          primaryAction={{ label: t("partner_profile.retry"), onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  if (!profile) return <div className="p-4">{t("loading")}</div>;

  const sectionActions = (key) =>
    edit === key ? (
      <div className="d-flex gap-2">
        <button type="button" className="nav-btn primary" style={{ height: 36 }} onClick={handleSave}>
          {t("partner_profile.actions.save")}
        </button>
        <button
          type="button"
          className="nav-btn ghost"
          style={{ height: 36 }}
          onClick={() => { setForm(profile); setEdit(null); }}
        >
          {t("partner_profile.actions.cancel")}
        </button>
      </div>
    ) : (
      <button
        type="button"
        className="nav-btn outline"
        style={{ height: 36 }}
        onClick={() => { setForm(profile); setEdit(key); }}
      >
        {t("partner_profile.actions.edit")}
      </button>
    );

  return (
    <div>
      <DashboardPageHeader title={t("partner_profile.title")} />

      {/* ───────── COMPANY INFO ───────── */}
      <div className="cw-card mb-4">
        <SectionHeader title={t("partner_profile.company_info.title")} action={sectionActions("company")} />

        {edit === "company" ? (
          <div className="d-flex flex-column gap-2">
            <input
              type="file"
              onChange={(e) =>
                setForm({ ...form, company_logo: e.target.files[0] })
              }
              className="form-control"
            />
            <input
              name="company_name"
              value={form.company_name || ""}
              onChange={handleChange}
              className="form-control"
            />
            <textarea
              name="company_short_desc"
              value={form.company_short_desc || ""}
              onChange={handleChange}
              className="form-control"
            />
            <input
              name="company_url"
              value={form.company_url || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            <img
              src={profile?.company_logo || AvatarPlaceholder}
              alt=""
              aria-hidden="true"
              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: "var(--cw-r-md)", border: "1px solid var(--cw-gray-200)" }}
            />
            <p className="mb-0">
              <b>{t("partner_profile.company_info.name")}</b>{" "}
              {profile.company_name}
            </p>
            <p className="mb-0">
              <b>{t("partner_profile.company_info.description")}</b>{" "}
              {profile.company_short_desc || "-"}
            </p>
            <p className="mb-0">
              <b>{t("partner_profile.company_info.url")}</b>{" "}
              <a href={profile.company_url || "#"} target="_blank" rel="noopener noreferrer">
                {profile.company_url || "-"}
              </a>
            </p>
          </div>
        )}
      </div>

      {/* ───────── BASIC INFO ───────── */}
      <div className="cw-card mb-4">
        <SectionHeader title={t("partner_profile.basic_info.title")} action={sectionActions("basic")} />

        {edit === "basic" ? (
          <div className="d-flex flex-column gap-2">
            <input name="name" value={form.name || ""} onChange={handleChange} className="form-control" />
            <input name="email" value={form.email || ""} onChange={handleChange} className="form-control" />
            <input name="mobile" value={form.mobile || ""} onChange={handleChange} className="form-control" />
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            <p className="mb-0"><b>{t("partner_profile.basic_info.name")}</b> {profile.name}</p>
            <p className="mb-0"><b>{t("partner_profile.basic_info.email")}</b> {profile.email}</p>
            <p className="mb-0"><b>{t("partner_profile.basic_info.mobile")}</b> {profile.mobile}</p>
          </div>
        )}
      </div>

      {/* ───────── LOCATION ───────── */}
      <div className="cw-card mb-4">
        <SectionHeader title={t("partner_profile.location.title")} action={sectionActions("location")} />

        {edit === "location" ? (
          <div className="d-flex flex-column gap-2">
            <input name="address" value={form.address || ""} onChange={handleChange} className="form-control" />
            <input name="city_id" value={form.city_id || ""} onChange={handleChange} className="form-control" />
            <input name="state_id" value={form.state_id || ""} onChange={handleChange} className="form-control" />
            <input name="postal_code" value={form.postal_code || ""} onChange={handleChange} className="form-control" />
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            <p className="mb-0"><b>{t("partner_profile.location.address")}</b> {profile.address}</p>
            <p className="mb-0"><b>{t("partner_profile.location.city")}</b> {profile.city_id}</p>
            <p className="mb-0"><b>{t("partner_profile.location.state")}</b> {profile.state_id}</p>
            <p className="mb-0"><b>{t("partner_profile.location.postal_code")}</b> {profile.postal_code}</p>
          </div>
        )}
      </div>

      {/* ───────── CATEGORY ───────── */}
      <div className="cw-card mb-4">
        <SectionHeader title={t("partner_profile.category_info.title")} action={sectionActions("category")} />

        {edit === "category" ? (
          <div className="d-flex flex-column gap-2">
            <select value={form.category_id || ""} onChange={handleCategoryChange} className="form-select">
              <option value="">{t("partner_profile.category_info.select_category")}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            <select value={form.subcategory_id || ""} onChange={handleSubcategoryChange} className="form-select">
              <option value="">{t("partner_profile.category_info.select_subcategory")}</option>
              {subcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>

            <select value={form.sub_subcategory_id || ""} onChange={handleChange} className="form-select">
              <option value="">{t("partner_profile.category_info.select_subsubcategory")}</option>
              {subSubcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            <p className="mb-0">
              <b>{t("partner_profile.category_info.category")}</b>{" "}
              {profile.category_id?.name}
            </p>
            <p className="mb-0">
              <b>{t("partner_profile.category_info.sub_category")}</b>{" "}
              {profile.subcategory_id?.name}
            </p>
            <p className="mb-0">
              <b>{t("partner_profile.category_info.sub_sub_category")}</b>{" "}
              {profile.sub_subcategory_id?.name}
            </p>
          </div>
        )}
      </div>

      {/* ───────── DOCUMENTS ───────── */}
      <div className="cw-card">
        <SectionHeader title={t("partner_profile.documents.title")} action={sectionActions("docs")} />

        {edit === "docs" ? (
          <div className="d-flex flex-column gap-2">
            <input
              type="file"
              onChange={(e) =>
                setForm({ ...form, adhar_card: e.target.files[0] })
              }
              className="form-control"
            />
            <input name="gst_no" value={form.gst_no || ""} onChange={handleChange} className="form-control" />
            <input name="status" value={form.status || ""} onChange={handleChange} className="form-control" />
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            <p className="mb-0">
              <b>{t("partner_profile.documents.aadhar")}</b>{" "}
              {profile.adhar_card ? "Uploaded" : "Not uploaded"}
            </p>
            <p className="mb-0">
              <b>{t("partner_profile.documents.gst")}</b>{" "}
              {profile.gst_no || "-"}
            </p>
            <p className="mb-0">
              <b>{t("partner_profile.documents.status")}</b>{" "}
              {profile.status}
            </p>
            <p className="mb-0">
              <b>{t("partner_profile.documents.plan")}</b>{" "}
              {profile.plan}
            </p>
          </div>
        )}
      </div>

      {/* ───────── BUSINESS PHOTOS ───────── */}
      <div className="cw-card mt-4">
        <SectionHeader
          title={t("partner_profile.gallery.title")}
          subtitle={t("partner_profile.gallery.subtitle", { max: MAX_GALLERY_PHOTOS })}
        />

        <div className="cw-gallery-grid">
          {galleryImages.map((url) => (
            <div className="cw-gallery-tile" key={url}>
              <img src={url} alt="" aria-hidden="true" />
              <button
                type="button"
                className="cw-gallery-tile__remove"
                onClick={() => handleRemovePhoto(url)}
                disabled={removingPhoto === url}
                aria-label={t("partner_profile.gallery.remove")}
              >
                {removingPhoto === url ? (
                  <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                ) : (
                  <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                )}
              </button>
            </div>
          ))}

          {remainingSlots > 0 && (
            <button
              type="button"
              className="cw-gallery-tile cw-gallery-tile--add"
              onClick={() => galleryInputRef.current?.click()}
              disabled={galleryUploading}
            >
              {galleryUploading ? (
                <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
              ) : (
                <>
                  <i className="fa-solid fa-camera" aria-hidden="true"></i>
                  <span>{t("partner_profile.gallery.add_photo")}</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          multiple
          hidden
          onChange={handleGalleryFilesSelected}
        />

        <p className="text-body-secondary small mb-0 mt-3">
          {t("partner_profile.gallery.help", { count: galleryImages.length, max: MAX_GALLERY_PHOTOS })}
        </p>
      </div>
    </div>
  );
}