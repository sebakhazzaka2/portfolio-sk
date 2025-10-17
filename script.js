// ===== Config =====
const API = (location.hostname === "localhost")
  ? "http://localhost:8080/api"
  : "https://portfolioapi-uj2a.onrender.com/api";

const TIMEOUT_MS = 7000; // Render puede tardar: dejamos un tiempo prudente

// ===== Util =====
const $ = (sel) => document.querySelector(sel);
$("#anio").textContent = new Date().getFullYear();

function fetchConTimeout(url, opciones = {}, ms = TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opciones, signal: ctrl.signal })
    .finally(() => clearTimeout(t));
}

// ===== UI Filtros =====
function aplicarFiltro(tecnologia) {
  document.querySelectorAll(".proyecto").forEach(card => {
    const tec = (card.getAttribute("data-tec") || "").toLowerCase();
    card.style.display = (tecnologia === "todos" || tec === tecnologia) ? "" : "none";
  });
}
const filtros = document.querySelector(".filtros");
if (filtros) {
  filtros.addEventListener("click", e => {
    const btn = e.target.closest("button[data-filtro]");
    if (!btn) return;
    filtros.querySelectorAll("button").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    aplicarFiltro(btn.getAttribute("data-filtro"));
  });
  filtros.querySelector('button[data-filtro="todos"]')?.classList.add("activo");
}

// ===== Fallback (8 proyectos) =====
const proyectosFallback = [
  { titulo: "Gestión de Corredores", descripcion: "Web para registrar corredores y tiempos.", tecnologia: "html",
    urlDemo: "https://sebakhazzaka2.github.io/Gestion-Corredores/",
    urlRepo: "https://github.com/sebakhazzaka2/Gestion-Corredores" },
  { titulo: "Mercado de Frutas", descripcion: "App para administrar frutas, precios y stock.", tecnologia: "java",
    urlDemo: null, urlRepo: "https://github.com/sebakhazzaka2/Mercado-Frutas" },
  { titulo: "Juego Autitos", descripcion: "Pequeño juego con listado y acciones básicas.", tecnologia: "java",
    urlDemo: null, urlRepo: "https://github.com/sebakhazzaka2/Juego-Autitos" },
  { titulo: "Juego Gatitos", descripcion: "Mini juego temática gatitos. Favoritos y filtros.", tecnologia: "java",
    urlDemo: null, urlRepo: "https://github.com/sebakhazzaka2/Juego-Gatitos" },
  { titulo: "Juego Tic-Tac-Toe", descripcion: "Ta-Te-Ti con detección de ganador y reinicio.", tecnologia: "java",
    urlDemo: null, urlRepo: "https://github.com/sebakhazzaka2/Juego-TicTacToe" },
  { titulo: "Gestión de Librería", descripcion: "Consola Java con POO y CRUD básico.", tecnologia: "java",
    urlDemo: null, urlRepo: "https://github.com/sebakhazzaka2/Gestion-Libros" },
  { titulo: "Portfolio Sebastián Khazzaka", descripcion: "Portfolio web (HTML/CSS/JS).", tecnologia: "html",
    urlDemo: "https://sebakhazzaka2.github.io/portfolio-sk/",
    urlRepo: "https://github.com/sebakhazzaka2/portfolio-sk" },
  { titulo: "Portfolio API (Spring Boot)", descripcion: "Backend del portfolio (Java + Spring Boot).", tecnologia: "java",
    urlDemo: "https://portfolioapi-uj2a.onrender.com",
    urlRepo: "https://github.com/sebakhazzaka2/PortfolioApi" },
];

// ===== Render de cards =====
function crearCardProyecto(p) {
  const art = document.createElement("article");
  const tec = (p.tecnologia || "").toLowerCase().trim();
  art.className = "proyecto";
  art.setAttribute("data-tec", tec || "html");

  const tags = (tec === "java")
    ? '<span class="chip">Java</span><span class="chip">POO</span>'
    : '<span class="chip">HTML</span><span class="chip">CSS</span><span class="chip">JS</span>';

  const btnDemo = (tec === "java" || !p.urlDemo) ? "" :
    `<a class="btn" href="${p.urlDemo}" target="_blank" rel="noopener">Demo</a>`;

  const btnRepo = p.urlRepo ? `<a class="btn" href="${p.urlRepo}" target="_blank" rel="noopener">Repo</a>` : "";

  art.innerHTML = `
    <h4>${p.titulo || "Proyecto"}</h4>
    <p>${p.descripcion || ""}</p>
    <p class="tags">${tags}</p>
    <p class="acciones">${btnDemo} ${btnRepo}</p>
  `;
  return art;
}

