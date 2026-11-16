# trailerfix-api

API en Node.js (ES Modules) con autenticacion JWT, Express 5, Sequelize y MySQL.
Modela un catalogo de peliculas y series con generos, actores, temporadas y las
listas personales de cada usuario.

## Requisitos

- Node.js >= 22.12
- MySQL 8 (o MariaDB compatible)

## Instalacion

```bash
npm install
cp .env.example .env
```

Editar `.env` con las credenciales de MySQL y un `JWT_SECRET` propio.

## Base de datos

```bash
npm run db:create
npm run db:migrate
npm run db:seed
```

El seeder crea el usuario demo:

| username | password |
| -------- | -------- |
| `admin`  | `Admin123!` |

Para reiniciar todo el esquema:

```bash
npm run db:reset
```

> `db:reset` elimina todas las tablas y vuelve a crearlas. No usarlo sobre una
> base con datos que quieras conservar.

## Desarrollo

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`.

## Variables de entorno

| Variable | Default | Descripcion |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP |
| `NODE_ENV` | `development` | Entorno (`development`, `test`, `production`) |
| `DB_HOST` | `localhost` | Host de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_NAME` | `trailerfix_db` | Nombre de la base |
| `DB_USER` | `root` | Usuario de MySQL |
| `DB_PASSWORD` | vacio | Password de MySQL |
| `DB_DIALECT` | `mysql` | Dialecto de Sequelize |
| `DB_LOGGING` | `false` | Loguear SQL |
| `JWT_SECRET` | - (obligatorio) | Secreto para firmar los tokens |
| `JWT_EXPIRES_IN` | `1h` | Duracion del token |
| `BCRYPT_SALT_ROUNDS` | `10` | Costo del hash de passwords |

## Endpoints

Las rutas de lectura son publicas. Las rutas marcadas con 🔒 requieren
`Authorization: Bearer <token>`.

### Health

```bash
curl http://localhost:3000/api/health
```

### Autenticacion

#### `POST /api/auth/register`

Body: `{ "username", "name", "password" }` (password entre 8 y 72 caracteres).

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"pablo\",\"name\":\"Pablo\",\"password\":\"Secreta123\"}"
```

Respuesta `201`:

```json
{
  "user": { "id": 2, "username": "pablo", "name": "Pablo" },
  "token": "<jwt>"
}
```

#### `POST /api/auth/login`

Body: `{ "username", "password" }`.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"Admin123!\"}"
```

Respuesta `200`: `{ "user": { ... }, "token": "<jwt>" }`.

#### `GET /api/auth/me` 🔒

```bash
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```

Respuesta `200`: `{ "user": { "id", "username", "name" } }`.

### Contenidos

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/contents` | No | Lista el catalogo |
| `GET` | `/api/contents/:id` | No | Detalle con generos, reparto y temporadas |
| `POST` | `/api/contents` | Si | Crea una pelicula o serie |
| `PATCH` | `/api/contents/:id` | Si | Actualiza datos generales y del subtipo |
| `DELETE` | `/api/contents/:id` | Si | Elimina en cascada |
| `PUT` | `/api/contents/:id/genres` | Si | Reemplaza todos los generos |
| `POST` | `/api/contents/:id/genres/:genreId` | Si | Agrega un genero |
| `DELETE` | `/api/contents/:id/genres/:genreId` | Si | Quita un genero |
| `PUT` | `/api/contents/:id/actors` | Si | Reemplaza todo el reparto |
| `POST` | `/api/contents/:id/actors` | Si | Agrega un actor |
| `PATCH` | `/api/contents/:id/actors/:actorId` | Si | Actualiza personaje u orden |
| `DELETE` | `/api/contents/:id/actors/:actorId` | Si | Quita un actor |

Filtros de `GET /api/contents`:

- `type`: `MOVIE` o `SERIES`
- `title`: busqueda parcial por titulo
- `genreId`: id de genero
- `genre`: nombre de genero
- `year`: año de estreno

Ejemplos:

```bash
curl "http://localhost:3000/api/contents?type=SERIES&genre=Drama"
curl "http://localhost:3000/api/contents?title=dark&year=2017"
```

Crear una pelicula:

```bash
curl -X POST http://localhost:3000/api/contents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Interstellar\",\"type\":\"MOVIE\",\"releaseYear\":2014,\"durationMinutes\":169}"
```

Crear una serie:

```bash
curl -X POST http://localhost:3000/api/contents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Breaking Bad\",\"type\":\"SERIES\",\"releaseYear\":2008,\"endYear\":2013,\"status\":\"COMPLETED\"}"
```

- `type` no se puede cambiar despues de crear el contenido.
- En `MOVIE` es obligatorio `durationMinutes`.
- En `SERIES` se aceptan `endYear` y `status` (`ONGOING`, `COMPLETED`, `CANCELLED`).

Reemplazar generos:

```bash
curl -X PUT http://localhost:3000/api/contents/1/genres \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"genreIds\":[1,4,10]}"
```

Agregar un actor:

```bash
curl -X POST http://localhost:3000/api/contents/1/actors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"actorId\":1,\"characterName\":\"Walter White\",\"creditOrder\":1}"
```

### Generos

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/genres` | No | Lista generos (`?search=`) |
| `GET` | `/api/genres/:id` | No | Obtiene un genero |
| `POST` | `/api/genres` | Si | Crea un genero |
| `PATCH` | `/api/genres/:id` | Si | Actualiza el nombre |
| `DELETE` | `/api/genres/:id` | Si | Elimina y quita sus relaciones |

