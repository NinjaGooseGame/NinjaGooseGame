// /js/nav.js
(function () {
  const header = document.querySelector('.header');
  const headerInner = document.getElementById('site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const menuPanel  = document.getElementById('menu-panel');



  // Verklig overflow-detektering (inte bara media query)
  const fits = () => {
    // lite marginal för komfort
    const paddingBuffer = 24;
    return headerInner.scrollWidth <= headerInner.clientWidth - paddingBuffer;
  };

  const updateCompactMode = () => {
    document.body.classList.toggle('nav-compact', !fits());
    // Stäng panel om vi går tillbaka till "får plats"
    if (fits() && document.body.classList.contains('menu-open')) {
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuPanel.hidden = true;
    }
  };

  // Lyssna på storleksförändringar
  const ro = new ResizeObserver(() => updateCompactMode());
  ro.observe(headerInner);
  window.addEventListener('load', updateCompactMode);
  window.addEventListener('orientationchange', updateCompactMode);

  // Öppna/stäng meny
  menuToggle?.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuPanel.hidden = !open;
  });

  // Stäng panel vid klick utanför länkar
  menuPanel?.addEventListener('click', (e) => {
    if (e.target === menuPanel) {
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuPanel.hidden = true;
    }
  });

  // Stäng på ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuPanel.hidden = true;
    }
  });
})();
