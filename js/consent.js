// /assets/js/consent.js
(() => {
  const HTML = `
<div class="consent-banner consent-hidden" id="consentBanner" role="region" aria-label="Cookie consent">
  <div class="consent-banner__card">
    <div class="consent-banner__text">
      <span data-i18n="cookiessmall.cookiessubtitle">
        We use cookies and similar technologies to operate the site (necessary) and – with your consent – for
        <strong>analytics</strong>, <strong>preferences</strong> and <strong>marketing</strong>.
      </span>
      <small data-i18n="cookiessmall.cookieschange">
        You can change your settings anytime via <span class="consent-link" data-consent-open>Cookie settings</span>.
        For California: <span class="consent-link" data-donotsell>Do Not Sell or Share</span>.
      </small>
    </div>
    <div class="consent-actions">
      <button class="consent-btn consent-btn--ghost" id="consentRejectAll" data-i18n="cookiessmall.rejectbtn">Reject all</button>
      <button class="consent-btn consent-btn--ghost" id="consentCustomize" data-i18n="cookiessmall.customizebtn">Customize</button>
      <button class="consent-btn consent-btn--primary" id="consentAcceptAll" data-i18n="cookiessmall.acceptbtn">Accept all</button>
    </div>
  </div>
</div>

<div class="consent-overlay consent-hidden" id="consentOverlay" aria-hidden="true">
  <div class="consent-modal" role="dialog" aria-modal="true" aria-labelledby="consentTitle">
    <header>
      <h2 id="consentTitle" data-i18n="cookieslarge.cookiestitle">Privacy & Cookies</h2>
      <button class="consent-close" id="consentClose" aria-label="Close">×</button>
    </header>
    <div class="consent-body">

      <div class="consent-section">
        <div class="consent-row">
          <div class="consent-col">
            <div class="consent-title" data-i18n="cookieslarge.neccessarytitle">Necessary</div>
            <div class="consent-desc" data-i18n="cookieslarge.neccessarysubtitle">
              Required for the website to function properly. Cannot be disabled.
            </div>
          </div>
          <label class="switch" aria-label="Necessary (always on)">
            <input type="checkbox" checked disabled>
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="consent-section">
        <div class="consent-row">
          <div class="consent-col">
            <div class="consent-title" data-i18n="cookieslarge.preferencestitle">Preferences</div>
            <div class="consent-desc" data-i18n="cookieslarge.preferencessubtitle">
              Stores settings such as language/region and UI choices.
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" id="consentPref">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="consent-section">
        <div class="consent-row">
          <div class="consent-col">
            <div class="consent-title" data-i18n="cookieslarge.analyticstitle">Analytics</div>
            <div class="consent-desc" data-i18n="cookieslarge.analyticssubtitle">
              Helps us understand traffic and improve the experience.
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" id="consentAnalytics">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="consent-section">
        <div class="consent-row">
          <div class="consent-col">
            <div class="consent-title" data-i18n="cookieslarge.marketingtitle">Marketing</div>
            <div class="consent-desc" data-i18n="cookieslarge.marketingsubtitle">
              Used for personalized advertising and measurement.
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" id="consentMarketing">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="consent-section">
        <div class="consent-row">
          <div class="consent-col">
            <div class="consent-title" data-i18n="cookieslarge.ccpatitle">CCPA – Do Not Sell or Share</div>
            <div class="consent-desc" data-i18n="cookieslarge.ccpasubtitle">
              California residents may opt out of the sharing/sale of personal data for cross-context advertising.
              Click: <span class="consent-link" data-donotsell>Do Not Sell or Share</span>.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="consent-footer">
      <button class="consent-btn consent-btn--ghost" id="consentRejectAll2" data-i18n="cookieslarge.rejectbtn">Reject all</button>
      <button class="consent-btn consent-btn--primary" id="consentSave" data-i18n="cookieslarge.savebtn">Save choices</button>
    </div>
  </div>
</div>
`;

  function inject() {
    const wrap = document.createElement('div');
    wrap.innerHTML = HTML;
    document.body.appendChild(wrap);
  }

  const KEY = 'gh_consent_v1';
  const EXPIRES_DAYS = 180;
  const defaultState = {
    version: 1,
    timestamp: null,
    expiresAt: null,
    regionHint: (navigator.language || '').toLowerCase(),
    categories: { necessary: true, preferences: false, analytics: false, marketing: false },
    ccpa_opt_out: false
  };

  const $ = (sel) => document.querySelector(sel);
  const nowMs = () => Date.now();
  const addDays = (ms, d) => ms + d*24*60*60*1000;

  function getState(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return structuredClone(defaultState);
      const s = JSON.parse(raw);
      if(!s.categories) s.categories = structuredClone(defaultState.categories);
      return s;
    }catch{ return structuredClone(defaultState); }
  }
  function saveState(s){
    const ts = nowMs();
    s.timestamp = ts;
    s.expiresAt = addDays(ts, EXPIRES_DAYS);
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent('gh-consent-changed', { detail: s }));
  }
  const hasExpired = (s) => !s?.expiresAt || nowMs() > s.expiresAt;

  function showBannerIfNeeded(){
    const s = getState();
    const banner = $('#consentBanner');
    if(!s.timestamp || hasExpired(s)) banner?.classList.remove('consent-hidden');
    else banner?.classList.add('consent-hidden');
  }

  function syncModalFromState(s){
    $('#consentPref').checked      = !!s.categories.preferences;
    $('#consentAnalytics').checked = !!s.categories.analytics;
    $('#consentMarketing').checked = !!s.categories.marketing;
  }
  function openModal(){
    syncModalFromState(getState());
    const overlay = $('#consentOverlay');
    overlay.classList.remove('consent-hidden');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(()=>$('#consentClose')?.focus(),0);
  }
  function closeModal(){
    const overlay = $('#consentOverlay');
    overlay.classList.add('consent-hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function acceptAll(){
    const s = getState();
    s.categories.preferences = s.categories.analytics = s.categories.marketing = true;
    s.ccpa_opt_out = false;
    saveState(s);
    $('#consentBanner')?.classList.add('consent-hidden');
    closeModal();
  }
  function rejectAll(){
    const s = getState();
    s.categories.preferences = s.categories.analytics = s.categories.marketing = false;
    saveState(s);
    $('#consentBanner')?.classList.add('consent-hidden');
    closeModal();
  }
  function doNotSell(){
    const s = getState();
    s.categories.analytics = s.categories.marketing = false;
    s.ccpa_opt_out = true;
    saveState(s);
    $('#consentBanner')?.classList.add('consent-hidden');
    closeModal();
  }
  function saveFromModal(){
    const s = getState();
    s.categories.preferences = !!$('#consentPref').checked;
    s.categories.analytics   = !!$('#consentAnalytics').checked;
    s.categories.marketing   = !!$('#consentMarketing').checked;
    saveState(s);
    $('#consentBanner')?.classList.add('consent-hidden');
    closeModal();
  }

  // Exponera hjälpare globalt
  window.ghConsent = {
    get: () => getState(),
    allows: (key) => key === 'necessary' ? true : !!getState().categories[key],
    open: () => openModal(),
    reset: () => { localStorage.removeItem(KEY); showBannerIfNeeded(); }
  };

  function bind(){
  $('#consentAcceptAll') .addEventListener('click', acceptAll);
  $('#consentRejectAll') .addEventListener('click', rejectAll);
  $('#consentCustomize') .addEventListener('click', openModal);
  $('#consentSave')      .addEventListener('click', saveFromModal);
  $('#consentRejectAll2').addEventListener('click', rejectAll);
  $('#consentClose')     .addEventListener('click', closeModal);

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !$('#consentOverlay').classList.contains('consent-hidden')) closeModal();
  });

  // ✅ Event delegation – funkar även om header/footer injiceras efteråt
document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-consent-open], #open-consent');
  if (open) { e.preventDefault(); openModal(); return; }

  const ccpa = e.target.closest('[data-donotsell]');
  if (ccpa) { e.preventDefault(); doNotSell(); return; }

  // 🧪 Dev-reset: visar bannern igen precis som för första-besöket
  const reset = e.target.closest('[data-consent-reset], #reset-consent');
  if (reset) { e.preventDefault(); window.ghConsent.reset(); return; }
}, { passive: false });

}


  function init(){
    inject();
    bind();
    showBannerIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  

  // Stöd för navigering med Turbo/HTMX (om du använder det)
  document.addEventListener('turbo:load', init);
  document.addEventListener('htmx:afterSettle', init);
})();
