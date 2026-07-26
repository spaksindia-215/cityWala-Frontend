import API from "../../api/axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { handleDelete } from "../../utils/CrudAction";
import AdminLayout from "./AdminLayout";
import Pagination from "../../components/Pagination";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminAllCategories() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [limit, setLimit] = useState(10)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({});
    const startIndex = (page - 1) * limit;

    const navigate = useNavigate();

    const loadCats = async () => {
        setLoading(true)
        try {
            const res = await API.get(`/categories?page=${page}&limit=${limit}&parentId=null`);
            const sortedCategories = (res.data.categories || []).sort((a, b) =>
              (a.name || '').localeCompare(b.name || '')
            );
            setCategories(sortedCategories);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCats();
    }, [page, limit])

    return (
        <AdminLayout>
            <DashboardPageHeader
                title="All Categories"
                action={
                    <button type="button" className="nav-btn primary" onClick={() => navigate('/admin/categories/add')}>
                        <i className="fa-solid fa-plus" aria-hidden="true"></i>
                        Add Category
                    </button>
                }
            />
            <p className="text-body-secondary mb-4">Manage all categories here</p>

            <div className="cw-card p-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table cw-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Image</th>
                                <th>Category</th>
                                <th>Full Path</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        Loading categories...
                                    </td>
                                </tr>
                            ) : categories.length > 0 ? (
                                categories.map((cat, ind) => (
                                    <tr key={cat._id}>
                                        <td>{startIndex + ind + 1}</td>

                                        <td>
                                            {cat.image ? (
                                                <img
                                                    src={cat.image}
                                                    alt=""
                                                    aria-hidden="true"
                                                    style={{
                                                        width: 48, height: 48,
                                                        borderRadius: "var(--cw-r-md)",
                                                        objectFit: "cover",
                                                        border: "1px solid var(--cw-gray-200)",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="d-flex justify-content-center align-items-center"
                                                    style={{
                                                        width: 48, height: 48,
                                                        borderRadius: "var(--cw-r-md)",
                                                        background: "var(--cw-gray-100)",
                                                        fontSize: 11,
                                                        color: "var(--cw-gray-500)",
                                                    }}
                                                >
                                                    No Img
                                                </div>
                                            )}
                                        </td>

                                        <td className="fw-semibold">{cat.name}</td>
                                        <td className="text-body-secondary" style={{ fontSize: 14 }}>{cat.slug}</td>

                                        <td>
                                            <span className={`badge rounded-pill cw-badge ${cat.status ? "cw-badge--success" : "cw-badge--danger"}`}>
                                                {cat.status ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="cw-icon-btn"
                                                    aria-label="Edit category"
                                                    onClick={() => navigate(`/admin/categories/edit/${cat._id}`)}
                                                >
                                                    <CiEdit />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="cw-icon-btn"
                                                    aria-label="Delete category"
                                                    onClick={() => handleDelete({
                                                        id: cat._id,
                                                        route: "categories",
                                                        loadData: loadCats,
                                                    })}
                                                >
                                                    <FaRegTrashAlt />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-0">
                                        <EmptyState icon="fa-layer-group" title="No categories found" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                page={page}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setPage}
                limit={limit}
                setLimit={setLimit}
                setPagination={setPagination}
            />
        </AdminLayout>
    )
}
