import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../context/ToastContext";

const MyPlan = () => {

    const [partnerPlan, setPartnerPlan] = useState(null);
    const { t } = useTranslation();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get(`/plans/partner-plan`);
                setPartnerPlan(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const openRazorpay = (data) => {
        const order = data.order || data;

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY,
            amount: order.amount,
            currency: order.currency || "INR",
            order_id: order.id,

            handler: async function (response) {
                await API.post("/plans/verify-payment", {
                    ...response,
                    partnerId: partnerPlan?.plan?.partner_id,
                    planId: data.planId || partnerPlan?.plan?.plan_id?._id
                });

                showToast("Payment success", "success");

                window.location.reload(); // IMPORTANT
            }
        };

        new window.Razorpay(options).open();
    };

    const handleRenew = async (planId) => {
        try {
            const res = await API.post("/plans/create-order", { planId });

            openRazorpay({
                order: res.data.order,
                amount: res.data.order?.amount,
                planId
            });
        } catch (error) {
            console.error(error);
        }
    };

    const [showAllHistory, setShowAllHistory] = useState(false);

    const toggleHistory = () => {
        setShowAllHistory(prev => !prev);
    };

    const visibleHistory = showAllHistory
        ? partnerPlan?.plan?.planHistory || []
        : partnerPlan?.plan?.planHistory?.slice(0, 2) || [];

    const statusBadgeClass = partnerPlan?.isExpired
        ? "cw-badge--danger"
        : partnerPlan?.plan?.nextPlan_id
            ? "cw-badge--warning"
            : "cw-badge--success";

    return (
        <div>
            <DashboardPageHeader title={t("my_plan.title")} />
            <p className="text-body-secondary mb-4">{t("my_plan.subtitle")}</p>

            {/* Current plan feature card */}
            <div className="cw-card p-0 overflow-hidden mb-5">
                <div className="p-4 d-flex justify-content-between flex-wrap gap-3" style={{ background: "var(--cw-gradient-hero)", color: "#fff" }}>
                    <div>
                        <h2 className="h4 fw-bold text-white mb-1">
                            {partnerPlan?.plan?.plan_id?.name || "Loading..."}
                        </h2>
                        <p className="mb-0 text-white" style={{ opacity: .9 }}>
                            {partnerPlan?.plan?.plan_id?.price === 0
                                ? "Free"
                                : `${partnerPlan?.plan?.payment_id?.currency === "USD" ? "$" : "₹"}${partnerPlan?.plan?.plan_id?.price ?? "-"}`} / month
                        </p>
                    </div>

                    <div className="text-end">
                        <span className={`badge rounded-pill cw-badge ${statusBadgeClass} mb-2`}>
                            {partnerPlan?.isExpired
                                ? t("my_plan.status.expired")
                                : partnerPlan?.plan?.nextPlan_id
                                    ? t("my_plan.status.upgrading")
                                    : t("my_plan.status.active")}
                        </span>
                        <div className="small text-white" style={{ opacity: .85 }}>
                            {partnerPlan?.daysLeft ?? "-"} {t("my_plan.status.days_left")}
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="cw-meta-tile mb-3">
                                <div className="cw-overline mb-1">{t("my_plan.labels.start_date")}</div>
                                <div className="fw-bold">{formatDate(partnerPlan?.plan?.startDate)}</div>
                            </div>
                            <div className="cw-meta-tile mb-3">
                                <div className="cw-overline mb-1">{t("my_plan.labels.expiry_date")}</div>
                                <div className="fw-bold">{formatDate(partnerPlan?.plan?.expiryDate)}</div>
                            </div>
                            <div className="cw-meta-tile mb-3">
                                <div className="cw-overline mb-1">{t("my_plan.labels.auto_renew")}</div>
                                <div className="fw-bold">{partnerPlan?.plan?.autoRenew ? "Enabled" : "Disabled"}</div>
                            </div>
                            <div className="cw-meta-tile mb-3">
                                <div className="cw-overline mb-1">{t("my_plan.labels.payment_provider")}</div>
                                <div className="fw-bold">{partnerPlan?.plan?.payment_id?.provider || "-"}</div>
                            </div>
                            <div className="cw-meta-tile">
                                <div className="cw-overline mb-1">{t("my_plan.labels.currency")}</div>
                                <div className="fw-bold">{partnerPlan?.plan?.payment_id?.currency || "-"}</div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <h3 className="h6 fw-bold mb-3">{t("my_plan.features.title")}</h3>

                            {partnerPlan?.plan?.plan_id?.features?.length ? (
                                partnerPlan.plan.plan_id.features.map((f, i) => (
                                    <div key={i} className="mb-2">
                                        <i className="fa-solid fa-circle-check me-2" style={{ color: "var(--cw-blue-600)" }} aria-hidden="true"></i>
                                        {f}
                                    </div>
                                ))
                            ) : (
                                <p className="text-body-secondary">{t("my_plan.features.no_features")}</p>
                            )}
                        </div>
                    </div>

                    {partnerPlan?.plan?.nextPlan_id && (
                        <div className="alert alert-warning mt-4 mb-0">
                            <strong>{t("my_plan.pending.text")}</strong>
                        </div>
                    )}

                    <div className="mt-4 d-flex gap-3 flex-wrap">
                        <button type="button" className="nav-btn primary" onClick={() => handleRenew(partnerPlan?.plan?.plan_id?._id)}>
                            {t("my_plan.actions.renew")}
                        </button>
                        <button type="button" className="nav-btn outline">
                            {t("my_plan.actions.upgrade")}
                        </button>
                        <button type="button" className="nav-btn ghost-danger">
                            {t("my_plan.actions.cancel")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Plan history */}
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h2 className="h5 fw-bold mb-1">{t("my_plan.history.title")}</h2>
                        <p className="text-body-secondary small mb-0">{t("my_plan.history.subtitle")}</p>
                    </div>

                    <div className="d-flex gap-2 align-items-center">
                        <span className="badge rounded-pill cw-badge cw-badge--neutral">
                            {partnerPlan?.plan?.planHistory?.length || 0} {t("my_plan.history.records")}
                        </span>

                        <button
                            type="button"
                            className="nav-btn outline"
                            style={{ height: 32, fontSize: 12 }}
                            onClick={toggleHistory}
                        >
                            {showAllHistory
                                ? t("my_plan.history.show_less")
                                : t("my_plan.history.show_all")}
                        </button>
                    </div>
                </div>

                {visibleHistory.length ? (
                    <div className="row g-3">
                        {visibleHistory.map((item, index) => (
                            <div className="col-12" key={index}>
                                <div className="cw-card">
                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                                        <div className="d-flex gap-3">
                                            <span className="cw-info-icon-chip" style={{ width: 48, height: 48, minWidth: 48, fontSize: 18 }}>
                                                <i className="fa-solid fa-crown" aria-hidden="true"></i>
                                            </span>

                                            <div>
                                                <h4 className="h6 fw-bold mb-0">
                                                    {item.plan_id?.name || "Plan"}
                                                </h4>

                                                <div className="mt-1 mb-3 fw-semibold fs-5">
                                                    {item.plan_id?.price === 0
                                                        ? "Free"
                                                        : item.plan_id?.price != null
                                                            ? `${item.plan_id?.currency === "USD" ? "$" : "₹"}${item.plan_id.price}`
                                                            : "N/A"}
                                                </div>

                                                <div className="row g-3">
                                                    <div className="col-sm-4">
                                                        <div className="cw-overline mb-1">{t("my_plan.history.started")}</div>
                                                        <div>{formatDate(item.startDate)}</div>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <div className="cw-overline mb-1">{t("my_plan.history.expired")}</div>
                                                        <div>{formatDate(item.expiryDate)}</div>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <div className="cw-overline mb-1">{t("my_plan.history.ended_at")}</div>
                                                        <div>{formatDate(item.endedAt)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <span className="badge rounded-pill cw-badge cw-badge--danger text-capitalize">
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="cw-card">
                        <EmptyState
                            icon="fa-clock-rotate-left"
                            title={t("my_plan.history.no_history")}
                            description={t("my_plan.history.empty_text")}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPlan;
