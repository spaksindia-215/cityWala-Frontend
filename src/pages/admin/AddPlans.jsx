import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";
import SectionHeader from "../../components/ui/SectionHeader";

const AddPlans = () => {

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        currency: "INR",
        category_id: "",
        subCategory_id: "",
        sub_subCategory_id: "",
        duration: "",
        features: [""]
    });

    const [sub_category, setSub_category] = useState([]);
    const [sub_subCategory, setSub_subCategory] = useState([]);
    const { id } = useParams();

    const isEdit = Boolean(id);

    const fetchSinglePlan = async () => {
        try {
            const res = await API.get(`/plans/${id}`);
            const plan = res.data.plan;
            setFormData({
                name: plan.name || "",
                price: plan.price ?? "",
                currency: plan.currency || "INR",
                category_id: plan.category_id?._id || plan.category_id || "",
                subCategory_id: plan.subCategory_id?._id || plan.subCategory_id || "",
                sub_subCategory_id: plan.sub_subCategory_id?._id || plan.sub_subCategory_id || "",
                duration: plan.duration || "",
                features: plan.features || [""]
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isEdit) {
            fetchSinglePlan();
        }
    }, [id]);

    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);

    const getCategories = async () => {
        try {
            const res = await API.get("/categories");
            const allCats = res.data.categories || [];
            setAllCategories(allCats);
            const rootCats = allCats
              .filter((cat) => !cat.parentId)
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setCategories(rootCats);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        if (!formData.category_id) {
            setSub_category([]);
            setSub_subCategory([]);
            return;
        }

        const filteredSubCats = allCategories
          .filter((cat) => cat.parentId === formData.category_id)
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        setSub_category(filteredSubCats);
    }, [allCategories, formData.category_id]);

    useEffect(() => {
        if (!formData.subCategory_id) {
            setSub_subCategory([]);
            return;
        }

        const filteredSubSubCats = allCategories
          .filter((cat) => cat.parentId === formData.subCategory_id)
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        setSub_subCategory(filteredSubSubCats);
    }, [allCategories, formData.subCategory_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextFormData = { ...formData, [name]: value };

        if (name === "category_id") {
            nextFormData.subCategory_id = "";
            nextFormData.sub_subCategory_id = "";
        }

        if (name === "subCategory_id") {
            nextFormData.sub_subCategory_id = "";
        }

        if (name === "name" && value === "Free") {
            nextFormData.price = 0;
        }

        setFormData(nextFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (
                formData.category_id === formData.subCategory_id ||
                formData.subCategory_id === formData.sub_subCategory_id ||
                formData.category_id === formData.sub_subCategory_id
            ) {
                return alert("Category hierarchy cannot be same");
            }

            if (isEdit) {
                await API.put(`/plans/${id}`, formData);
                alert("Plan Updated");
            } else {
                await API.post("/plans/create", formData);
                alert("Plan Added");
            }

            setFormData({
                name: "",
                price: "",
                currency: "INR",
                category_id: "",
                subCategory_id: "",
                sub_subCategory_id: "",
                duration: "",
                features: [""]
            });
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Plan creation/updation failed");
        }
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ""] });
    };

    const handleFeatureChange = (index, value) => {
        const updatedFeatures = [...formData.features];
        updatedFeatures[index] = value;
        setFormData({ ...formData, features: updatedFeatures });
    };

    const removeFeature = (index) => {
        const updatedFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: updatedFeatures });
    };

    return (
        <AdminLayout>
            <DashboardPageHeader title={isEdit ? "Edit Business Plan" : "Add Business Plan"} />
            <p className="text-body-secondary mb-4">Create pricing plans for categories and business listings.</p>

            <form onSubmit={handleSubmit}>
                <div className="cw-card mb-4">
                    <SectionHeader overline="Plan" title="Plan Type & Pricing" />

                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Plan Type</label>
                            <select name="name" value={formData.name} onChange={handleChange} className="form-select">
                                <option value="">Select Plan</option>
                                <option value="Free">Free</option>
                                <option value="Diamond">Diamond</option>
                                <option value="Ruby">Ruby</option>
                                <option value="Emerald">Emerald</option>
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                disabled={formData.name === "Free"}
                                className="form-select"
                            >
                                <option value="INR">₹ INR (Rs)</option>
                                <option value="USD">$ USD</option>
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Price</label>
                            <input
                                type="number"
                                name="price"
                                placeholder="Enter plan price"
                                value={formData.price}
                                onChange={handleChange}
                                disabled={formData.name === "Free"}
                                min={0}
                                className="form-control"
                            />
                        </div>
                    </div>
                </div>

                <div className="cw-card mb-4">
                    <SectionHeader overline="Scope" title="Category Hierarchy" />

                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Category</label>
                            <select name="category_id" value={formData.category_id} onChange={handleChange} className="form-select">
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Sub Category</label>
                            <select name="subCategory_id" value={formData.subCategory_id} onChange={handleChange} className="form-select">
                                <option value="">Select Subcategory</option>
                                {sub_category.map((sub) => (
                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Sub Sub Category</label>
                            <select name="sub_subCategory_id" value={formData.sub_subCategory_id} onChange={handleChange} className="form-select">
                                <option value="">Select Sub Subcategory</option>
                                {sub_subCategory.map((sub) => (
                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="cw-card mb-4">
                    <SectionHeader overline="Term" title="Duration" />
                    <div className="row g-3">
                        <div className="col-md-4">
                            <select name="duration" value={formData.duration} onChange={handleChange} className="form-select">
                                <option value="">Select Duration</option>
                                <option value={3}>3 Months</option>
                                <option value={6}>6 Months</option>
                                <option value={12}>1 Year</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="cw-card mb-4">
                    <SectionHeader
                        overline="Benefits"
                        title="Plan Features"
                        action={
                            <button type="button" onClick={addFeature} className="nav-btn primary" style={{ height: 36 }}>
                                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                                Add Feature
                            </button>
                        }
                    />

                    <div className="d-flex flex-column gap-2">
                        {formData.features.map((feature, index) => (
                            <div key={index} className="d-flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Feature ${index + 1}`}
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    className="form-control"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    className="cw-icon-btn"
                                    aria-label={`Remove feature ${index + 1}`}
                                    style={{ width: 44, height: 44 }}
                                >
                                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="d-flex justify-content-end">
                    <button type="submit" className="nav-btn primary" style={{ height: 48, minWidth: 160 }}>
                        {isEdit ? "Update Plan" : "Add Plan"}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
};

export default AddPlans;
