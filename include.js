// include.js
async function loadHTML(id, file) {
  const el = document.getElementById(id);
  if (!el) return null;

  try {
    // Bygg URL utifrån dokumentets baseURI (fungerar lokalt, GitHub Pages och eget domän)
    const url = new URL(file, document.baseURI).href;
    const res = await fetch(url, { cache: "no-cache" });

    if (!res.ok) {
      console.error("include failed:", url, res.status);
      return el; // hoppa över injicering vid 404/fel
    }

    const html = await res.text();
    el.innerHTML = html;
  } catch (err) {
    console.error("include error:", file, err);
  }

  return el;
}

function initHeaderBehavior(root = document) {
  const header = root.querySelector('.header');
  const btn = root.querySelector('.menu-toggle');
  const panel = root.querySelector('#menu-panel');

  // Shrink on scroll (toggle .is-shrunk)
  const onScroll = () => {
    // Frys shrink när mobilmeny är öppen
    if (document.body.classList.contains('menu-open')) {
      // uppdatera spacer så panelen alltid ligger tight mot headern
      const h = header?.offsetHeight || 0;
      document.body.style.setProperty('--header-spacer', `${h}px`);
      return;
    }
    if (!header) return;
    const shrink = window.scrollY > 8;
    header.classList.toggle('is-shrunk', shrink);

    // håll spacer i sync med faktisk headerhöjd
    const h = header.offsetHeight;
    document.body.style.setProperty('--header-spacer', `${h}px`);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle with aria + shadow logic
  if (btn && panel && header) {
    const mq = window.matchMedia('(max-width: 900px)');

    function setExpanded(open){
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      header.classList.toggle('menu-open', open); // remove header shadow when open
    }

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      setExpanded(!open);
    });

    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) setExpanded(false);
    });

    function handleResize(){
      if (!mq.matches) setExpanded(false); // closing when switching to desktop
    }
    window.addEventListener('resize', handleResize);
    handleResize();
  }
}

function initFooterYear(root = document) {
  const start = 2025;
  const now = new Date().getFullYear();
  const el = root.querySelector('#year');
  if (el) el.textContent = now > start ? `${start} - ${now}` : String(start);
}

/* =========================
   Robust logofix
   ========================= */
async function resolveLogoSrc(logo) {
  if (!logo) return;

  const base = document.baseURI;
  const origin = window.location.origin;

  // Försök gissa repo-path om vi kör under github.io/user/repo/...
  const m = window.location.pathname.match(/^\/([^/]+)\//);
  const repo = (window.location.hostname.endsWith('github.io') && m) ? m[1] : '';

  // 1) Nuvarande src normaliserad mot base
  const currentAttr = logo.getAttribute('src') || '';
  const candidate1 = safeUrl(currentAttr, base);

  // 2) Vanlig assets-sökväg relativt base
  const candidate2 = safeUrl('assets/img/Goosehunt_Logo.png', base);

  // 3) Repo-prefixad absolut (för säkerhets skull på github.io)
  const candidate3 = repo ? `${origin}/${repo}/assets/img/Goosehunt_Logo.png` : null;

  // 4) Testa även med ev. annorlunda versalisering om filen råkat döpas fel
  // (Den här delen kan du ta bort om du vill strama åt.)
  const variations = [
    'assets/img/GooseHunt_Logo.png',
    'assets/img/goosehunt_logo.png',
    'assets/img/GOOSEHUNT_LOGO.png',
  ].map(p => safeUrl(p, base));

  const candidates = [
    candidate1,
    candidate2,
    candidate3,
    ...variations
  ].filter(Boolean);

  // Prova i tur och ordning: HEAD → fall tillbaka på Image()
  for (const url of candidates) {
    try {
      const okHead = await tryHead(url);
      if (okHead) {
        logo.src = url;
        console.info('[logo] using', url);
        return;
      }
    } catch (_) { /* ignore */ }

    try {
      const okImg = await tryImage(url);
      if (okImg) {
        logo.src = url;
        console.info('[logo] using (via Image preload)', url);
        return;
      }
    } catch (_) { /* ignore */ }
  }

  console.error('[logo] could not resolve a working src from candidates:', candidates);
}

function safeUrl(path, base) {
  try { return new URL(path, base).href; } catch { return null; }
}

async function tryHead(url) {
  const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
  return res.ok;
}

function tryImage(url, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const img = new Image();
    const t = setTimeout(() => { cleanup(false); }, timeoutMs);
    function cleanup(ok){
      clearTimeout(t);
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    }
    img.onload = () => cleanup(true);
    img.onerror = () => cleanup(false);
    img.src = url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now();
  });
}

/* =========================
   Bootstrap
   ========================= */
(async () => {
  // Ladda header
  const headerHost = await loadHTML("header", "./header.html");
  if (headerHost) {
    initHeaderBehavior(headerHost);

    // Patcha loggans src till första fungerande kandidat
    const logo = headerHost.querySelector('img.logo');
    await resolveLogoSrc(logo);
  }

  // Ladda footer
  const footerHost = await loadHTML("footer", "./footer.html");
  if (footerHost) initFooterYear(footerHost);
})();

// ===== Header stickiness guard =====
(() => {
  const header = document.querySelector('.header');
  if (!header) return;

  // Sätt body-padding efter headerns faktiska höjd (även när den krymper)
  const setSpacer = () => {
    const h = header.offsetHeight; // aktuell höjd
    document.body.style.setProperty('--header-spacer', `${h}px`);
  };

  // Krymp när man scrollar
  const onScroll = () => {
    const shrink = window.scrollY > 8;
    header.classList.toggle('is-shrunk', shrink);
    setSpacer();
  };

  // Reagera på storleksförändringar
  const ro = new ResizeObserver(setSpacer);
  ro.observe(header);

  window.addEventListener('load', setSpacer, { once: true });
  window.addEventListener('resize', setSpacer);
  document.addEventListener('scroll', onScroll, { passive: true });
  setSpacer();
  onScroll();
})();
