// Login.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css';
import { useTranslation } from 'react-i18next';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import AuthCard from '../components/ui/AuthCard';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('email');

  // Display session timeout message if redirected from SessionTimeoutProvider
  useEffect(() => {
    if (location.state?.message && location.state?.expiredByTimeout) {
      setError(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalLogin = loginValue.trim();

      if (mode === "phone" && !finalLogin.startsWith("+")) {
        finalLogin = "+" + finalLogin;
      }

      const res = await login(finalLogin, password);

      const from = location.state?.from;
      if (from?.pathname) {
        navigate(from.pathname + (from.search || ''), { replace: true });
      } else if (res.role === "partner") {
        navigate("/partner/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate("/verify-email-pending", {
          state: { email: mode === "email" ? loginValue.trim() : undefined },
        });
        return;
      }
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow={t('home.trusted_label')}
      title={t('login.hero_title')}
      subtitle={t('login.hero_subtitle')}
      bullets={[t('login.bullet_1'), t('login.bullet_2'), t('login.bullet_3')]}
    >
      <h2 className="mb-1">{t('login.title')}</h2>
      <p className="text-body-secondary mb-4">{t('login.subtitle')}</p>

      <div className="cw-segmented mb-4">
        <button
          type="button"
          className={mode === 'email' ? 'is-active' : ''}
          onClick={() => setMode('email')}
        >
          {t('login.email')}
        </button>
        <button
          type="button"
          className={mode === 'phone' ? 'is-active' : ''}
          onClick={() => setMode('phone')}
        >
          {t('login.phone')}
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form onSubmit={handleSubmit}>
        {mode === 'email' && (
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              placeholder={t('login.email_label')}
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
            />
            <label>{t('login.email_label')}</label>
          </div>
        )}

        {mode === 'phone' && (
          <div className="mb-3">
            <PhoneInput
              country={'in'}
              value={loginValue}
              onChange={(val) => setLoginValue(val)}
              inputStyle={{ width: '100%', height: '48px' }}
            />
          </div>
        )}

        <div className="form-floating mb-3 z-1">
          <input
            type="password"
            className="form-control"
            placeholder={t('login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>{t('login.password')}</label>
        </div>

        <div className="text-end mb-3">
          <Link to="/forgot-password" style={{ fontSize: 13 }}>{t('login.forgot_password')}</Link>
        </div>
        <button className="nav-btn primary w-100" style={{ height: 48 }} type="submit" disabled={loading}>
          {loading ? t('login.logging_in') : t('login.login_btn')}
        </button>
      </form>

      <hr className="my-4" />

      <div className="text-center" style={{ fontSize: 14 }}>
        {t('login.new_here')} <Link to="/register">{t('login.create_account')}</Link>
      </div>
      <div className="text-center mt-3" style={{ fontSize: 13 }}>
        <span className="text-body-secondary">{t('login.are_you_partner')} </span>
        <Link to="/partner/login" className="fw-semibold">{t('login.partner_login')}</Link>
      </div>
    </AuthCard>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    country_code: '91',
    password: '',
    password_confirmation: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: t('register.passwords_no_match') });
      setLoading(false);
      return;
    }

    try {
      // BACKEND REQUIREMENT: send both 'mobile' and 'country_code'
      const data = await register({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        country_code: `+${form.country_code}`,
        password: form.password
      });
      navigate('/verify-email-pending', { state: { email: data?.email || form.email } });
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow={t('home.trusted_label')}
      title={t('register.hero_title')}
      subtitle={t('register.hero_subtitle')}
      bullets={[t('register.bullet_1'), t('register.bullet_2'), t('register.bullet_3')]}
    >
      <h2 className="mb-1">{t('register.title')}</h2>
      <p className="text-body-secondary mb-4">{t('register.subtitle')}</p>

      {errors.general && <div className="alert alert-danger">{errors.general}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-floating mb-3">
          <input type="text" className="form-control" placeholder={t('register.full_name')} required
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <label>{t('register.full_name')}</label>
        </div>

        <div className="form-floating mb-3">
          <input type="email" className="form-control" placeholder={t('register.email')} required
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label>{t('register.email')}</label>
        </div>

        <div className="mb-3">
          <label className="small text-body-secondary mb-1">{t('register.mobile')}</label>
          <PhoneInput
            country={'in'}
            value={form.country_code + form.mobile}
            onChange={(value, data) => {
              const code = data.dialCode;
              const number = value.slice(data.dialCode.length);

              setForm({
                ...form,
                country_code: code,
                mobile: number
              });
            }}
            inputStyle={{ width: '100%', height: '48px' }}
          />
          {errors.mobile && <div className="text-danger small">{errors.mobile}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">{t('register.password')}</label>
          <input
            type="password"
            className="form-control"
            placeholder={t('register.password')}
            required
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <PasswordStrengthMeter
            password={form.password}
            email={form.email}
            firstName={form.name.split(/\s+/)[0] || ''}
            lastName={form.name.split(/\s+/).slice(1).join(' ') || ''}
          />
          {errors.password && <div className="text-danger small mt-2">{errors.password}</div>}
        </div>

        <div className="form-floating mb-4">
          <input
            type="password"
            className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
            placeholder={t('register.confirm_password')}
            required
            value={form.password_confirmation}
            onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
          />
          <label>{t('register.confirm_password')}</label>
          {errors.password_confirmation && <div className="invalid-feedback d-block">{errors.password_confirmation}</div>}
        </div>

        <button className="nav-btn primary w-100" style={{ height: 48 }} type="submit" disabled={loading}>
          {loading ? t('register.registering') : t('register.register_btn')}
        </button>
      </form>

      <hr className="my-3" />

      <div className="text-center" style={{ fontSize: 14 }}>
        {t('register.have_account')} <Link to="/login">{t('register.login')}</Link>
      </div>
      <div className="text-center mt-3" style={{ fontSize: 13 }}>
        <span className="text-body-secondary">{t('register.want_business')} </span>
        <Link to="/register-business" className="fw-semibold">{t('register.register_partner')}</Link>
      </div>
    </AuthCard>
  );
}


export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (val) => {
    setInputValue(val);

    if (val.length > 0) {
      const firstChar = val.charAt(0);
      if (/^\d+$/.test(firstChar) || firstChar === '+') {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    } else {
      setIsMobile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const finalValue = isMobile && !inputValue.startsWith('+')
        ? `+${inputValue}`
        : inputValue;

      await forgotPassword(finalValue);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow={t('home.trusted_label')}
      title={t('forgot.title')}
      subtitle={t('forgot.subtitle')}
    >
      <div className="text-center">
        <i className="fa-solid fa-lock fa-3x mb-3" style={{ color: 'var(--cw-blue-600)' }} aria-hidden="true"></i>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {sent ? (
        <div className="alert alert-success">
          {t('forgot.reset_sent')} <b>{inputValue}</b>

          {isMobile && (
            <div className="mt-2">
              <Link
                to="/verify-otp"
                state={{ phone: inputValue }}
                className="nav-btn outline"
                style={{ height: 36 }}
              >
                {t('forgot.enter_otp')}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            {isMobile ? (
              <div>
                <label className="small fw-bold mb-1" style={{ color: 'var(--cw-blue-600)' }}>
                  {t('forgot.mobile_mode')}
                </label>

                <PhoneInput
                  country={"in"}
                  value={inputValue}
                  onChange={(phone) => setInputValue(phone)}
                  inputStyle={{ width: "100%", height: "48px" }}
                  autoFocus
                />

                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 mt-1 text-decoration-none"
                  onClick={() => {
                    setIsMobile(false);
                    setInputValue("");
                  }}
                >
                  {t('forgot.use_email')}
                </button>
              </div>
            ) : (
              <input
                type="text"
                className="form-control"
                style={{ height: "48px" }}
                placeholder={t('forgot.placeholder')}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                required
              />
            )}
          </div>

          <button className="nav-btn primary w-100" style={{ height: 48 }} disabled={loading}>
            {loading ? t('forgot.sending') : t('forgot.continue')}
          </button>
        </form>
      )}

      <div className="text-center mt-3">
        <Link to="/login" style={{ fontSize: 14 }}>
          {t('forgot.back_login')}
        </Link>
      </div>
    </AuthCard>
  );
}


export default Login
