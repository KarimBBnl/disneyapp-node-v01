# Disney App — Backend (disneyapp-node-v01)

**API REST en Node.js + TypeScript** para consultar información de películas usando SQLite como base de datos ligera.

---

Estan los archivos en distintas ramas/brechas
Frontend
Backend

## 📌 Descripción

Este repositorio contiene el backend de un proyecto de ejemplo que expone una API sencilla para obtener la lista de películas. Está escrito en **TypeScript** y usa **Express**, **SQLite** y utilidades modernas para desarrollo (por ejemplo, `tsx`, `nodemon`). Es ideal como plantilla para aprender a integrar una base de datos SQLite con una API REST minimalista.

## 🚀 Características principales

- API REST básica en Express + TypeScript
- Base de datos SQLite localizada en `backend/data/disney.sqlite`
- Endpoints documentados y fáciles de extender
- Scripts de desarrollo y pruebas (`npm run dev`, `npm run test`)

## 📁 Estructura del proyecto

- `backend/`
  - `src/`
    - `app.ts` — configuración de Express y rutas
    - `server.ts` — arranque del servidor
    - `db.ts` — creación y configuración de la conexión SQLite
    - `movies/movies.routes.ts` — ruta para listar películas
  - `data/` — archivo de base de datos SQLite (persistente)
  - `package.json` — scripts y dependencias

## 🧰 Requisitos

- Node.js (recomendado >= 18)
- npm o yarn

## ⚙️ Instalación y ejecución (local)

1. Clona el repositorio:

   ```bash
   git clone <repo-url>
   cd disneyapp-node-v01/backend
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   El servidor por defecto escucha en http://localhost:3000 según `server.ts`.

4. Ejecuta la suite de pruebas:

   ```bash
   npm run test
   ```

## 🗂 Base de datos

- El archivo SQLite utilizado por la aplicación se encuentra en `backend/data/disney.sqlite`.
- La conexión se crea desde `src/db.ts` y la aplicación asume que dicho archivo existe o será creado por SQLite al abrirlo.

## 🔍 Endpoints documentados

- GET `/health`
  - Descripción: Estado de salud de la API
  - Respuesta ejemplo: `{ "ok": true, "world": "Disney activo" }`

- GET `/api/movies`
  - Descripción: Devuelve la lista de películas (nombres distintos) extraídos de la tabla `characters`.
  - Respuesta ejemplo: `{ "ok": true, "movies": [ { "movie": "Aladdin" }, { "movie": "Toy Story" } ] }`

> Nota: Actualmente la ruta sólo devuelve los nombres de películas (consulta SQL en `movies.routes.ts`).

## 🤝 Contribuciones

Si deseas contribuir:
- Abre un issue describiendo la mejora o bug.
- Envía un pull request con tests si aplica.

## 📄 Licencia

Licencia por determinar. Añade el fichero `LICENSE` si quieres aplicar una licencia específica.

---

Si quieres que traduzca este README al inglés o que añada ejemplos de uso con `curl` / `HTTPie`, dímelo y lo añado. ✅
