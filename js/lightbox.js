document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  // ... Lightbox-markup skapas här (som i din nuvarande fil) ...

  const dialog    = document.querySelector('#lightbox .lightbox-dialog');
  const imgEl     = document.querySelector('#lightbox .lightbox-img');
  const captionEl = document.querySelector('#lightbox .lightbox-caption');
  const btnClose  = document.querySelector('#lightbox .lightbox-close');
  const btnPrev   = document.querySelector('#lightbox .lightbox-prev');
  const btnNext   = document.querySelector('#lightbox .lightbox-next');

  // ----- NYTT: hämta bilder i VISUELL ordning -----
  const epsilon = 6; // tolerans i px för "samma rad"
  function getImagesInVisualOrder(){
    const list = Array.from(grid.querySelectorAll('.block--gallery img'));
    // sortera efter top (rad), sedan left (kolumn)
    return list
      .map(el => ({ el, rect: el.getBoundingClientRect() }))
      .sort((a,b)=>{
        const dy = a.rect.top - b.rect.top;
        if (Math.abs(dy) > epsilon) return dy;      // olika rader
        return a.rect.left - b.rect.left;           // samma rad -> vänster->höger
      })
      .map(x => x.el);
  }

  let images = getImagesInVisualOrder();
  let index = 0, lastFocus = null;

  const bodyLock  = lock => { document.documentElement.style.overflow = lock ? 'hidden' : ''; };
  const srcFor    = el => el.dataset.full || el.currentSrc || el.src;
  const captionFor= el => {
    const card = el.closest('.block--gallery');
    const cap  = card && card.querySelector('.caption');
    return (cap && cap.textContent.trim()) || el.alt || '';
  };

  function show(i){
    if (!images.length) return;
    index = (i + images.length) % images.length;
    const source = images[index];
    imgEl.src = srcFor(source);
    imgEl.alt = source.alt || '';
    captionEl.textContent = captionFor(source);
  }
  function openAt(i){
    lastFocus = document.activeElement;
    // uppdatera ordningen precis när vi öppnar (om layouten ändrats)
    images = getImagesInVisualOrder();
    document.getElementById('lightbox').classList.add('is-open');
    document.getElementById('lightbox').setAttribute('aria-hidden','false');
    bodyLock(true);
    show(i);
    dialog.focus();
  }
  function close(){
    const lb = document.getElementById('lightbox');
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden','true');
    bodyLock(false);
    imgEl.src = '';
    if (lastFocus) lastFocus.focus();
  }

  // Klick i grid -> öppna i visuell ordning
  grid.addEventListener('click', (e)=>{
    const img = e.target.closest('.block--gallery img');
    if (!img) return;
    e.preventDefault();
    images = getImagesInVisualOrder();
    const i = images.indexOf(img);
    if (i >= 0) openAt(i);
  });

  // Knappar/keys/swipe (som du redan har)
  btnClose.addEventListener('click', close);
  btnPrev .addEventListener('click', ()=> show(index - 1));
  btnNext .addEventListener('click', ()=> show(index + 1));
  window.addEventListener('keydown', (e)=>{
    const open = document.getElementById('lightbox').classList.contains('is-open');
    if (!open) return;
    if (e.key === 'Escape')     return close();
    if (e.key === 'ArrowLeft')  return show(index - 1);
    if (e.key === 'ArrowRight') return show(index + 1);
  });

  // Re-beräkna ordningen vid resize (debounce)
  let t;
  window.addEventListener('resize', ()=>{
    clearTimeout(t);
    t = setTimeout(()=>{ images = getImagesInVisualOrder(); }, 120);
  });
});


  // Extra säkerhet: delegerad lyssnare för knapparna
document.getElementById('lightbox').addEventListener('click', (e) => {
  if (e.target.closest('.lightbox-prev'))  { e.preventDefault(); show(index - 1); }
  if (e.target.closest('.lightbox-next'))  { e.preventDefault(); show(index + 1); }
  if (e.target.closest('.lightbox-close')) { e.preventDefault(); close(); }
});

  // Säkerställ att lightbox-markup finns
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

  const dialog   = lb.querySelector('.lightbox-dialog');
  const imgEl    = lb.querySelector('.lightbox-img');
  const captionEl= lb.querySelector('.lightbox-caption');
  const btnClose = lb.querySelector('.lightbox-close');
  const btnPrev  = lb.querySelector('.lightbox-prev');
  const btnNext  = lb.querySelector('.lightbox-next');

  // Hämta aktuell lista med bilder
  const getImages = () => Array.from(grid.querySelectorAll('.block--gallery img'));

  let index = 0;
  let lastFocus = null;

  const bodyLock = (lock) => { document.documentElement.style.overflow = lock ? 'hidden' : ''; };
  const srcFor = (el) => el.dataset.full || el.currentSrc || el.src;
  const captionFor = (el) => {
    const card = el.closest('.block--gallery');
    const cap  = card && card.querySelector('.caption');
    return (cap && cap.textContent.trim()) || el.alt || '';
  };

  function show(i) {
    const images = getImages();
    if (!images.length) return;
    index = (i + images.length) % images.length;
    const source = images[index];
    imgEl.src = srcFor(source);
    imgEl.alt = source.alt || '';
    captionEl.textContent = captionFor(source);
  }

  function openAt(i) {
    lastFocus = document.activeElement;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden','false');
    bodyLock(true);
    show(i);
    dialog.focus();
  }

  function close() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden','true');
    bodyLock(false);
    imgEl.src = '';
    if (lastFocus) lastFocus.focus();
  }

  // Delegerad klicklyssnare på grid: funkar även för nya bilder
  grid.addEventListener('click', (e) => {
    const img = e.target.closest('.block--gallery img');
    if (!img || !grid.contains(img)) return;

    // Om bilden ligger i en <a>, stoppa navigering
    const link = e.target.closest('a');
    if (link) e.preventDefault();

    const images = getImages();
    const i = images.indexOf(img);
    if (i >= 0) openAt(i);
  });

  // Gör bilder klickvänliga (cursor + keyboard)
  const makeImagesInteractive = () => {
    getImages().forEach(el => {
      el.style.cursor = 'zoom-in';
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
    });
  };
  makeImagesInteractive();

  // Tangentbord i dialog
  window.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  // Knapphändelser
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(index - 1));
  btnNext.addEventListener('click', () => show(index + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  // Enkel swipe
  let touchX = null;
  dialog.addEventListener('touchstart', (e)=>{ touchX = e.changedTouches[0].clientX; }, {passive:true});
  dialog.addEventListener('touchend', (e)=>{
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { dx > 0 ? show(index - 1) : show(index + 1); }
    touchX = null;
  }, {passive:true});
;
