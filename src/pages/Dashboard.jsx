import { useTranslation } from "react-i18next";
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import StatCard from '../components/ui/StatCard'

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth()

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-lg-3">
          <div className="cw-card text-center">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--cw-blue-600)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <h2 className="h5 fw-bold mb-0">{user?.name}</h2>
            <p className="text-body-secondary" style={{ fontSize: 13 }}>{user?.email || user?.mobile}</p>
            <hr />
            <div className="d-grid gap-2">
              <Link to="/matrimonial" className="nav-btn outline">{t("user_dashboard.browse_matrimonial")}</Link>
              <Link to="/plan" className="nav-btn outline">{t("user_dashboard.view_plans")}</Link>
              <button onClick={logout} className="nav-btn ghost-danger">{t("user_dashboard.logout")}</button>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <h1 className="h3 fw-bold mb-4">{t("user_dashboard.welcome", { name: user?.name })}</h1>

          <div className="row g-3 mb-4">
            {[
              { label: t("user_dashboard.stats.matrimonial_profiles"), val: 0, icon: 'fa-heart', tint: 'blue' },
              { label: t("user_dashboard.stats.saved_profiles"), val: 0, icon: 'fa-bookmark', tint: 'orange' },
              { label: t("user_dashboard.stats.messages"), val: 0, icon: 'fa-envelope', tint: 'warning' },
            ].map(s => (
              <div key={s.label} className="col-md-4">
                <StatCard icon={s.icon} tint={s.tint} value={s.val} label={s.label} />
              </div>
            ))}
          </div>

          <div className="cw-card">
            <h2 className="h5 fw-bold mb-3">{t("user_dashboard.quick_links")}</h2>
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <Link to="/matrimonial" className="cw-quick-link">
                  <i className="fa-solid fa-heart" style={{ color: 'var(--cw-blue-600)' }} aria-hidden="true"></i>
                  {t("user_dashboard.matrimonial")}
                </Link>
              </div>
              <div className="col-6 col-md-3">
                <Link to="/categories" className="cw-quick-link">
                  <i className="fa-solid fa-th-large" style={{ color: 'var(--cw-orange-500)' }} aria-hidden="true"></i>
                  {t("user_dashboard.categories")}
                </Link>
              </div>
              <div className="col-6 col-md-3">
                <Link to="/plan" className="cw-quick-link">
                  <i className="fa-solid fa-crown" style={{ color: 'var(--cw-warning)' }} aria-hidden="true"></i>
                  {t("user_dashboard.plans")}
                </Link>
              </div>
              <div className="col-6 col-md-3">
                <Link to="/partner/register" className="cw-quick-link">
                  <i className="fa-solid fa-handshake" style={{ color: 'var(--cw-success)' }} aria-hidden="true"></i>
                  {t("user_dashboard.be_partner")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
