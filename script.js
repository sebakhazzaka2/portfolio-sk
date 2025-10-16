// ===== Año automático en el footer
document.getElementById('anio').textContent = new Date().getFullYear();

// ===== Detección de API (local vs producción)
const API = (location.hostname === "localhost")
  ? "http://localhost:8080/api"
  : "https://portfolioapi-uj2a.onrender.com/api";

// ===== Fallback de proyectos (si la API no responde)
const proyectosFallback = [
  {
    titulo: "Gestión de Corredores",
    descripcion: "Web para registrar corredores y tiempos.",
    tecnologia: "html",
    urlDemo: "https://sebakhazzaka2.github.io/Gestion-Corredores/",
    urlRepo: "https://github.com/sebakhazzaka2/Gestion-Corredores"
  },
  {
    titulo: "Mercado de Frutas",
    descripcion: "App para administrar frutas, precios y stock.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Mercado-Frutas"
  },
  {
    titulo: "Juego Autitos",
    descripcion: "Pequeño juego con listado y acciones básicas.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Juego-Autitos"
  },
  {
    titulo: "Juego Gatitos",
    descripcion: "Mini juego temática gatitos. Favoritos y filtros.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Juego-Gatitos"
  },
  {
    titulo: "Juego Tic-Tac-Toe",
    descripcion: "Ta-Te-Ti con detección de ganador y reinicio.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Juego-TicTacToe"
  },
  {
    titulo: "Gestión de Librería",
    descripcion: "Consola Java con POO y CRUD básico.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Gestion-Libros"
  },
  {
    titulo: "Portfolio Sebastián Khazzaka",
    descripcion: "Portfolio web (HTML/CSS/JS).",
    tecnologia: "html",
    urlDemo: "https://sebakhazzaka2.github.io/portfolio-sk/",
    urlRepo: "https://github.com/sebakhazzaka2/portfolio-sk"
  },
  {
    titulo: "Portfolio API (Spring Boot)",
    descripcion: "Backend del portfolio (Java + Spring Boot).",
    tecnologia: "java",
    urlDemo: "https://portfolioapi-uj2a.onrender.com",
    urlRepo: "https://github.com/sebakhazzaka2/PortfolioApi"
  }
];

// ===== Utilidad: fetch con timeout
function fetchConTimeout(url, opciones = {}, ms = 7000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opciones, signal: ctrl.signal })
    .finally(() => clearTimeout(id));
}

// ===== Render de una card de proyecto
function crearCardProyecto(p) {
  const art = document.createElement("article");
  const tec = (p.tecnologia || "").toLowerCase().trim();
  art.className = "proyecto";
  art.setAttribute("data-tec", tec || "html");

  const tags = (tec === "java")
    ? '<span class="chip">Java</span><span class="chip">POO</span>'
    : '<span class="chip">HTML</span><span class="chip">CSS</span><span class="chip">JS</span>';

  const btnDemo = (tec === "java" || !p.urlDemo)
    ? ""
    : `<a class="btn" href="${p.urlDemo}" target="_blank" rel="noopener">Demo</a>`;

  const btnRepo = p.urlRepo
    ? `<a class="btn" href="${p.urlRepo}" target="_blank" rel="noopener">Repo</a>`
    : "";

  art.innerHTML = `
    <h4>${p.titulo || "Proyecto"}</h4>
    <p>${p.descripcion || ""}</p>
    <p class="tags">${tags}</p>
    <p class="acciones">${btnDemo} ${btnRepo}</p>
  `;
  return art;
}

// ===== Carga de proyectos (API -> fallback)
function cargarProyectos() {
  const destino = document.getElementById("lista-proyectos");
  if (!destino) return;

  destino.innerHTML = "<p>Cargando proyectos...</p>";

  if (!API) {
    pintar(proyectosFallback);
    return;
  }

  fetchConTimeout(API + "/proyectos")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(pintar)
    .catch(() => pintar(proyectosFallback));

  function pintar(lista) {
    destino.innerHTML = "";
    if (!Array.isArray(lista) || lista.length === 0) {
      destino.innerHTML = "<p>No hay proyectos para mostrar aún.</p>";
      return;
    }
    lista.forEach(p => destino.appendChild(crearCardProyecto(p)));
  }
}

// ===== Contador de visitas visible
async function sumarVisita() {
  const salida = document.getElementById("visitas");
  if (!API || !salida) return;
  try {
    const r = await fetch(API + "/visitas", { method: "POST" });
    const data = await r.json();
    salida.textContent = `Visitas: ${data.total ?? "—"}`;
  } catch {
    console.warn("No se pudo actualizar contador de visitas");
  }
}

// ===== Filtros de UI
function aplicarFiltro(tecnologia) {
  const cards = document.querySelectorAll('.proyecto');
  cards.forEach(c => {
    const tec = c.getAttribute('data-tec');
    c.style.display = (tecnologia === 'todos' || tec === tecnologia) ? '' : 'none';
  });
}
const filtros = document.querySelector('.filtros');
if (filtros) {
  filtros.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filtro]');
    if (!btn) return;
    filtros.querySelectorAll('button').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    aplicarFiltro(btn.getAttribute('data-filtro'));
  });
  const primero = filtros.querySelector('button[data-filtro="todos"]');
  if (primero) primero.classList.add('activo');
}

// ===== Formulario de contacto (EmailJS)
document.getElementById("form-contacto")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre  = document.getElementById("c-nombre").value.trim();
  const email   = document.getElementById("c-email").value.trim();
  const mensaje = document.getElementById("c-msg").value.trim();
  const estado  = document.getElementById("estado-contacto");

  if (!nombre || !email || !mensaje) {
    estado.textContent = "Completa todos los campos.";
    return;
  }

  estado.textContent = "Enviando…";
  try {
    await emailjs.send("service_6ie5oxn", "template_jeeaf6g", {
      from_name: nombre,
      from_email: email,
      message: mensaje,
      to_name: "Sebastián"
    });
    estado.textContent = "¡Gracias! Mensaje enviado.";
    e.target.reset();
  } catch (err) {
    console.error(err);
    estado.textContent = "No se pudo enviar el correo.";
  }
});

// ===== Inicio
document.addEventListener("DOMContentLoaded", () => {
  cargarProyectos();
  sumarVisita();
});

// ===== Verificar conexión con el backend =====
async function verificarEstadoAPI() {
  const estadoDiv = document.getElementById("estado-api");
  const texto = document.getElementById("texto-api");
  if (!estadoDiv || !texto) return;

  texto.textContent = "Conectando al backend...";
  estadoDiv.classList.remove("ok", "off");

  try {
    const resp = await fetch(API + "/visitas");
    if (resp.ok) {
      estadoDiv.classList.add("ok");
      estadoDiv.querySelector(".icono").textContent = "✅";
      texto.textContent = "Backend conectado correctamente";
    } else {
      throw new Error("Respuesta no OK");
    }
  } catch (e) {
    estadoDiv.classList.add("off");
    estadoDiv.querySelector(".icono").textContent = "⚙️";
    texto.textContent = "Modo sin conexión (usando datos locales)";
  }
}

// ===== Inicio =====
document.addEventListener("DOMContentLoaded", () => {
  verificarEstadoAPI(); 
  cargarProyectos();     
  sumarVisita();         
});

