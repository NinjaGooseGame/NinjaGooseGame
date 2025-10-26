// /js/i18n.js
(() => {
  const STORAGE_KEY = "lang";

  // Läs stödda språk från window.LANGS om möjligt (sanningskällan), annars fallback
  const getLangs = () => Array.isArray(window.LANGS) && window.LANGS.length ? window.LANGS : [
        // 🌍 English
      { code: "en", name: "English",            flag: "./assets/img/flags/gb.png", file: "./assets/lang/en.json" },
      // 🧭 Scandinavian
      { code: "da", name: "Dansk",              flag: "./assets/img/flags/dk.png", file: "./assets/lang/da.json" },
      { code: "fi", name: "Suomi",              flag: "./assets/img/flags/fi.png", file: "./assets/lang/fi.json" },
      { code: "is", name: "Íslenska",           flag: "./assets/img/flags/is.png", file: "./assets/lang/is.json" },
      { code: "no", name: "Norsk",              flag: "./assets/img/flags/no.png", file: "./assets/lang/no.json" },
      { code: "sv", name: "Svenska",            flag: "./assets/img/flags/se.png", file: "./assets/lang/sv.json" },
      // 🇪🇺 European
      { code: "de", name: "Deutsch",            flag: "./assets/img/flags/de.png", file: "./assets/lang/de.json" },
      { code: "es", name: "Español",            flag: "./assets/img/flags/es.png", file: "./assets/lang/es.json" },
      { code: "fr", name: "Français",           flag: "./assets/img/flags/fr.png", file: "./assets/lang/fr.json" },
      { code: "hu", name: "Magyar",             flag: "./assets/img/flags/hu.png", file: "./assets/lang/hu.json" },
      { code: "it", name: "Italiano",           flag: "./assets/img/flags/it.png", file: "./assets/lang/it.json" },
      { code: "ro", name: "română",             flag: "./assets/img/flags/ro.png", file: "./assets/lang/ro.json" },
      { code: "nl", name: "Nederlands",         flag: "./assets/img/flags/nl.png", file: "./assets/lang/nl.json" },
      { code: "pl", name: "Polski",             flag: "./assets/img/flags/pl.png", file: "./assets/lang/pl.json" },
      { code: "pt", name: "Português",          flag: "./assets/img/flags/pt.png", file: "./assets/lang/pt.json" },
      { code: "ru", name: "Русский",            flag: "./assets/img/flags/ru.png", file: "./assets/lang/ru.json" },
      { code: "sk", name: "Slovenčina",         flag: "./assets/img/flags/sk.png", file: "./assets/lang/sk.json" },
      { code: "sr", name: "Српски",             flag: "./assets/img/flags/sr.png", file: "./assets/lang/sr.json" },
      { code: "tr", name: "Türkçe",             flag: "./assets/img/flags/tr.png", file: "./assets/lang/tr.json" },
      { code: "uk", name: "Українська",         flag: "./assets/img/flags/ua.png", file: "./assets/lang/uk.json" },
      // 🌏 Asian
      { code: "hi", name: "हिन्दी",                flag: "./assets/img/flags/in.png", file: "./assets/lang/hi.json" },
      { code: "id", name: "Bahasa",             flag: "./assets/img/flags/id.png", file: "./assets/lang/id.json" },
      { code: "ja", name: "日本語",              flag: "./assets/img/flags/jp.png", file: "./assets/lang/ja.json" },
      { code: "ko", name: "한국어",               flag: "./assets/img/flags/kr.png", file: "./assets/lang/ko.json" },
      { code: "th", name: "ไทย",                flag: "./assets/img/flags/th.png", file: "./assets/lang/th.json" },
      { code: "vi", name: "Tiếng Việt",         flag: "./assets/img/flags/vn.png", file: "./assets/lang/vi.json" },
      { code: "zh-Hans", name: "中文 (简体)",     flag: "./assets/img/flags/cn.png", file: "./assets/lang/zh-Hans.json" },
  ];
  const SUPPORTED = () => getLangs().map(x => x.code);
  const DEFAULT = () => (SUPPORTED().includes("en") ? "en" : SUPPORTED()[0]);

  // Hämta sparat språk eller navigatorn
  const pickLang = () => {
    const sup = SUPPORTED();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && sup.includes(saved)) return saved;
    const nav = (navigator.language || DEFAULT()).slice(0,2).toLowerCase();
    return sup.includes(nav) ? nav : DEFAULT();
  };

  // Hjälpfunktion: läs "site.title" från nästlad JSON
  function getByPath(obj, path){
    return path.split('.').reduce((o,k)=> (o && typeof o==='object') ? o[k] : undefined, obj);
  }

  // Ladda språk och applicera
  const loadLang = async (lang = pickLang()) => {
    try {
      const conf = getLangs().find(x => x.code === lang);
      const url  = conf?.file || `./assets/lang/${lang}.json`;
      const res  = await fetch(url, { cache: "no-store" });
      const dict = await res.json();

      // <html lang="..">
      document.documentElement.setAttribute('lang', lang);

      // <title data-i18n="site.title">
      const titleEl = document.querySelector("title[data-i18n]");
      if (titleEl) {
        const t = getByPath(dict, titleEl.dataset.i18n);
        if (typeof t === "string") document.title = t;
      }

      // Alla element med data-i18n (t.ex. "index.catchtitle")
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (!key) return;
        const txt = getByPath(dict, key);
        if (typeof txt === "string") el.innerHTML = txt;
      });

      // --- NYTT: Attribut-baserad i18n för formulär m.m. ---

      // PLACEHOLDER för <input>/<textarea>
      document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        const val = getByPath(dict, key);
        if (typeof val === "string") el.setAttribute("placeholder", val);
      });

      // VALUE för <input type="submit|button|..."> om du använder input istället för <button>
      document.querySelectorAll("[data-i18n-value]").forEach(el => {
        const key = el.getAttribute("data-i18n-value");
        const val = getByPath(dict, key);
        if (typeof val === "string") el.setAttribute("value", val);
      });

      // TITLE-attribute (tooltips)
      document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        const val = getByPath(dict, key);
        if (typeof val === "string") el.setAttribute("title", val);
      });

      // ARIA-labels för tillgänglighet
      document.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
        const key = el.getAttribute("data-i18n-aria-label");
        const val = getByPath(dict, key);
        if (typeof val === "string") el.setAttribute("aria-label", val);
      });

      // Markera aktivt språk i listor
      document.querySelectorAll("[data-lang]").forEach(btn => {
        btn.toggleAttribute("aria-current", btn.dataset.lang === lang);
      });
    } catch (e) {
      console.error("i18n load failed", e);
    }
  };

  // Global: byt språk + uppdatera knapp
  window.setLanguage = async (lang) => {
    const sup = SUPPORTED();
    if (!sup.includes(lang)) lang = DEFAULT();
    localStorage.setItem(STORAGE_KEY, lang);
    await loadLang(lang);

    const btn  = document.getElementById('langBtn');
    const conf = getLangs().find(x => x.code === lang);
    if (btn && conf) {
      const label = btn.querySelector('.label');
      const img   = btn.querySelector('.flag');
      if (label) label.textContent = conf.name || lang.toUpperCase();
      if (img)   img.src = conf.flag || `./assets/img/flags/${lang}.png`;    }
  };

  function initI18n() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, pickLang());
    }
    loadLang(localStorage.getItem(STORAGE_KEY));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
  document.addEventListener('turbo:load', initI18n);
  document.addEventListener('htmx:afterSettle', initI18n);
})();
