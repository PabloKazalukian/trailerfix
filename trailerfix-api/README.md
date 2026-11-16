# trailerfix-api

API REST del proyecto **Trailerfix**. Backend en Node.js (ES Modules) con autenticación JWT, Express 5, Sequelize 6 y MySQL.

Expone endpoints para:

- Catálogo de películas y series con géneros, actores y temporadas
- Autenticación (registro, login, usuario actual)
- Listas personales por usuario (pendientes / vistos)

> **Documentación relacionada**
>
> - **README del proyecto** (visión de producto, arquitectura, frontend): [`../README.md`](../README.md)
> - **Base de datos** (esquema detallado, campos, índices, relaciones, constraints, migraciones, seeders, configuración): [`src/database/README.md`](src/database/README.md)

---

## Requisitos

- Node.js ≥ 22.12
- MySQL 8 (o MariaDB compatible)

---

## Instalación

```bash
npm install
cp .env.example .env
```

Edita `.env` con tus credenciales de MySQL y un `JWT_SECRET` propio (mínimo 32 caracteres en producción).

---

## Variables de entorno

| Variable             | Default         | Descripción                                   |
| -------------------- | --------------- | --------------------------------------------- |
| `PORT`               | `3000`          | Puerto HTTP                                   |
| `NODE_ENV`           | `development`   | Entorno (`development`, `test`, `production`) |
| `DB_HOST`            | `localhost`     | Host de MySQL                                 |
| `DB_PORT`            | `3306`          | Puerto de MySQL                               |
| `DB_NAME`            | `trailerfix_db` | Nombre de la base                             |
| `DB_USER`            | `root`          | Usuario de MySQL                              |
| `DB_PASSWORD`        | _(vacío)_       | Password de MySQL                             |
| `DB_DIALECT`         | `mysql`         | Dialecto de Sequelize                         |
| `DB_LOGGING`         | `false`         | Loguear SQL (`true`/`false`)                  |
| `JWT_SECRET`         | **obligatorio** | Secreto para firmar tokens                    |
| `JWT_EXPIRES_IN`     | `1h`            | Duración del token                            |
| `BCRYPT_SALT_ROUNDS` | `10`            | Costo del hash de passwords                   |

---

## Base de datos (operativa)

```bash
# Crear base, ejecutar migraciones y seeders
npm run db:create
npm run db:migrate
npm run db:seed

# Reiniciar todo el esquema (¡borra datos!)
npm run db:reset
```

El seeder crea el usuario demo:

| username | password    |
| -------- | ----------- |
| `admin`  | `Admin123!` |

> **Detalle completo del esquema**: ver [`src/database/README.md`](src/database/README.md) (campos, índices, FKs, constraints, asociaciones, configuración Sequelize/CLI, relación con `data/Trailerflix.sql`).

---

## Desarrollo

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`. Prefijo base: `/api`.

---

## Autenticación (JWT en cookie HttpOnly)

- **Registro y login** establecen una cookie `HttpOnly` llamada `trailerfix_token` con el JWT.
- **Rutas protegidas** leen el token automáticamente desde la cookie (el navegador la envía en cada request).
- **Compatibilidad**: también se acepta `Authorization: Bearer <token>` como fallback (útil para testing o clientes no-navegador).
- **Logout** elimina la cookie (`POST /api/auth/logout`).
- El token es **stateless** (sin refresh token ni logout servidor más allá de borrar la cookie).
- `password` nunca se devuelve (excluido en `toJSON` y scope `defaultScope`).

### Configuración de cookies (variables de entorno)

| Variable           | Default            | Descripción                                           |
| ------------------ | ------------------ | ----------------------------------------------------- |
| `COOKIE_NAME`      | `trailerfix_token` | Nombre de la cookie                                   |
| `COOKIE_SECURE`    | `auto`             | `true`/`false`/`auto` (auto = true en production)     |
| `COOKIE_SAME_SITE` | `lax`              | `lax`, `strict`, `none`                               |
| `COOKIE_DOMAIN`    | _(vacío)_          | Dominio de la cookie (opcional)                       |
| `COOKIE_MAX_AGE`   | `3600000`          | Duración en ms (default 1h)                           |
| `CORS_ORIGIN`      | _(vacío)_          | Orígenes permitidos para credentials (coma-separados) |

> **Development**: `COOKIE_SECURE=auto` → `false`, `SameSite=Lax`, `CORS_ORIGIN=http://localhost:5173,http://localhost:3000`  
> **Production**: `COOKIE_SECURE=auto` → `true`, `SameSite=None` (cross-site) o `Lax` (same-site), `CORS_ORIGIN=https://tu-frontend.com`

