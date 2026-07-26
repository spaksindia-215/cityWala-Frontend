// import { useEffect } from "react";

// const GoogleTranslate = () => {
//   useEffect(() => {
//     if (
//       document.getElementById(
//         "google-translate-script"
//       )
//     )
//       return;

//     window.googleTranslateElementInit = () => {
//       new window.google.translate.TranslateElement(
//         {
//           pageLanguage: "en",
//           autoDisplay: false,
//         },
//         "google_translate_element"
//       );
//     };

//     const script =
//       document.createElement("script");

//     script.id = "google-translate-script";

//     script.src =
//       "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

//     script.async = true;

//     document.body.appendChild(script);
//   }, []);

//   return (
//     <div id="google_translate_element"></div>
//   );
// };

// export default GoogleTranslate;



import { useEffect, useState } from "react";
import SearchableSelect from "./SearchableSelect";

const GoogleTranslate = () => {
  const [languages, setLanguages] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    let interval;

    const initGoogleTranslate = () => {
      if (!window.google || !window.google.translate) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      );

      interval = setInterval(() => {
        const select = document.querySelector(".goog-te-combo");

        if (select && select.options.length) {
          const langs = Array.from(select.options)
            .filter((opt) => opt.value)
            .map((opt) => ({
              code: opt.value,
              name: opt.text,
            }));

          setLanguages(langs);
          clearInterval(interval);
        }
      }, 300);
    };

    // avoid duplicate script injection
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = initGoogleTranslate;

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;

      script.onerror = () => {
        console.error("Google Translate script failed to load");
      };

      document.body.appendChild(script);
    } else {
      initGoogleTranslate();
    }

    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (langCode) => {
    setSelected(langCode);

    const select = document.querySelector(".goog-te-combo");

    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div>
      {/* Hidden Google widget */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Custom dropdown */}
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
    </div>
  );
};

export default GoogleTranslate;