/* =====================================================================
   Banderas en miniatura (proporción 3:2), una por jurisdicción.
   Solo se cargan las que están verificadas; las que faltan no se dibujan.
   ===================================================================== */
window.BANDERAS = {
  /* República Argentina: celeste-blanco-celeste con Sol de Mayo */
  nacional:'<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#74acdf"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><g fill="#f6b40e"><circle cx="15" cy="10" r="1.9"/><g stroke="#f6b40e" stroke-width=".6" stroke-linecap="round"><path d="M15 6.6v1.2M15 12.2v1.2M11.6 10h1.2M17.2 10h1.2M12.6 7.6l.85.85M16.55 11.55l.85.85M12.6 12.4l.85-.85M16.55 8.45l.85-.85"/></g></g><circle cx="15" cy="10" r="1.9" fill="none" stroke="#85340a" stroke-width=".25"/></svg>',
  /* Córdoba: la misma versión que usa el simulador original de la BUS */
  cordoba:'<svg viewBox="0 0 90 60"><rect width="90" height="60" fill="#fff"/><rect width="31" height="60" fill="#971b2f"/><rect x="59" width="31" height="60" fill="#6cace4"/><circle cx="45" cy="30" r="8" fill="#8f734a"/><circle cx="45" cy="30" r="4" fill="#fdf8ee"/></svg>'
};
/* Las provinciales vienen como imagen (js/banderas-img.js), cada una con su proporción. */
window.bandera = function(id, clase){
  const img = (window.BANDERAS_IMG || {})[id];
  if(img) return '<span class="bandera'+(clase ? ' '+clase : '')+'" style="--r:'+img.r+'" aria-hidden="true"><img src="'+img.src+'" alt=""></span>';
  const s = window.BANDERAS[id];
  return s ? '<span class="bandera'+(clase ? ' '+clase : '')+'" aria-hidden="true">'+s+'</span>' : '';
};
