import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios'
import { useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Pagination from '../../components/Pagination';
import { getYoutubeThumbnail } from '../../utils/youtube';
import AuthCard from '../../components/ui/AuthCard';


// ─── Sidebar ──────────────────────────────────────────────────────────────────
// function AdminSidebar({ active }) {
//   const { logout } = useAuth()
//   const navigate = useNavigate()
//   const links = [
//     { to: '/admin/dashboard', icon: 'fa-gauge', label: 'Dashboard' },
//     { to: '/admin/users', icon: 'fa-users', label: 'Users' },
//     { to: '/admin/categories', icon: 'fa-th-large', label: 'Categories' },
//     { to: '/admin/banners', icon: 'fa-images', label: 'Banners' },
//     { to: '/admin/matrimonial', icon: 'fa-heart', label: 'Matrimonial' },
//     { to: '/admin/advertise', icon: 'fa-ad', label: 'Advertise' },
//   ]
//   return (
//     <div className="col-lg-2 col-md-3 dashboard-sidebar">
//       <div className="text-center p-3">
//         <i className="fa-solid fa-shield fa-2x text-white mb-2"></i>
//         <h6 className="text-white mb-0" style={{ fontSize: 13 }}>Admin Panel</h6>
//       </div>
//       <hr style={{ borderColor: '#333' }} />
//       <nav>
//         {links.map(l => (
//           <Link key={l.to} to={l.to} className={active === l.to ? 'active' : ''}>
//             <i className={`fa-solid ${l.icon} me-2`}></i>{l.label}
//           </Link>
//         ))}
//         <button
//           onClick={() => { logout(); navigate('/') }}
//           style={{ background: 'none', border: 'none', color: '#aaa', padding: '12px 20px', width: '100%', textAlign: 'left', fontSize: 14 }}
//         >
//           <i className="fa-solid fa-sign-out me-2"></i>Logout
//         </button>
//       </nav>
//     </div>
//   )
// }

export { default as AdminSidebar } from './AdminSidebar';

export function AdminLogin() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await adminLogin(form.email, form.password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || t('admin_login.invalid_credentials'))
    } finally { setLoading(false) }
  }

  return (
    <AuthCard variant="admin" title={t('admin_login.hero_title')} subtitle={t('admin_login.hero_subtitle')}>
      <div className="text-center mb-4">
        <i className="fa-solid fa-shield fa-3x mb-3" style={{ color: 'var(--cw-blue-600)' }} aria-hidden="true"></i>
        <h2 className="h4 fw-bold">{t('admin_login.title')}</h2>
        <p className="text-body-secondary" style={{ fontSize: 13 }}>{t('admin_login.subtitle')}</p>
      </div>
      {error && <div className="alert alert-danger py-2 text-center">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-floating mb-3">
          <input type="email" className="form-control" id="email" placeholder={t('admin_login.email')}
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
            autoComplete="username" />
          <label htmlFor="email">{t('admin_login.email')}</label>
        </div>
        <div className="form-floating mb-4 position-relative">
          <input type={showPassword ? 'text' : 'password'} className="form-control pe-5" id="password" placeholder={t('admin_login.password')}
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
            autoComplete="current-password" />
          <label htmlFor="password">{t('admin_login.password')}</label>
          <button
            type="button"
            className="btn password-toggle-btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-body-secondary"
            style={{ zIndex: 5, width: 32, height: 32 }}
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            tabIndex={-1}
          >
            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
          </button>
        </div>
        <button className="nav-btn primary w-100" style={{ height: 48 }} disabled={loading}>
          {loading ? t('admin_login.logging_in') : t('admin_login.login_btn')}
        </button>
      </form>
    </AuthCard>
  )
}


// ─── Admin Users ──────────────────────────────────────────────────────────────



