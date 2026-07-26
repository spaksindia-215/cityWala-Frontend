import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../assets/headerLogo.png'
import { useTranslation } from 'react-i18next'


export default function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleHomeClick = (e) => {
    e.preventDefault();

    if (location.pathname === '/') {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const heroSection = document.getElementById('hero-section');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-top">
          <div className="container">
            <div className="row">
              {/* Follow Us */}
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="footer-widget">
                  <img src={Logo}
                    alt="CityWala logo" style={{ height: 40, filter: 'brightness(10)' }} className="mb-3" />
                  <p style={{ fontSize: 14, color: 'var(--cw-gray-300)', maxWidth: '32ch' }}>{t('footer.tagline')}</p>
                  <h3 className="mt-4">{t('footer.follow_us')}</h3>
                  <div className="social-icon mt-2">
                    <ul>
                      <li><a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" aria-hidden="true"></i></a></li>
                      <li><a href="#" aria-label="Instagram"><i className="fab fa-instagram" aria-hidden="true"></i></a></li>
                      <li><a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in" aria-hidden="true"></i></a></li>
                      <li><a href="https://web.whatsapp.com/send?phone=8368741739" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fab fa-whatsapp" aria-hidden="true"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="col-lg-3 col-md-6 col-6 mb-4">
                <div className="footer-widget footer-menu">
                  <h2>{t('footer.quick_links')}</h2>
                  <ul>
                    <li><a href="/" onClick={handleHomeClick}>{t('footer.home')}</a></li>
                    <li><a href="/about-us">{t('footer.about')}</a></li>
                    <li><a href="/contact-us">{t('footer.contact')}</a></li>
                  </ul>
                </div>
              </div>

              {/* Useful Links */}
              <div className="col-lg-3 col-md-6 col-6 mb-4">
                <div className="footer-widget footer-menu">
                  <h2>{t('footer.useful_links')}</h2>
                  <ul>
                    <li><a href="/privacy-policy">{t('footer.privacy')}</a></li>
                    <li><a href="/terms-and-conditions">{t('footer.terms')}</a></li>
                  </ul>
                </div>
              </div>

              {/* Contact */}
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="footer-widget">
                  <h2>{t('footer.communication')}</h2>
                  <div className="d-flex flex-column gap-3" style={{ fontSize: 14 }}>
                    <div className="footer-contact-row">
                      <span className="icon-chip">
                        <i className="fa-solid fa-phone" aria-hidden="true"></i>
                      </span>
                      <div>
                        <div className="cw-overline" style={{ marginBottom: 2 }}>{t('footer.call_us')}</div>
                        <a href="tel:+918368741739">+91 836 874 1739</a>
                      </div>
                    </div>
                    <div className="footer-contact-row">
                      <span className="icon-chip">
                        <i className="fa-solid fa-envelope" aria-hidden="true"></i>
                      </span>
                      <div>
                        <div className="cw-overline" style={{ marginBottom: 2 }}>{t('footer.send_message')}</div>
                        <a href="mailto:citywala1959@gmail.com">citywala1959@gmail.com</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12">
                <p className="mb-0" style={{ fontSize: 13, color: 'var(--cw-gray-500)' }}>
                  {t('footer.copyright')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Buttons — single stack, safe-area aware */}
      <div className="fab-stack">
        <a
          href="https://web.whatsapp.com/send?phone=8368741739"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-button"
          aria-label="Chat on WhatsApp"
        >
          <i className="fab fa-whatsapp" aria-hidden="true"></i>
        </a>
        <a href="tel:+918368741739" className="call-button" aria-label="Call CityWala">
          <i className="fa-solid fa-phone" aria-hidden="true"></i>
        </a>
      </div>
    </>
  )
}
