import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import SearchableSelect from '../components/SearchableSelect';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";
import Logo from '../assets/headerLogo.png'
import AvatarPlaceholder from '../assets/avatar-placeholder.svg'
import ServicePlaceholder from '../assets/service-placeholder.svg'
import Seo from '../seo/Seo'
import { webPageSchema, graph } from '../seo/schema'
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '../seo/config'

const POPULAR_CATEGORIES = [
  { id: 1, tKey: 'matrimonial', name: 'Matrimonial', img: 'https://citywala.com/popular_photo/1768286155_matrimonial.svg', link: 'https://matrimonial.citywala.com/' },
  { id: 2, tKey: 'daily_necessity', name: 'Daily Necessity', img: 'https://citywala.com/popular_photo/1768286166_daily-necessary.svg', link: '/daily-necessary' },
  { id: 3, tKey: 'education', name: 'Education', img: 'https://citywala.com/popular_photo/1768286187_education.svg', link: '#' },
  { id: 4, tKey: 'health', name: 'Health', img: 'https://citywala.com/popular_photo/1768286207_health.svg', link: '#' },
  { id: 5, tKey: 'real_estate', name: 'Real Estate', img: 'https://citywala.com/popular_photo/1768286227_Real-Estate.svg', link: '#' },
  { id: 6, tKey: 'transporters', name: 'Transporters', img: 'https://citywala.com/popular_photo/1768286241_transporters.svg', link: '#' },
  { id: 7, tKey: 'industries', name: 'Industries', img: 'https://citywala.com/popular_photo/1768289073_Industries.svg', link: '#' },
  { id: 8, tKey: 'pandit_astrologer', name: 'Pandit & Astrologer', img: 'https://citywala.com/popular_photo/1768289101_pandit-astrologer.svg', link: '#' },
  { id: 9, tKey: 'insurance', name: 'Insurance', img: 'https://citywala.com/popular_photo/1768289120_Insurance.svg', link: '#' },
  { id: 10, tKey: 'import_export', name: 'Import & Export', img: 'https://citywala.com/popular_photo/1768289132_import-export.svg', link: '#' },
  { id: 11, tKey: 'job_placement', name: 'Job Placement', img: 'https://citywala.com/popular_photo/1768289150_jobs.svg', link: '#' },
  { id: 12, tKey: 'wedding_events', name: 'Wedding & Events', img: 'https://citywala.com/popular_photo/1768289504_wedding-event.svg', link: '#' },
  { id: 13, tKey: 'agriculture', name: 'Agriculture', img: 'https://citywala.com/popular_photo/1768372714_agriculture.svg', link: '#' },
  { id: 14, tKey: 'jewellery', name: 'Jewellery', img: 'https://citywala.com/popular_photo/1768374555_jewellery.svg', link: '#' },
  { id: 15, tKey: 'it_software', name: 'IT Software', img: 'https://citywala.com/popular_photo/1768374604_it-software.svg', link: '#' },
  { id: 16, tKey: 'food', name: 'Food', img: 'https://citywala.com/popular_photo/1768374634_food.svg', link: '#' },
  { id: 17, tKey: 'tour_travels', name: 'Tour and Travels', img: 'https://citywala.com/popular_photo/1768374660_tour-travel.svg', link: '#' },
  { id: 18, tKey: 'electrical', name: 'Electrical', img: 'https://citywala.com/popular_photo/1768374685_electricians.svg', link: '#' },
  { id: 19, tKey: 'house_construction', name: 'House Construction', img: 'https://citywala.com/popular_photo/1768374963_House-Construction.svg', link: '#' },
  { id: 20, tKey: 'legal_document', name: 'Legal Document', img: 'https://citywala.com/popular_photo/1768375455_Document.svg', link: '#' },
  { id: 21, tKey: 'packers_movers', name: 'Packers & Movers', img: 'https://citywala.com/popular_photo/1768375474_packers & Movers.svg', link: '#' },
  { id: 22, tKey: 'financial_accounting', name: 'Financial & Accounting', img: 'https://citywala.com/popular_photo/1768375973_Financial-Accounting.svg', link: '#' },
  { id: 23, tKey: 'fitness_yoga', name: 'Fitness and Yoga', img: 'https://citywala.com/popular_photo/1768376102_Fitness-Yoga.svg', link: '#' },
  { id: 24, tKey: 'furniture_services', name: 'Furniture Services', img: 'https://citywala.com/popular_photo/1768384007_Furniture.svg', link: '/furniture-repair' },
]

