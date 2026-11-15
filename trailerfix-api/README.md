# trailerfix-api

Esqueleto de API en Node.js (ES Modules) con autenticacion JWT, Express 5, Sequelize y MySQL.

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

### `GET /api/health`

```bash
curl http://localhost:3000/api/health
```

### `POST /api/auth/register`

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

### `POST /api/auth/login`

Body: `{ "username", "password" }`.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"Admin123!\"}"
```

Respuesta `200`: `{ "user": { ... }, "token": "<jwt>" }`.

### `GET /api/auth/me`

Requiere `Authorization: Bearer <token>`.

```bash
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```

Respuesta `200`: `{ "user": { "id", "username", "name" } }`.

## Errores

Las respuestas de error tienen la forma:

```json
{ "error": "Credenciales invalidas" }
```

Las validaciones agregan `details`:

```json
{ "error": "Datos invalidos", "details": ["password es obligatorio y debe tener entre 8 y 72 caracteres"] }
```

| Codigo | Caso |
| --- | --- |
| `400` | Body invalido |
| `401` | Credenciales invalidas, token ausente/invalido/expirado |
| `409` | `username` ya registrado |
| `500` | Error no controlado |

## Estructura

```
src/
  app.js                 # configuracion de Express y montaje de rutas
  server.js              # conexion a DB y arranque del servidor
  config/                # environment (dotenv) y database (Sequelize + config CLI)
  database/
    models/              # User (defaultScope oculta password)
    migrations/          # creacion de la tabla users
    seeders/             # usuario demo
  repositories/          # acceso a datos
  controllers/           # logica de register/login/me
  routers/               # /api/health y /api/auth
  middlewares/           # authenticate, validaciones, 404 y errores
  utils/                 # firma y verificacion de JWT
```

## Notas

- El token JWT es stateless: no hay refresh token ni logout del lado del servidor en esta etapa.
- `password` nunca se devuelve en las respuestas: el modelo `User` lo excluye de `toJSON()` y del scope por defecto.
- No hay roles ni permisos; el modelo `User` solo tiene `id`, `username`, `name` y `password`.