```bash
curl -X POST http://localhost:3000/api/genres \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ciencia ficcion\"}"
```

### Actores

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/actors` | No | Lista actores (`?search=`) |
| `GET` | `/api/actors/:id` | No | Obtiene un actor |
| `POST` | `/api/actors` | Si | Crea un actor |
| `PATCH` | `/api/actors/:id` | Si | Actualiza nombre o apellido |
| `DELETE` | `/api/actors/:id` | Si | Elimina y quita sus relaciones |

```bash
curl -X POST http://localhost:3000/api/actors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Bryan\",\"lastName\":\"Cranston\"}"
```

### Temporadas

Las temporadas se gestionan dentro de una serie (`contentId` de la serie).

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/series/:contentId/seasons` | No | Lista temporadas |
| `POST` | `/api/series/:contentId/seasons` | Si | Crea una temporada |
| `PATCH` | `/api/series/:contentId/seasons/:seasonId` | Si | Actualiza una temporada |
| `DELETE` | `/api/series/:contentId/seasons/:seasonId` | Si | Elimina una temporada |

```bash
curl -X POST http://localhost:3000/api/series/1/seasons \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"seasonNumber\":1,\"releaseYear\":2008,\"episodeCount\":7}"
```

### Mi contenido 🔒

Siempre opera sobre el usuario autenticado por el token.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/api/me/content?status=WATCHED\|WATCHLIST` | Lista vistos o pendientes |
| `POST` | `/api/me/content` | Agrega un contenido |
| `PATCH` | `/api/me/content/:contentId` | Cambia el estado |
| `DELETE` | `/api/me/content/:contentId` | Quita de la lista |

```bash
curl -X POST http://localhost:3000/api/me/content \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"contentId\":1,\"status\":\"WATCHLIST\"}"

curl -X PATCH http://localhost:3000/api/me/content/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"WATCHED\"}"
```

- `WATCHED` guarda `watchedAt` con la fecha actual.
- `WATCHLIST` deja `watchedAt` en `null`.
- No se puede tener dos estados para el mismo contenido y usuario.

## Errores

Las respuestas de error tienen la forma:

```json
{ "error": "Credenciales invalidas" }
```

Las validaciones agregan `details`:

```json
{
  "error": "Datos invalidos",
  "details": ["password es obligatorio y debe tener entre 8 y 72 caracteres"]
}
```

| Codigo | Caso |
| --- | --- |
| `400` | Body o query invalido, o restriccion CHECK de la base |
| `401` | Credenciales invalidas, token ausente/invalido/expirado |
| `404` | Recurso no encontrado |
| `409` | Unique duplicado, referencia inexistente o en uso |
| `413` | Body demasiado grande |
| `500` | Error no controlado |

## Estructura

```
src/
  app.js                 # configuracion de Express y montaje de rutas
  server.js              # conexion a DB y arranque del servidor
  config/                # environment (dotenv) y database (Sequelize + config CLI)
  database/
    models/              # User, Content, Movie, Series, Genre, ContentGenre,
                         # Actor, ContentActor, Season, UserContent
    migrations/          # creacion de tablas y constraints
    seeders/             # usuario demo
  repositories/          # acceso a datos: content, genre, actor, season, userContent
  controllers/           # auth y CRUD de cada recurso
  routers/               # /api/health, /api/auth, /api/contents, /api/genres,
                         # /api/actors, /api/series, /api/me/content
  middlewares/           # authenticate, validaciones, 404 y errores
  utils/                 # JWT y serializadores
```

## Notas

- El token JWT es stateless: no hay refresh token ni logout del lado del servidor.
- `password` nunca se devuelve: el modelo `User` lo excluye de `toJSON()` y del scope.
- `DELETE /api/contents/:id` elimina en cascada pelicula/serie, temporadas,
  generos, reparto y estados de usuario asociados.
- Las listas no tienen paginacion en esta etapa.
