(function(){
  // Är vi på en github.io-domän?
  var isGh = /\.github\.io$/i.test(location.hostname);

  // Första path-segmentet (t.ex. "goosehunt" på /goosehunt/index.html)
  var seg = location.pathname.split('/').filter(Boolean)[0] || '';

  // Hitta/Skapa <base>
  var baseEl = document.querySelector('base') || document.createElement('base');

  // Logik:
  // - User site (ninjagoosegame.github.io): location.pathname är "/" => seg = "" => base "/"
  // - Project site (...github.io/goosehunt/): seg = "goosehunt" => base "/goosehunt/"
  // - Custom domain: isGh = false => base "/"
  baseEl.href = (isGh && seg ? '/' + seg + '/' : '/');

  if(!baseEl.parentNode) document.head.prepend(baseEl);
})();
