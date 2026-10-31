/* Navegación: la portada y cada simulador son vistas de la misma página.
   La dirección #<id> abre el simulador; sin dirección, la portada. */
(function(){
  document.querySelectorAll('.firma .bandera').forEach(function(b){ b.innerHTML = (window.BANDERAS || {}).nacional || ''; });
  const portada = document.getElementById('vista-portada');
  const sim = document.getElementById('vista-sim');
  const tituloBase = document.title;
  let montado = null;

  function mostrar(){
    const id = (location.hash || '').slice(1);
    const modelo = (window.MODELOS || {})[id];
    const motor = modelo && window.MOTORES && window.MOTORES[modelo.mecanica];
    if(!motor){
      sim.hidden = true; portada.hidden = false; document.title = tituloBase;
      return;
    }
    portada.hidden = true; sim.hidden = false;
    document.title = modelo.titulo + ' · ¿Cómo votamos en Argentina?';
    if(montado !== id){
      document.getElementById('sim-nivel').textContent = modelo.nivel || '';
      document.getElementById('sim-titulo').innerHTML = window.bandera(modelo.id, 'grande') + modelo.titulo;
      document.getElementById('sim-bajada').textContent = modelo.bajada || '';
      const av = document.getElementById('sim-aviso');
      av.textContent = modelo.aviso || ''; av.hidden = !modelo.aviso;
      document.getElementById('sim-pasos').innerHTML = (typeof motor.pasos === 'function' ? motor.pasos(modelo) : (motor.pasos || [])).map(function(p){ return '<li>'+p+'</li>'; }).join('');
      document.getElementById('sim-avisos').innerHTML = (typeof motor.avisos === 'function' ? motor.avisos(modelo) : (motor.avisos || [])).map(function(p){ return '<li>'+p+'</li>'; }).join('');
      const cont = document.getElementById('sim-motor');
      const nuevo = cont.cloneNode(false); cont.parentNode.replaceChild(nuevo, cont); // limpia escuchas viejas
      motor.montar(nuevo, modelo);
      // aviso de girar el celular: solo boletas anchas (todas menos la partidaria)
      document.getElementById('sim-girar').hidden = modelo.mecanica === 'partidaria' || girarCerrado;
      // guía plegable en celular
      const nPasos = document.querySelectorAll('#sim-pasos li').length;
      document.getElementById('sim-guia-btn-tx').textContent = 'Cómo se vota · '+nPasos+' pasos';
      document.getElementById('sim-guia').classList.remove('abierta');
      document.getElementById('sim-guia-btn').setAttribute('aria-expanded', 'false');
      montado = id;
    }
    window.scrollTo(0, 0);
  }
  let girarCerrado = false;
  document.getElementById('girar-x').addEventListener('click', function(){ girarCerrado = true; document.getElementById('sim-girar').hidden = true; });
  document.getElementById('sim-guia-btn').addEventListener('click', function(){
    const g = document.getElementById('sim-guia');
    const abierta = g.classList.toggle('abierta');
    this.setAttribute('aria-expanded', abierta ? 'true' : 'false');
  });
  window.addEventListener('hashchange', mostrar);
  mostrar();
})();
