
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'; // Iska CSS zaroori hai flags ke liye
import API from '../../api/axios'
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/headerLogo.png'
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter';
import AuthCard from '../../components/ui/AuthCard';
import StatCard from '../../components/ui/StatCard';
import DashboardPageHeader from '../../components/ui/DashboardPageHeader';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
// const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://citywala-backend.onrender.com'
const imgUrl = (path) => path ? `${BASE}/${path}` : ''


// ─── Partner Login ────────────────────────────────────────────────────────────
export function PartnerLogin() {
  const { partnerLogin } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await partnerLogin(form.email, form.password)
      navigate('/partner/dashboard')
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate('/verify-email-pending', { state: { email: form.email } })
        return
      }
      setError(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <AuthCard
      eyebrow={t('home.trusted_label')}
      title={t('partner_register.hero_title')}
      subtitle={t('partner_register.hero_subtitle')}
      bullets={[t('partner_register.bullet_1'), t('partner_register.bullet_2'), t('partner_register.bullet_3')]}
    >
      <h2 className="mb-1">{t('partner_register.login_title')}</h2>
      <p className="text-body-secondary mb-4">{t('partner_register.login_subtitle')}</p>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-floating mb-3">
          <input type="email" className="form-control" id="email" placeholder={t("auth.email_address")}
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <label>{t("auth.email_address")}</label>
        </div>
        <div className="form-floating mb-4">
          <input type="password" className="form-control" id="password" placeholder={t("auth.password")}
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <label>{t("auth.password")}</label>
        </div>
        <div className="text-end mb-3">
          <Link to="/forgot-password" style={{ fontSize: 13 }}>{t("login.forgot_password")}</Link>
        </div>
        <button className="nav-btn primary w-100" style={{ height: 48 }} type="submit" disabled={loading}>
          {loading ? t('login.logging_in') : t('login.login_btn')}
        </button>
      </form>
      <hr className="my-4" />
      <div className="text-center" style={{ fontSize: 14 }}>
        {t("partner_register.new_partner")} <Link to="/register-business">{t("partner_register.register_here")}</Link>
      </div>
    </AuthCard>
  )
}

