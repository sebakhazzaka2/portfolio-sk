// =========================
//   CONTACTO (frontend)
// =========================
// - Este script maneja el envío del formulario de contacto del portfolio.
// - En producción usa tu API publicada en Render.
// - En local usa http://localhost:8080/api

// ===== 1) Detección de API (local vs producción)
const API = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:8080/api"
  : "https://portfolioapi-uj2a.onrender.com/api"; // <-- tu backend en Render

// ===== 2) Captura de elementos del DOM (coinciden con los IDs del form)
const $form   = document.getElementById("form-contacto");
const $nombre = document.getElementById("nombre");
const $email  = document.getElementById("email");
const $asunto = document.getElementById("asunto");
const $mensaje= document.getElementById("mensaje");
const $extra  = document.getElementById("campo_extra"); // honeypot (oculto)
const $btn    = document.getElementById("btn-enviar");
const $estado = document.getElementById("estado");

// ===== 3) Helpers "junior"
function setEstado(texto, esOk = false) {
  if (!$estado) return;
  $estado.textContent = texto;
  // Verde si OK, rojo si error, gris si info
  $estado.style.color = esOk ? "seagreen" : (texto ? "crimson" : "inherit");
}

function validarEmailSimple(valor) {
  // Validación simple para no complicar (suficiente para front)
  // Nota: el backend también valida.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function leerDatosFormulario() {
  return {
    nombre:  ($nombre?.value || "").trim(),
    email:   ($email?.value  || "").trim(),
    asunto:  ($asunto?.value || "").trim(),
    mensaje: ($mensaje?.value|| "").trim(),
  };
}

// ===== 4) Envío del formulario
$form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 4.1) Anti-bots: si el honeypot tiene texto, abortamos en silencio
  if ($extra && $extra.value) return;

  // 4.2) Tomar datos y validaciones básicas
  const datos = leerDatosFormulario();

  if (!datos.email || !validarEmailSimple(datos.email)) {
    setEstado("Ingresá un email válido.");
    $email?.focus();
    return;
  }
  if (!datos.mensaje) {
    setEstado("El mensaje no puede estar vacío.");
    $mensaje?.focus();
    return;
  }

  // 4.3) Enviar
  try {
    setEstado("Enviando..."); // feedback
    if ($btn) $btn.disabled = true;

    const resp = await fetch(`${API}/contacto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    // Intentamos parsear JSON, pero si falla devolvemos objeto vacío
    const json = await resp.json().catch(() => ({}));

    if (!resp.ok || !json.ok) {
      // Si el backend devuelve {ok:false,error:"..."} lo mostramos
      const msg = json?.error || "No se pudo enviar tu correo.";
      throw new Error(msg);
    }

    // 4.4) Éxito
    setEstado("¡Mensaje enviado! Te responderé a la brevedad.", true);
    $form.reset();

  } catch (err) {
    console.error("[CONTACTO] Error:", err);
    setEstado(err?.message || "No se pudo enviar tu correo.");
  } finally {
    if ($btn) $btn.disabled = false;
  }
});

// ===== 5) UX suave: limpiar estado al tipear
[$nombre, $email, $asunto, $mensaje].forEach(($el) => {
  $el?.addEventListener("input", () => {
    // Si hay algo escrito, limpiamos el mensaje de error
    if ($estado?.textContent) setEstado("", false);
  });
});

// ===== 6) Accesibilidad básica
if ($estado) $estado.setAttribute("aria-live", "polite");