export function AdminUsers() {
  const [users, setUsers] = useState([])
  // const [partners, setPartners] = useState([])
  const [tab, setTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [data, setData] = useState("");
  const [pagination, setPagination] = useState({})
  const [limit, setLimit] = useState(10);

  // const limit = pagination?.limit || 10;
  const startIndex = (page - 1) * limit;

  useEffect(() => {
    Promise.all([
      API.get(`/admin/users?page=${page}&limit=${limit}`),
      // FIX: correct endpoint is /partner/all
      // API.get('/partner/all'),

    ])
      .then(([u, p]) => {
        // FIX: backend returns { users: [] } and { partners: [] }
        setUsers(u.data.users || u.data || [])
        setPagination(u.data.pagination)
        console.log('fetching partners...', u.data.users || u.data || [])
        // setPartners(p.data.partners || p.data || [])
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [page])

  const list = tab === 'users' ? users : partners

  return (
    // <div style={{ minHeight: '80vh', background: '#f5f5f5' }}>

    <>
      <AdminLayout active="/admin/users" >
        <>

          {/* HEADER */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">

            <div>
              <h3 className="fw-bold mb-1">User Management</h3>
              <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                Manage all registered users & partners
              </p>
            </div>

            <div
              className="px-3 py-2 rounded-3 shadow-sm bg-white border"
              style={{ minWidth: 140 }}
            >
              <small className="text-muted d-block">Total Users</small>
              <h5 className="fw-bold mb-0">
                {pagination?.total || users.length}
              </h5>
            </div>

          </div>

          {/* CARD */}
          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden"
            style={{
              background: "#fff",
            }}
          >

            {/* TOP BAR */}
            <div
              className="d-flex flex-wrap justify-content-between align-items-center px-4 py-3 border-bottom"
              style={{
                background:
                  "linear-gradient(135deg,#111827,#1f2937)",
                color: "#fff",
              }}
            >
              <div>
                <h5 className="fw-bold mb-1">Users List</h5>
                <p className="mb-0 text-light" style={{ fontSize: 13 }}>
                  All registered platform users
                </p>
              </div>

              <div
                className="px-3 py-2 rounded-pill"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  fontSize: 13,
                }}
              >
                {list.length} Records
              </div>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  style={{ width: 50, height: 50 }}
                ></div>

                <p className="mt-3 text-muted mb-0">
                  Loading users...
                </p>
              </div>
            ) : (
              <div className="table-responsive">

                <table className="table align-middle mb-0">

                  <thead
                    style={{
                      background: "#f8fafc",
                    }}
                  >
                    <tr>
                      <th className="py-3 px-4">S no</th>
                      <th className="py-3">User</th>
                      <th className="py-3">Email</th>
                      <th className="py-3">Mobile</th>
                      <th className="py-3">Joined</th>
                    </tr>
                  </thead>

                  <tbody>

                    {list.map((u, i) => (
                      <tr
                        key={u._id}
                        style={{
                          transition: "0.2s",
                          cursor: "pointer",
                        }}
                      >

                        <td className="px-4 fw-semibold text-muted">
                          {startIndex + i + 1}
                        </td>

                        {/* USER */}
                        <td>
                          <div className="d-flex align-items-center gap-3">

                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg,#1075be,#0d9488)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: 15,
                              }}
                            >
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>

                            <div>
                              <div className="fw-semibold">
                                {u.name}
                              </div>

                              <small className="text-muted">
                                User ID: {u._id.slice(-6)}
                              </small>
                            </div>

                          </div>
                        </td>

                        {/* EMAIL */}
                        <td>
                          <span className="text-dark">
                            {u.email}
                          </span>
                        </td>

                        {/* MOBILE */}
                        <td>
                          {u.mobile ? (
                            <span>{u.mobile}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        {/* DATE */}
                        <td>
                          <span
                            className="badge rounded-pill text-bg-light border"
                            style={{
                              fontWeight: 500,
                              padding: "8px 12px",
                            }}
                          >
                            {new Date(u.createdAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </span>
                        </td>

                      </tr>
                    ))}

                    {/* EMPTY */}
                    {list.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-5"
                        >
                          <div className="text-muted">
                            <i
                              className="fa-regular fa-folder-open mb-3"
                              style={{ fontSize: 42 }}
                              aria-hidden="true"
                            ></i>

                            <p className="mb-0">
                              No users found
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}

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
        </>

      </AdminLayout>
    </>
    // </div>
  )
}

// ─── Admin Categories (nested: unlimited depth via parentId) ─────────────────
function catIdStr(id) {
  if (id == null) return ''
  return typeof id === 'object' && id.toString ? id.toString() : String(id)
}

function buildChildrenByParent(categories) {
  const map = new Map()
  for (const c of categories) {
    const pid = c.parentId ? catIdStr(c.parentId) : ''
    if (!map.has(pid)) map.set(pid, [])
    map.get(pid).push(c)
  }
  for (const [, arr] of map) arr.sort((a, b) => a.name.localeCompare(b.name))
  return map
}

/** Depth-first list: root → children → … (works for 20+ levels). */
function flattenCategoryTree(categories) {
  const byParent = buildChildrenByParent(categories)
  const out = []
  function walk(parentKey, depth) {
    for (const c of byParent.get(parentKey) || []) {
      out.push({ cat: c, depth })
      walk(catIdStr(c._id), depth + 1)
    }
  }
  walk('', 0)
  return out
}

/** When editing `rootId`, cannot choose self or any descendant as parent (avoids cycles). */
function getSelfAndDescendantIds(categories, rootId) {
  if (!rootId) return new Set()
  const byParent = buildChildrenByParent(categories)
  const blocked = new Set()
  function add(id) {
    blocked.add(catIdStr(id))
    for (const c of byParent.get(catIdStr(id)) || []) add(c._id)
  }
  add(rootId)
  return blocked
}

function getCategoryPath(categories, cat) {
  const byId = new Map(categories.map((c) => [catIdStr(c._id), c]))
  const parts = []
  let cur = cat
  const guard = new Set()
  while (cur && !guard.has(catIdStr(cur._id))) {
    guard.add(catIdStr(cur._id))
    parts.unshift(cur.name)
    cur = cur.parentId ? byId.get(catIdStr(cur.parentId)) : null
  }
  return parts.join(' › ')
}

// add categories page

export function AdminCategories() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    image: "",
    description: "",
    youtubeUrl: "",
    status: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================
  // HELPERS
  // =========================

  const catIdStr = (v) =>
    typeof v === "object" ? String(v?._id) : String(v);

  const buildTree = (items, parentId = null) => {
    return items
      .filter((i) =>
        parentId
          ? catIdStr(i.parentId) === catIdStr(parentId)
          : !i.parentId
      )
      .map((i) => ({
        ...i,
        children: buildTree(items, i._id),
      }));
  };

  const flattenCategoryTree = (items) => {
    const tree = buildTree(items);

    const rows = [];

    const walk = (nodes, depth = 0) => {
      nodes.forEach((n) => {
        rows.push({
          cat: n,
          depth,
        });

        if (n.children?.length) {
          walk(n.children, depth + 1);
        }
      });
    };

    walk(tree);

    return rows;
  };

  const getCategoryPath = (items, cat) => {
    const path = [];

    let current = cat;

    while (current) {
      path.unshift(current.name);

      current = items.find(
        (i) =>
          catIdStr(i._id) ===
          catIdStr(current.parentId)
      );
    }

    return path.join(" / ");
  };

  const getSelfAndDescendantIds = (
    items,
    rootId
  ) => {
    const ids = new Set();

    const walk = (pid) => {
      ids.add(catIdStr(pid));

      items.forEach((i) => {
        if (
          catIdStr(i.parentId) ===
          catIdStr(pid)
        ) {
          walk(i._id);
        }
      });
    };

    if (rootId) {
      walk(rootId);
    }

    return ids;
  };

  // =========================
  // LOAD ALL
  // =========================

  const loadCats = async () => {
    setLoading(true);

    try {
      const res = await API.get("/categories");

      const sortedCategories = (res.data.categories || []).sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
      setCategories(sortedCategories);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
  }, []);

  // =========================
  // LOAD SINGLE CATEGORY
  // =========================

  useEffect(() => {
    if (id) {
      API.get(`/categories/${id}`)
        .then((res) => {
          console.log(res.data);

          const cat =
            res.data.category || res.data;

          setForm({
            name: cat.name || "",
            slug: cat.slug || "",
            parentId: cat.parentId
              ? catIdStr(cat.parentId)
              : "",
            image: cat.image || "",
            status: cat.status !== false,
            description: cat.description || "",
            youtubeUrl: cat.youtubeUrl || "",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [id]);

  // =========================
  // TREE DATA
  // =========================

  const blockedParentIds = useMemo(
    () =>
      getSelfAndDescendantIds(
        categories,
        id
      ),
    [categories, id]
  );

  const parentSelectRows = useMemo(() => {
    return flattenCategoryTree(
      categories
    ).filter(
      ({ cat }) =>
        !blockedParentIds.has(
          catIdStr(cat._id)
        )
    );
  }, [categories, blockedParentIds]);

  // const tableRows = useMemo(
  //   () => flattenCategoryTree(categories),
  //   [categories]
  // );

  // =========================
  // FORM DATA
  // =========================

  const appendFormToFd = (fd) => {
    fd.append("name", form.name.trim());

    if (form.slug?.trim()) {
      fd.append(
        "slug",
        form.slug.trim()
      );
    }

    fd.append(
      "parentId",
      form.parentId || ""
    );
    fd.append(
      "description",
      form.description || ""
    );

    fd.append(
      "youtubeUrl",
      form.youtubeUrl || ""
    );

    fd.append(
      "status",
      form.status ? "true" : "false"
    );

    if (
      form.image &&
      typeof form.image !== "string"
    ) {
      fd.append("image", form.image);
    }
  };

  // =========================
  // ADD
  // =========================

  const handleAdd = async (e) => {
    e.preventDefault();

    if (
      !window.confirm(
        "Add this category?"
      )
    )
      return;

    setSaving(true);

    try {
      const data = new FormData();

      appendFormToFd(data);

      await API.post("/categories", data, {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      });

      alert("Category added");

      loadCats();

      setForm({
        name: "",
        slug: "",
        parentId: "",
        image: "",
        description: "",
        youtubeUrl: "",
        status: true,
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Error"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!id) return;

    setSaving(true);

    try {
      const data = new FormData();

      appendFormToFd(data);

      await API.put(
        `/categories/${id}`,
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert("Category updated");
      setForm({
        name: "",
        slug: "",
        parentId: "",
        image: "",
        description: "",
        youtubeUrl: "",
        status: true,
      })
      loadCats();

      navigate(
        "/admin/categories/add"
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Error"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this category?"
      )
    )
      return;

    try {
      await API.delete(
        `/categories/${id}`
      );

      loadCats();

      alert("Deleted successfully");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Error"
      );
    }
  };

  // =========================
  // SLUG
  // =========================

  const genrateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  // =========================
  // UI
  // =========================



  return (
    // <div
    //   style={{
    //     minHeight: "100vh",
    //     background: "#f5f5f5",
    //   }}
    // >
    <>
      <AdminLayout active="/admin/categories/add" >
        <div className="row g-0">
          {/* <AdminSidebar active="/admin/categories/add" /> */}
          <div className="d-flex justify-content-center w-100">
            <div className="col-lg-8 col-xl-7">
              <div className="row g-4">
                {/* FORM */}
                <div className="col-12">
                  <div
                    className="card border-0 shadow-lg"
                    style={{
                      borderRadius: "24px",
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    {/* Header */}
                    <div
                      className="p-4"
                      style={{
                        background:
                          "linear-gradient(135deg,#111827,#1f2937,#374151)",
                        color: "#fff",
                      }}
                    >
                      <h3
                        className="fw-bold mb-1"
                        style={{
                          letterSpacing: "0.5px",
                          color: "#fff",
                        }}
                      >
                        {isEdit
                          ? "Edit Category"
                          : "Add Category"}
                      </h3>

                      <p
                        className="mb-0"
                        style={{
                          opacity: 0.8,
                          fontSize: "14px",
                          color: "#fff",
                        }}
                      >
                        Manage category details &
                        hierarchy
                      </p>
                    </div>

                    {/* Form */}
                    <div className="p-4">
                      <form
                        onSubmit={
                          isEdit
                            ? handleEdit
                            : handleAdd
                        }
                      >
                        {/* Category Name */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold mb-2">
                            Category Name
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter category name"
                            value={form.name}
                            onChange={(e) => {
                              const name =
                                e.target.value;

                              setForm((prev) => ({
                                ...prev,
                                name,
                                slug:
                                  genrateSlug(name),
                              }));
                            }}
                            style={{
                              height: "52px",
                              borderRadius: "14px",
                              border:
                                "1px solid #d1d5db",
                              boxShadow: "none",
                            }}
                            required
                          />
                        </div>

                        {/* Slug */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold mb-2">
                            Slug
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="category-slug"
                            value={form.slug}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                slug:
                                  e.target.value,
                              })
                            }
                            style={{
                              height: "52px",
                              borderRadius: "14px",
                              border:
                                "1px solid #d1d5db",
                            }}
                          />
                        </div>

                        {/* Parent */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold mb-2">
                            Parent Category
                          </label>

                          {/* <select
                        className="form-select"
                        value={form.parentId}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            parentId:
                              e.target.value,
                          })
                        }
                        style={{
                          height: "52px",
                          borderRadius: "14px",
                          border:
                            "1px solid #d1d5db",
                        }}
                      >
                        <option value="">
                          Root Category
                        </option>

                        {parentSelectRows.map(
                          ({ cat, depth }) => (
                            <option
                              key={cat._id}
                              value={catIdStr(
                                cat._id
                              )}
                            >
                              {"↳ ".repeat(depth)}
                              {cat.name}
                            </option>
                          )
                        )}
                      </select> */}

                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Search category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />

                          <select
                            className="form-select"
                            value={form.parentId}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                parentId: e.target.value,
                              })
                            }
                            style={{
                              height: "52px",
                              borderRadius: "14px",
                              border: "1px solid #d1d5db",
                            }}
                          >
                            <option value="">Root Category</option>

                            {parentSelectRows
                              .filter(({ cat }) =>
                                cat.name.toLowerCase().includes(search.toLowerCase())
                              )
                              .map(({ cat, depth }) => (
                                <option key={cat._id} value={catIdStr(cat._id)}>
                                  {"↳ ".repeat(depth)}
                                  {cat.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Image Upload */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold mb-2">
                            Category Image
                          </label>

                          <div
                            style={{
                              border:
                                "2px dashed #d1d5db",
                              borderRadius: "16px",
                              padding: "20px",
                              textAlign: "center",
                              background: "#f9fafb",
                            }}
                          >
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  image:
                                    e.target
                                      .files[0],
                                })
                              }
                              style={{
                                borderRadius:
                                  "12px",
                              }}
                            />

                            <p
                              className="mt-2 mb-0"
                              style={{
                                fontSize: "13px",
                                color: "#6b7280",
                              }}
                            >
                              Upload JPG, PNG,
                              WEBP image
                            </p>
                          </div>
                        </div>

                        {/* Image Preview */}
                        {form.image && (
                          <div className="mb-4">
                            <label className="form-label fw-semibold mb-2">
                              Preview
                            </label>

                            <div>
                              <img
                                src={
                                  typeof form.image ===
                                    "string"
                                    ? form.image
                                    : URL.createObjectURL(
                                      form.image
                                    )
                                }
                                alt="preview"
                                style={{
                                  width: "110px",
                                  height: "110px",
                                  objectFit:
                                    "cover",
                                  borderRadius:
                                    "18px",
                                  border:
                                    "2px solid #e5e7eb",
                                  boxShadow:
                                    "0 4px 14px rgba(0,0,0,0.08)",
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="form-label fw-semibold mb-2">
                            Discription
                          </label>

                          <textarea
                            className="form-control"
                            placeholder="Enter description"
                            value={form.description}
                            onChange={(e) => {
                              setForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }));
                            }}
                            rows={4}
                            style={{
                              borderRadius: "14px",
                              border: "1px solid #d1d5db",
                              boxShadow: "none",
                            }}

                          />
                        </div>

                        {/* YouTube Video Link */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold mb-2">
                            YouTube Video Link
                          </label>

                          <input
                            type="url"
                            className="form-control"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={form.youtubeUrl}
                            onChange={(e) => {
                              setForm((prev) => ({
                                ...prev,
                                youtubeUrl: e.target.value,
                              }));
                            }}
                            style={{
                              height: "52px",
                              borderRadius: "14px",
                              border: "1px solid #d1d5db",
                              boxShadow: "none",
                            }}
                          />

                          {getYoutubeThumbnail(form.youtubeUrl) && (
                            <div className="mt-2">
                              <img
                                src={getYoutubeThumbnail(form.youtubeUrl)}
                                alt="YouTube thumbnail preview"
                                style={{
                                  width: "160px",
                                  height: "90px",
                                  objectFit: "cover",
                                  borderRadius: "12px",
                                  border: "2px solid #e5e7eb",
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Status */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold mb-2">
                            Status
                          </label>

                          <select
                            className="form-select"
                            value={
                              form.status
                                ? "true"
                                : "false"
                            }
                            onChange={(e) =>
                              setForm({
                                ...form,
                                status:
                                  e.target
                                    .value ===
                                  "true",
                              })
                            }
                            style={{
                              height: "52px",
                              borderRadius: "14px",
                              border:
                                "1px solid #d1d5db",
                            }}
                          >
                            <option value="true">
                              Active
                            </option>

                            <option value="false">
                              Inactive
                            </option>
                          </select>
                        </div>

                        {/* Buttons */}
                        <div className="d-flex gap-3 mt-4">
                          <button
                            type="submit"
                            className="btn btn-dark w-100"
                            disabled={saving}
                            style={{
                              height: "52px",
                              borderRadius: "14px",
                              fontWeight: "600",
                              fontSize: "15px",
                            }}
                          >
                            {saving
                              ? "Saving..."
                              : isEdit
                                ? "Update Category"
                                : "Add Category"}
                          </button>

                          {isEdit && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary w-100"
                              onClick={() =>
                                navigate(
                                  "/admin/categories/add"
                                )
                              }
                              style={{
                                borderRadius: "14px",
                                fontWeight: "600",
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
    // </div>
  );
}


{/* TABLE */ }
{/* <div className="col-lg-7">
              <div className="card border-0 shadow-sm p-4 rounded-4">
                <h4 className="fw-bold mb-3">
                  Categories Tree
                </h4>

                {loading ? (
                  <div className="text-center py-5">
                    Loading...
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Category</th>
                          <th>Path</th>
                          <th>Image</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {tableRows.map(
                          (
                            { cat, depth },
                            i
                          ) => (
                            <tr
                              key={cat._id}
                            >
                              <td>
                                {i + 1}
                              </td>

                              <td
                                style={{
                                  paddingLeft:
                                    depth *
                                    20,
                                }}
                              >
                                {depth > 0
                                  ? "↳ "
                                  : ""}
                                {cat.name}
                              </td>

                              <td>
                                {getCategoryPath(
                                  categories,
                                  cat
                                )}
                              </td>

                              <td>
                                {cat.image ? (
                                  <img
                                    src={
                                      cat.image
                                    }
                                    width={
                                      50
                                    }
                                    alt=""
                                  />
                                ) : (
                                  "—"
                                )}
                              </td>

                              <td>
                                {cat.status
                                  ? "Active"
                                  : "Inactive"}
                              </td>

                              <td>
                                <button
                                  className="btn btn-warning btn-sm me-2"
                                  onClick={() =>
                                    navigate(
                                      `/admin/categories/edit/${cat._id}`
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    handleDelete(
                                      cat._id
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div> */}
// ─── Admin Banners ────────────────────────────────────────────────────────────
// export function AdminBanners() {
//   const [banners, setBanners] = useState([])
//   const [title, setTitle] = useState('')
//   const [file, setFile] = useState(null)
//   const [saving, setSaving] = useState(false)
//   const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
//   // const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://citywala-backend.onrender.com'

//   // FIX: use /banners/all for admin (includes inactive)
//   const loadBanners = () => API.get('/banners/all').then(r => setBanners(r.data || [])).catch(() => API.get('/banners').then(r => setBanners(r.data || [])))
//   useEffect(() => { loadBanners() }, [])

//   const handleAdd = async (e) => {
//     e.preventDefault(); setSaving(true)
//     const fd = new FormData()
//     fd.append('title', title)
//     if (file) fd.append('image', file)
//     try {
//       await API.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
//       setTitle(''); setFile(null); loadBanners()
//     } catch (err) { alert(err.response?.data?.message || 'Error') }
//     finally { setSaving(false) }
//   }

//   // FIX: build correct image URL
//   const imgUrl = (path) => path ? `${BASE}/${path}` : ''

//   return (
//     <div style={{ minHeight: '80vh', background: '#f5f5f5' }}>
//       <div className="row g-0">
//         <AdminSidebar active="/admin/banners" />
//         <div className="col-lg-10 col-md-9 p-4">
//           <h4 className="fw-bold mb-4">Banner Management</h4>
//           <div className="row g-3">
//             <div className="col-md-4">
//               <div className="card p-3">
//                 <h6 className="fw-bold mb-3">Add Banner</h6>
//                 <form onSubmit={handleAdd}>
//                   <input className="form-control mb-2" placeholder="Banner Title" value={title} onChange={e => setTitle(e.target.value)} />
//                   <input type="file" className="form-control mb-3" accept="image/*" onChange={e => setFile(e.target.files[0])} />
//                   <button className="btn btn-primary w-100" disabled={saving}>{saving ? 'Uploading...' : 'Add Banner'}</button>
//                 </form>
//               </div>
//             </div>
//             <div className="col-md-8">
//               <div className="card p-3">
//                 <h6 className="fw-bold mb-3">All Banners ({banners.length})</h6>
//                 <div className="row g-2">
//                   {banners.map(b => (
//                     <div key={b._id} className="col-6">
//                       <div style={{ borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
//                         <img src={imgUrl(b.image)} alt={b.title} style={{ width: '100%', height: 100, objectFit: 'cover' }}
//                           onError={e => e.target.style.display = 'none'} />
//                         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                           <span style={{ color: '#fff', fontSize: 12 }}>{b.title}</span>
//                           <button onClick={async () => { await API.delete(`/banners/${b._id}`); loadBanners() }}
//                             style={{ background: '#dc3545', border: 'none', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 11 }}>Del</button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {banners.length === 0 && <p className="text-muted text-center">No banners yet</p>}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// ─── Admin Matrimonial ────────────────────────────────────────────────────────
// export function AdminMatrimonial() {
//   const [profiles, setProfiles] = useState([])
//   const [total, setTotal] = useState(0)
//   const [loading, setLoading] = useState(true)

//   // FIX: admin endpoint is /admin/matrimonial, returns { profiles, total }
//   useEffect(() => {
//     API.get('/admin/matrimonial')
//       .then(r => {
//         setProfiles(r.data.profiles || [])
//         setTotal(r.data.total || 0)
//       })
//       .catch(() => { })
//       .finally(() => setLoading(false))
//   }, [])

//   const toggleStatus = async (id) => {
//     await API.patch(`/admin/matrimonial/${id}/toggle`)
//     setProfiles(prev => prev.map(p => p._id === id ? { ...p, is_active: !p.is_active } : p))
//   }

//   return (
//     <div style={{ minHeight: '80vh', background: '#f5f5f5' }}>
//       <div className="row g-0">
//         <AdminSidebar active="/admin/matrimonial" />
//         <div className="col-lg-10 col-md-9 p-4">
//           <h4 className="fw-bold mb-4">Matrimonial Profiles <span className="badge bg-primary ms-2">{total}</span></h4>
//           <div className="card p-3">
//             {loading ? <div className="text-center py-3"><div className="spinner-border text-primary"></div></div> : (
//               <div className="table-responsive">
//                 <table className="table table-hover">
//                   <thead>
//                     <tr><th>#</th><th>Name</th><th>Age</th><th>Gender</th><th>City</th><th>Partner</th><th>Status</th><th>Action</th></tr>
//                   </thead>
//                   <tbody>
//                     {profiles.map((p, i) => (
//                       <tr key={p._id}>
//                         <td>{i + 1}</td>
//                         <td className="fw-semibold">{p.name}</td>
//                         <td>{p.age} yrs</td>
//                         <td><span className={`badge ${p.gender === 'female' ? 'bg-danger' : 'bg-primary'}`}>{p.gender}</span></td>
//                         <td>{p.city}</td>
//                         <td style={{ fontSize: 12 }}>{p.partner_id?.name || '—'}</td>
//                         <td>
//                           <span className={`badge ${p.is_active ? 'bg-success' : 'bg-secondary'}`}>
//                             {p.is_active ? 'Active' : 'Inactive'}
//                           </span>
//                         </td>
//                         <td className="d-flex gap-1">
//                           <Link to={`/matrimonial/profile/${p._id}`} className="btn btn-outline-primary btn-sm">View</Link>
//                           <button onClick={() => toggleStatus(p._id)} className={`btn btn-sm ${p.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}>
//                             {p.is_active ? 'Deactivate' : 'Activate'}
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                     {profiles.length === 0 && <tr><td colSpan={8} className="text-center text-muted py-4">No profiles found</td></tr>}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// ─── Admin Advertise ──────────────────────────────────────────────────────────
// export function AdminAdvertise() {
//   const [ads, setAds] = useState([])
//   const [form, setForm] = useState({ advertise_name: '' })
//   const [file, setFile] = useState(null)
//   const [saving, setSaving] = useState(false)
//   const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
//   // const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://citywala-backend.onrender.com'

//   const loadAds = () => API.get('/advertise').then(r => setAds(r.data || []))
//   useEffect(() => { loadAds() }, [])

//   const handleAdd = async (e) => {
//     e.preventDefault(); setSaving(true)
//     const fd = new FormData()
//     fd.append('advertise_name', form.advertise_name)
//     if (file) fd.append('image', file)
//     try {
//       await API.post('/advertise', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
//       setForm({ advertise_name: '' }); setFile(null); loadAds()
//     } catch (err) { alert(err.response?.data?.message || 'Error') }
//     finally { setSaving(false) }
//   }

//   return (
//     <div style={{ minHeight: '80vh', background: '#f5f5f5' }}>
//       <div className="row g-0">
//         <AdminSidebar active="/admin/advertise" />
//         <div className="col-lg-10 col-md-9 p-4">
//           <h4 className="fw-bold mb-4">Advertise Management</h4>
//           <div className="row g-3">
//             <div className="col-md-4">
//               <div className="card p-3">
//                 <h6 className="fw-bold mb-3">Add Advertise</h6>
//                 <form onSubmit={handleAdd}>
//                   <input className="form-control mb-2" placeholder="Ad Name" value={form.advertise_name}
//                     onChange={e => setForm({ advertise_name: e.target.value })} required />
//                   <input type="file" className="form-control mb-3" accept="image/*" onChange={e => setFile(e.target.files[0])} />
//                   <button className="btn btn-primary w-100" disabled={saving}>{saving ? 'Uploading...' : 'Add Ad'}</button>
//                 </form>
//               </div>
//             </div>
//             <div className="col-md-8">
//               <div className="card p-3">
//                 <h6 className="fw-bold mb-3">All Ads ({ads.length})</h6>
//                 <div className="row g-2">
//                   {ads.map(ad => (
//                     <div key={ad._id} className="col-6">
//                       <div style={{ borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
//                         <img src={`${BASE}/${ad.image}`} alt={ad.advertise_name}
//                           style={{ width: '100%', height: 100, objectFit: 'cover' }}
//                           onError={e => e.target.style.display = 'none'} />
//                         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                           <span style={{ color: '#fff', fontSize: 12 }}>{ad.advertise_name}</span>
//                           <button onClick={async () => { await API.delete(`/advertise/${ad._id}`); loadAds() }}
//                             style={{ background: '#dc3545', border: 'none', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 11 }}>Del</button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {ads.length === 0 && <p className="text-muted text-center">No ads yet</p>}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

export default AdminLogin
