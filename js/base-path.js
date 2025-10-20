(function(){
  var base = document.createElement('base');
  // Byt "goosehunt" till namnet på ditt GitHub Pages-repo
  base.href = location.hostname.endsWith('github.io') ? '/goosehunt/' : '/';
  document.head.appendChild(base);
})();
