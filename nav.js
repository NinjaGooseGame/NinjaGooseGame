// /js/nav.js
(() => {
  const doc = document;
  const header = doc.querySelector('.header');
  const menuToggle = doc.querySelector('.menu-toggle');
  const menuPanel = doc.getElementById('menu-panel');

  // Shrink header on scroll
  const SHRINK_CLASS = 'is-shrunk';
  const THRESH = 8;
  const onScroll = () => {
    if (!header) return;
    const y = window.scrollY || 0;
    header.classList.toggle(SHRINK_CLASS, y > THRESH);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  // Menu toggle
  if (menuToggle && menuPanel){
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      const next = !open;
      menuToggle.setAttribute('aria-expanded', String(next));
      menuPanel.hidden = !next;
      doc.documentElement.classList.toggle('menu-open', next);
    });

    // Close on ESC / outside click
    doc.addEventListener('keydown', e => {
      if (e.key === 'Escape'){
        menuToggle.setAttribute('aria-expanded','false');
        menuPanel.hidden = true;
        doc.documentElement.classList.remove('menu-open');
      }
    });

    doc.addEventListener('click', e => {
      if (!menuPanel.hidden && !menuPanel.contains(e.target) && !menuToggle.contains(e.target)){
        menuToggle.setAttribute('aria-expanded','false');
        menuPanel.hidden = true;
        doc.documentElement.classList.remove('menu-open');
      }
    }, { passive:true });
  }

  // Highlight current link
  try {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    doc.querySelectorAll('a[href]').forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/^\.\/+/,'').toLowerCase();
      if (href && path === href) a.setAttribute('aria-current','page');
    });
  } catch(_) {}
})();
