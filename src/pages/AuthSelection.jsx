import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import Logo from '../assets/headerLogo.png'

export function AuthSelection() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, partner } = useAuth()

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) navigate('/account/dashboard', { replace: true })
    else if (partner) navigate('/partner/dashboard', { replace: true })
  }, [user, partner, navigate])

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="cw-card">
              <div className="text-center mb-4">
                <img src={Logo} alt="CityWala" style={{ height: 60 }} />
              </div>

              <h1 className="h3 text-center mb-2">{t('auth_selection.title')}</h1>
              <p className="text-center text-body-secondary mb-5">{t('auth_selection.subtitle')}</p>

              <div className="row g-3">
                <div className="col-md-6">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="cw-choice-card"
                  >
                    <span className="cw-choice-card__icon">
                      <i className="fa-solid fa-user" aria-hidden="true"></i>
                    </span>
                    <h2 className="h5 mb-1">{t('auth_selection.customer_title')}</h2>
                    <small className="text-body-secondary">{t('auth_selection.customer_desc')}</small>
                  </button>
                </div>

                <div className="col-md-6">
                  <button
                    type="button"
                    onClick={() => navigate('/partner/login')}
                    className="cw-choice-card cw-choice-card--accent"
                  >
                    <span className="cw-choice-card__icon">
                      <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
                    </span>
                    <h2 className="h5 mb-1">{t('auth_selection.partner_title')}</h2>
                    <small className="text-body-secondary">{t('auth_selection.partner_desc')}</small>
                  </button>
                </div>
              </div>

              <div className="my-4 text-center">
                <span className="text-body-secondary" style={{ fontSize: 14 }}>{t('auth_selection.no_account')}</span>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="nav-btn outline w-100"
                  >
                    {t('auth_selection.create_customer_account')}
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    type="button"
                    onClick={() => navigate('/register-business')}
                    className="nav-btn outline-accent w-100"
                  >
                    {t('auth_selection.register_partner')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthSelection
