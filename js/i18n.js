// /js/i18n.js  (drop-in fix)
(() => {
  const STORAGE_KEY = "lang";

  // === Val: styr hur vi väljer start-språk ===
  // 1) Tvinga ett språk som default (t.ex. "en"). Sätt till null för att inte tvinga.
  const FORCE_DEFAULT = null; // ex: "en"
  // 2) Om FORCE_DEFAULT är null: ska vi använda navigator.language som auto? (annars "en")
  const USE_NAVIGATOR = true;

  // Läs stödda språk från window.LANGS om möjligt (sanningskällan), annars fallback
  const getLangs = () => Array.isArray(window.LANGS) && window.LANGS.length ? window.LANGS : [
    { code:"en", name:"English",  flag:"./assets/img/flags/gb.png", file:"./assets/lang/en.json" },
    { code:"da", name:"Dansk",    flag:"./assets/img/flags/dk.png", file:"./assets/lang/da.json" },
    { code:"fi", name:"Suomi",    flag:"./assets/img/flags/fi.png", file:"./assets/lang/fi.json" },
    { code:"is", name:"Íslenska", flag:"./assets/img/flags/is.png", file:"./assets/lang/is.json" },
    { code:"no", name:"Norsk",    flag:"./assets/img/flags/no.png", file:"./assets/lang/no.json" },
    { code:"sv", name:"Svenska",  flag:"./assets/img/flags/se.png", file:"./assets/lang/sv.json" },
    { code:"de", name:"Deutsch",  flag:"./assets/img/flags/de.png", file:"./assets/lang/de.json" },
    { code:"es", name:"Español",  flag:"./assets/img/flags/es.png", file:"./assets/lang/es.json" },
    { code:"fr", name:"Français", flag:"./assets/img/flags/fr.png", file:"./assets/lang/fr.json" },
    { code:"hu", name:"Magyar",   flag:"./assets/img/flags/hu.png", file:"./assets/lang/hu.json" },
    { code:"it", name:"Italiano", flag:"./assets/img/flags/it.png", file:"./assets/lang/it.json" },
    { code:"ro", name:"română",   flag:"./assets/img/flags/ro.png", file:"./assets/lang/ro.json" },
    { code:"nl", name:"Nederlands", flag:"./assets/img/flags/nl.png", file:"./assets/lang/nl.json" },
    { code:"pl", name:"Polski",   flag:"./assets/img/flags/pl.png", file:"./assets/lang/pl.json" },
    { code:"pt", name:"Português", flag:"./assets/img/flags/pt.png", file:"./assets/lang/pt.json" },
    { code:"ru", name:"Русский",  flag:"./assets/img/flags/ru.png", file:"./assets/lang/ru.json" },
    { code:"sk", name:"Slovenčina", flag:"./assets/img/flags/sk.png", file:"./assets/lang/sk.json" },
    { code:"sr", name:"Српски",   flag:"./assets/img/flags/sr.png", file:"./assets/lang/sr.json" },
    { code:"tr", name:"Türkçe",   flag:"./assets/img/flags/tr.png", file:"./assets/lang/tr.json" },
    { code:"uk", name:"Українська", flag:"./assets/img/flags/ua.png", file:"./assets/lang/uk.json" },
    { code:"hi", name:"हिन्दी",   flag:"./assets/img/flags/in.png", file:"./assets/lang/hi.json" },
    { code:"id", name:"Bahasa",   flag:"./assets/img/flags/id.png", file:"./assets/lang/id.json" },
    { code:"ja", name:"日本語",    flag:"./assets/img/flags/jp.png", file:"./assets/lang/ja.json" },
    { code:"ko", name:"한국어",     flag:"./assets/img/flags/kr.png", file:"./assets/lang/ko.json" },
    { code:"th", name:"ไทย",      flag:"./assets/img/flags/th.png", file:"./assets/lang/th.json" },
    { code:"vi", name:"Tiếng Việt", flag:"./assets/img/flags/vn.png", file:"./assets/lang/vi.json" },
    { code:"zh-Hans", name:"中文 (简体)", flag:"./assets/img/flags/cn.png", file:"./assets/lang/zh-Hans.json" },
  ];
  const SUPPORTED = () => getLangs().map(x => x.code);
  const DEFAULT   = () => (SUPPORTED().includes("en") ? "en" : SUPPORTED()[0]);

  // Hjälpfunktion: läs "site.title" från nästlad JSON
  function getByPath(obj, path){
    return path.split('.').reduce((o,k)=> (o && typeof o==='object') ? o[k] : undefined, obj);
  }

  // Hitta vilket språk vi ska använda
  const pickLang = () => {
    const sup = SUPPORTED();

    // 0) Tvingad default?
    if (FORCE_DEFAULT && sup.includes(FORCE_DEFAULT)) return FORCE_DEFAULT;

    // 1) Sparat av användaren?
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && sup.includes(saved)) return saved;

    // 2) Auto via navigator?
    if (USE_NAVIGATOR) {
      const nav = (navigator.language || "").toLowerCase();
      // matcha ex. sv-SE → sv, pt-BR → pt, zh-Hans → zh-Hans
      const exact = sup.find(c => c === nav);
      if (exact) return exact;
      const short = nav.slice(0,2);
      if (sup.includes(short)) return short;
    }

    // 3) Fallback
    return DEFAULT();
  };

  // Uppdatera språkknappen (label + flagga)
  function updateLangButton(lang){
    const conf = getLangs().find(x => x.code === lang);
    const btn  = document.getElementById('langBtn');
    if (!btn || !conf) return;
    const label = btn.querySelector('.label');
    const img   = btn.querySelector('.flag');
    if (label) label.textContent = conf.name || lang.toUpperCase();
    if (img)   img.src = conf.flag || `./assets/img/flags/${lang}.png`;
    btn.setAttribute('data-current-lang', lang);
    btn.toggleAttribute("aria-current", true);
  }

  // Ladda språk och applicera + se till att knappen synkar
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

      // Textnoder
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (!key) return;
        const txt = getByPath(dict, key);
        if (typeof txt === "string") el.innerHTML = txt;
      });

      // Attribut (placeholder, value, title, aria-label)
      document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        const val = getByPath(dict, key);
        if (typeof val === "string") el.setAttribute("placeholder", val);
      });
      document.querySelectorAll("[data-i18n-value]").forEach(el => {
        const key = el.getAttribute("data-i18n-value");
        const val = getByPath(dict, key);
        if (typeof val === "string") el.setAttribute("value", val);
      });
      document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        const val = getByPath(dict, key);
        if (typeof val === "string") el.setAttribute("title", val);
      });
      document.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
        const key = el.getAttribute("data-i18n-aria-label");
        const val = getByPath(dict, key);
        if (typeof val === "string") el.setAttribute("aria-label", val);
      });

      // Markera aktivt språk i listor
      document.querySelectorAll("[data-lang]").forEach(btn => {
        btn.toggleAttribute("aria-current", btn.dataset.lang === lang);
      });

      // NYTT: uppdatera språkknappen även vid första laddningen
      updateLangButton(lang);
    } catch (e) {
      console.error("i18n load failed", e);
    }
  };

  // Global: byt språk + spara
  window.setLanguage = async (lang) => {
    const sup = SUPPORTED();
    if (!sup.includes(lang)) lang = DEFAULT();
    localStorage.setItem(STORAGE_KEY, lang);
    await loadLang(lang);
  };

  // Init – välj språk, spara om saknas, ladda och synka UI
  async function initI18n() {
    const lang = pickLang();
    if (localStorage.getItem(STORAGE_KEY) !== lang) {
      localStorage.setItem(STORAGE_KEY, lang);
    }
    await loadLang(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
  document.addEventListener('turbo:load', initI18n);
  document.addEventListener('htmx:afterSettle', initI18n);

  // --- Valfritt: IP/Geo-gissning ---
  // OBS: kräver extern tjänst (sekretess & CORS). Om du absolut vill:
  // (1) Lägg till en mapping från landskod → språk (t.ex. SE→sv, NO→no, DK→da, FI→fi, annars en)
  // (2) Kör detta EN gång vid första besöket om ingen lang finns sparad.
  /*
  async function guessLangFromIP() {
    try {
      const r = await fetch("https://ipapi.co/json/"); // exempeltjänst
      const j = await r.json();
      const cc = (j && j.country_code) ? j.country_code.toUpperCase() : "US";
      const map = { SE:"sv", NO:"no", DK:"da", FI:"fi", IS:"is" };
      const sup = SUPPORTED();
      const lang = map[cc] && sup.includes(map[cc]) ? map[cc] : DEFAULT();
      return lang;
    } catch {
      return DEFAULT();
    }
  }
  // Exempel-användning:
  // if (!localStorage.getItem(STORAGE_KEY)) {
  //   const ipLang = await guessLangFromIP();
  //   localStorage.setItem(STORAGE_KEY, ipLang);
  // }
  */
})();
