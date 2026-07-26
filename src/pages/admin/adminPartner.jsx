import API from "../../api/axios";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { handleDelete } from "../../utils/CrudAction";
import AdminLayout from "./AdminLayout";
import Pagination from "../../components/Pagination";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";
import EmptyState from "../../components/ui/EmptyState";

export function AdminPartner() {

  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [limit, setLimit] = useState(10)

  const startIndex = (page - 1) * limit;

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);

        const res = await API.get(
          `/partner/all?page=${page}&limit=${limit}`
        );

        setPartners(res.data.partners || []);
        setPagination(res.data.pagination);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [page, limit]);

  const statusBadgeClass = (status) => {
    if (status === "approved") return "cw-badge--success";
    if (status === "pending") return "cw-badge--warning";
    if (status === "suspended") return "cw-badge--danger";
    if (status === "rejected") return "cw-badge--neutral";
    return "cw-badge--neutral";
  };

  return (
    <AdminLayout>
      <DashboardPageHeader
        title="Partner Management"
        action={
          <div className="cw-card cw-card--flat py-2 px-3">
            <span className="cw-overline d-block">Total Partners</span>
            <span className="h5 fw-bold mb-0">{pagination?.total || partners.length}</span>
          </div>
        }
      />
      <p className="text-body-secondary mb-4">Manage all registered partners</p>

      <div className="cw-card p-0 overflow-hidden">
        <div className="px-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-3" style={{ background: "var(--cw-gradient-hero)", color: "#fff" }}>
          <div>
            <h2 className="h6 fw-bold mb-1 text-white">Partners List</h2>
            <p className="mb-0" style={{ fontSize: 13, opacity: .85 }}>Control and manage partner accounts</p>
          </div>
          <div className="px-3 py-2 rounded-pill" style={{ background: "rgba(255,255,255,.15)", fontSize: 13 }}>
            {partners.length} Records
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="text-body-secondary mt-3 mb-0">Loading partners...</p>
          </div>
        ) : partners.length === 0 ? (
          <EmptyState icon="fa-folder-open" title="No partners found" />
        ) : (
          <div className="table-responsive">
            <table className="table cw-table align-middle mb-0">
              <thead>
                <tr>
                  <th>S no</th>
                  <th>Partner</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Joined</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {partners.map((u, i) => (
                  <tr key={u._id}>
                    <td className="fw-semibold text-body-secondary">{startIndex + i + 1}</td>

                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: "var(--cw-blue-600)", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 16,
                        }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">{u.name}</div>
                          <small className="text-body-secondary">ID: {u._id.slice(-6)}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="small fw-medium">{u.email}</div>
                      <div className="small text-body-secondary">{u.mobile || "—"}</div>
                    </td>

                    <td>
                      <span className={`badge rounded-pill cw-badge ${statusBadgeClass(u.status)} text-capitalize`}>
                        {u.status || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span className="badge rounded-pill cw-badge cw-badge--info">
                        {u.plan || "No Plan"}
                      </span>
                    </td>

                    <td>
                      <span className="badge rounded-pill cw-badge cw-badge--neutral">
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <button
                          type="button"
                          className="nav-btn outline"
                          style={{ height: 32, fontSize: 12 }}
                          onClick={async () => {
                            try {
                              let nextStatus = "approved";

                              if (u.status === "approved") {
                                nextStatus = "suspended";
                              } else if (u.status === "suspended") {
                                nextStatus = "approved";
                              } else if (u.status === "pending") {
                                nextStatus = "approved";
                              }

                              const confirmResult = window.confirm(
                                `Are you sure you want to ${nextStatus === "approved" ? "approve" : nextStatus === "suspended" ? "suspend" : "update"} this partner?`
                              );

                              if (!confirmResult) return;

                              const res = await API.put(`/partner/${u._id}`, { status: nextStatus });

                              setPartners(prev =>
                                prev.map(p =>
                                  p._id === u._id
                                    ? { ...p, status: res.data.partner?.status || nextStatus }
                                    : p
                                )
                              );
                            } catch (err) {
                              console.error(err);
                              alert(err.response?.data?.message || "Status update failed");
                            }
                          }}
                        >
                          {u.status === "approved" ? "Block" : u.status === "suspended" ? "Unblock" : "Approve"}
                        </button>

                        <button
                          type="button"
                          className="cw-icon-btn"
                          aria-label="Delete partner"
                          onClick={() =>
                            handleDelete({
                              id: u._id,
                              route: `partner`,
                              onSuccess: () => setPartners(partners.filter(p => p._id !== u._id)),
                              alertMessage: "Partner deleted",
                            })
                          }
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={pagination?.totalPages || 1}
        onPageChange={setPage}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
      />
    </AdminLayout>
  )
}
