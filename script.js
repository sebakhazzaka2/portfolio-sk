// ====== Config ======
const API_BASE = "https://portfolioapi-uj2a.onrender.com/api"; // tu backend en Render
const TIMEOUT_MS = 5000;

// ====== Util ======
const $ = (sel) => document.querySelector(sel);
const badgeApi = $("#estado-api");
const badgeVisitas = $("#visitas");

// Año automático
$("#anio").textContent = new Date().getFullYear();

// Timeout helper
function fetchConTimeout(url, opts = {}, ms = TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

// ====== Filtros UI ======
function aplicarFiltro(tecnologia) {
  document.querySelectorAll(".proyecto").forEach((c) => {
    const tec = (c.getAttribute("data-tec") || "").toLowerCase();
    c.style.display = (tecnologia === "todos" || tec === tecnologia) ? "" : "none";
  });
}

const filtros = document.querySelector(".filtros");
if (filtros) {
  filtros.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filtro]");
    if (!btn) return;
    filtros.querySelectorAll("button").forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    aplicarFiltro(btn.getAttribute("data-filtro"));
  });
  filtros.querySelector('button[data-filtro="todos"]')?.classList.add("activo");
}

// ====== Fallback (8 proyectos, incluyendo la API) ======
const proyectosFallback = [
  {
    titulo: "Gestión de Corredores",
    descripcion: "Web para registrar corredores y tiempos.",
    tecnologia: "html",
    urlDemo: "https://sebakhazzaka2.github.io/Gestion-Corredores/",
    urlRepo: "https://github.com/sebakhazzaka2/Gestion-Corredores",
  },
  {
    titulo: "Mercado de Frutas",
    descripcion: "App para administrar frutas, precios y stock.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Mercado-Frutas",
  },
  {
    titulo: "Juego Autitos",
    descripcion: "Pequeño juego con listado y acciones básicas.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Juego-Autitos",
  },
  {
    titulo: "Juego Gatitos",
    descripcion: "Mini juego temática gatitos. Favoritos y filtros.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Juego-Gatitos",
  },
  {
    titulo: "Juego Tic-Tac-Toe",
    descripcion: "Ta-Te-Ti con detección de ganador y reinicio.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Juego-TicTacToe",
  },
  {
    titulo: "Gestión de Librería",
    descripcion: "Consola Java con POO y CRUD básico.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Gestion-Libros",
  },
  {
    titulo: "Portfolio Sebastián Khazzaka",
    descripcion: "Portfolio web (HTML/CSS/JS).",
    tecnologia: "html",
    urlDemo: "https://sebakhazzaka2.github.io/portfolio-sk/",
    urlRepo: "https://github.com/sebakhazzaka2/portfolio-sk",
  },
  {
    titulo: "Portfolio API (Spring Boot)",
    descripcion: "Backend del portfolio.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/PortfolioApi",
  },
];

// ====== Render de cards ======
function crearCardProyecto(p) {
  const art = document.createElement("article");
  const tec = (p.tecnologia || "").toLowerCase();
  art.className = "proyecto";
  art.setAttribute("data-tec", tec || "html");

  const tags = tec === "java"
    ? '<span class="chip">Java</span><span class="chip">POO</span>'
    : '<span class="chip">HTML</span><span class="chip">CSS</span><span class="chip">JS</span>';

  const btnDemo = (tec === "java")
    ? ""
    : (p.urlDemo ? `<a class="btn" href="${p.urlDemo}" target="_blank" rel="noopener">Demo</a>` : "");

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
  lista.forEach((p) => destino.appendChild(crearCardProyecto(p)));
}

// ====== API: estado + visitas + proyectos ======
async function verificarEstadoAPI() {
  if (!badgeApi) return;
  try {
    const r = await fetchConTimeout(API_BASE + "/visitas", { method: "GET" });
    badgeApi.textContent = r.ok ? "API: OK" : "API: Error";
    badgeApi.classList.toggle("ok", r.ok);
    badgeApi.classList.toggle("ko", !r.ok);
  } catch {
    badgeApi.textContent = "API: OFF";
    badgeApi.classList.remove("ok");
    badgeApi.classList.add("ko");
  }
}

async function sumarVisita() {
  if (!badgeVisitas) return;
  try {
    const r = await fetchConTimeout(API_BASE + "/visitas", { method: "POST" });
    const data = await r.json().catch(() => ({}));
    if (typeof data.total === "number") {
      badgeVisitas.textContent = "Visitas: " + data.total;
    }
  } catch {
    // si falla, lo dejamos silencioso
  }
}

async function cargarProyectos() {
  const destino = $("#lista-proyectos");
  if (!destino) return;
  destino.innerHTML = "<p>Cargando proyectos...</p>";

  try {
    const r = await fetchConTimeout(API_BASE + "/proyectos");
    if (!r.ok) throw new Error("status " + r.status);
    const lista = await r.json();
    pintarProyectos(lista);
  } catch {
    // fallback si la API no responde
    pintarProyectos(proyectosFallback);
  }
}

// ====== Contacto (EmailJS opcional — evita romper si no está cargado) ======
const form = $("#form-contacto");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = $("#c-nombre").value.trim();
    const email = $("#c-email").value.trim();
    const mensaje = $("#c-msg").value.trim();
    const estado = $("#estado-contacto");

    try {
      if (window.emailjs && emailjs.send) {
        await emailjs.send("default_service", "template_default", {
          from_name: nombre,
          reply_to: email,
          message: mensaje,
        });
        estado.textContent = "¡Gracias! Mensaje enviado.";
      } else {
        estado.textContent = "Gracias, recibí tu mensaje (modo demo).";
      }
      form.reset();
    } catch {
      estado.textContent = "No se pudo enviar el mensaje.";
    }
  });
}

// ====== Inicio ======
document.addEventListener("DOMContentLoaded", () => {
  verificarEstadoAPI();
  cargarProyectos();
  sumarVisita();
});