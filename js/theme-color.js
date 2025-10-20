(function () {
  const meta = document.querySelector('meta[name="theme-color"]');
  const headerInner = document.querySelector('.header-inner');

  function updateThemeColor() {
    if (!headerInner) return;
    const bg = window.getComputedStyle(headerInner).backgroundColor;
    if (bg && meta.content !== bg) {
      meta.setAttribute('content', bg);
    }
  }

  updateThemeColor();
  window.addEventListener('scroll', updateThemeColor, { passive: true });
  window.addEventListener('resize', updateThemeColor);
})();