function pintarProyectos(lista) {
  const destino = $("#lista-proyectos");
  if (!destino) return;
  destino.innerHTML = "";
  if (!Array.isArray(lista) || lista.length === 0) {
    destino.innerHTML = "<p>No hay proyectos para mostrar aún.</p>";
    return;
  }
  lista.forEach(p => destino.appendChild(crearCardProyecto(p)));
}

// ===== Estado de API (con timeout + reintento) =====
const badgeApi = $("#estado-api");
const badgeApiText = $("#texto-api");
function setApiStatus(kind) {
  // kind: "ok" | "off" | "wait"
  badgeApi?.classList.remove("ok", "off");
  if (kind === "ok") {
    badgeApi?.classList.add("ok");
    badgeApi?.querySelector(".icono")?.replaceChildren(document.createTextNode("✅"));
    if (badgeApiText) badgeApiText.textContent = "Backend conectado";
  } else if (kind === "off") {
    badgeApi?.classList.add("off");
    badgeApi?.querySelector(".icono")?.replaceChildren(document.createTextNode("⚙️"));
    if (badgeApiText) badgeApiText.textContent = "Modo sin conexión (usando datos locales)";
  } else {
    badgeApi?.querySelector(".icono")?.replaceChildren(document.createTextNode("…"));
    if (badgeApiText) badgeApiText.textContent = "Conectando al backend…";
  }
}

async function verificarEstadoAPI() {
  setApiStatus("wait");
  try {
    const r = await fetchConTimeout(API + "/visitas", { method: "GET" });
    if (!r.ok) throw 0;
    setApiStatus("ok");
  } catch {
    setApiStatus("off");
    // Reintenta silencioso a los 20s (por si Render despertó)
    setTimeout(verificarEstadoAPI, 20000);
  }
}

// ===== Visitas (POST, silencioso si falla) =====
const badgeVisitas = $("#visitas");
async function sumarVisita() {
  if (!badgeVisitas) return;
  try {
    const r = await fetchConTimeout(API + "/visitas", { method: "POST" });
    const data = await r.json().catch(() => ({}));
    if (typeof data.total === "number") {
      badgeVisitas.textContent = "Visitas: " + data.total;
    }
  } catch {
    // no bloquea UI
  }
}

// ===== Proyectos (API -> fallback) =====
async function cargarProyectos() {
  const destino = $("#lista-proyectos");
  if (!destino) return;
  destino.innerHTML = "<p>Cargando proyectos...</p>";

  try {
    const r = await fetchConTimeout(API + "/proyectos");
    if (!r.ok) throw 0;
    const lista = await r.json();
    pintarProyectos(lista);
  } catch {
    pintarProyectos(proyectosFallback);
  }
}

// ===== Contacto (EmailJS real) =====
$("#form-contacto")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre  = $("#c-nombre").value.trim();
  const email   = $("#c-email").value.trim();
  const mensaje = $("#c-msg").value.trim();
  const estado  = $("#estado-contacto");

  if (!nombre || !email || !mensaje) {
    estado.textContent = "Completa todos los campos.";
    return;
  }

  estado.textContent = "Enviando…";
  try {
    await emailjs.send("service_6ie5oxn", "template_jeeaf6g", {
      from_name: nombre,
      reply_to: email,
      message: mensaje,
      to_name: "Sebastián",
    });
    estado.textContent = "¡Gracias! Mensaje enviado.";
    e.target.reset();
  } catch (err) {
    console.error(err);
    estado.textContent = "No se pudo enviar el correo. Intenta más tarde.";
  }
});

// ===== Inicio =====
document.addEventListener("DOMContentLoaded", () => {
  verificarEstadoAPI();
  cargarProyectos();
  sumarVisita();
});