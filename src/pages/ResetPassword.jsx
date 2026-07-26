import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import API from "../api/axios";
import AuthCard from "../components/ui/AuthCard";

export function ResetPassword() {
  const { t } = useTranslation();
  const { token } = useParams(); // email flow
  const location = useLocation(); // phone flow
  const navigate = useNavigate();

  const resetToken = location.state?.resetToken;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOtpFlow = !token && !!resetToken;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError(t("auth.passwords_no_match"));
    }

    setLoading(true);
    setError("");

    try {
      if (token) {
        // Email reset link flow
        await API.post(`/auth/reset-password/${token}`, { password });
      } else if (isOtpFlow) {
        // Phone OTP flow
        await API.post(`/auth/reset-password-otp`, { resetToken, password });
      } else {
        throw new Error("Invalid reset request");
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.message || t("auth.reset_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow={t('home.trusted_label')}
      title={t("auth.reset_password")}
      subtitle={token ? t("auth.reset_using_email") : t("auth.reset_using_phone")}
    >
      <h2 className="mb-4 text-center">{t("auth.reset_password")}</h2>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{t("auth.reset_success")}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            placeholder={t("auth.new_password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>{t("auth.new_password")}</label>
        </div>

        <div className="form-floating mb-4">
          <input
            type="password"
            className="form-control"
            placeholder={t("auth.confirm_password")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label>{t("auth.confirm_password")}</label>
        </div>

        <button className="nav-btn primary w-100" style={{ height: 48 }} disabled={loading}>
          {loading ? t("auth.updating") : t("auth.update_password")}
        </button>
      </form>
    </AuthCard>
  );
}
