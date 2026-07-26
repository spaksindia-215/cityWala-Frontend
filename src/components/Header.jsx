import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import Logo from '../assets/headerLogo.png'

import { useTranslation } from "react-i18next";
import { languages } from "../i18n/config/languages";
import GoogleTranslate from './googleTranslate'

const useScrolled = (threshold = 4) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
};


export default function Header() {
  const { t, i18n } = useTranslation();

  // const changeLanguage = (lang) => {
  //   i18n.changeLanguage(lang);
  //   localStorage.setItem("lang", lang);
  //   document.dir = lang === "ar" ? "rtl" : "ltr";
  //   document.documentElement.lang = lang;
  // };

  // const changeLanguage = (lang) => {
  //   i18n.changeLanguage(lang);
  //   localStorage.setItem("lang", lang);

  //   const isRTL = lang === "ar";

  //   document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  //   document.documentElement.setAttribute("lang", lang);
  // };

  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const scrolled = useScrolled()

  const { user, partner, logout } = useAuth();

  const currentUser = partner || user;
  const currentRole = partner ? "partner" : user ? "user" : null;

  const handleLogout = () => {
    logout();
  };

  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const r = await API.get('/categories');
        const data = r.data?.categories || [];
        setAllCategories(data);
        const rootCats = data
          .filter((c) => !c.parentId)
          .filter((c) => c.status === true)
          .sort((a, b) => a.name.localeCompare(b.name));
        setCategories(rootCats);
      } catch (err) {
        console.error('Failed to fetch categories:', err.message);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);

  const flattenCategories = (data) => {
    let result = [];
    data.forEach((item) => {
      result.push(item);
      if (item.subcategories?.length > 0) {
        result = [...result, ...flattenCategories(item.subcategories)];
      }
    });
    return result;
  };

  const allSearchData = flattenCategories(allCategories);

  const handleSearchChange = (value) => {
    setQuery(value);
    const q = value.toLowerCase();
    if (!q) {
      setFilteredResults([]);
      return;
    }
    const results = allSearchData.filter((item) =>
      item.name?.toLowerCase().includes(q)
    );
    setFilteredResults(results);
  };

  const handleItemClick = (item) => {
    setQuery(item.name);
    setFilteredResults([]);
    navigate(`/categories/${item.slug}`);
  };

  const handleSearch = () => {
    if (filteredResults.length > 0) {
      navigate(filteredResults[0].slug);
    }
  };

  const handleCategories = (cat) => {
    if (!user && !partner) {
      return navigate('/login');
    }
    navigate(`/categories/${cat.slug}`);
  }

  const getCatName = (cat) => {
    const key = cat.slug?.replace(/-/g, '_');
    return key ? t(`home.popular_cats.${key}`, { defaultValue: cat.name }) : cat.name;
  };


const [users, setUsers] = useState([])

