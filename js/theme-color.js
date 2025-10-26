// /js/theme-color.js
(() => {
  const meta = document.querySelector('meta[name="theme-color"]');
  const headerInner = document.querySelector('.header-inner');

  if (!meta || !headerInner) return;

  function updateThemeColor() {
    const bg = getComputedStyle(headerInner).backgroundColor;
    if (bg && meta.content !== bg) meta.setAttribute('content', bg);
  }

  updateThemeColor();
  window.addEventListener('scroll', updateThemeColor, { passive: true });
  window.addEventListener('resize', updateThemeColor);
})();
