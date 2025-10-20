// /js/lang-menu.js
(() => {
  // ENDA sanningskällan för språklistan
  window.LANGS = [
  // 🌍 English
{ code: "en", name: "English",            flag: "/assets/img/flags/gb.png", file: "/assets/lang/en.json" },
// 🧭 Scandinavian
{ code: "da", name: "Dansk",              flag: "/assets/img/flags/dk.png", file: "/assets/lang/da.json" },
{ code: "fi", name: "Suomi",              flag: "/assets/img/flags/fi.png", file: "/assets/lang/fi.json" },
{ code: "is", name: "Íslenska",           flag: "/assets/img/flags/is.png", file: "/assets/lang/is.json" },
{ code: "no", name: "Norsk",              flag: "/assets/img/flags/no.png", file: "/assets/lang/no.json" },
{ code: "sv", name: "Svenska",            flag: "/assets/img/flags/se.png", file: "/assets/lang/sv.json" },
// 🇪🇺 European
{ code: "de", name: "Deutsch",            flag: "/assets/img/flags/de.png", file: "/assets/lang/de.json" },
{ code: "es", name: "Español",            flag: "/assets/img/flags/es.png", file: "/assets/lang/es.json" },
{ code: "fr", name: "Français",           flag: "/assets/img/flags/fr.png", file: "/assets/lang/fr.json" },
{ code: "hu", name: "Magyar",             flag: "/assets/img/flags/hu.png", file: "/assets/lang/hu.json" },
{ code: "it", name: "Italiano",           flag: "/assets/img/flags/it.png", file: "/assets/lang/it.json" },
{ code: "ro", name: "română",             flag: "/assets/img/flags/ro.png", file: "/assets/lang/ro.json" },
{ code: "nl", name: "Nederlands",         flag: "/assets/img/flags/nl.png", file: "/assets/lang/nl.json" },
{ code: "pl", name: "Polski",             flag: "/assets/img/flags/pl.png", file: "/assets/lang/pl.json" },
{ code: "pt", name: "Português",          flag: "/assets/img/flags/pt.png", file: "/assets/lang/pt.json" },
{ code: "ru", name: "Русский",            flag: "/assets/img/flags/ru.png", file: "/assets/lang/ru.json" },
{ code: "sk", name: "Slovenčina",         flag: "/assets/img/flags/sk.png", file: "/assets/lang/sk.json" },
{ code: "sr", name: "Српски",             flag: "/assets/img/flags/sr.png", file: "/assets/lang/sr.json" },
{ code: "tr", name: "Türkçe",             flag: "/assets/img/flags/tr.png", file: "/assets/lang/tr.json" },
{ code: "uk", name: "Українська",         flag: "/assets/img/flags/ua.png", file: "/assets/lang/uk.json" },
// 🌏 Asian
{ code: "hi", name: "हिन्दी",                flag: "/assets/img/flags/in.png", file: "/assets/lang/hi.json" },
{ code: "id", name: "Bahasa",             flag: "/assets/img/flags/id.png", file: "/assets/lang/id.json" },
{ code: "ja", name: "日本語",              flag: "/assets/img/flags/jp.png", file: "/assets/lang/ja.json" },
{ code: "ko", name: "한국어",               flag: "/assets/img/flags/kr.png", file: "/assets/lang/ko.json" },
{ code: "th", name: "ไทย",                flag: "/assets/img/flags/th.png", file: "/assets/lang/th.json" },
{ code: "vi", name: "Tiếng Việt",         flag: "/assets/img/flags/vn.png", file: "/assets/lang/vi.json" },
{ code: "zh-Hans", name: "中文 (简体)",     flag: "/assets/img/flags/cn.png", file: "/assets/lang/zh-Hans.json" },
  ];

  const byCode = (c) => (window.LANGS || []).find(x => x.code === c);

  function ensureLangSwitch() {
    const desiredMount =
      document.getElementById('langMount') ||
      document.querySelector('.header-inner') ||
      null;

    let existing = document.getElementById('langSwitch');
    if (existing) {
      if (desiredMount && existing.parentElement !== desiredMount) {
        desiredMount.appendChild(existing);
      }
      return existing;
    }

    const mount = desiredMount || document.body;
    const wrap = document.createElement('div');
    wrap.id = 'langSwitch';
    wrap.className = 'lang-switch';
    wrap.innerHTML = `
      <button id="langBtn" class="lang-switch__btn" aria-haspopup="true" aria-expanded="false">
        <span class="label">English</span>
        <img class="flag" src="/assets/img/flags/en.png" alt="">
      </button>
      <div id="langMenu" class="lang-switch__menu" role="menu" aria-label="Language"></div>
    `;
    mount.appendChild(wrap);
    return wrap;
  }

  function buildHeaderMenu() {
    const wrap = ensureLangSwitch();
    const menu = document.getElementById('langMenu');
    const btn  = document.getElementById('langBtn');
    if (!menu || !btn) return;

    menu.innerHTML = "";
    (window.LANGS || []).forEach(({code, name, flag}) => {
      const el = document.createElement('button');
      el.className = 'lang-item';
      el.setAttribute('data-lang', code);
      el.setAttribute('role', 'menuitem');
      el.innerHTML = `<span>${name}</span><img class="flag" src="${flag}" alt="">`;
      menu.appendChild(el);
    });

    const current = localStorage.getItem('lang') || 'en';
    const meta = byCode(current) || (window.LANGS || [])[0];
    btn.querySelector('.label')?.replaceChildren(document.createTextNode(meta?.name || current.toUpperCase()));
    const img = btn.querySelector('.flag');
    if (img) img.src = meta?.flag || `/assets/img/flags/${current}.png`;
  }

  function toggleMenu(open) {
    ensureLangSwitch();
    const btn  = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');
    if (!btn || !menu) return;

    if (open === undefined) open = !menu.classList.contains('is-open');

    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.style.display = open ? 'block' : 'none';
    if (open) {
      const z = getComputedStyle(menu).zIndex;
      if (!z || z === 'auto') menu.style.zIndex = '10060';
    }
  }

  function bindOnce(){
    if (window.__langBound) return;
    window.__langBound = true;

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#langBtn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      ensureLangSwitch();
      toggleMenu();
    }, { passive:false });

    document.addEventListener('click', (e) => {
      const item = e.target.closest('#langMenu .lang-item');
      if (!item) return;
      const lang = item.getAttribute('data-lang');
      if (lang) window.setLanguage?.(lang);   // -> i18n.js
      toggleMenu(false);
      buildHeaderMenu();
    });

    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('langSwitch');
      const menu = document.getElementById('langMenu');
      if (!wrap || !menu || !menu.classList.contains('is-open')) return;
      if (!wrap.contains(e.target)) toggleMenu(false);
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleMenu(false);
      }
    });
  }

  function initLangUI(){
    ensureLangSwitch();
    buildHeaderMenu();
    bindOnce();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangUI);
  } else {
    initLangUI();
  }
  document.addEventListener('turbo:load', initLangUI);
  document.addEventListener('htmx:afterSettle', initLangUI);
})();
