async function loadHTML(id, file) {
  const el = document.getElementById(id);
  if (!el) return null;

  try {
    const res = await fetch(file, { cache: "no-cache" });
    if (!res.ok) {
      console.error("include failed:", file, res.status);
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
    const h = header.offsetHeight;
    document.body.style.setProperty('--header-spacer', `${h}px`);
    return;
  }
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

// Bootstrap: load shared header & footer then init behaviors
(async () => {
const headerHost = await loadHTML("header", "./header.html");
if (headerHost) initHeaderBehavior(headerHost);

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