useEffect(() => {
  API.get(`/admin/users`)
    .then((res) => {
      setUsers(res.data.users || [])
    })
    .catch((err) => {
      console.log(err)
    })
}, [])
  return (
    <>
      {/* ===== ROW 1: UTILITY BAR ===== */}
      <div className="header-top py-2">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">

            <ul className="top-contact mb-0 d-none d-md-flex">
              <li>
                <i className="fa-solid fa-phone" aria-hidden="true"></i>
                <a href="tel:+918368741739">+91 836 874 1739</a>
              </li>
              <li>
                <i className="fa-solid fa-envelope" aria-hidden="true"></i>
                <a href="mailto:citywala1959@gmail.com">
                  citywala1959@gmail.com
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3 gap-md-4">
              <ul className="top-nav mb-0 d-none d-md-flex">
                <li>
                  <Link to="/about-us">{t('header.about_us')}</Link>
                </li>
                <li>
                  <Link to="/register-business">{t('header.list_business')}</Link>
                </li>
                <li className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded={helpOpen}
                    onClick={() => setHelpOpen((v) => !v)}
                  >
                    {t('header.help_support')}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    <li>
                      <Link className="dropdown-item" to="/contact-us">
                        {t('header.contact_support')}
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/terms-and-conditions">
                        {t('footer.terms')}
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/privacy-policy">
                        {t('footer.privacy')}
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>

              <GoogleTranslate />
            </div>
          </div>
        </div>
      </div>

      {/* ===== ROW 2: MAIN BAR ===== */}
       <header className={`main-header sticky-top${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container">
          <nav className="navbar navbar-expand-lg py-2">

            {/* Logo + tagline */}
            <Link to="/" className="header-brand navbar-brand">
              <div className="logo-row">
                <img src={Logo} alt="CityWala" className="logo-img" />
              </div>
              <span className="header-tagline">{t('header.tagline')}</span>
            </Link>

            {/* Mobile Toggle */}
            <button
              className="navbar-toggler border-0 shadow-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <i className="fa-solid fa-bars" aria-hidden="true"></i>
            </button>

            <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>

              {/* Compact pill search bar */}
              <div className="header-search-pill mx-lg-4 my-3 my-lg-0">

                <select
                  className="form-select category-select"
                  aria-label={t('header.categories')}
                  onChange={(e) => {
                    const selected = categories.find((c) => c._id === e.target.value);
                    if (selected) handleCategories(selected);
                  }}
                >
                  <option value="">{t('header.categories')}</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>

                <div className="search-box">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('header.search_placeholder')}
                    value={query}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  />

                  {filteredResults.length > 0 && (
                    <div className="search-dropdown">
                      {filteredResults.map((item) => (
                        <div
                          key={item._id}
                          className="search-item"
                          onClick={() => {
                            handleItemClick(item);
                            handleCategories(item);
                          }}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="search-btn"
                  aria-label={t('search')}
                  onClick={() => {
                    const selected = categories.find(
                      (c) => c.name.toLowerCase() === query.trim().toLowerCase()
                    );
                    if (selected) handleCategories(selected);
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                </button>
              </div>

              <ul className="header-actions ms-lg-auto">

                {/* Total Users stat */}
                <li>
                  <div className="header-stat">
                    <span className="header-stat__icon">
                      <i className="fa-solid fa-users" aria-hidden="true"></i>
                    </span>
                    <span>
                      <span className="header-stat__label d-block">{t('header.total_users')}</span>
                      <span className="header-stat__value">{users?.length || 0}</span>
                    </span>
                  </div>
                </li>

                {/* Partner Dashboard */}
                {currentRole === "partner" && (
                  <li>
                    <Link
                      to="/partner/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-btn outline"
                    >
                      {t('header.dashboard')}
                    </Link>
                  </li>
                )}

                {/* Login/Profile */}
                {currentUser ? (
                  <li>
                    <div className="dropdown">
                      <button
                        className="nav-btn outline dropdown-toggle d-flex align-items-center gap-2"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <span className="avatar">
                          {currentUser?.name?.charAt(0)?.toUpperCase()}
                        </span>

                        <span className="d-none d-md-inline">
                          {currentUser?.name}
                        </span>
                      </button>

                      <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        <li className="px-3 py-2 border-bottom">
                          <div className="fw-semibold">{currentUser?.name}</div>
                          <small className="text-muted">{currentUser?.email}</small>
                        </li>

                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={handleLogout}
                          >
                            {t('header.logout')}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="nav-btn outline">
                        <i className="fa-solid fa-user" aria-hidden="true"></i>
                        {t('header.customer_login')}
                      </Link>
                    </li>
                    <li>
                      <Link to="/partner/login" className="nav-btn outline-accent">
                        <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
                        {t('header.partner_login')}
                      </Link>
                    </li>
                  </>
                )}

                {/* Register */}
                <li>
                  <Link to="/register-business" className="nav-btn primary">
                    {t('header.list_business')}
                  </Link>
                </li>

              </ul>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