// const TESTIMONIALS = [
//   { name: 'Dev', text: 'Amazing platform! Found exactly what I was looking for. Highly recommend CityWala to everyone.', img: 'https://citywala.com/assets/images/testimonial-1.jpg' },
//   { name: 'Esther Hills', text: 'The matrimonial service is outstanding. Very easy to use and find the right match.', img: 'https://citywala.com/assets/images/testimonial-2.jpg' },
//   { name: 'Hannah Schmitt', text: 'Great experience! The local business directory helped me find services quickly.', img: 'https://citywala.com/assets/images/testimonial-1.jpg' },
//   { name: 'Hannah Schmitt', text: 'Great experience! The local business directory helped me find services quickly.', img: 'https://citywala.com/assets/images/testimonial-1.jpg' },
// ]


export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const [popularCategories, setPopularCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [advertises, setAdvertises] = useState([])
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [search, setSearch] = useState({ country: '', state: '', city: '', category: '' })
  const [bannerIdx, setBannerIdx] = useState(0)
  const [adIdx, setAdIdx] = useState(0)
  const [testiIdx, setTestiIdx] = useState(0)
  const scrollRef = useRef(null)

  const TESTIMONIALS = t("testimonials", { returnObjects: true });

  const sortCategoriesByName = (cats = []) =>
    [...cats].sort((a, b) =>
      String(a?.name || '').localeCompare(String(b?.name || ''), undefined, {
        sensitivity: 'base',
      })
    );

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // useEffect(() => {
  //   API.get('/banners').then(r => setBanners(r.data)).catch(() => { })
  //   API.get('/advertise').then(r => setAdvertises(r.data)).catch(() => { })
  //   API.get('/location/countries').then(r => setCountries(r.data)).catch(() => { })
  //   // API.get('/location/categories').then(r => setPopularCategories(r.data.categories || [])).catch(() => { })
  //   // API.get('/location/categories').then(r => setPopularCategories(r.data.categories || [])).catch(() => { })
  //   API.get('/categories').then(r => setPopularCategories(r.data.categories.filter(c => !c.parentId) || [])).catch(() => { })

  //   // console.log("category data :::", popularCategories);
  //   // API.get('/categories').then(r => setCategories(r.data.categories.filter(c => !c.parentId) || [])).catch(() => { })

  //   console.log("category data :", popularCategories);

  //   // Auto-slide banners
  //   const t1 = setInterval(() => setBannerIdx(p => (p + 1) % Math.max(banners.length, 1)), 4000)
  //   const t2 = setInterval(() => setAdIdx(p => (p + 1) % Math.max(advertises.length, 1)), 5000)
  //   const t3 = setInterval(() => setTestiIdx(p => (p + 1) % TESTIMONIALS.length), 4000)
  //   return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3) }
  // }, [banners.length, advertises.length])

  useEffect(() => {
    API.get('/location/countries')
      .then(r => setCountries(r.data))
      .catch(() => { })

    API.get('/categories')
      .then(r => {
        const data = r.data.categories || [];
        const filtered = sortCategoriesByName(
          data.filter(c => !c.parentId).filter(cat => cat.status)
        );
        setPopularCategories(filtered || []);
      })
      .catch((err) => {
        console.error("CATEGORY FETCH ERROR:", err.message);
      });

    // Auto-slide testimonials
    const t3 = setInterval(
      () => setTestiIdx(p => (p + 1) % TESTIMONIALS.length),
      4000
    );

    return () => {
      clearInterval(t3);
    };

  }, [TESTIMONIALS.length]);

  // derive root categories for horizontal scroll
  const rootCategories = useMemo(
    () => popularCategories.filter((c) => !c.parentId),
    [popularCategories]
  );

  // translated fallback categories (used when API returns no data)
  const translatedFallbackCats = useMemo(
    () => sortCategoriesByName(
      POPULAR_CATEGORIES.map(cat => ({ ...cat, name: t(`home.popular_cats.${cat.tKey}`) }))
    ),
    [t]
  );

  // handleCountry
  const handleCountryChange = async (countryId) => {
    setSearch(p => ({ ...p, country: countryId, state: '', city: '' }))
    setStates([])
    setCities([])
    if (countryId) {
      try {
        const r = await API.get(`/location/states/${countryId}`)
        setStates(r.data.states || [])

      } catch (_) {
        setStates([])
      }
    }
  }

  // state chnage
  const handleStateChange = async (stateId, countryId) => {
    setSearch(p => ({ ...p, state: stateId, city: '' }))
    setCities([])

    if (stateId) {
      try {
        const r = await API.get(`/location/cities/${stateId}?country_id=${countryId}`)
        setCities(r.data.cities || [])

        console.log("city data: ", r)
      } catch (_) {
        setCities([])
      }
    }
  }


  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.country) params.append("country", search.country);
    if (search.state) params.append("state", search.state);
    if (search.city) params.append("city", search.city);

    const selectedCategory = (
      popularCategories.length > 0
        ? popularCategories
        : translatedFallbackCats
    ).find(
      (c) => (c._id || c.id) === search.category
    );

    if (selectedCategory?.slug) {
      navigate(`/categories/${selectedCategory.slug}?${params.toString()}`);
    } else {
      navigate(`/listing?${params.toString()}`);
    }
  };
  // add handleSearch

  // const handleCategory = (cat) => {
  //   const isLoggedIn = localStorage.getItem("token");

  //   if (!isLoggedIn) {
  //     navigate("/login");
  //     return;
  //   }

  //   // navigate(`/categories/${cat.slug}`);
  //   navigate(`/categories/${cat.slug}`)
  // };

  // const handleCategory = (cat) => {
  //   const isLoggedIn = localStorage.getItem("token");
  //   const isLoggedInPartner = localStorage.getItem("partnerToken");

  //   if (!isLoggedIn && !isLoggedInPartner) {
  //     navigate("/login");
  //     return;
  //   }

  //   // navigate(`/categories/${cat.slug}`);
  //   navigate(`/categories/${cat.slug}`)
  // };

  const handleCategory = (cat) => {
    if (cat.tKey === 'matrimonial' || cat.slug === 'matrimonial') {
      window.location.href = 'https://matrimonial.citywala.com/';
      return;
    }
    navigate(`/categories/${cat.slug}`);
  };

  const scrollCats = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollLeft += dir * 200
  }

  return (
    <div>
      <Seo
        fullTitle={DEFAULT_TITLE}
        description={DEFAULT_DESCRIPTION}
        path="/"
        jsonLd={graph(webPageSchema({ path: "/", name: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }))}
      />

      <section id="hero-section" className="cw-hero-photo">
        <div className="cw-hero-photo__bg" aria-hidden="true" />
        <div className="cw-hero-photo__wash" aria-hidden="true" />

        <div className="cw-hero-photo__content container">
          <div className="row">
            <div className="col-xl-8 col-lg-9">

              <span className="d-inline-block px-3 py-2 mb-3 rounded-pill cw-overline"
                style={{ background: 'var(--cw-blue-50)', color: 'var(--cw-blue-600)', letterSpacing: '.06em' }}>
                {t('home.trusted_label')}
              </span>

              <h1 className="cw-display cw-display--hero mb-3">
                {t('home.hero_title')}<br />
                {(() => {
                  const title2 = t('home.hero_title2');
                  const ampIdx = title2.indexOf('&');
                  if (ampIdx === -1) return title2;
                  return (
                    <>
                      {title2.slice(0, ampIdx)}
                      <span style={{ color: 'var(--cw-orange-500)' }}>{title2.slice(ampIdx)}</span>
                    </>
                  );
                })()}
              </h1>

              <p className="mb-5" style={{ maxWidth: 560, fontSize: 16, lineHeight: 1.6, color: 'var(--cw-gray-700)' }}>
                {t('home.hero_subtitle')}
              </p>
            </div>
          </div>

          {/* Search Card */}
          <div className="row">
            <div className="col-xl-11">
              <div className="cw-hero-search-card">
                <form onSubmit={handleSearch}>
                  <div className="row g-3 align-items-end">

                    <div className="col-lg-3 col-md-6">
                      <label className="form-label small fw-semibold text-body-secondary mb-1">
                        <i className="fa-solid fa-globe me-1" style={{ color: 'var(--cw-blue-600)' }} aria-hidden="true"></i>
                        {t('home.select_country')}
                      </label>
                      <SearchableSelect
                        options={[
                          ...countries.filter((c) => c.name === "India"),
                          ...countries.filter((c) => c.name !== "India"),
                        ]}
                        value={search.country}
                        onChange={handleCountryChange}
                        placeholder={t('home.select_country')}
                        valueKey="iso2"
                        labelKey="name"
                      />
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <label className="form-label small fw-semibold text-body-secondary mb-1">
                        <i className="fa-solid fa-location-dot me-1" style={{ color: 'var(--cw-blue-600)' }} aria-hidden="true"></i>
                        {t('home.search_state')}
                      </label>
                      <SearchableSelect
                        options={states}
                        placeholder={t('home.search_state')}
                        value={search.state}
                        onChange={(value) => handleStateChange(value, search.country)}
                        valueKey='_id'
                        labelKey='name'
                      />
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <label className="form-label small fw-semibold text-body-secondary mb-1">
                        <i className="fa-solid fa-building me-1" style={{ color: 'var(--cw-blue-600)' }} aria-hidden="true"></i>
                        {t('home.search_city')}
                      </label>
                      <SearchableSelect
                        options={cities}
                        value={search.city}
                        placeholder={t('home.search_city')}
                        onChange={(value) => setSearch((p) => ({ ...p, city: value }))}
                        valueKey='_id'
                        labelKey='name'
                      />
                    </div>

                    <div className="col-lg-2 col-md-6">
                      <label className="form-label small fw-semibold text-body-secondary mb-1">
                        <i className="fa-solid fa-grip me-1" style={{ color: 'var(--cw-blue-600)' }} aria-hidden="true"></i>
                        {t('home.category')}
                      </label>
                      <SearchableSelect
                        options={popularCategories.length > 0 ? popularCategories : translatedFallbackCats}
                        value={search.category}
                        placeholder={t('home.category')}
                        valueKey={popularCategories.length > 0 ? '_id' : 'id'}
                        labelKey='name'
                        onChange={(e) => setSearch((p) => ({ ...p, category: e }))}
                      />
                    </div>

                    <div className="col-lg-1 col-md-12">
                      <button type="submit" className="nav-btn primary w-100" style={{ height: 48 }}>
                        <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                        <span className="d-lg-none">{t('search')}</span>
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAND ===== */}
      <section className="cw-stats-band">
        <div className="container">
          <div className="row g-4 text-center text-md-start">
            {[
              { icon: 'fa-store', tint: 'blue', number: '10K+', text: t('home.businesses') },
              { icon: 'fa-user-group', tint: 'orange', number: '50+', text: t('home.cities') },
              { icon: 'fa-shield-halved', tint: 'success', number: '24/7', text: t('home.support') },
              { icon: 'fa-shield', tint: 'violet', number: '100%', text: t('home.verified') },
            ].map((item, index) => (
              <div className="col-6 col-md-3" key={index}>
                <div className="cw-stat-tile">
                  <span className={`cw-stat-tile__icon cw-stat-tile__icon--${item.tint}`}>
                    <i className={`fa-solid ${item.icon}`} aria-hidden="true"></i>
                  </span>
                  <div>
                    <div className="cw-stat-tile__value">{item.number}</div>
                    <div className="cw-stat-tile__label">{item.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cw-section category-section">
        <div className="container">

          {/* Section header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
            <div>
              <span className="cw-overline d-block mb-2">
                {t('home.explore')}
              </span>
              <h2 className="cw-display cw-display--section mb-2">{t('home.popular_categories')}</h2>
              <p className="section-subtitle mb-0">
                {t('home.popular_subtitle')}
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="row g-4">
            {(rootCategories.length > 0 ? rootCategories : translatedFallbackCats).map(cat => (
              <div
                key={cat._id || cat.id || cat.name}
                className="col-xl-2 col-lg-3 col-md-4 col-6"
              >
                <button
                  type="button"
                  onClick={() => handleCategory(cat)}
                  className="category-card-v2 text-decoration-none w-100 border-0 cw-lift"
                >
                  <div className="icon-box">
                    <img
                      src={cat.img || cat.image || cat.svg_path || Logo}
                      alt=""
                      aria-hidden="true"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = Logo;
                      }}
                    />
                  </div>

                  <h6 className='text-truncate'>{cat.name}</h6>
                  <span className='text-truncate'>{t('home.explore_now')}</span>
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>


      <section className="cw-section fast-expert-section" style={{ paddingTop: 'var(--cw-s6)', paddingBottom: 'var(--cw-s6)' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="cw-display cw-display--section mb-1" style={{ fontSize: 'clamp(1.25rem,2.5vw,1.75rem)' }}>{t('home.find_experts')}</h2>
              <p className="section-subtitle mb-0">{t('home.browse_cats')}</p>
            </div>

            <div className="d-flex gap-2">
              <button onClick={() => scrollCats(-1)} className="scroll-btn" aria-label="Scroll categories left">
                <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
              </button>
              <button onClick={() => scrollCats(1)} className="scroll-btn" aria-label="Scroll categories right">
                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="expert-scroll hide-scrollbar"
          >
            {(popularCategories.length > 0
              ? popularCategories
              : translatedFallbackCats).map(cat => (
                <button
                  type="button"
                  key={cat._id || cat.id || cat.name}
                  className="expert-card border-0 cw-lift"
                  onClick={() => handleCategory(cat)}
                >
                  <img
                    src={cat.img || cat.image || cat.svg_path || Logo}
                    alt=""
                    aria-hidden="true"
                    onError={(e) => { e.target.onerror = null; e.target.src = Logo; }}
                  />
                  <p>{cat.name}</p>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* ===== REPAIRS & DAILY NEEDS ===== */}
      <section className="cw-section service-section" style={{ paddingTop: 'var(--cw-s6)', paddingBottom: 'var(--cw-s6)' }}>
        <div className="container">
          <div className="row g-4">

            {/* Repairs & Services */}
            <div className="col-12 col-lg-6 mb-4">
              <div className="service-card-wrap h-100">

                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <div>
                    <span className="mini-label">{t('home.top_picks')}</span>
                    <h3 className="service-title">
                      <i className="fa-solid fa-screwdriver-wrench me-2" style={{ color: 'var(--cw-blue-600)', fontSize: 18 }} aria-hidden="true"></i>
                      {t('home.repairs')}
                    </h3>
                  </div>

                  <Link to="/categories/furniture-business-and-services" className="view-btn">
                    {t('home.view_all')}
                  </Link>
                </div>

                <div className="row g-3">
                  {[
                    { id: 'ac', name: t('home.svc_ac'), url: '/categories/furniture-business-and-services' },
                    { id: 'car', name: t('home.svc_car'), url: '/categories/furniture-business-and-services' },
                    { id: 'bike', name: t('home.svc_bike'), url: '/categories/furniture-business-and-services' },
                  ].map((item) => (
                    <div key={item.id} className="col-6 col-sm-4">
                      <Link to={item.url} className="service-box">
                        <img
                          src={ServicePlaceholder}
                          alt=""
                          aria-hidden="true"
                          className="img-fluid"
                        />
                        <span className="service-overlay">
                          <p>{item.name}</p>
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Needs */}
            <div className="col-12 col-lg-6 mb-4">
              <div className="service-card-wrap h-100">

                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <div>
                    <span className="mini-label">{t('home.essentials')}</span>
                    <h3 className="service-title">
                      <i className="fa-solid fa-cart-shopping me-2" style={{ color: 'var(--cw-orange-500)', fontSize: 18 }} aria-hidden="true"></i>
                      {t('home.daily_needs')}
                    </h3>
                  </div>

                  <Link to="/categories/daily-necessity" className="view-btn">
                    {t('home.view_all')}
                  </Link>
                </div>

                <div className="row g-3">
                  {[
                    { id: 'labour', name: t('home.svc_labour'), url: '/categories/daily-necessity' },
                    { id: 'grocery', name: t('home.svc_grocery'), url: '/categories/daily-necessity/local-shops' },
                    { id: 'electricians', name: t('home.svc_electricians'), url: '/categories/daily-necessity/electrician' },
                  ].map((item) => (
                    <div key={item.id} className="col-6 col-sm-4">
                      <Link to={item.url} className="service-box">
                        <img
                          src={ServicePlaceholder}
                          alt=""
                          aria-hidden="true"
                          className="img-fluid"
                        />
                        <span className="service-overlay">
                          <p>{item.name}</p>
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="cw-section" style={{ background: 'var(--cw-gradient-soft)', paddingTop: 'var(--cw-s6)', paddingBottom: 'var(--cw-s6)' }}>
        <div className="container">

          <h2 className="cw-display cw-display--section text-center mb-5">
            {t('home.testimonials')}
          </h2>

          <Slider {...settings}>
            {TESTIMONIALS.map((item, i) => (
              <div key={i} className="px-2">

                <div className="testimonial-card">

                  <i
                    className="fa-solid fa-quote-left mb-3"
                    style={{ color: 'var(--cw-orange-500)', fontSize: 20 }}
                    aria-hidden="true"
                  ></i>

                  <p className="testimonial-text">
                    {item.text}
                  </p>

                  <div className="d-flex align-items-center gap-3 mt-3">

                    <img
                      src={item.img || AvatarPlaceholder}
                      alt=""
                      aria-hidden="true"
                      className="testimonial-img"
                      onError={(e) => { e.target.onerror = null; e.target.src = AvatarPlaceholder; }}
                    />

                    <div>
                      <h6 className="mb-0 fw-bold">
                        {item.name}
                      </h6>

                      <div style={{ color: 'var(--cw-amber-400)', fontSize: 13 }} aria-label="5 out of 5 stars">
                        ★★★★★
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            ))}
          </Slider>

        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cw-section cw-cta-banner" style={{ paddingTop: 'var(--cw-s6)', paddingBottom: 'var(--cw-s6)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9 text-center position-relative">

              <h2 className="cw-display cw-display--cta text-white mb-3">
                {t('home.cta_title')}
              </h2>

              <p className="text-white mb-4" style={{ opacity: .85, fontSize: 16 }}>
                {t('home.cta_subtitle')}
              </p>

              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">

                <Link
                  to="/register-business"
                  className="nav-btn cw-btn-on-dark cta-btn w-100 w-sm-auto"
                >
                  <i className="fa-solid fa-handshake" aria-hidden="true"></i>
                  {t('home.register_partner')}
                </Link>

                <a
                  href="https://wa.me/919875677667"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-btn cw-btn-outline-on-dark cta-btn w-100 w-sm-auto"
                >
                  <i className="fa-solid fa-phone" aria-hidden="true"></i>
                  {t('home.contact_us')}
                </a>

              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

