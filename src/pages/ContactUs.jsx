import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiSend,
  FiClock,
} from "react-icons/fi";
import { useState } from "react";
import API from "../api/axios";
import Seo from "../seo/Seo";
import { webPageSchema, graph } from "../seo/schema";
import HeroBanner from "../components/ui/HeroBanner";

const TITLE = "Contact Us";
const DESCRIPTION =
  "Get in touch with CityWala for support, partnership queries, or business listing assistance. Reach our team via phone, email, or the contact form.";

const INFO_ITEMS = [
  { icon: FiPhone, title: "Phone", value: "+91 836 874 1739", href: "tel:+918368741739" },
  { icon: FiMail, title: "Email", value: "citywala1959@gmail.com", href: "mailto:citywala1959@gmail.com" },
  { icon: FiMapPin, title: "Location", value: "E-38, Budh Vihar, Badarpur, New Delhi 110044" },
  { icon: FiClock, title: "Working Hours", value: "Mon - Sat : 10 AM - 7 PM" },
];

const ContactUs = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'danger', text }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !messageText) {
      setStatus({ type: "danger", text: "All fields are required" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await API.post("/auth/contact", {
        name,
        email,
        subject,
        message: messageText,
      });

      setStatus({ type: "success", text: "Your message has been sent successfully! Our team will get back to you soon." });

      setName("");
      setEmail("");
      setSubject("");
      setMessageText("");

    } catch (err) {
      setStatus({ type: "danger", text: err.response?.data?.message || "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        path="/contact-us"
        jsonLd={graph(webPageSchema({ path: "/contact-us", name: TITLE, description: DESCRIPTION }))}
      />

      <HeroBanner
        eyebrow="Contact CityWala"
        title="Get In Touch With Us"
        subtitle="Have questions, feedback, or business inquiries? Our team is ready to help you anytime."
      />

      <section className="cw-section">
        <div className="container">
          <div className="row g-4">

            {/* LEFT SIDE - INFO BOXES */}
            <div className="col-lg-5">
              <h2 className="cw-display cw-display--section mb-3">Contact Information</h2>
              <p className="mb-4" style={{ fontSize: 16, lineHeight: 1.8, color: "var(--cw-gray-700)" }}>
                We'd love to hear from you. Reach out for support, partnerships, listings, or general inquiries.
              </p>

              <div className="d-flex flex-column gap-3">
                {INFO_ITEMS.map(({ icon: Icon, title, value, href }) => {
                  const content = (
                    <div className="cw-card cw-lift d-flex gap-3 align-items-start">
                      <div className="cw-info-icon-chip" style={{ width: 56, height: 56, minWidth: 56, fontSize: 22 }}>
                        <Icon />
                      </div>
                      <div>
                        <h3 className="h6 mb-1">{title}</h3>
                        <p className="mb-0 small text-body-secondary">{value}</p>
                      </div>
                    </div>
                  );

                  return href ? (
                    <a key={title} href={href} className="text-decoration-none text-reset">
                      {content}
                    </a>
                  ) : (
                    <div key={title}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="col-lg-7">
              <div className="cw-card cw-card--feature">
                <h2 className="cw-display cw-display--section mb-4">Send Message</h2>

                {status && (
                  <div className={`alert alert-${status.type} py-2`}>{status.text}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Your Email *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <textarea
                      rows="6"
                      className="form-control"
                      placeholder="Write your message here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="nav-btn primary"
                    style={{ height: 48, padding: "0 32px" }}
                  >
                    {loading ? "Sending..." : "Send Message"}
                    <FiSend />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="cw-section" style={{ background: "var(--cw-bg)", paddingTop: "var(--cw-s6)", paddingBottom: "var(--cw-s6)" }}>
        <div className="container">
          <div className="cw-card p-0 overflow-hidden" style={{ borderRadius: "var(--cw-r-xl)", height: 500 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.5319696965407!2d77.30482627613364!3d28.493638490373154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce720705c3965%3A0x2c6082cb48df2283!2sspaks%20education!5e0!3m2!1sen!2sin!4v1781154178306!5m2!1sen!2sin"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="location"
              style={{ width: "100%", height: "100%", border: "none" }}
            ></iframe>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactUs;