export function PartnerRegister() {
  const { partnerRegister } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    adhar_card: "",
    password: "",
    confirmPassword: "",
    country_id: "",
    state_id: "",
    city_id: "",
    company_name: "",
    category_id: "",
    subcategory_id: "",
    sub_subcategory_id: null,
    // 
    gst_no: "",
    company_short_desc: "",
    address: "",
    postal_code: "",
    company_logo: null,
    country_code: "",
    country_url: "",
    company_url: ""
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [sub_subcategories, setSub_subcategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    API.get("/location/countries")
      .then((r) => setCountries(r.data || []))
      .catch(() => { });

    API.get('/categories')
      .then((r) => setCategories(r.data.categories || []))
      .catch(() => { });
  }, []);

  const handleCountry = async (id) => {
    setForm((p) => ({
      ...p,
      country_id: id,
      state_id: "",
      city_id: ""
    }));

    setStates([]);
    setCities([]);

    if (!id) return;

    try {
      const r = await API.get(`/location/states/${id}`);
      setStates(r.data.states || []);
    } catch {
      setStates([]);
    }
  };

  const handleState = async (id) => {
    setForm((p) => ({
      ...p,
      state_id: id,
      city_id: ""
    }));

    setCities([]);

    if (!id) return;

    try {
      const r = await API.get(
        `/location/cities/${id}?country_id=${form.country_id}`
      );
      setCities(r.data.cities || []);
    } catch {
      setCities([]);
    }
  };

  // const handleCategory = async (id) => {
  //   setForm((p) => ({
  //     ...p,
  //     category_id: id,
  //     subcategory_id: ""
  //   }));

  //   setSubcategories([]);

  //   if (!id) return;

  //   try {
  //     // const r = await API.get(`/subcategories/${id}`);
  //     // setSubcategories(r.data.subcategories || []);
  //   } catch {
  //     setSubcategories([]);
  //   }
  // };

  const childrenByParent = useMemo(() => {
    const m = new Map();

    for (const c of categories) {
      const pid = c?.parentId
        ? String(c.parentId._id || c.parentId)
        : "";

      if (!m.has(pid)) {
        m.set(pid, []);
      }

      m.get(pid).push(c);
    }

    return m;
  }, [categories]);

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  // handleCategory aur handleSubcategory ko update karte hain taaki wo childrenByParent map ka use kar sake aur subcategories ko filter kar sake based on selected category/subcategory
  const handleCategory = (id) => {

    console.log("selected category id:", id);

    setForm((p) => ({
      ...p,
      category_id: id,
      subcategory_id: "",
      sub_subcategory_id: ""
    }));

    if (!id) {
      setSubcategories([]);
      return;
    }

    const filtered =
      childrenByParent.get(String(id)) || [];

    console.log("filtered:", filtered);

    setSubcategories(filtered);
    setSub_subcategories([]);
  };

  const handleSubcategory = (id) => {

    setForm((p) => ({
      ...p,
      subcategory_id: id,
      sub_subcategory_id: ""
    }));

    const filtered =
      childrenByParent.get(String(id)) || [];

    setSub_subcategories(filtered);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "company_logo") {
      setForm((p) => ({
        ...p,
        company_logo: files[0]
      }));
      return;
    }

    if (name === "adhar_card") {
      setForm((p) => ({
        ...p,
        adhar_card: files[0]
      }));
      return;
    }


    setForm((p) => ({
      ...p,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        if (key !== "confirmPassword" && form[key] !== null) {
          data.append(key, form[key]);
        }
      });

      const res = await partnerRegister(data);
      navigate("/verify-email-pending", { state: { email: res?.email || form.email } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Partner registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((p) => p + 1);
  const prevStep = () => setStep((p) => p - 1);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow border-0 rounded-4 p-4">

            <div className="text-center mb-4">
              <img
                src={Logo}
                alt="CityWala"
                style={{ height: 55 }}
              />
              <h3 className="fw-bold mt-3">{t("partner_register.title")}</h3>
              <p className="text-muted mb-0">
                {t("partner_register.step")} {step} {t("partner_register.of")} 3
              </p>
            </div>

            <div className="progress mb-4" style={{ height: "8px" }}>
              <div
                className="progress-bar"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>

            {error && (
              <div className="alert alert-danger py-2">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">

                {/* STEP 1 */}
                {step === 1 && (
                  <>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder={`${t("partner_register.full_name")} *`}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="email"
                        className="form-control"
                        placeholder={`${t("auth.email")} *`}
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <PhoneInput
                        country={"in"}
                        value={form.mobile}
                        onChange={(phone, country) =>
                          setForm({
                            ...form,
                            mobile: phone,
                            country_code: "+" + country.dialCode
                          })
                        }
                        inputStyle={{
                          width: "100%",
                          height: "38px"
                        }}
                        containerStyle={{ width: "100%" }}
                        inputProps={{
                          name: "mobile",
                          required: true
                        }}
                      />
                    </div>

                    {/* <div className="col-md-6">
                      <input
                        type="file"
                        className="form-control"
                        placeholder="Adhar card *"
                        name="email"
                        value={form.adhar_card}
                        onChange={handleChange}
                        required
                      />
                    </div>  */}


                    <div className="col-12">
                      <label className="form-label">{t("auth.password")} *</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder={`${t("auth.password")} *`}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                      <PasswordStrengthMeter
                        password={form.password}
                        email={form.email}
                        firstName={form.name.split(/\s+/)[0] || ''}
                        lastName={form.name.split(/\s+/).slice(1).join(' ') || ''}
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="password"
                        className="form-control"
                        placeholder={`${t("auth.confirm_password")} *`}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        {`${t("partner_register.adhar_card")} `} <span className='text-danger'>*</span>
                      </label>

                      <input
                        type="file"
                        className="form-control"
                        name="adhar_card"
                        // accept="image/*"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <>
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        value={form.country_id}
                        onChange={(e) =>
                          handleCountry(e.target.value)
                        }
                      >
                        <option value=""> {`${t("partner_register.country")} *`}</option>
                        {countries.map((c) => (
                          <option
                            key={c._id || c.iso2}
                            value={c.iso2 || c._id}
                          >
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <select
                        className="form-select"
                        value={form.state_id}
                        onChange={(e) =>
                          handleState(e.target.value)
                        }
                      >
                        <option value=""> {`${t("partner_register.state")} *`}</option>
                        {states.map((s) => (
                          <option
                            key={s._id || s.iso2}
                            value={s.iso2 || s._id}
                          >
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <select
                        className="form-select"
                        name="city_id"
                        value={form.city_id}
                        onChange={handleChange}
                      >
                        <option value=""> {`${t("partner_register.city")} *`}</option>
                        {cities.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder={`${t("partner_register.postal_code")} *`}
                        name="postal_code"
                        value={form.postal_code}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <textarea
                        rows="2"
                        className="form-control"
                        placeholder="Full Address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder={t("partner_register.business_name_placeholder")}
                        name="company_name"
                        value={form.company_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder={t("partner_register.company_url_placeholder")}
                        name="company_url"
                        value={form.company_url}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <select
                        className="form-select"
                        value={form.category_id}
                        onChange={(e) =>
                          handleCategory(e.target.value)
                        }
                        required
                      >
                        <option value="">
                        {t("partner_register.category")} <span className="text-danger">*</span>
                        </option>
                        {rootCategories.map((cat) => (
                          <option
                            key={cat._id}
                            value={cat._id}
                          >
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <select
                        className="form-select"
                        name="subcategory_id"
                        value={form.subcategory_id}
                        onChange={(e) => handleSubcategory(e.target.value)}
                      >
                        <option value="">
                       {t("partner_register.subcategory")} <span className="text-danger">*</span>
                        </option>

                        {subcategories.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* <div className="col-md-6">
                      <select
                        className="form-select"
                        value={form.sub_subcategory_id}
                        onChange={(e) =>
                          handleSubcategory(e.target.value)
                        }
                      >
                        <option value="">
                          Select Subcategory
                        </option>

                        {sub_subcategories.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div> */}
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        name="sub_subcategory_id"
                        value={form.sub_subcategory_id}
                        onChange={handleChange}
                      >
                        <option value="">
                        {t("partner_register.subsubcategory")} <span className="text-danger">*</span>
                        </option>

                        {sub_subcategories.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t("partner_register.gst_placeholder")}
                        name="gst_no"
                        value={form.gst_no}
                        onChange={handleChange}

                      />
                    </div>

                    <div className="col-12">
                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder={t("partner_register.description_placeholder")}
                        name="company_short_desc"
                        value={form.company_short_desc}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                         Company Logo / Image
                      </label>

                      <input
                        type="file"
                        className="form-control"
                        name="company_logo"
                        accept="image/*"
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="col-12 d-flex justify-content-between mt-3">

                  {step > 1 ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={prevStep}
                    >
                      {step > 1 ? t("partner_register.back") : ""}
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={nextStep}
                    >
                      {step < 3 ? t("partner_register.next") : t("partner_register.register_as_partner")}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={loading}
                    >
                      {loading
                        ? t("partner_register.registering")
                        : t("partner_register.register_as_partner")}
                    </button>
                  )}
                </div>

              </div>
            </form>

            <div className="text-center mt-4">
              {t("partner_register.have_account")} {""}
              <Link to="/partner/login" >{t("partner_register.login")}</Link>
            </div>
            <div className="text-center mt-3" style={{ fontSize: 13 }}>
              <span className="text-muted">Looking for customer login? </span>
              <Link to="/login" style={{ color: '#1075be', fontWeight: '500' }}>Customer Login</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Partner Dashboard ────────────────────────────────────────────────────────
export function PartnerDashboard() {
  const { partner } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [data, setData] = useState({
    profiles: [],
    stats: { total: 0, active: 0, inactive: 0 },
    partner: null,
  });

  const [partnerPlan, setPartnerPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // DASHBOARD API
  useEffect(() => {
    API.get("/partner/dashboard")
      .then((r) => {
        setData(r.data);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // PLAN API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/plans/partner-plan");
        setPartnerPlan(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleToggle = async (id) => {
    await API.patch(`/matrimonial/${id}/toggle`);

    setData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p._id === id ? { ...p, is_active: !p.is_active } : p
      ),
    }));
  };

  const info = data.partner || partner;

  if (loading) {
    return (
      <div className="p-4">
        {t("partner_layout.loading")}
      </div>
    );
  }

  return (
    <div>
      <DashboardPageHeader title={t("partner_dashboard.title")} />

      <div className="row g-3">
        {[
          {
            label: t("partner_dashboard.stats.total_profiles"),
            val: data.stats?.total ?? 0,
            icon: "fa-heart",
            tint: "blue",
          },
          {
            label: t("partner_dashboard.stats.active"),
            val: data.stats?.active ?? 0,
            icon: "fa-check-circle",
            tint: "success",
          },
          {
            label: t("partner_dashboard.stats.inactive"),
            val: data.stats?.inactive ?? 0,
            icon: "fa-pause-circle",
            tint: "warning",
          },
          {
            label: t("partner_dashboard.stats.plan"),
            val: info?.plan || t("partner_dashboard.plan_default"),
            icon: "fa-crown",
            tint: "violet",
          },
        ].map((s) => (
          <div key={s.label} className="col-md-3 col-6">
            <StatCard icon={s.icon} tint={s.tint} value={s.val} label={s.label} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PartnerLogin
