// /js/nav.js
(() => {
  const doc = document;

  // Om include.js redan kör header/meny: gör endast "current link"-markering
  if (window.__HEADER_HAS_CONTROLLER__) {
    try {
      const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      doc.querySelectorAll('a[href]').forEach(a => {
        const href = (a.getAttribute('href') || '').replace(/^\.\/+/, '').toLowerCase();
        if (href && path === href) a.setAttribute('aria-current', 'page');
      });
    } catch(_) {}
    return;
  }

  // (Fallback om include.js inte fanns – lätt vikt)
  const header = doc.querySelector('.header');
  const menuToggle = doc.querySelector('.menu-toggle');
  const menuPanel = doc.getElementById('menu-panel');

  const THRESH = 8;
  const onScroll = () => {
    if (!header) return;
    if (doc.body.classList.contains('menu-open')) return; // frys när meny öppen
    header.classList.toggle('is-shrunk', (window.scrollY || 0) > THRESH);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  if (menuToggle && menuPanel){
    let locked = false, scrollY = 0;
    const lock = () => {
      if (locked) return;
      locked = true;
      scrollY = window.scrollY || 0;
      doc.body.style.position='fixed';
      doc.body.style.top=`-${scrollY}px`;
      doc.body.style.left='0'; doc.body.style.right='0'; doc.body.style.width='100%';
      doc.body.style.overflow='hidden';
      doc.documentElement.style.overscrollBehavior='none';
    };
    const unlock = () => {
      if (!locked) return;
      locked = false;
      doc.body.style.position='';
      doc.body.style.top=''; doc.body.style.left=''; doc.body.style.right=''; doc.body.style.width='';
      doc.body.style.overflow='';
      doc.documentElement.style.overscrollBehavior='';
      window.scrollTo(0, scrollY);
    };
    const setExpanded = (open) => {
      menuToggle.setAttribute('aria-expanded', String(open));
      menuPanel.hidden = !open;
      doc.body.classList.toggle('menu-open', open);
      if (open) {
        // frys headerhöjd
        const h = header?.offsetHeight || 0;
        if (header) {
          header.style.height = h+'px';
          header.style.minHeight = h+'px';
          header.style.maxHeight = h+'px';
        }
        lock();
      } else {
        if (header) { header.style.height = header.style.minHeight = header.style.maxHeight = ''; }
        unlock();
        onScroll();
      }
    };

    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!open);
    });

    doc.addEventListener('keydown', e => { if (e.key === 'Escape') setExpanded(false); });
    doc.addEventListener('click', e => {
      if (!menuPanel.hidden && !menuPanel.contains(e.target) && !menuToggle.contains(e.target)){
        setExpanded(false);
      }
    }, { passive:true });
  }

  // current link
  try {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    doc.querySelectorAll('a[href]').forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/^\.\/+/, '').toLowerCase();
      if (href && path === href) a.setAttribute('aria-current','page');
    });
  } catch(_) {}
})();
