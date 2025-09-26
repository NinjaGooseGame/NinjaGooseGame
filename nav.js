document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('navToggle');
  const menu = document.getElementById('menu');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  if (btn && menu) {
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('show');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
});
