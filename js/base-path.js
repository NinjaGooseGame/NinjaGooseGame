(function(){
  // Skapa <base>-tagg
  var base = document.createElement('base');

  // Kolla om vi kör på GitHub Pages (domän slutar på github.io)
  var isGitHub = location.hostname.endsWith('github.io');

  // Försök hitta repo-namnet från URL:en (ex: /NinjaGooseGame/)
  var match = location.pathname.match(/^\/([^/]+)\//);
  var repo = isGitHub && match ? match[1] : '';

  // Bygg dynamisk bas
  base.href = location.origin + (repo ? '/' + repo + '/' : '/');

  // Sätt in i <head>
  document.head.prepend(base);

  // Debug
  console.log('[base-path] base.href =', base.href);
})();
