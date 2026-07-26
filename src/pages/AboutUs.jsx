import Seo from "../seo/Seo";
import Breadcrumbs from "../components/Breadcrumbs";
import { webPageSchema, graph } from "../seo/schema";
import HeroBanner from "../components/ui/HeroBanner";
import CTABanner from "../components/ui/CTABanner";
import StatCard from "../components/ui/StatCard";

const TITLE = "About Us";
const DESCRIPTION =
  "Learn about CityWala's mission to connect verified businesses, MSMEs, exporters, importers, and wholesalers across India through our business listing platform and online marketplace.";

const FEATURES = [
  { icon: "fa-bolt", tint: "blue", title: "Fast Discovery", desc: "Find nearby businesses and services instantly." },
  { icon: "fa-shield-halved", tint: "success", title: "Trusted Listings", desc: "Verified and organized local business profiles." },
  { icon: "fa-location-dot", tint: "orange", title: "Smart Search", desc: "Explore services based on categories and location." },
  { icon: "fa-mobile-screen", tint: "violet", title: "Modern Experience", desc: "Responsive, clean, and user-friendly platform." },
];

const PILLARS = [
  {
    icon: "fa-rocket",
    title: "Vision",
    body: "Build the most trusted local discovery platform where users can quickly connect with businesses and opportunities around them.",
    points: ["Easy access to local services", "Better visibility for businesses", "Simple and clean user experience"],
  },
  {
    icon: "fa-bullseye",
    title: "Mission",
    body: "Our mission is to remove confusion from local search and create a smarter ecosystem that benefits both users and business owners.",
    points: ["Instant local discovery", "Reliable information", "Faster business connections"],
  },
  {
    icon: "fa-gears",
    title: "What We Do",
    body: "CityWala organizes local businesses, services, and opportunities in one powerful platform designed for modern users.",
    points: ["Business listings", "Category-based browsing", "Location-focused discovery"],
  },
];

const AboutUs = () => {
  return (
    <div>
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        path="/about-us"
        jsonLd={graph(webPageSchema({ path: "/about-us", name: TITLE, description: DESCRIPTION }))}
      />

      <HeroBanner
        breadcrumbs={<Breadcrumbs items={[{ name: "About Us" }]} onDark />}
        eyebrow="About CityWala"
        title="Discover Local Services Without The Chaos"
        subtitle="CityWala is built to simplify how people discover nearby businesses, trusted services, local opportunities, and daily essentials."
      />

      <section className="cw-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="cw-img-zoom" style={{ borderRadius: "var(--cw-r-xl)", overflow: "hidden", height: 420 }}>
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                  alt="Team collaborating in a modern office"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <span className="cw-overline d-block mb-3" style={{ color: "var(--cw-orange-500)" }}>
                About CityWala
              </span>

              <h2 className="cw-display cw-display--section mb-3">
                Why We Built <span style={{ color: "var(--cw-orange-500)" }}>CityWala</span>
              </h2>

              <p className="mb-3" style={{ fontSize: 16, lineHeight: 1.8, color: "var(--cw-gray-700)" }}>
                Instead of searching across multiple platforms and wasting time, users can explore everything in one clean and smart ecosystem.
              </p>
              <p className="mb-4" style={{ fontSize: 16, lineHeight: 1.8, color: "var(--cw-gray-700)" }}>
                Our platform focuses on speed, trust, better visibility for local businesses, and a smooth user experience across every device.
              </p>

              <div className="row g-3">
                {FEATURES.map((f) => (
                  <div className="col-md-6" key={f.title}>
                    <div className="cw-card cw-lift h-100">
                      <span className={`cw-dash-stat__icon cw-dash-stat__icon--${f.tint} mb-3`}>
                        <i className={`fa-solid ${f.icon}`} aria-hidden="true"></i>
                      </span>
                      <h3 className="h6 mb-2">{f.title}</h3>
                      <p className="mb-0 small text-body-secondary">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cw-section" style={{ background: "var(--cw-bg)" }}>
        <div className="container">
          <div className="row g-4">
            {PILLARS.map((p) => (
              <div className="col-md-4" key={p.title}>
                <div className="cw-card cw-card--feature cw-lift h-100">
                  <span className="cw-dash-stat__icon cw-dash-stat__icon--blue mb-3">
                    <i className={`fa-solid ${p.icon}`} aria-hidden="true"></i>
                  </span>
                  <h3 className="h5 mb-3">{p.title}</h3>
                  <p className="mb-3" style={{ color: "var(--cw-gray-700)", lineHeight: 1.8 }}>{p.body}</p>
                  <ul className="mb-0 ps-3">
                    {p.points.map((pt) => (
                      <li key={pt} className="mb-2" style={{ color: "var(--cw-gray-500)", lineHeight: 1.6 }}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        title="Ready to Explore Local Services?"
        subtitle="Join thousands of users discovering businesses, services, and opportunities faster with CityWala."
        primaryAction={{ label: "Explore Platform", href: "/", icon: "fa-magnifying-glass" }}
        secondaryAction={{ label: "Contact Us", href: "mailto:citywala1959@gmail.com", icon: "fa-envelope" }}
      />

      <section className="cw-section" style={{ background: "var(--cw-bg)" }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <StatCard icon="fa-magnifying-glass" tint="blue" value="10K+" label="Monthly searches across local categories." />
            </div>
            <div className="col-md-4">
              <StatCard icon="fa-store" tint="orange" value="500+" label="Businesses and services listed on platform." />
            </div>
            <div className="col-md-4">
              <StatCard icon="fa-headset" tint="success" value="24/7" label="Customer support and platform availability." />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
