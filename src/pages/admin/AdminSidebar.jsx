import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../assets/headerLogo.png'
import Sidebar from '../../components/ui/Sidebar'

export default function AdminSidebar() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const items = [
        { to: "/admin/dashboard", icon: "fa-gauge-high", label: "Dashboard" },
        { to: "/admin/users", icon: "fa-users", label: "Users" },
        { to: "/admin/partners", icon: "fa-handshake", label: "Partners" },
        { to: "/admin/analytics", icon: "fa-table-cells-large", label: "Analytics" },
        { to: "/admin/subcategories", icon: "fa-layer-group", label: "Subcategories" },
        {
            icon: "fa-table-cells-large",
            label: "Categories",
            children: [
                { to: "/admin/categories/all", label: "All Categories" },
                { to: "/admin/categories/add", label: "Add Category" },
                { to: "/admin/categories-tree", label: "Category Tree" },
            ],
        },
        {
            icon: "fa-layer-group",
            label: "Plans",
            children: [
                { to: "/admin/plans", label: "All Plans" },
                { to: "/admin/plans/add", label: "Add Plan" },
            ],
        },
        { to: "/admin/term-and-condition", icon: "fa-table-cells-large", label: "Term and Condition" },
    ];

    return (
        <>
            <div className="d-none d-md-block cw-sidebar" style={{ position: "sticky", top: 0, height: "100vh" }}>
                <Sidebar
                    logo={Logo}
                    panelTitle="Admin Panel"
                    items={items}
                    onLogout={() => { logout(); navigate("/admin/login"); }}
                    logoutLabel="Logout"
                />
            </div>

            <div className="offcanvas offcanvas-start d-md-none cw-sidebar" id="mobileSidebar">
                <div className="offcanvas-header border-bottom border-secondary">
                    <h5 className="text-white mb-0">Admin Panel</h5>
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
                        panelTitle="Admin Panel"
                        items={items}
                        onLogout={() => { logout(); navigate("/admin/login"); }}
                        logoutLabel="Logout"
                    />
                </div>
            </div>
        </>
    )
}
