import { useTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from '../api/axios';
import { getYoutubeThumbnail, getYoutubeWatchUrl } from '../utils/youtube';
import Seo from '../seo/Seo';
import EmptyState from '../components/ui/EmptyState';
import SkeletonCard from '../components/ui/SkeletonCard';
import BusinessCard from '../components/ui/BusinessCard';
import { categorySchema, webPageSchema, graph } from '../seo/schema';
import { CATEGORY_LABELS, humanizeSlug } from '../seo/config';

const DESCRIPTION_WORD_LIMIT = 400;

const truncateWords = (text, limit) => {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return { truncated: text || "", isTruncated: false };
  return { truncated: words.slice(0, limit).join(" ") + "...", isTruncated: true };
};

const AllCategories = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(location.search);
  const country = searchParams.get("country");
  const state = searchParams.get('state');
  const city = searchParams.get('city');

  const navigate = useNavigate()
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [showListings, setShowListings] = useState(false);
  const [showMixed, setShowMixed] = useState(false);
  const [mixedCategories, setMixedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryDescExpanded, setCategoryDescExpanded] = useState(false);
  const [expandedSubDescIds, setExpandedSubDescIds] = useState(new Set());
  const { level1, level2, level3 } = useParams();

  const currentSlug = level3 || level2 || level1;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        const list = res.data?.categories || res.data || [];
        setCategories(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // When route slug changes, resolve its category id (for subcategory tree)
  useEffect(() => {
    setCategoryDescExpanded(false);
  }, [currentSlug]);

  useEffect(() => {
    if (!currentSlug || categories.length === 0) return;
    const current = categories.find((c) => String(c?.slug || "") === String(currentSlug));
    if (current) {
      setSelectedCategoryId(String(current._id));
      setSelectedCategoryName(current);
    }
  }, [currentSlug, categories]);

  // category tree map for quick lookup of subcategories by parentId
  const childrenByParent = useMemo(() => {
    const m = new Map();
    for (const c of categories) {
      // parentId kabhi string hota hai, kabhi populated object ({ _id: ... })
      const pid = c?.parentId
        ? String(c.parentId?._id || c.parentId)
        : "";
      if (!m.has(pid)) m.set(pid, []);
      m.get(pid).push(c);
    }
    for (const [, arr] of m) arr.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    return m;
  }, [categories]);

  // top-level categories when user visits /categories without slug
  const rootCategories = useMemo(() => {
    return childrenByParent.get("") || [];
  }, [childrenByParent]);

  // current subcategories to show in table (if any)
  const subCategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    return childrenByParent.get(String(selectedCategoryId)) || [];
  }, [childrenByParent, selectedCategoryId]);

  // Fetch listings for current category
  useEffect(() => {
    if (!currentSlug) {
      setData([]);
      setShowListings(false);
      setShowMixed(false);
      setMixedCategories([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      // reset UI flags for new slug to avoid stale mixed/listing state
      setShowListings(false);
      setShowMixed(false);
      setMixedCategories([]);
      try {
        const query = new URLSearchParams();

        if (country) query.append("country", country);
        if (state) query.append("state", state);
        if (city) query.append("city", city);

        const apiUrl = `/listing/${currentSlug}?${query.toString()}`;
        const res = await API.get(apiUrl);

        if (res.data.type === "listings" && Array.isArray(res.data.data)) {
          // Partners/Businesses found
          setData(res.data.data);
          setShowListings(true);
          setShowMixed(false);
          setMixedCategories([]);
        } else if (res.data.type === "categories" && Array.isArray(res.data.data)) {
          // Subcategories found - hide listings, show subcategories via childrenByParent
          setData([]);
          setShowListings(false);
          setShowMixed(false);
          setMixedCategories([]);
        } else if (res.data.type === "mixed") {
          // Both subcategories and partners found
          setData(res.data.listings || []);
          setMixedCategories(res.data.categories || []);
          setShowListings(false);
          setShowMixed(true);
        } else {
          setData([]);
          setShowListings(false);
          setShowMixed(false);
          setMixedCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch listings:", error);
        setData([]);
        setShowListings(false);
        setShowMixed(false);
        setMixedCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentSlug, location.search]);

  const handleSubCategoryClick = (sub) => {
    navigate(`${location.pathname}/${sub.slug}${location.search}`);
  };

  const handlePartnerClick = (partnerId) => {
    navigate(`/partner/details/${partnerId}${location.search}`);
  };

  // Build the crawlable path exactly as routed (/categories/:level1/:level2/:level3)
  // so canonical/OG URLs never drop the nested segments.
  const categoryPath = ["/categories", level1, level2, level3].filter(Boolean).join("/");
  const fallbackLabel = currentSlug
    ? CATEGORY_LABELS[currentSlug] || humanizeSlug(currentSlug)
    : "All Categories";
  const displayName = selectedCategoryName?.name || fallbackLabel;
  const seoDescription =
    selectedCategoryName?.description ||
    (currentSlug
      ? `Browse verified ${displayName} businesses, service providers, and partners listed on CityWala.`
      : "Browse all business categories on CityWala — from real estate and education to health, food, and more.");

  return (
    <div>
      <Seo
        title={displayName}
        description={seoDescription}
        path={categoryPath}
        jsonLd={graph(
          categorySchema({ path: categoryPath, name: displayName, description: seoDescription }),
          webPageSchema({ path: categoryPath, name: displayName, description: seoDescription })
        )}
      />

      {/* Slim gradient page header (4.4/4.5) */}
      <section className="cw-page-header">
        <div className="container">
          <h1 className="cw-display cw-display--section text-white mb-0">{displayName}</h1>

          {(() => {
            const rawDesc = selectedCategoryName?.description || "";
            const { truncated, isTruncated } = truncateWords(rawDesc, DESCRIPTION_WORD_LIMIT);
            const shown = categoryDescExpanded ? rawDesc : truncated;
            if (!rawDesc) return null;
            return (
              <p className="cw-page-header__desc mt-3">
                {shown}
                {isTruncated && (
                  <button
                    type="button"
                    className="btn btn-link p-0 ms-1 align-baseline"
                    onClick={() => setCategoryDescExpanded((prev) => !prev)}
                  >
                    {categoryDescExpanded ? t("all_categories.read_less") : t("all_categories.read_more")}
                  </button>
                )}
              </p>
            );
          })()}

          {(() => {
            const thumb = getYoutubeThumbnail(selectedCategoryName?.youtubeUrl);
            if (!thumb) return null;
            return (
              <a
                href={getYoutubeWatchUrl(selectedCategoryName?.youtubeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="d-inline-block mt-3 position-relative"
                style={{ width: 240, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
              >
                <img
                  src={thumb}
                  alt="Category video thumbnail"
                  style={{ width: "100%", height: 135, objectFit: "cover", display: "block" }}
                />
                <span
                  className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
                  style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,0.65)" }}
                >
                  <i className="fa-solid fa-play text-white" style={{ fontSize: 16, marginLeft: 2 }} aria-hidden="true"></i>
                </span>
              </a>
            );
          })()}

          {!currentSlug && (
            <p className="cw-page-header__desc mt-3 mb-0">
              {t("all_categories.choose_a_category_to_view_subcategories_and_businesses")}
            </p>
          )}
          {showListings && (
            <p className="cw-page-header__desc mt-3 mb-0">
              {t("all_categories.registered_partners_in_this_category")}
            </p>
          )}
        </div>
      </section>

      <div className="container cw-section" style={{ paddingTop: "var(--cw-s6)", paddingBottom: "var(--cw-s6)" }}>

        {/* Root categories grid (no slug selected) */}
        {!currentSlug && (
          categories.length === 0 ? (
            <div className="row g-4 mb-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                  <SkeletonCard variant="category" />
                </div>
              ))}
            </div>
          ) : rootCategories.length > 0 ? (
            <div className="row g-4 mb-5">
              {rootCategories.map((cat) => {
                const cardThumb = getYoutubeThumbnail(cat?.youtubeUrl);
                return (
                  <div key={cat._id} className="col-lg-3 col-md-4 col-sm-6">
                    <button
                      type="button"
                      onClick={() => navigate(`/categories/${cat.slug}${location.search}`)}
                      className="cw-card cw-lift cw-category-media-card w-100 border text-start p-0"
                    >
                      {cardThumb ? (
                        <div className="cw-category-media-card__thumb">
                          <img src={cardThumb} alt="" aria-hidden="true" />
                          <span className="cw-category-media-card__play">
                            <i className="fa-solid fa-play" aria-hidden="true"></i>
                          </span>
                        </div>
                      ) : (
                        <div className="icon-box mx-auto mt-4" style={{ width: 64, height: 64 }}>
                          <i className="fa-solid fa-layer-group" style={{ color: "var(--cw-blue-600)", fontSize: 24 }} aria-hidden="true"></i>
                        </div>
                      )}
                      <div className="p-3">
                        <h6 className="fw-bold mb-1">{cat.name.charAt(0).toUpperCase() + cat.name.slice(1).toLowerCase()}</h6>
                        <span className="text-body-secondary small">{t("all_categories.view_subcategories")}</span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="fa-layer-group"
              title={t("all_categories.no_categories_are_available_right_now")}
              description={t("all_categories.no_categories_desc")}
            />
          )
        )}

        {/* Subcategories */}
        {subCategories.length > 0 && (
          <div className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="h4 mb-0">{t("all_categories.subcategories")}</h2>
              <span className="badge rounded-pill" style={{ background: "var(--cw-blue-50)", color: "var(--cw-blue-600)" }}>
                {subCategories.length}
              </span>
            </div>

            <div className="row g-3">
              {subCategories.map((sub) => {
                const rawSubDesc = sub?.description || "";
                const isSubExpanded = expandedSubDescIds.has(sub._id);
                // Two clamped lines fit roughly 150 characters at this width;
                // only offer the toggle when there is genuinely more to reveal.
                const subIsTruncated = rawSubDesc.length > 150;
                const subThumb = getYoutubeThumbnail(sub?.youtubeUrl);

                const toggleSubDesc = (e) => {
                  e.stopPropagation();
                  setExpandedSubDescIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(sub._id)) next.delete(sub._id);
                    else next.add(sub._id);
                    return next;
                  });
                };

                return (
                  <div key={sub._id} className="col-12 col-lg-6">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSubCategoryClick(sub)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSubCategoryClick(sub);
                        }
                      }}
                      className="cw-card cw-lift cw-subcategory-card p-0"
                    >
                      <div className="w-100">
                        <div className="cw-subcategory-row">
                          <span className="cw-subcategory-row__icon">
                            <i className="fa-solid fa-folder-open" aria-hidden="true"></i>
                          </span>

                          {subThumb && (
                            <a
                              href={getYoutubeWatchUrl(sub?.youtubeUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="cw-subcategory-row__thumb"
                            >
                              <img src={subThumb} alt="" aria-hidden="true" />
                              <span className="cw-subcategory-row__play">
                                <i className="fa-solid fa-play" aria-hidden="true"></i>
                              </span>
                            </a>
                          )}

                          <span className="fw-semibold flex-grow-1 text-truncate">
                            {sub.name.charAt(0).toUpperCase() + sub.name.slice(1).toLowerCase()}
                          </span>

                          <i className="fa-solid fa-chevron-right cw-subcategory-row__chevron text-body-secondary" aria-hidden="true"></i>
                        </div>

                        {rawSubDesc && (
                          <div className="px-4 pb-3">
                            <p className={`cw-subcategory-row__desc mb-0${isSubExpanded ? "" : " is-clamped"}`}>
                              {rawSubDesc}
                            </p>
                            {subIsTruncated && (
                              <button
                                type="button"
                                className="cw-subcategory-row__toggle"
                                onClick={toggleSubDesc}
                              >
                                {isSubExpanded ? t("all_categories.read_less") : t("all_categories.read_more")}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Partner listings (category has businesses, no subcategories) */}
        {showListings && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="h4 mb-0">
                {t("all_categories.registered_businesses")} ({data.length})
              </h2>
            </div>

            {loading ? (
              <div className="row g-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="col-12 col-sm-6 col-lg-4">
                    <SkeletonCard variant="business" />
                  </div>
                ))}
              </div>
            ) : data.length === 0 ? (
              <EmptyState
                icon="fa-store-slash"
                title={t("all_categories.no_businesses_in_category")}
                description={t("all_categories.no_businesses_in_category_desc")}
                secondaryAction={{ label: t("all_categories.browse_other_categories"), to: "/categories" }}
              />
            ) : (
              <div className="row g-4">
                {data.map((partner) => (
                  <div key={partner._id} className="col-12 col-sm-6 col-lg-4">
                    <BusinessCard partner={partner} onOpen={handlePartnerClick} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mixed: subcategories + partner listings both present */}
        {showMixed && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="h4 mb-0">
                {t("all_categories.registered_businesses")} ({data.length})
              </h2>
            </div>

            {data.length === 0 ? (
              <EmptyState
                icon="fa-store-slash"
                title={t("all_categories.no_registered_partners_found_in_this_category")}
                description={t("all_categories.no_businesses_in_category_desc")}
              />
            ) : (
              <div className="row g-4">
                {data.map((partner) => (
                  <div key={partner._id} className="col-12 col-sm-6 col-lg-4">
                    <BusinessCard partner={partner} onOpen={handlePartnerClick} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCategories;
