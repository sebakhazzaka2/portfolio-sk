\# Portfolio Web — Sebastián Khazzaka



Sitio estático hecho con \*\*HTML, CSS y JavaScript\*\* para presentar mis proyectos, idiomas y contacto.



\- Demo: https://sebakhazzaka2.github.io/portfolio-sk/

\- Repo: https://github.com/sebakhazzaka2/portfolio-sk



\## Estructura
/

├── index.html

├── style.css

├── script.js

└── assets/ (opcional: imágenes, íconos)


## Funcionalidades

\- \*\*Sección Proyectos\*\* con tarjetas (título, descripción, tags y botones \*\*Demo / Repo\*\*).

\- \*\*Filtro por tecnología\*\* (JS simple con `data-tec="js|java|html"`).

\- \*\*Accesibilidad mínima\*\*: skip-link, foco visible, contraste, etiquetas ARIA.

\- \*\*Sección Calidad\*\* con checklist visible.



\## Conexión opcional a backend (API)

Este portfolio puede cargar proyectos dinámicamente desde una \*\*API REST en Java (Spring Boot)\*\*:



\- Backend Repo: https://github.com/sebakhazzaka2/portfolio-api

\- Endpoints:

&nbsp; - `GET /api/proyectos` → Lista de proyectos (JSON)

&nbsp; - `POST /api/contacto` → Guarda mensajes (JSON)

&nbsp; - `POST /api/visitas` / `GET /api/visitas` → Contador de visitas



\### Cómo activar el consumo de la API

En `script.js`, definí la URL base del backend:

```js

const API = "http://localhost:8080/api"; // local

