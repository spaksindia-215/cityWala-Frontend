import { useEffect, useState } from "react";
import API from "../api/axios";
import { FiFileText, FiCalendar } from "react-icons/fi";
import Seo from "../seo/Seo";
import Breadcrumbs from "../components/Breadcrumbs";
import { webPageSchema, graph } from "../seo/schema";
import HeroBanner from "../components/ui/HeroBanner";

const TITLE = "Terms & Conditions";
const DESCRIPTION =
  "Read CityWala's Terms & Conditions governing the use of our business listing platform, marketplace services, and partner registrations.";

const TermConditions = () => {
  // Static content - fallback if API fails
  const staticContent = `
<h2>1. Acceptance of Terms</h2>

<p>Welcome to <strong>CityWala.com</strong>, an online platform operated by <strong>Spaks India Business Solutions Pvt. Ltd.</strong> (hereinafter referred to as "CityWala", "we", "us", "our", or "Company"), with its registered office at E-38, Budh Vihar, near Dharmveer Market, Mathura Road, Badarpur, New Delhi.</p>

<p>These Terms of Use (hereinafter referred to as "Terms") along with the Privacy Policy, constitute a legally binding agreement between you (hereinafter referred to as "User", "You", "Your") and CityWala regarding your use of our website, mobile application, and services.</p>

<p><strong>By accessing, browsing, or using CityWala.com and its services, you acknowledge that you have read, understood, and agree to be bound by all the terms and conditions herein.</strong></p>

<p>If you do not agree to these Terms, please do not use our website or services. Your continued use of CityWala.com signifies your acceptance of these Terms. CityWala reserves the right to modify these Terms at any time, without prior notice. It is your responsibility to periodically review these Terms for updates.</p>

<h2>2. Description of Services</h2>

<p>CityWala is an online business directory and local services platform that enables:</p>

<ol>
  <li><strong>Business Listings:</strong> Users can discover and access information about local businesses, shops, restaurants, service providers, and establishments across various categories.</li>
  <li><strong>Service Discovery:</strong> Connection between service seekers and service providers (plumbers, electricians, salons, repair services, etc.).</li>
  <li><strong>Reviews and Ratings:</strong> Users can post reviews, ratings, and feedback about businesses and services they have experienced.</li>
  <li><strong>Lead Generation:</strong> Businesses and service providers can receive customer inquiries and leads through our platform.</li>
  <li><strong>Payments & Transactions:</strong> Where applicable, users can make payments through our platform for services and products, though many transactions may occur offline.</li>
  <li><strong>Communication:</strong> Facilitate communication between businesses and customers through contact information, messaging, and inquiry systems.</li>
</ol>

<p>CityWala acts as a platform provider and intermediary. <em>We do not directly provide the services listed on our platform.</em> CityWala is not responsible for the quality, accuracy, or legality of services offered by third-party service providers and businesses listed on our platform.</p>

<h2>3. User Registration & Account</h2>

<h3>3.1 Registration Requirements</h3>

<ol>
  <li>To use certain features of CityWala, you may be required to create an account (either as a Customer or Partner).</li>
  <li>You agree to provide accurate, current, and complete information during registration.</li>
  <li>You are responsible for maintaining the confidentiality of your login credentials and password.</li>
  <li>You are solely responsible for all activities that occur under your account.</li>
  <li>You agree to notify CityWala immediately of any unauthorized use of your account.</li>
</ol>

<h3>3.2 Account Eligibility</h3>

<ol>
  <li>You must be at least 18 years of age or the age of majority in your jurisdiction.</li>
  <li>You must be a legal resident of India or authorized to conduct business in India.</li>
  <li>You agree not to create multiple accounts or impersonate any person or entity.</li>
  <li>CityWala reserves the right to terminate accounts that violate these requirements.</li>
</ol>

<h3>3.3 Partner Account Requirements</h3>

<ol>
  <li>Partners (Business owners and service providers) must provide valid business registration documents or proof of business operation.</li>
  <li>Partners must maintain accurate and up-to-date business information on their listings.</li>
  <li>Partners agree to comply with all applicable laws and regulations in their jurisdiction.</li>
  <li>CityWala reserves the right to verify partner information and may suspend or terminate partner accounts if verification fails.</li>
</ol>

<h3>3.4 Account Security</h3>

<p>You agree to take all necessary precautions to protect your account from unauthorized access. CityWala will not be liable for any unauthorized access or misuse of your account resulting from your negligence or failure to maintain confidentiality.</p>

<h2>4. User Responsibilities & Prohibited Activities</h2>

<h3>4.1 User Conduct</h3>

<p>You agree to use CityWala in a manner that is lawful, ethical, and in compliance with all applicable local, state, and national laws and regulations. You shall not use our platform for any illegal or unlawful purpose.</p>

<h3>4.2 Prohibited Activities</h3>

<p>Without limiting the foregoing, you agree not to:</p>

<ol>
  <li>Post, upload, or distribute any content that is defamatory, abusive, obscene, hateful, or discriminatory.</li>
  <li>Post false, misleading, or fraudulent information or listings.</li>
  <li>Engage in harassment, bullying, or threatening behavior toward other users, businesses, or staff members.</li>
  <li>Attempt to gain unauthorized access to our systems or networks.</li>
  <li>Engage in hacking, phishing, spamming, or any form of cyber-attack against our platform.</li>
  <li>Collect or harvest personal information of other users without consent.</li>
  <li>Reverse-engineer, decompile, disassemble, or attempt to derive the source code of our platform.</li>
  <li>Remove or alter any proprietary notices, labels, or watermarks on our content.</li>
  <li>Create derivative works or use our content for commercial purposes without permission.</li>
  <li>Engage in any form of unauthorized commercial use of our platform.</li>
  <li>Post links to competitor websites or engage in unfair business practices.</li>
  <li>Violate any third-party intellectual property rights.</li>
  <li>Engage in any conduct that we reasonably believe violates these Terms or any applicable law.</li>
</ol>

<h3>4.3 Violations</h3>

<p>CityWala reserves the right to investigate any alleged violation of these Terms and take appropriate action, including suspension or termination of your account, without notice or liability.</p>

<h2>5. Intellectual Property Rights</h2>

<h3>5.1 CityWala Intellectual Property</h3>

<p>All content on CityWala.com, including but not limited to text, graphics, logos, images, audio, video, designs, layouts, source code, and software, is the intellectual property of CityWala or its content providers and is protected by copyright, trademark, and other intellectual property laws.</p>

<h3>5.2 Limited License</h3>

<p>We grant you a limited, non-exclusive, non-transferable license to view, download, and print content from CityWala for personal, non-commercial use only. This license does not include the right to:</p>

<ol>
  <li>Modify or create derivative works based on the content.</li>
  <li>Copy, reproduce, or distribute the content.</li>
  <li>Use the content for commercial purposes.</li>
  <li>Remove any proprietary notices or attribution.</li>
  <li>Sell, rent, lease, or sublicense the content or platform.</li>
</ol>

<h3>5.3 Trademark</h3>

<p>"CityWala" and all associated logos, trademarks, and trade names are the exclusive property of Spaks India Business Solutions Pvt. Ltd. You shall not use our trademarks without prior written consent.</p>

<h2>6. Business Listings & Partner Rules</h2>

<h3>6.1 Listing Guidelines</h3>

<ol>
  <li>All business listings must contain accurate and truthful information.</li>
  <li>Listings must comply with all applicable laws and regulations.</li>
  <li>Partners must not use listings for misleading advertising or deceptive practices.</li>
  <li>Contact information must be functional and regularly monitored.</li>
  <li>Partners must update their listings within 30 days of any material changes.</li>
  <li>Listings must not contain external links leading to competitor websites.</li>
  <li>Listings must not contain adult content, hate speech, or discriminatory material.</li>
</ol>

<h3>6.2 Listing Verification</h3>

<ol>
  <li>CityWala does not verify the accuracy or completeness of business listings on our platform.</li>
  <li>Business information, addresses, phone numbers, and services listed are provided by the businesses or users and may not be up-to-date.</li>
  <li>CityWala is not responsible for errors, inaccuracies, or outdated information in listings.</li>
  <li>Users are advised to verify information directly with the business before making purchasing or service decisions.</li>
</ol>

<h3>6.3 Suspension or Removal of Listings</h3>

<p>CityWala reserves the right to suspend or remove any listing that:</p>

<ol>
  <li>Violates these Terms of Use.</li>
  <li>Contains false, misleading, or fraudulent information.</li>
  <li>Violates applicable laws or regulations.</li>
  <li>Receives consistent complaints from users about quality or fraudulent practices.</li>
  <li>Fails to respond to user inquiries within a reasonable timeframe.</li>
  <li>Engages in paid or fake reviews.</li>
</ol>

<h2>7. Reviews & Ratings Moderation</h2>

<h3>7.1 Review Submission Guidelines</h3>

<ol>
  <li>Reviews must be based on genuine experiences with the business or service.</li>
  <li>Reviews must not contain false, defamatory, or misleading information.</li>
  <li>Reviews must not contain external links, promotional content, or spam.</li>
  <li>Reviews must not disclose personal information of the business owner or staff.</li>
  <li>Reviews must comply with applicable laws regarding defamation and libel.</li>
  <li>Users must not submit multiple reviews for the same business to manipulate ratings.</li>
  <li>Users must not be offered incentives or payment for posting positive reviews.</li>
</ol>

<h3>7.2 Review Moderation & Removal</h3>

<ol>
  <li>CityWala reserves the right to moderate, edit, or remove any review that violates these Terms.</li>
  <li>Reviews containing obscene language, hate speech, or personal attacks will be removed.</li>
  <li>Fake reviews, paid reviews, or reviews submitted to manipulate ratings will be removed.</li>
  <li>CityWala is not obligated to provide notice before removing a review.</li>
  <li>We do not endorse or verify any user-generated reviews posted on our platform.</li>
  <li>CityWala will investigate complaints from businesses regarding false or defamatory reviews.</li>
</ol>

<h3>7.3 User Responsibility for Reviews</h3>

<p>You acknowledge that you are solely responsible for any review you post on CityWala. You warrant that:</p>

<ol>
  <li>Your review is based on genuine experience with the business or service.</li>
  <li>Your review does not violate any third-party rights or defame any person.</li>
  <li>You have the right to post the review.</li>
</ol>

<h2>8. Payments & Transactions</h2>

<h3>8.1 Payment Terms</h3>

<ol>
  <li>Where CityWala facilitates payments through our platform, all payments are processed through third-party payment gateways (Razorpay, PayPal, and other approved payment providers).</li>
  <li>By making a payment, you authorize us and our payment partners to charge your account as specified.</li>
  <li>You are responsible for ensuring that your payment information is accurate and current.</li>
  <li>CityWala does not store full credit card details; these are handled securely by our payment partners.</li>
</ol>

<h3>8.2 Supported Payment Methods</h3>

<p>CityWala accepts payments through the following methods (where available):</p>

<ol>
  <li><strong>Razorpay:</strong> Credit/Debit Cards, UPI, Net Banking, Wallets</li>
  <li><strong>PayPal:</strong> PayPal account holders</li>
  <li><strong>Bank Transfers:</strong> Direct bank transfers for partner accounts (if applicable)</li>
</ol>

<h3>8.3 Transaction Responsibility</h3>

<ol>
  <li>CityWala acts as a payment intermediary only. We are not responsible for the quality, delivery, or performance of services and products offered by third-party providers.</li>
  <li>Disputes regarding the quality, pricing, or delivery of services should be addressed directly with the service provider or business.</li>
  <li>CityWala will assist in dispute resolution where possible but makes no guarantees.</li>
</ol>

<h3>8.4 Refund Policy</h3>

<ol>
  <li>Refund policies vary depending on the specific service or product and the service provider.</li>
  <li>CityWala will display applicable refund policies at the time of transaction.</li>
  <li>For transactions facilitated through our platform, refund requests must be submitted within 7 days of the transaction.</li>
  <li>CityWala will assist in processing refunds in accordance with the applicable refund policy and third-party provider terms.</li>
  <li>CityWala does not guarantee refunds and reserves the right to deny refund requests that do not comply with stated policies.</li>
  <li>Refunds will be processed back to the original payment method within 7-10 business days.</li>
</ol>

<h3>8.5 Payment Security</h3>

<ol>
  <li>CityWala employs industry-standard encryption and security measures to protect payment information.</li>
  <li>Your financial information is processed securely through PCI-DSS compliant payment gateways.</li>
  <li>CityWala will never ask for your complete card details via email or phone.</li>
  <li>Report any unauthorized transactions immediately to our support team.</li>
</ol>

<h3>8.6 Offline Transactions</h3>

<p>For transactions that occur offline (outside our platform), CityWala is not responsible for payment disputes, non-performance, fraud, or any issues arising from such transactions. Users transact at their own risk.</p>

<h2>9. Disclaimers</h2>

<h3>9.1 "As-Is" Service</h3>

<p>CityWala is provided on an "AS-IS" and "AS-AVAILABLE" basis without any warranties or representations of any kind, whether express or implied. To the fullest extent permitted by law, we disclaim all warranties, including but not limited to:</p>

<ol>
  <li>Implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
  <li>Warranties regarding the accuracy, completeness, or reliability of content, listings, or information.</li>
  <li>Warranties that our service will be uninterrupted, error-free, secure, or free from viruses or malicious code.</li>
  <li>Warranties regarding the availability of our service at all times.</li>
</ol>

<h3>9.2 No Professional Advice</h3>

<p>Information and content on CityWala are provided for general informational purposes only and do not constitute professional advice, recommendations, or endorsements. Users should not rely solely on information from our platform for making important decisions. We recommend consulting qualified professionals for advice on specific matters.</p>

<h3>9.3 Third-Party Listings and Services</h3>

<p>CityWala does not own, operate, or control the businesses and service providers listed on our platform. We do not warrant that:</p>

<ol>
  <li>Listed businesses are legitimate or operating legally.</li>
  <li>Services offered meet any quality or safety standards.</li>
  <li>Service providers are licensed, insured, or qualified.</li>
  <li>Transactions will be completed satisfactorily.</li>
  <li>Service providers will not engage in fraudulent or deceptive practices.</li>
</ol>

<h3>9.4 User Risk</h3>

<p>Your use of CityWala and your reliance on information, services, and products offered through our platform is at your sole risk. CityWala is not responsible for any harm, loss, or damage resulting from your use of our platform or interactions with service providers listed on it.</p>

<h3>9.5 Service Interruptions</h3>

<p>CityWala does not guarantee uninterrupted or error-free service. We are not responsible for any interruptions, delays, or malfunctions in our service caused by technical issues, maintenance, updates, or factors beyond our reasonable control.</p>

<h2>10. Limitation of Liability</h2>

<h3>10.1 Cap on Liability</h3>

<p>To the fullest extent permitted by applicable law, CityWala shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses, even if we have been advised of the possibility of such damages.</p>

<h3>10.2 Direct Damages Limitation</h3>

<p>In no event shall CityWala's total liability to you for any claim arising from or related to these Terms or your use of our services exceed the amount you paid to CityWala in the 12 months preceding the claim, or INR 1,000 (Indian Rupees One Thousand), whichever is less.</p>

<h3>10.3 Scope of Limitation</h3>

<p>These limitations apply regardless of the form of action (whether in contract, tort, negligence, strict liability, or otherwise) and whether or not CityWala has been advised of the possibility of such damages.</p>

<h3>10.4 Excluded Liabilities</h3>

<p>Nothing in these Terms limits our liability for:</p>

<ol>
  <li>Fraud or fraudulent misrepresentation.</li>
  <li>Death or personal injury caused by our negligence.</li>
  <li>Defective products under applicable consumer protection laws.</li>
  <li>Any other liability that cannot be limited by applicable law.</li>
</ol>

<h2>11. Indemnification</h2>

<p>You agree to indemnify, defend, and hold harmless CityWala, its officers, directors, employees, agents, and representatives from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising from or related to:</p>

<ol>
  <li>Your use of our platform or services.</li>
  <li>Your violation of these Terms.</li>
  <li>Your violation of any applicable law or regulation.</li>
  <li>Content you post or submit to our platform.</li>
  <li>Your infringement of any third-party intellectual property rights.</li>
  <li>Your interactions with other users or service providers on our platform.</li>
  <li>Any disputes with service providers listed on our platform.</li>
</ol>

<p>This indemnification obligation shall survive the termination of these Terms.</p>

<h2>12. Termination</h2>

<h3>12.1 User Termination</h3>

<p>You may terminate your account at any time by contacting CityWala at citywala1959@gmail.com or through your account settings. Upon termination, your access to our services will be revoked.</p>

<h3>12.2 CityWala Termination</h3>

<p>CityWala may terminate, suspend, or restrict your account access at any time, with or without cause, and with or without notice, if:</p>

<ol>
  <li>You violate these Terms or any applicable law.</li>
  <li>You engage in illegal, fraudulent, or deceptive activities.</li>
  <li>You harass, abuse, or threaten other users or our staff.</li>
  <li>Your account is used for unauthorized or prohibited activities.</li>
  <li>We determine, in our sole discretion, that your continued participation poses a risk to our platform or users.</li>
  <li>Your payment method fails or you have outstanding payment obligations.</li>
  <li>For Partners: Your business fails to comply with listing rules or receives consistent complaints about fraudulent practices.</li>
</ol>

<h3>12.3 Effect of Termination</h3>

<ol>
  <li>Upon termination, all rights granted to you under these Terms immediately cease.</li>
  <li>You must immediately discontinue use of our platform.</li>
  <li>Your content may be deleted or retained by CityWala at its discretion.</li>
  <li>Provisions that should survive termination shall remain in effect.</li>
</ol>

<h2>13. General Provisions</h2>

<h3>13.1 Entire Agreement</h3>

<p>These Terms, along with our Privacy Policy, constitute the entire agreement between you and CityWala regarding your use of our services and supersede all prior agreements and understandings (whether written or oral) between the parties.</p>

<h3>13.2 Amendments</h3>

<p>CityWala reserves the right to modify these Terms at any time at its sole discretion. Changes will be effective upon posting to our website. Your continued use of CityWala after such changes constitutes your acceptance of the modified Terms. It is your responsibility to review these Terms periodically for updates.</p>

<h3>13.3 Severability</h3>

<p>If any provision of these Terms is found to be invalid or unenforceable, that provision shall be modified to the minimum extent necessary to make it valid, or if not possible, severed. The remaining provisions shall continue in full force and effect.</p>

<h3>13.4 Waiver</h3>

<p>The failure of CityWala to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision. Any waiver must be in writing and signed by an authorized representative of CityWala.</p>

<h3>13.5 Survival of Provisions</h3>

<p>Provisions that by their nature are intended to survive termination of these Terms, including but not limited to Intellectual Property Rights, Disclaimers, Limitation of Liability, Indemnification, and Dispute Resolution, shall survive termination or expiration of these Terms.</p>

<h3>13.6 Force Majeure</h3>

<p>CityWala shall not be liable for any failure or delay in performance under these Terms to the extent caused by circumstances beyond our reasonable control, including but not limited to:</p>

<ol>
  <li>Natural disasters, earthquakes, floods, hurricanes, or acts of God.</li>
  <li>War, terrorism, riots, civil unrest, or acts of violence.</li>
  <li>Epidemic, pandemic, or quarantine restrictions.</li>
  <li>Strikes, lockouts, or labor disputes.</li>
  <li>Government actions, restrictions, or regulations.</li>
  <li>Cyberattacks, hacking, viruses, or malware attacks.</li>
  <li>Network failures, system outages, or technical malfunctions beyond our control.</li>
</ol>

<h3>13.7 Assignment</h3>

<p>You may not assign, transfer, or delegate your rights or obligations under these Terms without the prior written consent of CityWala. Any unauthorized assignment shall be void. CityWala may assign these Terms to any successor or affiliate without notice.</p>

<h3>13.8 Notices</h3>

<p>All notices, requests, demands, and communications required under these Terms shall be in writing and sent to:</p>

<p><strong>Spaks India Business Solutions Pvt. Ltd.</strong><br>
E-38, Budh Vihar<br>
Near Dharmveer Market, Mathura Road<br>
Badarpur, New Delhi<br>
Email: citywala1959@gmail.com</p>

<p>Notices are deemed received when personally delivered, 5 days after being sent via registered mail, or immediately upon email transmission with confirmation of delivery.</p>

<h3>13.9 No Waiver of Rights</h3>

<p>CityWala's failure to exercise or enforce any right under these Terms does not constitute a waiver of that right or any other right.</p>

<h3>13.10 Non-Exclusive Rights</h3>

<p>These Terms are on a non-exclusive basis. CityWala is free to provide similar services to third parties, and nothing herein prevents CityWala from serving competitors of users.</p>

<h3>13.11 Third-Party Links and Content</h3>

<ol>
  <li>CityWala may contain links to third-party websites and content.</li>
  <li>We are not responsible for the accuracy, legality, or content of third-party websites.</li>
  <li>Your access to third-party websites is at your own risk and subject to their terms and conditions.</li>
  <li>CityWala does not endorse or approve third-party content or websites.</li>
</ol>

<h3>13.12 Dispute Resolution & Arbitration</h3>

<p>In the event a dispute arises between you and CityWala, the parties shall attempt to amicably resolve the dispute through mutual discussions and negotiation. If the dispute is not resolved within 30 (thirty) days from the date of the dispute, either party may, upon giving written notice to the other party, initiate arbitration proceedings.</p>

<p><strong>Arbitration Terms:</strong></p>

<ol>
  <li>The arbitration shall be conducted in English in accordance with the rules and procedures under the Arbitration and Conciliation Act, 1996.</li>
  <li>The venue for the arbitration shall be New Delhi, India.</li>
  <li>The arbitration shall be conducted by a sole arbitrator to be appointed by mutual agreement of the parties, or failing such agreement, appointed in accordance with the Arbitration and Conciliation Act, 1996.</li>
  <li>The award of the arbitrator shall be final and binding on both parties.</li>
  <li>Each party shall bear its own costs of arbitration, except where the arbitrator awards costs to the prevailing party as per applicable law.</li>
</ol>

<h3>13.13 Governing Law and Jurisdiction</h3>

<p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any legal proceedings or arbitration arising under these Terms shall be subject to the exclusive jurisdiction of the courts and arbitration venues in New Delhi, India.</p>

<h2>14. Contact Information</h2>

<p>If you have questions, concerns, or complaints about these Terms, our services, or our practices, please contact us at:</p>

<p><strong>Email:</strong> citywala1959@gmail.com<br>
<strong>Address:</strong> E-38, Budh Vihar, Near Dharmveer Market, Mathura Road, Badarpur, New Delhi<br>
<strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>

<h2>15. Acknowledgment</h2>

<p>By using CityWala.com, you acknowledge that:</p>

<ol>
  <li>You have read and understood these Terms of Use.</li>
  <li>You agree to be bound by all the terms and conditions herein.</li>
  <li>You agree to use our platform only for lawful purposes and in compliance with all applicable laws.</li>
  <li>You understand that CityWala is a platform provider and does not guarantee the quality, safety, or legality of services offered by third parties.</li>
  <li>You understand that we may modify these Terms at any time, and your continued use constitutes acceptance of such modifications.</li>
</ol>

<p><em>Last Updated: June 2026</em><br>
<em>© 2026 Spaks India Business Solutions Pvt. Ltd. All Rights Reserved.</em></p>
  `;

  const [title, setTitle] = useState("Terms & Conditions");
  const [content, setContent] = useState(staticContent);
  const [updatedAt, setUpdatedAt] = useState("2026-06-17");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to fetch from API first, fall back to static content
    const fetchData = async () => {
      try {
        const res = await API.get("/admin/terms");
        const data = res.data?.data ?? res.data ?? {};

        if (data.content) {
          setTitle(data.title || "Terms & Conditions");
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
        path="/terms-and-conditions"
        jsonLd={graph(webPageSchema({ path: "/terms-and-conditions", name: TITLE, description: DESCRIPTION }))}
      />

      <HeroBanner
        breadcrumbs={<Breadcrumbs items={[{ name: "Terms & Conditions" }]} onDark />}
        eyebrow="Legal Information"
        title={title || "Terms & Conditions"}
        subtitle="Please read these terms carefully before using CityWala"
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
              <strong style={{ color: "var(--cw-orange-500)" }}>Important:</strong> By using
              CityWala, you acknowledge that you have read, understood, and agree to be
              bound by all terms and conditions herein. If you do not agree, please do
              not use our services.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default TermConditions;