import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchableSelect from "./SearchableSelect";
import { languages } from "../i18n/config/languages";

const GoogleTranslate = () => {
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState(i18n.language || "en");

  const changeLanguage = (langCode) => {
    setSelected(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem("lang", langCode);
  };

  return (
    <div className="lang-selector">
      <i className="fa-solid fa-globe" style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }} aria-hidden="true"></i>
      <SearchableSelect
        options={languages}
        value={selected}
        onChange={changeLanguage}
        placeholder="Language"
        valueKey="code"
        labelKey="name"
        variant="on-dark"
      />
    </div>
  );
};

export default GoogleTranslate;
