import { useTranslation } from "react-i18next";

/**
 * Shared business/partner card (spec 4.5). One component for every listing
 * grid — replaces the two hand-duplicated card blocks in AllCategories.jsx.
 */
export default function BusinessCard({ partner, onOpen }) {
  const { t } = useTranslation();
  const initial = partner.name?.charAt(0)?.toUpperCase() || "?";
  const isVerified = partner.status === "approved";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(partner._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(partner._id);
        }
      }}
      className="cw-card cw-lift cw-business-card"
    >
      <div className="cw-business-card__logo">
        {partner.company_logo ? (
          <img src={partner.company_logo} alt="" aria-hidden="true" />
        ) : (
          <span aria-hidden="true">{initial}</span>
        )}
      </div>

      <div className="flex-grow-1 min-w-0">
        <h4 className="mb-1 text-truncate d-flex align-items-center gap-1">
          <span className="text-truncate">{partner.name}</span>
          {isVerified && (
            <i
              className="fa-solid fa-circle-check text-success flex-shrink-0"
              style={{ fontSize: "0.75em" }}
              title={t("verified")}
              aria-label={t("verified")}
            ></i>
          )}
        </h4>

        {partner.company_name && (
          <div className="cw-business-card__company text-truncate">{partner.company_name}</div>
        )}

        {partner.company_short_desc && (
          <p className="cw-business-card__desc">{partner.company_short_desc?.slice(0, 80)}</p>
        )}

        <div className="d-flex align-items-center gap-2 mt-2">
          <button
            type="button"
            className="dc-btn dc-btn--navy"
            onClick={(e) => { e.stopPropagation(); onOpen(partner._id); }}
          >
            {t("all_categories.view_details")}
          </button>

          {partner.mobile && (
            <a
              href={`tel:${partner.country_code || "+91"}${partner.mobile}`}
              className="cw-icon-btn"
              aria-label={`${t("all_categories.call")} ${partner.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fa-solid fa-phone" aria-hidden="true"></i>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
