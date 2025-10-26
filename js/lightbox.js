// /js/lightbox.js
// En sammanfogad, robust lightbox som funkar med din .gallery-grid-layout.
// - Skapar markup om den saknas
// - Sorterar bilder i VISUELL ordning (rad/kolumn) med liten tolerans
// - Tangentbord, swipe, fokusåterställning, backdrop-klick
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  // Säkerställ markup i DOM
  let lb = document.getElementById('lightbox');
  if (!lb) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="lightbox" class="lightbox-backdrop" aria-hidden="true" role="dialog">
        <div class="lightbox-dialog" tabindex="-1" aria-label="Image dialog">
          <button class="lightbox-close" aria-label="Close">✕</button>
          <button class="lightbox-prev" aria-label="Previous">‹</button>
          <img class="lightbox-img" src="" alt="">
          <button class="lightbox-next" aria-label="Next">›</button>
          <div class="lightbox-caption"></div>
        </div>
      </div>
    `);
    lb = document.getElementById('lightbox');
  }

  const dialog     = lb.querySelector('.lightbox-dialog');
  const imgEl      = lb.querySelector('.lightbox-img');
  const captionEl  = lb.querySelector('.lightbox-caption');
  const btnClose   = lb.querySelector('.lightbox-close');
  const btnPrev    = lb.querySelector('.lightbox-prev');
  const btnNext    = lb.querySelector('.lightbox-next');

  const epsilon = 6; // px tolerans när vi avgör radgruppering
  function getImagesInVisualOrder(){
    const list = Array.from(grid.querySelectorAll('.block--gallery img'));
    return list
      .map(el => ({ el, rect: el.getBoundingClientRect() }))
      .sort((a,b)=>{
        const dy = a.rect.top - b.rect.top;
        if (Math.abs(dy) > epsilon) return dy;         // olika rader
        return a.rect.left - b.rect.left;              // samma rad → vänster till höger
      })
      .map(x => x.el);
  }

  const srcFor     = el => el.dataset.full || el.currentSrc || el.src;
  const captionFor = el => {
    const card = el.closest('.block--gallery');
    const cap  = card && card.querySelector('.caption');
    return (cap && cap.textContent.trim()) || el.alt || '';
  };
  const bodyLock = lock => { document.documentElement.style.overflow = lock ? 'hidden' : ''; };

  // State
  let images = getImagesInVisualOrder();
  let index = 0;
  let lastFocus = null;

  // Gör bilderna interaktiva (tabb + enter/space öppnar)
  (function makeInteractive(){
    images.forEach(el => {
      el.style.cursor = 'zoom-in';
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(images.indexOf(el)); }
      });
    });
  })();

  function show(i){
    images = getImagesInVisualOrder(); // ifall layouten ändrats av responsive grid
    if (!images.length) return;
    index = (i + images.length) % images.length;
    const source = images[index];
    imgEl.src = srcFor(source);
    imgEl.alt = source.alt || '';
    captionEl.textContent = captionFor(source);
  }
  function openAt(i){
    lastFocus = document.activeElement;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden','false');
    bodyLock(true);
    show(i);
    dialog.focus();
  }
  function close(){
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden','true');
    bodyLock(false);
    imgEl.src = '';
    if (lastFocus) lastFocus.focus();
  }

  // Grid-klick → öppna
  grid.addEventListener('click', e => {
    const img = e.target.closest('.block--gallery img');
    if (!img) return;
    e.preventDefault();
    images = getImagesInVisualOrder();
    const i = images.indexOf(img);
    if (i >= 0) openAt(i);
  });

  // Knappar
  btnClose.addEventListener('click', close);
  btnPrev .addEventListener('click', () => show(index - 1));
  btnNext .addEventListener('click', () => show(index + 1));

  // Backdrop-klick
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  // Tangentbord
  window.addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape')      return close();
    if (e.key === 'ArrowLeft')   return show(index - 1);
    if (e.key === 'ArrowRight')  return show(index + 1);
  });

  // Resize → uppdatera sortering, lite debouncad
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { images = getImagesInVisualOrder(); }, 120);
  });

  // Enkel horisontell swipe
  let touchX = null;
  dialog.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, {passive:true});
  dialog.addEventListener('touchend',   e => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { dx > 0 ? show(index - 1) : show(index + 1); }
    touchX = null;
  }, {passive:true});
});
