import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <>
      {/* Mobile Topbar */}
      <div className="d-md-none cw-dashboard-topbar">
        <span style={{ fontWeight: 600 }}>Admin Panel</span>
        <button
          className="btn btn-outline-light btn-sm"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-label="Open menu"
        >
          <i className="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
      </div>

      <div className="cw-dashboard-layout">
        <AdminSidebar />

        <div className="cw-dashboard-content">
          {children}
        </div>
      </div>
    </>
  );
}
