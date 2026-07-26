import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import AuthCard from "./ui/AuthCard";

const VerifyOtp = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const phone = location.state?.phone;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError(t("auth.otp_required"));
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/auth/verify-reset-otp", {
        phone,
        otp,
      });

      if (!data?.resetToken) {
        throw new Error("Reset token missing");
      }

      navigate("/reset-password", {
        state: { resetToken: data.resetToken },
      });

    } catch (err) {
      setError(err.response?.data?.message || t("auth.otp_invalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard eyebrow={t('home.trusted_label')} title={t("partner.verify_otp")}>
      <h2 className="text-center mb-2">{t("partner.verify_otp")}</h2>
      <p className="text-body-secondary text-center mb-4">
        {t("partner.otp_sent_to")} {phone}
      </p>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          className="form-control mb-3 text-center"
          style={{ height: 56, fontSize: 22, letterSpacing: "0.5em" }}
          placeholder={t("auth.enter_otp")}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />

        <button className="nav-btn primary w-100" style={{ height: 48 }} disabled={loading}>
          {loading ? t("partner.verifying") : t("partner.verify_otp")}
        </button>
      </form>
    </AuthCard>
  );
};

export default VerifyOtp;
