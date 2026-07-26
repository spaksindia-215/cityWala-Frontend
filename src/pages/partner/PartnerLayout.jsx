import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/headerLogo.png";
import Sidebar from "../../components/ui/Sidebar";

export default function PartnerLayout() {
  const { logout, navigate } = useAuth();
  const { t } = useTranslation();

  const items = [
    { to: "/partner/dashboard", icon: "fa-gauge", label: t("partner_dashboard.sidebar.dashboard") },
    { to: "/partner/add-profile", icon: "fa-user-plus", label: t("partner_dashboard.sidebar.add_profile") },
    {
      icon: "fa-crown",
      label: t("partner_dashboard.sidebar.plans.title"),
      children: [
        { to: "/partner/plan", label: t("partner_dashboard.sidebar.plans.all_plans") },
        { to: "/partner/my-plan", label: t("partner_dashboard.sidebar.plans.my_plan") },
      ],
    },
  ];

  return (
    <>
      {/* MOBILE TOPBAR */}
      <div className="d-lg-none cw-dashboard-topbar">
        <div className="d-flex align-items-center gap-2">
          <div className="cw-dashboard-topbar__mark">P</div>
          <span style={{ fontWeight: 600 }}>{t("partner_layout.mobile_title")}</span>
        </div>

        <button
          className="btn btn-outline-light btn-sm"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-label={t("partner_layout.menu")}
        >
          <i className="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
      </div>

      <div className="cw-dashboard-layout">
        {/* DESKTOP SIDEBAR */}
        <div className="d-none d-lg-block cw-sidebar">
          <Sidebar
            logo={Logo}
            panelTitle={t("partner_dashboard.sidebar.panel_title")}
            items={items}
            onLogout={() => { logout(); navigate("/"); }}
            logoutLabel={t("partner_dashboard.sidebar.logout")}
          />
        </div>

        {/* MOBILE OFFCANVAS */}
        <div className="offcanvas offcanvas-start cw-sidebar" id="mobileSidebar">
          <div className="offcanvas-header border-bottom border-secondary">
            <h5 className="mb-0 text-white">{t("partner_layout.menu")}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body p-0">
            <Sidebar
              logo={Logo}
              panelTitle={t("partner_dashboard.sidebar.panel_title")}
              items={items}
              onLogout={() => { logout(); navigate("/"); }}
              logoutLabel={t("partner_dashboard.sidebar.logout")}
            />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="cw-dashboard-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
