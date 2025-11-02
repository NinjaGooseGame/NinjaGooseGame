// /js/i18n.js  (drop-in fix: synka språkknapp när headern dyker upp)
(() => {
  const STORAGE_KEY = "lang";

  // === Val: styr start-språk ===
  // Sätt till "en" om du alltid vill börja på engelska, annars lämna null.
  const FORCE_DEFAULT = null; // ex: "en"
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

  function getByPath(obj, path){
    return path.split('.').reduce((o,k)=> (o && typeof o==='object') ? o[k] : undefined, obj);
  }

  const norm = s => (s||"").toLowerCase().split('-')[0];

  const pickLang = () => {
    const sup = SUPPORTED();
    if (FORCE_DEFAULT && sup.includes(FORCE_DEFAULT)) return FORCE_DEFAULT;

    const saved = (localStorage.getItem(STORAGE_KEY) || "").toLowerCase();
    if (saved && sup.includes(saved)) return saved;

    if (USE_NAVIGATOR) {
      const nav = (navigator.language || "").toLowerCase();
      if (sup.includes(nav)) return nav;
      const short = nav.slice(0,2);
      if (sup.includes(short)) return short;
    }
    return DEFAULT();
  };

  function updateActiveMarkers(lang){
    document.querySelectorAll("[data-lang]").forEach(btn => {
      btn.toggleAttribute("aria-current", btn.dataset.lang === lang);
    });
  }

  function updateLangButton(lang){
    const conf = getLangs().find(x => x.code === lang);
    const btn  = document.getElementById('langBtn');
    if (!btn || !conf) return false;
    const label = btn.querySelector('.label');
    const img   = btn.querySelector('.flag');
    if (label) label.textContent = conf.name || lang.toUpperCase();
    if (img)   img.src = conf.flag || `./assets/img/flags/${lang}.png`;
    btn.setAttribute('data-current-lang', lang);
    btn.toggleAttribute("aria-current", true);
    return true;
  }

  function currentLang(){
    return (document.documentElement.getAttribute("lang")
         || localStorage.getItem(STORAGE_KEY)
         || pickLang());
  }

  // Synka UI (knapp + markeringar). Kör den säkert även om knappen inte finns ännu.
  function syncLangUI(){
    const lang = currentLang();
    const ok = updateLangButton(lang);
    updateActiveMarkers(lang);
    return ok;
  }

  // Ladda och applicera översättningar
  const loadLang = async (lang = pickLang()) => {
    try {
      const conf = getLangs().find(x => x.code === lang);
      const url  = conf?.file || `./assets/lang/${lang}.json`;
      const res  = await fetch(url, { cache: "no-store" });
      const dict = await res.json();

      document.documentElement.setAttribute('lang', lang);

      const titleEl = document.querySelector("title[data-i18n]");
      if (titleEl) {
        const t = getByPath(dict, titleEl.dataset.i18n);
        if (typeof t === "string") document.title = t;
      }

      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (!key) return;
        const txt = getByPath(dict, key);
        if (typeof txt === "string") el.innerHTML = txt;
      });

      [["data-i18n-placeholder","placeholder"],
       ["data-i18n-value","value"],
       ["data-i18n-title","title"],
       ["data-i18n-aria-label","aria-label"]]
      .forEach(([attr, target])=>{
        document.querySelectorAll("["+attr+"]").forEach(el=>{
          const key = el.getAttribute(attr);
          const val = getByPath(dict, key);
          if (typeof val === "string") el.setAttribute(target, val);
        });
      });

      // Försök synka knappen direkt…
      if (!syncLangUI()) {
        // …om den inte finns än, vänta in den med observer + tidsbackup
        waitForLangButtonThenSync();
      }
    } catch (e) {
      console.error("i18n load failed", e);
    }
  };

  // Publik API
  window.setLanguage = async (lang) => {
    const sup = SUPPORTED();
    if (!sup.includes(lang)) lang = DEFAULT();
    localStorage.setItem(STORAGE_KEY, lang);
    await loadLang(lang);
  };

  async function initI18n() {
    const lang = pickLang();
    if (localStorage.getItem(STORAGE_KEY) !== lang) {
      localStorage.setItem(STORAGE_KEY, lang);
    }
    await loadLang(lang);
  }

  // === Vänta in att #langBtn dyker upp (t.ex. efter att headern inkluderats) ===
  function waitForLangButtonThenSync() {
    // 1) MutationObserver – snabb och exakt
    const obs = new MutationObserver(() => {
      if (document.getElementById('langBtn')) {
        syncLangUI();
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    // 2) Tidsbackup: prova några gånger det första sekunderna
    let tries = 0;
    const max = 20; // ~2s
    const tick = () => {
      if (syncLangUI() || tries++ > max) return;
      setTimeout(tick, 100);
    };
    tick();
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }

  // Stöd för navigationsramverk/partials
  document.addEventListener('turbo:load', initI18n);
  document.addEventListener('htmx:afterSettle', initI18n);

  // Om include.js triggar en custom event efter att header/footer laddats — lyssna och synka.
  // (Du behöver inte ändra include.js för att detta ska funka, men om du redan sänder en event är vi redo.)
  ["partials:loaded","partials:ready","header:loaded","footer:loaded"].forEach(evt=>{
    document.addEventListener(evt, () => {
      if (!syncLangUI()) waitForLangButtonThenSync();
    });
  });
})();