---

## Endpoints

### Health

```
GET /api/health
```

**Respuesta 200**

```json
{ "status": "ok", "database": "up" }
```

---

### Autenticación

#### Registrar usuario

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "pablo",
  "name": "Pablo",
  "password": "Secreta123"
}
```

**Respuesta 201** — Seta cookie `trailerfix_token` (HttpOnly)

```json
{
  "user": { "id": 2, "username": "pablo", "name": "Pablo" }
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

**Respuesta 200** — Seta cookie `trailerfix_token` (HttpOnly)

```json
{
  "user": { "id": 1, "username": "admin", "name": "Administrador" }
}
```

#### Logout

```
POST /api/auth/logout
Cookie: trailerfix_token=<jwt>
```

**Respuesta 204** — Elimina la cookie

#### Usuario actual (protegido)

```
GET /api/auth/me
Cookie: trailerfix_token=<jwt>
```

**Respuesta 200**

```json
{ "user": { "id": 1, "username": "admin", "name": "Administrador" } }
```

> **Nota**: El token también se acepta vía header `Authorization: Bearer <token>` como fallback para testing o clientes no-navegador.

---

## Modelo de datos: `content` como tabla principal

El catálogo se modela con **herencia de tabla única** sobre la tabla **`content`**:

- **`content`** es la tabla **padre/principal**. Guarda los campos **comunes** a cualquier ítem del catálogo:
  - `id` (PK), `title`, `description`, `release_year`, `type` (`MOVIE` | `SERIES`), `created_at`
- **`movies`** y **`series`** son **subtipos 1:1** con `content` (su PK es a la vez FK `content_id` → `content.id`):
  - `movies`: agrega `duration_minutes`
  - `series`: agrega `end_year`, `status` (`ONGOING` | `COMPLETED` | `CANCELLED`)
- **`seasons`** es **1:N** desde `series` (`series_id` → `series.content_id`)

**Relaciones N:M** (sobre `content`, no sobre subtipos por separado):

- **`actors`** ↔ `content` vía `content_actors` (con `character_name`, `credit_order`)
- **`genres`** ↔ `content` vía `content_genres`
- **`users`** ↔ `content` vía `user_content` (estado `WATCHED`/`WATCHLIST`, `watched_at`)

**Por qué esta diseño:**

1. **Consultas unificadas**: buscar “qué ver” recorre una sola tabla (`content`) y filtra por `type`, `title`, `year`, `genre`, `actor`.
2. **Evita duplicación**: campos comunes (título, descripción, año, géneros, reparto) no se repiten en `movies` y `series`.
3. **Extensible**: añadir un nuevo subtipo (p.ej. `documentary`, `anime`) solo requiere una tabla hija nueva; la lógica de búsqueda/filtros no cambia.
4. **Cascada natural**: `DELETE content` elimina en cascada su subtipo (`movie`/`series`), temporadas, géneros, reparto y estados de usuario (`ON DELETE CASCADE` en todas las FK).

En la API, los endpoints bajo `/api/contents` devuelven **ítems del catálogo** (películas o series) con su subtipo correspondiente en `movie` o `series` (uno será `null`), más `genres`, `actors` y, si autenticado, `userStatus`.

---

### Contenidos

| Método   | Ruta                                | Auth     | Descripción                               |
| -------- | ----------------------------------- | -------- | ----------------------------------------- |
| `GET`    | `/api/contents`                     | Opcional | Lista catálogo con filtros                |
| `GET`    | `/api/contents/:id`                 | Opcional | Detalle con géneros, actores y temporadas |
| `POST`   | `/api/contents`                     | Sí       | Crea película o serie                     |
| `PATCH`  | `/api/contents/:id`                 | Sí       | Actualiza datos generales y del subtipo   |
| `DELETE` | `/api/contents/:id`                 | Sí       | Elimina en cascada                        |
| `PUT`    | `/api/contents/:id/genres`          | Sí       | Reemplaza todos los géneros               |
| `POST`   | `/api/contents/:id/genres/:genreId` | Sí       | Agrega un género                          |
| `DELETE` | `/api/contents/:id/genres/:genreId` | Sí       | Quita un género                           |
| `PUT`    | `/api/contents/:id/actors`          | Sí       | Reemplaza todo el reparto                 |
| `POST`   | `/api/contents/:id/actors`          | Sí       | Agrega un actor                           |
| `PATCH`  | `/api/contents/:id/actors/:actorId` | Sí       | Actualiza personaje u orden               |
| `DELETE` | `/api/contents/:id/actors/:actorId` | Sí       | Quita un actor                            |

> **Nota**: En `GET /api/contents` y `GET /api/contents/:id`, la autenticación es **opcional**. Si el request incluye cookie/token válido, cada ítem incluye `userStatus: "WATCHED" | "WATCHLIST" | null` indicando el estado del contenido para ese usuario.

#### Filtros `GET /api/contents`

| Query param | Tipo                | Descripción                                    |
| ----------- | ------------------- | ---------------------------------------------- |
| `type`      | `MOVIE` \| `SERIES` | Filtra por tipo                                |
| `title`     | string              | Búsqueda parcial por título (case-insensitive) |
| `genreId`   | integer             | ID de género                                   |
| `genre`     | string              | Nombre exacto de género                        |
| `year`      | integer             | Año de estreno (`releaseYear`)                 |

**Ejemplos**

```
GET /api/contents?type=SERIES&genre=Drama
GET /api/contents?title=dark&year=2017
GET /api/contents?genreId=3
```

#### Crear una película

```
POST /api/contents
Cookie: trailerfix_token=<jwt>
Content-Type: application/json

{
  "title": "Interstellar",
  "type": "MOVIE",
  "releaseYear": 2014,
  "durationMinutes": 169,
  "description": "Un grupo de astronautas busca un nuevo hogar para la humanidad."
}
```

**Respuesta 201** — incluye `movie: { contentId, durationMinutes }`, `series: null`, `genres: []`, `actors: []`.

#### Crear una serie

```
POST /api/contents
Cookie: trailerfix_token=<jwt>
Content-Type: application/json

{
  "title": "Breaking Bad",
  "type": "SERIES",
  "releaseYear": 2008,
  "endYear": 2013,
  "status": "COMPLETED",
  "description": "Un profesor de química comienza a fabricar metanfetamina."
}
```

**Respuesta 201** — incluye `series: { contentId, endYear, status, seasons: [] }`, `movie: null`.

> **Reglas**
>
> - `type` no se puede cambiar después de crear el contenido.
> - `MOVIE` requiere `durationMinutes` (1–65535).
> - `SERIES` acepta `endYear` (≥1900) y `status` (`ONGOING`, `COMPLETED`, `CANCELLED`).
> - `DELETE /api/contents/:id` elimina en cascada película/serie, temporadas, géneros, reparto y estados de usuario.
> - **Respuesta `DELETE /api/contents/:id`**: `200 OK` con `{ "message": "Se borró el contenido satisfactoriamente." }` (antes `204 No Content`).

#### Reemplazar géneros de un contenido

```
PUT /api/contents/1/genres
Cookie: trailerfix_token=<jwt>
Content-Type: application/json

{ "genreIds": [1, 4, 10] }
```

#### Agregar un actor a un contenido

```
POST /api/contents/1/actors
Cookie: trailerfix_token=<jwt>
Content-Type: application/json

{
  "actorId": 1,
  "characterName": "Walter White",
  "creditOrder": 1
}
```

---

### Géneros

| Método   | Ruta              | Auth | Descripción                    |
| -------- | ----------------- | ---- | ------------------------------ |
| `GET`    | `/api/genres`     | No   | Lista géneros (`?search=`)     |
| `GET`    | `/api/genres/:id` | No   | Obtiene un género              |
| `POST`   | `/api/genres`     | Sí   | Crea un género                 |
| `PATCH`  | `/api/genres/:id` | Sí   | Actualiza el nombre            |
| `DELETE` | `/api/genres/:id` | Sí   | Elimina y quita sus relaciones |

**Crear género**

```
POST /api/genres
Cookie: trailerfix_token=<jwt>
Content-Type: application/json

{ "name": "Ciencia ficción" }
```

> **Respuesta `DELETE /api/genres/:id`**: `200 OK` con `{ "message": "Se borró el género satisfactoriamente." }` (antes `204 No Content`).

---

### Actores

| Método   | Ruta                       | Auth     | Descripción                             |
| -------- | -------------------------- | -------- | --------------------------------------- |
| `GET`    | `/api/actors`              | No       | Lista actores (`?search=`)              |
| `GET`    | `/api/actors/:id`          | No       | Obtiene un actor                        |
| `GET`    | `/api/actors/:id/contents` | Opcional | Películas/series donde trabajó el actor |
| `POST`   | `/api/actors`              | Sí       | Crea un actor                           |
| `PATCH`  | `/api/actors/:id`          | Sí       | Actualiza nombre o apellido             |
| `DELETE` | `/api/actors/:id`          | Sí       | Elimina y quita sus relaciones          |

**Crear actor**

```
POST /api/actors
Cookie: trailerfix_token=<jwt>
Content-Type: application/json

{ "firstName": "Bryan", "lastName": "Cranston" }
```

**Contenidos de un actor** (ej. Bryan Cranston id=4)

```
GET /api/actors/4/contents
Cookie: trailerfix_token=<jwt>  # opcional
```

**Respuesta 200** — igual que `/api/contents` (incluye `userStatus` si autenticado)

```json
[
  {
    "id": 1,
    "title": "Breaking Bad",
    "type": "SERIES",
    "...": "...",
    "userStatus": "WATCHED"
  }
]
```

> **Respuesta `DELETE /api/actors/:id`**: `200 OK` con `{ "message": "Se borró el actor satisfactoriamente." }` (antes `204 No Content`).
> En `GET /api/actors/:id/contents`, la autenticación es **opcional**. Si autenticado, incluye `userStatus` por contenido.

---

### Temporadas

Se gestionan dentro de una serie (`contentId` de la serie).

| Método   | Ruta                                       | Auth | Descripción             |
| -------- | ------------------------------------------ | ---- | ----------------------- |
| `GET`    | `/api/series/:contentId/seasons`           | No   | Lista temporadas        |
| `POST`   | `/api/series/:contentId/seasons`           | Sí   | Crea una temporada      |
| `PATCH`  | `/api/series/:contentId/seasons/:seasonId` | Sí   | Actualiza una temporada |
| `DELETE` | `/api/series/:contentId/seasons/:seasonId` | Sí   | Elimina una temporada   |

**Crear temporada**

```
POST /api/series/1/seasons
Cookie: trailerfix_token=<jwt>
Content-Type: application/json

{ "seasonNumber": 1, "releaseYear": 2008, "episodeCount": 7 }
```

> `seasonNumber` debe ser único por serie. `releaseYear` y `episodeCount` opcionales.
> **Respuesta `DELETE /api/series/:contentId/seasons/:seasonId`**: `200 OK` con `{ "message": "Se borró la temporada satisfactoriamente." }` (antes `204 No Content`).

---

### Mi contenido (protegido — usuario de la cookie)

| Método   | Ruta                                        | Descripción               |
| -------- | ------------------------------------------- | ------------------------- |
| `GET`    | `/api/me/content?status=WATCHED\|WATCHLIST` | Lista vistos o pendientes |
| `POST`   | `/api/me/content`                           | Agrega un contenido       |
| `PATCH`  | `/api/me/content/:contentId`                | Cambia el estado          |
| `DELETE` | `/api/me/content/:contentId`                | Quita de la lista         |

**Agregar a pendientes (watchlist)**

```
POST /api/me/content
Cookie: trailerfix_token=<jwt>
Content-Type: application/json

{ "contentId": 1, "status": "WATCHLIST" }
```

**Marcar como visto**

```
PATCH /api/me/content/1
Cookie: trailerfix_token=<jwt>
Content-Type: application/json

{ "status": "WATCHED" }
```

> - `WATCHED` setea `watchedAt` con la fecha actual (si no existía).
> - `WATCHLIST` deja `watchedAt` en `null`.
> - No se puede tener dos estados para el mismo `user_id` + `content_id` (UNIQUE).
> - `GET /api/me/content?status=WATCHED` filtra por estado.
> - **Respuesta `DELETE /api/me/content/:contentId`**: `200 OK` con `{ "message": "Se borró el contenido de tu lista satisfactoriamente." }` (antes `204 No Content`).

---

## Errores

Formato estándar:

```json
{ "error": "Credenciales inválidas" }
```

Validaciones agregan `details`:

```json
{
  "error": "Datos inválidos",
  "details": ["password es obligatorio y debe tener entre 8 y 72 caracteres"]
}
```

| Código | Caso                                                    |
| ------ | ------------------------------------------------------- |
| `400`  | Body/query inválido, o restricción CHECK de la base     |
| `401`  | Credenciales inválidas, token ausente/inválido/expirado |
| `404`  | Recurso no encontrado                                   |
| `409`  | Unique duplicado, referencia inexistente o en uso (FK)  |
| `413`  | Body demasiado grande                                   |
| `500`  | Error no controlado                                     |

El handler distingue:

- `SequelizeUniqueConstraintError` → 409 (campo duplicado)
- `SequelizeForeignKeyConstraintError` → 409 (FK inexistente/en uso)
- `SequelizeDatabaseError` con CHECK → 400 (restricción de BD)
- `SequelizeValidationError` → 400 (validaciones de modelo)

---

## Estructura del código

```
src/
  app.js                 # configuración de Express y montaje de rutas
  server.js              # conexión a DB y arranque del servidor
  config/                # environment (dotenv) y database (Sequelize + config CLI)
  database/
    models/              # User, Content, Movie, Series, Genre, ContentGenre,
                         # Actor, ContentActor, Season, UserContent
    migrations/          # creación de tablas y constraints
    seeders/             # datos demo (usuario, catálogo, relaciones)
  repositories/          # acceso a datos: content, genre, actor, season, userContent
  controllers/           # auth y CRUD de cada recurso
  routers/               # /api/health, /api/auth, /api/contents, /api/genres,
                         # /api/actors, /api/series, /api/me/content
  middlewares/           # authenticate, validaciones, 404 y errores
  utils/                 # JWT y serializadores
```

---

## Notas

- **Sin paginación** en listados (etapa actual).
- **Convención de nombres**: tablas nuevas en `snake_case` + `underscored: true`; `users` conserva `createdAt`/`updatedAt` camelCase (alineado en migración `20261116000008-align-users-id-unsigned.js` para `id` UNSIGNED).
- **BD por defecto**: `trailerfix_db` (config). El script `data/Trailerflix.sql` está **alineado 1:1** (mismo nombre BD, mismo seed `admin`/`Admin123!`, mismos timestamps) — ver [`src/database/README.md`](src/database/README.md#relación-con-datatrailerflixsql).
