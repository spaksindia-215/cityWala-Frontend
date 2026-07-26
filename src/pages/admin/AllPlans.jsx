import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Pagination from "../../components/Pagination";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";
import EmptyState from "../../components/ui/EmptyState";

const AllPlans = () => {

    const [plans, setPlans] = useState([]);
    const navigate = useNavigate()
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subSubCategories, setSubSubCategories] = useState([]);

    const [filters, setFilters] = useState({
        search: "",
        category_id: "",
        subCategory_id: "",
        sub_subCategory_id: "",
    });

    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({});
    const startIndex = (page - 1) * limit;

    const getCategories = async () => {
        try {
            const res = await API.get("/categories?parentId=null");
            const sorted = (res.data.categories || []).sort((a, b) =>
                (a.name || "").localeCompare(b.name || "")
            );
            setCategories(sorted);
        } catch (error) {
            console.error(error);
        }
    };

    const getSubCategories = async (categoryId) => {
        try {
            if (!categoryId) {
                setSubCategories([]);
                return;
            }
            const res = await API.get(`/categories/${categoryId}/popular-sub`);
            const sorted = (res.data || []).sort((a, b) =>
                (a.name || "").localeCompare(b.name || "")
            );
            setSubCategories(sorted);
        } catch (error) {
            console.error(error);
        }
    };

    const getSubSubCategories = async (subCategoryId) => {
        try {
            if (!subCategoryId) {
                setSubSubCategories([]);
                return;
            }
            const res = await API.get(`/categories/${subCategoryId}/popular-sub`);
            const sorted = (res.data || []).sort((a, b) =>
                (a.name || "").localeCompare(b.name || "")
            );
            setSubSubCategories(sorted);
        } catch (error) {
            console.error(error);
        }
    };

    const getPlans = async () => {
        try {
            setLoading(true);

            let query = [`page=${page}`, `limit=${limit}`];

            if (filters.search) {
                query.push(`search=${encodeURIComponent(filters.search)}`);
            }
            if (filters.category_id) {
                query.push(`category_id=${filters.category_id}`);
            }
            if (filters.subCategory_id) {
                query.push(`subCategory_id=${filters.subCategory_id}`);
            }
            if (filters.sub_subCategory_id) {
                query.push(`sub_subCategory_id=${filters.sub_subCategory_id}`);
            }

            const queryString = query.join("&");
            const res = await API.get(`/plans?${queryString}`);

            setPlans(res.data.plans || []);
            setPagination(res.data.pagination || {});
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === "category_id") {
            setFilters({
                ...filters,
                category_id: value,
                subCategory_id: "",
                sub_subCategory_id: "",
            });
            setSubSubCategories([]);
            getSubCategories(value);
            return;
        }

        if (name === "subCategory_id") {
            setFilters({
                ...filters,
                subCategory_id: value,
                sub_subCategory_id: "",
            });
            getSubSubCategories(value);
            return;
        }

        setFilters({ ...filters, [name]: value });
    };

    const resetFilters = () => {
        setFilters({
            search: "",
            category_id: "",
            subCategory_id: "",
            sub_subCategory_id: "",
        });
        setSubCategories([]);
        setSubSubCategories([]);
    };

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        getPlans();
    }, [page, limit, filters]);

    const handleEdit = (plan) => {
        navigate(`/admin/plans/edit/${plan._id}`)
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this plan?");
        if (!confirmDelete) return;

        try {
            await API.delete(`/plans/${id}`);
            setPlans((prev) => prev.filter((p) => p._id !== id));
            alert("Plan deleted successfully");
        } catch (error) {
            console.error(error);
            alert("Delete failed");
        }
    };

    return (
        <AdminLayout>
            <DashboardPageHeader
                title="All Plans"
                action={
                    <button type="button" className="nav-btn primary" onClick={() => navigate("/admin/plans/add")}>
                        Add Plan
                    </button>
                }
            />
            <p className="text-body-secondary mb-4">Manage business plans</p>

            <div className="cw-card mb-4">
                <div className="row g-3">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Search</label>
                        <input
                            type="text"
                            name="search"
                            placeholder="Search Plan..."
                            value={filters.search}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Category</label>
                        <select name="category_id" value={filters.category_id} onChange={handleChange} className="form-select">
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Sub Category</label>
                        <select name="subCategory_id" value={filters.subCategory_id} onChange={handleChange} className="form-select">
                            <option value="">All Sub Categories</option>
                            {subCategories.map((sub) => (
                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Sub Sub Category</label>
                        <select name="sub_subCategory_id" value={filters.sub_subCategory_id} onChange={handleChange} className="form-select">
                            <option value="">All Sub Sub Categories</option>
                            {subSubCategories.map((sub) => (
                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                    <button type="button" className="nav-btn outline" onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>
            </div>

            <div className="cw-card p-0 overflow-hidden">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : plans.length === 0 ? (
                    <EmptyState icon="fa-layer-group" title="No Plans Found" />
                ) : (
                    <div className="table-responsive">
                        <table className="table cw-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Plan</th>
                                    <th>Price</th>
                                    <th>Duration</th>
                                    <th>Category</th>
                                    <th>Sub Category</th>
                                    <th>Sub Sub Category</th>
                                    <th>Features</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {plans.map((plan, index) => (
                                    <tr key={plan._id}>
                                        <td>{startIndex + index + 1}</td>

                                        <td>
                                            <span className="badge rounded-pill cw-badge cw-badge--info">
                                                {plan.name}
                                            </span>
                                        </td>

                                        <td className="fw-bold" style={{ color: "var(--cw-success)" }}>
                                            {plan.price === 0
                                                ? "Free"
                                                : `${plan.currency === "USD" ? "$" : "₹"} ${plan.price}`}
                                        </td>

                                        <td>{plan.duration === 12 ? "1 Year" : `${plan.duration} Months`}</td>
                                        <td>{plan?.category_id?.name || "N/A"}</td>
                                        <td>{plan?.subCategory_id?.name || "N/A"}</td>
                                        <td>{plan?.sub_subCategory_id?.name || "N/A"}</td>

                                        <td>
                                            <ul className="mb-0 ps-3">
                                                {plan.features?.map((f, i) => (
                                                    <li key={i}>{f}</li>
                                                ))}
                                            </ul>
                                        </td>

                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="cw-icon-btn"
                                                    aria-label="Edit plan"
                                                    onClick={() => handleEdit(plan)}
                                                >
                                                    <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cw-icon-btn"
                                                    aria-label="Delete plan"
                                                    onClick={() => handleDelete(plan._id)}
                                                >
                                                    <i className="fa-solid fa-trash" aria-hidden="true"></i>
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
    );

};

export default AllPlans;
