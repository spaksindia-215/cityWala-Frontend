import { useEffect, useState } from "react";
import API from "../api/axios";
import { FiFileText, FiCalendar } from "react-icons/fi";
import Seo from "../seo/Seo";
import { webPageSchema, graph } from "../seo/schema";
import HeroBanner from "../components/ui/HeroBanner";

const TITLE = "Privacy Policy";
const DESCRIPTION =
  "Read CityWala's Privacy Policy to understand how we collect, use, and protect your personal and business information across our platform.";

const PrivacyPolicy = () => {
  // Static content with CityWala Privacy Policy
  const staticContent = `
<h2>1. Introduction</h2>

<p>Welcome to <strong>CityWala.com</strong>, operated by <strong>Spaks India Business Solutions Pvt. Ltd.</strong> ("CityWala", "we", "us", "our", or "Company"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and mobile application.</p>

<p>Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our services. Your use of CityWala signifies your acceptance of this Privacy Policy.</p>

<h2>2. Information We Collect</h2>

<h3>2.1 Information You Provide</h3>

<ol>
  <li><strong>Account Registration:</strong> When you create an account, we collect name, email address, phone number, password, and other basic profile information.</li>
  <li><strong>Business Profile Information:</strong> For business/partner accounts, we collect business name, address, category, description, photos, and business details.</li>
  <li><strong>Payment Information:</strong> When you make payments through our platform, payment details are collected by our payment processors (Razorpay, PayPal). We do not directly store full credit card information.</li>
  <li><strong>Communication Data:</strong> When you contact us, we collect the content of your messages, attachments, and contact information.</li>
  <li><strong>Review and Rating Data:</strong> When you post reviews, ratings, or comments, we collect that content along with timestamps.</li>
  <li><strong>Support Requests:</strong> When you submit support tickets, we collect your inquiry details and any attachments.</li>
</ol>

<h3>2.2 Information Collected Automatically</h3>

<ol>
  <li><strong>Log Data:</strong> IP address, browser type, operating system, referring URL, pages visited, time spent on pages.</li>
  <li><strong>Device Information:</strong> Device type, device ID, mobile operating system, unique device identifiers.</li>
  <li><strong>Usage Information:</strong> Clicks, search queries, business profiles viewed, interactions with listings.</li>
  <li><strong>Location Data:</strong> City/area information (if location services enabled), approximate location from IP address.</li>
  <li><strong>Cookies and Tracking:</strong> Cookies, web beacons, pixels, and similar tracking technologies.</li>
</ol>

<h3>2.3 Information from Third Parties</h3>

<ol>
  <li>Information from payment processors (Razorpay, PayPal)</li>
  <li>Information from analytics providers</li>
  <li>Information from social media platforms (if you connect your account)</li>
  <li>Information from other users (e.g., when mentioning you in reviews)</li>
</ol>

<h2>3. How We Use Your Information</h2>

<p>CityWala uses the collected information for various purposes:</p>

<h3>3.1 Service Delivery</h3>

<ol>
  <li>Creating and managing your account</li>
  <li>Providing, maintaining, and improving our services</li>
  <li>Processing transactions and payments</li>
  <li>Displaying your business profile and listings</li>
  <li>Facilitating communication between users and service providers</li>
</ol>

<h3>3.2 Communication</h3>

<ol>
  <li>Sending transactional emails (account confirmation, order receipts, password resets)</li>
  <li>Responding to your inquiries and support requests</li>
  <li>Sending promotional emails and newsletters (only with consent)</li>
  <li>Notifying you of changes to our services or policies</li>
</ol>

<h3>3.3 Analytics and Improvement</h3>

<ol>
  <li>Analyzing usage patterns and trends</li>
  <li>Improving website performance and user experience</li>
  <li>Developing new features and services</li>
  <li>Conducting research and analytics</li>
</ol>

<h3>3.4 Security and Compliance</h3>

<ol>
  <li>Detecting and preventing fraud and abuse</li>
  <li>Protecting against malicious or illegal activity</li>
  <li>Enforcing our Terms of Use and other agreements</li>
  <li>Complying with legal obligations</li>
</ol>

<h3>3.5 Personalization</h3>

<ol>
  <li>Personalizing content and recommendations</li>
  <li>Remembering your preferences</li>
  <li>Providing location-based services</li>
</ol>

<h2>4. Data Sharing and Disclosure</h2>

<h3>4.1 Public Information</h3>

<p>Information you choose to make public (business listings, reviews, ratings, profile information) is visible to all users and search engines.</p>

<h3>4.2 Service Providers</h3>

<p>We share information with third-party service providers who assist us in operating our platform, including:</p>

<ol>
  <li>Payment processors (Razorpay, PayPal)</li>
  <li>Cloud hosting providers</li>
  <li>Analytics providers</li>
  <li>Email service providers</li>
  <li>Customer support platforms</li>
</ol>

<h3>4.3 Business Transfers</h3>

<p>If CityWala is acquired, merged, or sold, your information may be transferred as part of that transaction.</p>

<h3>4.4 Legal Requirements</h3>

<p>We may disclose information if required by law, court order, or government request.</p>

<h3>4.5 Protection of Rights</h3>

<p>We may disclose information to protect our rights, privacy, safety, or property, and to prevent fraud or illegal activity.</p>

<h2>5. Data Protection and Security</h2>

<h3>5.1 Security Measures</h3>

<p>CityWala implements industry-standard security measures to protect your information:</p>

<ol>
  <li>SSL/TLS encryption for data in transit</li>
  <li>Secure password hashing and storage</li>
  <li>Firewalls and intrusion detection systems</li>
  <li>Regular security audits and updates</li>
  <li>Access controls and authentication</li>
</ol>

<h3>5.2 Limitation of Security</h3>

<p>While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>

<h3>5.3 Data Retention</h3>

<p>We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your data subject to legal requirements.</p>

<h2>6. Cookies and Tracking Technologies</h2>

<h3>6.1 What Are Cookies?</h3>

<p>Cookies are small files stored on your device that help us remember your preferences and track your activity.</p>

<h3>6.2 Types of Cookies We Use</h3>

<ol>
  <li><strong>Essential Cookies:</strong> Required for site functionality (authentication, security)</li>
  <li><strong>Performance Cookies:</strong> Collect data about how you use the site (analytics)</li>
  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
  <li><strong>Marketing Cookies:</strong> Track your activity for advertising purposes</li>
</ol>

<h3>6.3 Managing Cookies</h3>

<p>You can disable cookies through your browser settings. Note that disabling essential cookies may affect site functionality.</p>

<h2>7. Third-Party Links and Services</h2>

<p>CityWala may contain links to third-party websites and services. We are not responsible for their privacy practices. Please review their privacy policies before providing information.</p>

<h2>8. Your Privacy Rights</h2>

<h3>8.1 Access and Portability</h3>

<p>You have the right to access your personal information and request a copy in a portable format.</p>

<h3>8.2 Correction and Update</h3>

<p>You can update or correct your profile information through your account settings.</p>

<h3>8.3 Deletion</h3>

<p>You can request deletion of your account and associated data, subject to legal retention requirements.</p>

<h3>8.4 Opt-Out</h3>

<p>You can opt out of promotional emails by clicking "unsubscribe" in our emails or through your account settings.</p>

<h3>8.5 Do Not Track</h3>

<p>Some browsers have "Do Not Track" features. CityWala does not currently respond to DNT signals.</p>

<h2>9. Children's Privacy</h2>

<p>CityWala is not intended for users under 18 years old. We do not knowingly collect information from children. If we discover we have collected information from a child, we will delete it immediately.</p>

<h2>10. International Data Transfers</h2>

<p>Your information may be transferred to, stored in, and processed in countries other than India. By using CityWala, you consent to such transfers.</p>

<h2>11. Data Protection Compliance</h2>

<h3>11.1 India Data Protection</h3>

<p>CityWala complies with India's data protection laws, including:</p>

<ol>
  <li>Information Technology Act, 2000</li>
  <li>Information Technology Rules, 2000</li>
  <li>Various state privacy regulations</li>
</ol>

<h3>11.2 User Rights</h3>

<p>Users have the right to:</p>

<ol>
  <li>Know what personal information is collected and how it's used</li>
  <li>Access their personal information</li>
  <li>Correct inaccurate information</li>
  <li>Withdraw consent for data processing</li>
</ol>

<h2>12. Changes to Privacy Policy</h2>

<p>CityWala may update this Privacy Policy periodically. We will notify you of significant changes via email or through our platform. Your continued use of CityWala signifies acceptance of updated policies.</p>

<h2>13. Contact Us</h2>

<p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>

<p><strong>Email:</strong> citywala1959@gmail.com<br>
<strong>Address:</strong> E-38, Budh Vihar, Near Dharmveer Market, Mathura Road, Badarpur, New Delhi<br>
<strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>

<h2>14. Data Protection Officer</h2>

<p>For data protection inquiries, you can contact our team at:</p>

<p><strong>Email:</strong> citywala1959@gmail.com<br>
<strong>Subject Line:</strong> Data Protection Inquiry</p>

<h2>15. Grievance Redressal</h2>

<p>If you have any complaint or grievance regarding data protection, please contact us with detailed information. We will address your concerns within 30 days.</p>

<p><em>Last Updated: June 2026</em><br>
<em>© 2026 Spaks India Business Solutions Pvt. Ltd. All Rights Reserved.</em></p>
  `;

  const [title, setTitle] = useState("Privacy Policy");
  const [content, setContent] = useState(staticContent);
  const [updatedAt, setUpdatedAt] = useState("2026-06-17");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to fetch from API first, fall back to static content
    const fetchData = async () => {
      try {
        const res = await API.get("/admin/privacy");
        const data = res.data?.data ?? res.data ?? {};

        if (data.content) {
          setTitle(data.title || "Privacy Policy");
          setContent(data.content);
          setUpdatedAt(data.updatedAt || "2026-06-17");
        }
      } catch (error) {
        // API unavailable — fall back to the bundled static content above.
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format Date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        path="/privacy-policy"
        jsonLd={graph(webPageSchema({ path: "/privacy-policy", name: TITLE, description: DESCRIPTION }))}
      />

      <HeroBanner
        eyebrow="Privacy & Data Protection"
        title={title}
        subtitle="We are committed to protecting your privacy and ensuring transparency about how we handle your data"
      />

      <section className="cw-section">
        <div className="container" style={{ maxWidth: "72ch" }}>
          <div className="cw-card cw-card--feature">
            {updatedAt && (
              <div className="d-flex align-items-center gap-2 mb-4 pb-4" style={{ borderBottom: "1px solid var(--cw-gray-200)" }}>
                <FiCalendar style={{ color: "var(--cw-orange-500)", fontSize: 18 }} />
                <span className="small" style={{ color: "var(--cw-gray-700)" }}>
                  Last Updated: <strong>{formatDate(updatedAt)}</strong>
                </span>
              </div>
            )}

            {content ? (
              <div className="terms-content" dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <div className="text-center py-5" style={{ color: "var(--cw-gray-500)" }}>
                <FiFileText style={{ fontSize: 64, marginBottom: 20, opacity: .2 }} />
                <p>No content available at the moment.</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-3" style={{ background: "var(--cw-orange-50)", border: "1px solid var(--cw-orange-50)" }}>
            <p className="mb-0 small" style={{ color: "var(--cw-gray-700)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--cw-orange-500)" }}>Your Privacy Matters:</strong> We collect and use your
              information only as described in this policy. You have the right to access, correct, or delete your
              personal information. Contact us anytime if you have questions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;