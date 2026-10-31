/* Botón claro / oscuro. Modo claro por defecto; se recuerda la elección. */
(function(){
  const root = document.documentElement;
  const btn = document.getElementById('tema');
  if(!btn) return;
  const sol = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const luna = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';

  function guardado(){ try{ return localStorage.getItem('cv-tema'); }catch(e){ return null; } }
  function actual(){ return root.getAttribute('data-theme') || 'light'; }
  function pintar(){
    const oscuro = actual() === 'dark';
    btn.innerHTML = (oscuro ? sol : luna) + '<span>' + (oscuro ? 'Modo claro' : 'Modo oscuro') + '</span>';
    btn.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
  const g = guardado();
  root.setAttribute('data-theme', g === 'dark' ? 'dark' : 'light');
  btn.addEventListener('click', function(){
    const nuevo = actual() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nuevo);
    try{ localStorage.setItem('cv-tema', nuevo); }catch(e){}
    pintar();
  });
  pintar();
})();
