// ==============================
// Config
// ==============================

const API = "https://portfolioapi-uj2a.onrender.com/api"; 
const TIMEOUT_MS = 1500;

// Proyectos de respaldo (se muestran si la API no responde o no existe)
const proyectosFallback = [
  {
    titulo: "Gestión de Corredores",
    descripcion: "Web para registrar corredores y tiempos.",
    tecnologia: "html",
    urlDemo: "https://sebakhazzaka2.github.io/Gestion-Corredores/",
    urlRepo: "https://github.com/sebakhazzaka2/Gestion-Corredores"
  },
  {
    titulo: "Gestión de Librería (Java)",
    descripcion: "Consola Java con POO y CRUD básico.",
    tecnologia: "java",
    urlDemo: null,
    urlRepo: "https://github.com/sebakhazzaka2/Gestion-Libros"
  }
];

// ==============================
// Año automático
// ==============================
document.getElementById('anio').textContent = new Date().getFullYear();

// ==============================
// Filtro de proyectos (UI)
// ==============================
function aplicarFiltro(tecnologia){
  const cards = document.querySelectorAll('.proyecto');
  cards.forEach(c => {
    const tec = c.getAttribute('data-tec'); // 'js' | 'java' | 'html'
    c.style.display = (tecnologia === 'todos' || tec === tecnologia) ? '' : 'none';
  });
}

const filtros = document.querySelector('.filtros');
if (filtros){
  filtros.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filtro]');
    if(!btn) return;
    filtros.querySelectorAll('button').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    aplicarFiltro(btn.getAttribute('data-filtro'));
  });
  const primero = filtros.querySelector('button[data-filtro="todos"]');
  if (primero){ primero.classList.add('activo'); }
}

// ==============================
// Helpers
// ==============================
function fetchConTimeout(url, ms = TIMEOUT_MS, options = {}) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))
  ]);
}

// ==============================
// Render de cards de proyectos
// ==============================
function crearCardProyecto(p) {
  const art = document.createElement("article");
  const tec = (p.tecnologia || "").toLowerCase();
  art.className = "proyecto";
  art.setAttribute("data-tec", tec || "html");

  const tags = tec === "java"
    ? '<span class="chip">Java</span><span class="chip">POO</span>'
    : '<span class="chip">HTML</span><span class="chip">CSS</span><span class="chip">JS</span>';

  // Demo: nunca para Java; para el resto solo si viene urlDemo
  const btnDemo = (tec === "java")
    ? ""
    : (p.urlDemo ? `<a class="btn" href="${p.urlDemo}" target="_blank" rel="noopener">Demo</a>` : "");

  const btnRepo = p.urlRepo
    ? `<a class="btn" href="${p.urlRepo}" target="_blank" rel="noopener">Repo</a>`
    : "";

  art.innerHTML = `
    <h4>${p.titulo}</h4>
    <p>${p.descripcion}</p>
    <p class="tags">${tags}</p>
    <p class="acciones">${btnDemo} ${btnRepo}</p>
  `;
  return art;
}

function cargarProyectos() {
  const destino = document.getElementById("lista-proyectos");
  if (!destino) return;

  destino.innerHTML = "<p>Cargando proyectos...</p>";

  // Si no hay API, pinto con fallback
  if (!API) {
    pintar(proyectosFallback);
    return;
  }

  fetchConTimeout(API + "/proyectos")
    .then(r => r.json())
    .then(pintar)
    .catch(() => pintar(proyectosFallback));

  function pintar(lista){
    destino.innerHTML = "";
    if (!Array.isArray(lista) || lista.length === 0) {
      destino.innerHTML = "<p>No hay proyectos para mostrar aún.</p>";
      return;
    }
    lista.forEach(p => destino.appendChild(crearCardProyecto(p)));
  }
}

// ==============================
// Contador de visitas (solo si hay API)
// ==============================
function sumarVisita() {
  if (!API) return;
  fetch(API + "/visitas", { method: "POST" }).catch(()=>{});
}

// ==============================
// Formulario de contacto (EmailJS + opcional backend)
// ==============================
document.getElementById("form-contacto")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre  = document.getElementById("c-nombre").value.trim();
  const email   = document.getElementById("c-email").value.trim();
  const mensaje = document.getElementById("c-msg").value.trim();
  const estado  = document.getElementById("estado-contacto");

  // 1) Enviar correo con EmailJS (frontend)
  try {
    await emailjs.send("service_6ie5oxn", "template_jeeaf6g", {
      from_name: nombre,
      from_email: email,
      message: mensaje,
      to_name: "Sebastián Khazzaka"
    });
    estado.textContent = "¡Gracias! Te respondo a la brevedad.";
    e.target.reset();
  } catch (err) {
    console.error(err);
    estado.textContent = "No se pudo enviar el correo.";
  }

  // 2) (Opcional) Registrar también en el backend si existe
  if (API) {
    fetch(API + "/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, mensaje })
    }).catch(()=>{});
  }
});

// ==============================
// Inicio
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  cargarProyectos();
  sumarVisita();
});