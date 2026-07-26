import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../api/axios';
import Seo from '../seo/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import EmptyState from '../components/ui/EmptyState';
import { localBusinessSchema, webPageSchema, graph } from '../seo/schema';

export default function PartnerDetails() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sticky mobile Call/Email bar shares bottom-right screen space with the
    // global WhatsApp/call FAB stack — nudge the FABs up while this page is mounted.
    useEffect(() => {
        document.body.classList.add('has-sticky-profile-actions');
        return () => document.body.classList.remove('has-sticky-profile-actions');
    }, []);

    useEffect(() => {
        const fetchPartner = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/partner/${id}`);
                setPartner(res.data.partner);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load partner details');
                setPartner(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPartner();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-12">
                        <div className="cw-card" style={{ height: 220 }}>
                            <div className="cw-skeleton cw-skeleton--avatar mb-3" />
                            <div className="cw-skeleton cw-skeleton--line" style={{ width: "40%" }} />
                            <div className="cw-skeleton cw-skeleton--line" style={{ width: "25%" }} />
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="cw-card" style={{ height: 180 }}>
                            <div className="cw-skeleton cw-skeleton--line" style={{ width: "60%" }} />
                            <div className="cw-skeleton cw-skeleton--line" style={{ width: "80%" }} />
                            <div className="cw-skeleton cw-skeleton--line" style={{ width: "50%" }} />
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="cw-card" style={{ height: 180 }}>
                            <div className="cw-skeleton cw-skeleton--line" style={{ width: "30%" }} />
                            <div className="cw-skeleton cw-skeleton--line" style={{ width: "90%" }} />
                            <div className="cw-skeleton cw-skeleton--line" style={{ width: "70%" }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="cw-card">
                    <EmptyState
                        icon="fa-triangle-exclamation"
                        title={t("error")}
                        description={error}
                        primaryAction={{ label: t("go_back"), onClick: () => navigate(-1) }}
                    />
                </div>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="container py-5">
                <Seo
                    title={t("partner_information_not_available")}
                    description="This business profile is unavailable or has been removed."
                    path={`/partner/details/${id}`}
                    noindex
                />
                <div className="cw-card">
                    <EmptyState
                        icon="fa-store-slash"
                        title={t("partner_information_not_available")}
                        primaryAction={{ label: t("go_back"), onClick: () => navigate(-1) }}
                    />
                </div>
            </div>
        );
    }

    const businessName = partner.company_name || partner.name;
    const businessDescription =
        partner.company_short_desc ||
        `View contact details, address, and business information for ${businessName} on CityWala.`;
    const detailPath = `/partner/details/${id}`;
    const isVerified = partner.status === 'approved';
    const initial = businessName?.charAt(0)?.toUpperCase() || "?";
    const breadcrumbItems = [
        ...(partner.category_id?.slug
            ? [{ name: partner.category_id.name, path: `/categories/${partner.category_id.slug}` }]
            : []),
        ...(partner.subcategory_id?.slug && partner.category_id?.slug
            ? [{ name: partner.subcategory_id.name, path: `/categories/${partner.category_id.slug}/${partner.subcategory_id.slug}` }]
            : []),
        { name: businessName },
    ];

    return (
        <div className="container py-4 py-md-5 cw-partner-details">
            <Seo
                title={businessName}
                description={businessDescription}
                path={detailPath}
                image={partner.company_logo || undefined}
                imageAlt={businessName}
                type="business.business"
                jsonLd={graph(
                    localBusinessSchema(partner, detailPath),
                    webPageSchema({ path: detailPath, name: businessName, description: businessDescription })
                )}
            />

            {/* Top Navigation & Back Button */}
            <div className="mb-4">
                <Breadcrumbs items={breadcrumbItems} />
                <button
                    type="button"
                    className="nav-btn outline"
                    style={{ height: 36 }}
                    onClick={() => navigate(-1)}
                >
                    <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
                    {t("go_back")}
                </button>
            </div>

            {/* Profile Hero Header Card */}
            <div className="cw-card p-0 overflow-hidden mb-4">
                <div className="cw-profile-cover" aria-hidden="true">
                    {isVerified && (
                        <span className="badge rounded-pill cw-badge cw-badge--success position-absolute top-0 end-0 m-3">
                            <i className="fa-solid fa-circle-check me-1" aria-hidden="true"></i>
                            {t("verified")}
                        </span>
                    )}
                </div>

                <div className="px-4 pb-4 pt-0 position-relative">
                    <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end text-center text-md-start gap-4 cw-profile-header">

                        {/* Logo frame with monogram fallback */}
                        <div className="cw-profile-logo">
                            {partner.company_logo ? (
                                <img
                                    src={partner.company_logo}
                                    alt=""
                                    aria-hidden="true"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <span aria-hidden="true">{initial}</span>
                            )}
                        </div>

                        <div className="flex-grow-1 mt-2 mt-md-0">
                            <h1 className="fw-extrabold mb-1 fs-3">{businessName}</h1>
                            <p className="text-body-secondary mb-0 fs-6 fw-medium">
                                {partner.company_short_desc || t("business_overview")}
                            </p>
                        </div>

                        {/* Quick Actions (Call / Email) — sticky bottom bar on mobile */}
                        <div className="cw-profile-actions d-flex gap-2 w-100 w-md-auto mt-3 mt-md-0 justify-content-center">
                            <a href={`tel:${partner.mobile}`} className="nav-btn primary flex-grow-1 flex-md-grow-0">
                                <i className="fa-solid fa-phone" aria-hidden="true"></i>{t("call_partner")}
                            </a>
                            <a href={`mailto:${partner.email}`} className="nav-btn outline flex-grow-1 flex-md-grow-0">
                                <i className="fa-solid fa-envelope" aria-hidden="true"></i>{t("email")}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Details & Overview */}
            <div className="row g-4">
                {/* Left Side Info Panel */}
                <div className="col-lg-4">
                    <div className="cw-card mb-4">
                        <h2 className="cw-overline mb-3">{t("contact_details")}</h2>

                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-start gap-3">
                                <span className="cw-info-icon-chip">
                                    <i className="fa-solid fa-user" aria-hidden="true"></i>
                                </span>
                                <div>
                                    <div className="cw-overline mb-1">{t("contact_person")}</div>
                                    <div className="fw-bold">{partner.name || "—"}</div>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3">
                                <span className="cw-info-icon-chip">
                                    <i className="fa-solid fa-envelope" aria-hidden="true"></i>
                                </span>
                                <div className="overflow-hidden">
                                    <div className="cw-overline mb-1">{t("official_email")}</div>
                                    <a href={`mailto:${partner.email}`} className="fw-bold text-break d-block">
                                        {partner.email}
                                    </a>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3">
                                <span className="cw-info-icon-chip">
                                    <i className="fa-solid fa-phone" aria-hidden="true"></i>
                                </span>
                                <div>
                                    <div className="cw-overline mb-1">{t("mobile_number")}</div>
                                    <a href={`tel:${partner.mobile}`} className="fw-bold">
                                        {partner.country_code || '+91'} {partner.mobile}
                                    </a>
                                </div>
                            </div>

                            {partner.company_url && (
                                <div className="d-flex align-items-start gap-3">
                                    <span className="cw-info-icon-chip">
                                        <i className="fa-solid fa-globe" aria-hidden="true"></i>
                                    </span>
                                    <div className="overflow-hidden">
                                        <div className="cw-overline mb-1">{t("company_website")}</div>
                                        <a
                                            href={
                                                partner.company_url.startsWith("http")
                                                    ? partner.company_url
                                                    : `https://${partner.company_url}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="fw-bold text-truncate d-block"
                                        >
                                            {partner.company_url.replace(/https?:\/\/(www\.)?/, "")}
                                            <i className="fa-solid fa-arrow-up-right-from-square ms-1" style={{ fontSize: 11 }} aria-hidden="true"></i>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side Info Panel */}
                <div className="col-lg-8">
                    <div className="cw-card h-100">
                        <h2 className="h5 mb-4 pb-2 border-bottom">{t("business_overview")}</h2>

                        {partner.company_short_desc && (
                            <div className="mb-4">
                                <h3 className="h6 mb-2">{t("about_company")}</h3>
                                <p className="mb-0" style={{ lineHeight: 1.8, color: 'var(--cw-gray-700)' }}>
                                    {partner.company_short_desc}
                                </p>
                            </div>
                        )}

                        <div className="row g-3">
                            <div className="col-sm-6">
                                <div className="cw-meta-tile">
                                    <div className="cw-overline mb-1">{t("full_registered_name")}</div>
                                    <div className="fw-bold">{partner.company_name || "—"}</div>
                                </div>
                            </div>

                            <div className="col-sm-6">
                                <div className="cw-meta-tile">
                                    <div className="cw-overline mb-1">{t("postal_zip_code")}</div>
                                    <div className="fw-bold">{partner.postal_code || "—"}</div>
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="cw-meta-tile">
                                    <div className="cw-overline mb-1">{t("office_address")}</div>
                                    <div className="fw-semibold">
                                        <i className="fa-solid fa-location-dot me-2" style={{ color: 'var(--cw-blue-600)' }} aria-hidden="true"></i>
                                        {partner.address || "No address provided"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
