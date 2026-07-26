import { useTranslation } from "react-i18next";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";
import EmptyState from "../../components/ui/EmptyState";

const PaymentHistory = () => {
    const { t } = useTranslation();

    const payments = [
        {
            id: "TXN001",
            plan: "Diamond",
            amount: 999,
            status: "paid",
            date: "25 May 2026",
            method: "Razorpay"
        },
        {
            id: "TXN002",
            plan: "Ruby",
            amount: 499,
            status: "pending",
            date: "10 June 2026",
            method: "PayPal"
        },
        {
            id: "TXN003",
            plan: "Emerald",
            amount: 1999,
            status: "failed",
            date: "15 June 2026",
            method: "Razorpay"
        }
    ];

    const getBadgeClass = (status) => {
        if (status === "paid") return "cw-badge--success";
        if (status === "pending") return "cw-badge--warning";
        if (status === "failed") return "cw-badge--danger";
        return "cw-badge--neutral";
    };

    return (
        <div>
            <DashboardPageHeader title={t("payment_history.title")} />
            <p className="text-body-secondary mb-4">{t("payment_history.subtitle")}</p>

            {payments.length === 0 ? (
                <div className="cw-card">
                    <EmptyState
                        icon="fa-receipt"
                        title={t("payment_history.empty_title")}
                        description={t("payment_history.empty_desc")}
                    />
                </div>
            ) : (
                <div className="cw-card cw-card--flat p-0">
                    <div className="table-responsive">
                        <table className="table cw-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>{t("payment_history.transaction_id")}</th>
                                    <th>{t("payment_history.plan")}</th>
                                    <th className="text-end">{t("payment_history.amount")}</th>
                                    <th>{t("payment_history.status")}</th>
                                    <th>{t("payment_history.method")}</th>
                                    <th>{t("payment_history.date")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.plan}</td>
                                        <td className="text-end">₹{p.amount}</td>
                                        <td>
                                            <span className={`badge rounded-pill cw-badge ${getBadgeClass(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>{p.method}</td>
                                        <td>{p.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
