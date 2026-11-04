/* ====== CONFIGURACIÓN ====== */
const WHATSAPP = "573202641496";   // 57 = Colombia
const CARPETA  = "fotos/";         // las fotos van en esta carpeta: foto1.jpg, foto2.jpg...
const LOGO     = "logo.png";       // logo para la marca de agua (junto a index.html)
/* Los rangos de fotos de cada carrusel se cambian en index.html (data-desde / data-hasta) */

const cargar = src => new Promise(ok => {
  const i = new Image();
  i.onload = () => ok(i);
  i.onerror = () => ok(null);
  i.src = src;
});

/* Dibuja la foto en un canvas con el logo repetido en diagonal.
   Así la marca de agua queda dentro de la imagen y no se puede quitar con CSS. */
function lienzo(img, logo) {
  const c = document.createElement("canvas");
  const w = Math.min(img.naturalWidth, 700);
  const h = Math.round(img.naturalHeight * w / img.naturalWidth);
  c.width = w; c.height = h;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0, w, h);
  if (logo) {
    const lw = w * 0.3, lh = lw * logo.naturalHeight / logo.naturalWidth;
    x.save();
    x.globalAlpha = 0.3;
    x.translate(w / 2, h / 2);
    x.rotate(-Math.PI / 9);
    let fila = 0;
    for (let yy = -h; yy < h; yy += lh * 2.4, fila++)
      for (let xx = -w + (fila % 2) * lw * 0.8; xx < w; xx += lw * 1.6)
        x.drawImage(logo, xx, yy, lw, lh);
    x.restore();
  }
  return c;
}

async function armarCarrusel(caja, logo) {
  const desde = +caja.dataset.desde, hasta = +caja.dataset.hasta;
  const numeros = Array.from({ length: hasta - desde + 1 }, (_, k) => desde + k);
  const cargadas = (await Promise.all(numeros.map(n => cargar(`${CARPETA}foto${n}.jpg`)))).filter(Boolean);

  if (!cargadas.length) {
    caja.innerHTML = `<p class="vacio">Agrega las fotos foto${desde}.jpg a foto${hasta}.jpg en la carpeta “${CARPETA}”.</p>`;
    return;
  }
  caja.classList.add(caja.dataset.dir === "der" ? "der" : "izq");

  let lista = cargadas;
  while (lista.length < 8) lista = lista.concat(cargadas);   // asegura que el carrusel llene la pantalla

  const pista = document.createElement("div");
  pista.className = "pista";
  pista.style.setProperty("--vel", lista.length * 4 + "s");
  for (let vuelta = 0; vuelta < 2; vuelta++) {               // dos copias = bucle infinito sin saltos
    lista.forEach(img => {
      const f = document.createElement("div");
      f.className = "foto";
      f.appendChild(lienzo(img, logo));
      pista.appendChild(f);
    });
  }
  caja.appendChild(pista);
}

/* ====== PROTECCIÓN ====== */
const bloquear = e => e.preventDefault();
["contextmenu", "dragstart", "selectstart", "copy", "cut"].forEach(t => document.addEventListener(t, bloquear));

document.addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  if (k === "printscreen") {
    navigator.clipboard?.writeText("Fotos protegidas · DIRCO The Creative Team").catch(() => {});
    document.body.classList.add("oculto");
    setTimeout(() => document.body.classList.remove("oculto"), 1500);
    e.preventDefault();
  }
  if (
    k === "f12" ||
    (ctrl && ["s", "p", "u", "c", "a"].includes(k)) ||
    (ctrl && e.shiftKey && ["i", "j", "c", "s"].includes(k)) ||
    (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(k))   // capturas en Mac
  ) e.preventDefault();
});

// Si la ventana pierde el foco (herramientas de recorte, cambio de pestaña), se difuminan las fotos
const ocultar = () => document.body.classList.add("oculto");
const mostrar = () => document.body.classList.remove("oculto");
window.addEventListener("blur", ocultar);
window.addEventListener("focus", mostrar);
document.addEventListener("visibilitychange", () => document.hidden ? ocultar() : mostrar());

/* ====== WHATSAPP ====== */
document.querySelectorAll("[data-wa]").forEach(a => {
  a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.wa)}`;
  a.target = "_blank";
  a.rel = "noopener";
});

document.getElementById("anio").textContent = new Date().getFullYear();

(async () => {
  const logo = await cargar(LOGO);
  document.querySelectorAll(".carrusel").forEach(c => armarCarrusel(c, logo));
})();
