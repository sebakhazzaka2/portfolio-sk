// =========================
//   CONTACTO (frontend)
// =========================

console.log("[CONTACTO] Script cargado"); // para verificar que se carga

// 1) Detección de API (local vs producción)
const API = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:8080/api"
  : "https://portfolioapi-uj2a.onrender.com/api";

// 2) Captura de elementos con IDs nuevos y viejos (fallback)
const $form   = document.getElementById("form-contacto");

// Nuevos
let $nombre = document.getElementById("nombre");
let $email  = document.getElementById("email");
let $asunto = document.getElementById("asunto");
let $mensaje= document.getElementById("mensaje");
let $estado = document.getElementById("estado");

// Viejos (fallback)
if (!$nombre)  $nombre  = document.getElementById("c-nombre");
if (!$email)   $email   = document.getElementById("c-email");
if (!$mensaje) $mensaje = document.getElementById("c-msg");
if (!$estado)  $estado  = document.getElementById("estado-contacto");

// Extras
const $extra  = document.getElementById("campo_extra"); // honeypot (oculto)
const $btn    = document.getElementById("btn-enviar");  // opcional

// 3) Helpers visuales
function setEstado(texto, esOk = false) {
  if (!$estado) return;
  $estado.textContent = texto;
  $estado.style.color = esOk ? "seagreen" : (texto ? "crimson" : "inherit");
}

function validarEmailSimple(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor || "");
}

function leerDatosFormulario() {
  return {
    nombre:  ($nombre?.value || "").trim(),
    email:   ($email?.value  || "").trim(),
    asunto:  ($asunto?.value || "").trim(),
    mensaje: ($mensaje?.value|| "").trim(),
  };
}

// 4) Seguridad: si no hay formulario, avisamos y salimos
if (!$form) {
  console.error("[CONTACTO] No encontré #form-contacto en el HTML.");
}

// 5) Envío del formulario
$form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("[CONTACTO] Submit disparado");

  // Anti-bots
  if ($extra && $extra.value) return;

  const datos = leerDatosFormulario();

  if (!validarEmailSimple(datos.email)) {
    setEstado("Ingresá un email válido.");
    $email?.focus();
    return;
  }
  if (!datos.mensaje) {
    setEstado("El mensaje no puede estar vacío.");
    $mensaje?.focus();
    return;
  }

  try {
    setEstado("Enviando...");
    if ($btn) $btn.disabled = true;

    const resp = await fetch(`${API}/contacto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const json = await resp.json().catch(() => ({}));
    console.log("[CONTACTO] Respuesta:", resp.status, json);

    if (!resp.ok || !json.ok) {
      const msg = json?.error || `Error de servidor (${resp.status})`;
      throw new Error(msg);
    }

    setEstado("¡Mensaje enviado! Te responderé a la brevedad.", true);
    $form.reset();
  } catch (err) {
    console.error("[CONTACTO] Error:", err);
    setEstado(err?.message || "No se pudo enviar tu correo.");
  } finally {
    if ($btn) $btn.disabled = false;
  }
});

// 6) UX: limpiar estado al tipear
[$nombre, $email, $asunto, $mensaje].forEach(($el) => {
  $el?.addEventListener("input", () => {
    if ($estado?.textContent) setEstado("", false);
  });
});

// 7) Accesibilidad
if ($estado) $estado.setAttribute("aria-live", "polite");