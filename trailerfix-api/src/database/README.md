# Base de datos — Trailerfix API

Documentación técnica completa del esquema relacional, configuración Sequelize/CLI, migraciones, seeders y discrepancias con el script de referencia.

---

## Visión general

- **Motor**: MySQL 8.0+ (InnoDB)
- **Charset/Collation**: `utf8mb4` / `utf8mb4_0900_ai_ci` (definido en migraciones)
- **ORM**: Sequelize 6 (ES Modules)
- **Convención de nombres**:
  - Tablas nuevas: `snake_case` + `underscored: true` → columnas `snake_case`, timestamps `created_at`/`updated_at`
  - Tabla `users` (legacy): `camelCase` en timestamps (`createdAt`, `updatedAt`), PK `id` alineada a `UNSIGNED` en migración 08
- **Timestamps**: `content` tiene solo `created_at`; `movies`, `series`, `genres`, `actors`, `content_genres`, `content_actors`, `seasons` sin timestamps; `user_content` con `created_at`/`updated_at` (auto `ON UPDATE`)
- **DB por entorno**: `trailerfix_db` (development), `trailerfix_db_test` (test), misma config en production (ver `src/config/database.cjs`)

---

## Diagrama lógico (entidades y cardinalidad)

```
users 1 ─────< user_content >───── 1 content
                              │
                              ├──< 1:1 > movie
                              ├──< 1:1 > series 1 ─────< seasons
                              ├──< N:M > genres (through content_genres)
                              └──< N:M > actors (through content_actors, attrs: character_name, credit_order)
```

| Relación | Tipo | Detalle |
|---|---|---|
| `users` ↔ `user_content` | 1:N | FK `user_id` → `users.id` (CASCADE) |
| `content` ↔ `user_content` | 1:N | FK `content_id` → `content.id` (CASCADE) |
| `content` ↔ `movies` | 1:1 | PK/FK `content_id` (CASCADE) |
| `content` ↔ `series` | 1:1 | PK/FK `content_id` (CASCADE) |
| `series` ↔ `seasons` | 1:N | FK `series_id` → `series.content_id` (CASCADE) |
| `content` ↔ `genres` | N:M | Tabla `content_genres` (PK compuesta, CASCADE ambos lados) |
| `content` ↔ `actors` | N:M | Tabla `content_actors` (PK compuesta + `character_name`, `credit_order`, CASCADE ambos lados) |

**Reglas de borrado**: `ON DELETE CASCADE` / `ON UPDATE CASCADE` en todas las FK. Borrar un `content` arrastra `movie`/`series`, `seasons`, `content_genres`, `content_actors`, `user_content`.

---

## Detalle por tabla

### 1. `users`

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `id` | `INT UNSIGNED` | NO | `AUTO_INCREMENT` | PK |
| `username` | `VARCHAR(50)` | NO | — | Único, 3–50 chars |
| `name` | `VARCHAR(100)` | NO | — | 2–100 chars |
| `password` | `VARCHAR(255)` | NO | — | Hash bcrypt (nunca se devuelve) |
| `createdAt` | `DATETIME` | NO | `CURRENT_TIMESTAMP` | CamelCase (legacy) |
| `updatedAt` | `DATETIME` | NO | `CURRENT_TIMESTAMP ON UPDATE` | CamelCase (legacy) |

**Índices / Constraints**
- `PRIMARY KEY (id)`
- `UNIQUE uq_users_username (username)` — migración `20261113000000-create-users.js` línea 31-34

**Notas**
- Modelo excluye `password` en `defaultScope` y `toJSON()`.
- Scope `withPassword` incluye hash para login.
- Migración `20261116000008-align-users-id-unsigned.js` cambió `id` a `UNSIGNED` para coincidir con `user_content.user_id`.

---

### 2. `content`

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `id` | `INT UNSIGNED` | NO | `AUTO_INCREMENT` | PK |
| `title` | `VARCHAR(255)` | NO | — | 1–255 chars |
| `description` | `TEXT` | YES | `NULL` | |
| `release_year` | `SMALLINT UNSIGNED` | YES | `NULL` | Año de estreno |
| `type` | `ENUM('MOVIE','SERIES')` | NO | — | Discriminador |
| `created_at` | `TIMESTAMP` | NO | `CURRENT_TIMESTAMP` | Solo created_at (no updated_at) |

**Índices**
- `PRIMARY KEY (id)`
- `INDEX idx_content_title (title)` — búsqueda parcial `LIKE %title%`
- `INDEX idx_content_type (type)` — filtro por MOVIE/SERIES
- `INDEX idx_content_release_year (release_year)` — filtro por año

**Notas**
- `underscored: true` → columnas `snake_case`, timestamps `created_at`.
- `releaseYear` en modelo mapea a `release_year` en BD.

---

### 3. `movies`

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `content_id` | `INT UNSIGNED` | NO | — | PK + FK → `content.id` |
| `duration_minutes` | `SMALLINT UNSIGNED` | NO | — | 1–65535 |

**Constraints**
- `PRIMARY KEY (content_id)`
- `FK fk_movies_content (content_id) REFERENCES content(id) ON DELETE CASCADE ON UPDATE CASCADE`
- `CHECK chk_movies_duration (duration_minutes > 0)`

**Notas**
- Sin timestamps (`timestamps: false`).
- 1:1 con `content` donde `type = 'MOVIE'`.

---

### 4. `series`

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `content_id` | `INT UNSIGNED` | NO | — | PK + FK → `content.id` |
| `end_year` | `SMALLINT UNSIGNED` | YES | `NULL` | Año final (≥1900) |
| `status` | `ENUM('ONGOING','COMPLETED','CANCELLED')` | NO | `'ONGOING'` | Estado de la serie |

**Constraints**
- `PRIMARY KEY (content_id)`
- `FK fk_series_content (content_id) REFERENCES content(id) ON DELETE CASCADE ON UPDATE CASCADE`
- `CHECK chk_series_end_year (end_year IS NULL OR end_year >= 1900)`

**Notas**
- Sin timestamps.
- 1:1 con `content` donde `type = 'SERIES'`.
- `status` validado en modelo y BD.

---

### 5. `genres`

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `id` | `INT UNSIGNED` | NO | `AUTO_INCREMENT` | PK |
| `name` | `VARCHAR(50)` | NO | — | Único, 1–50 chars |

**Índices / Constraints**
- `PRIMARY KEY (id)`
- `UNIQUE uq_genres_name (name)`

**Notas**
- Sin timestamps.
- `name` único a nivel BD y modelo.

---

### 6. `content_genres` (N:M content ↔ genres)

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `content_id` | `INT UNSIGNED` | NO | — | PK + FK → `content.id` |
| `genre_id` | `INT UNSIGNED` | NO | — | PK + FK → `genres.id` |

**Constraints**
- `PRIMARY KEY (content_id, genre_id)`
- `FK fk_content_genres_content (content_id) REFERENCES content(id) ON DELETE CASCADE ON UPDATE CASCADE`
- `FK fk_content_genres_genre (genre_id) REFERENCES genres(id) ON DELETE CASCADE ON UPDATE CASCADE`

**Índices**
- `INDEX idx_content_genres_genre (genre_id)` — consultas "contenidos por género"

**Notas**
- Tabla puente sin timestamps.
- Modelo `ContentGenre` define `belongsTo` a `Content` y `Genre` (aliases `content`, `genre`).

---

### 7. `actors`

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `id` | `INT UNSIGNED` | NO | `AUTO_INCREMENT` | PK |
| `first_name` | `VARCHAR(100)` | NO | — | 1–100 chars |
| `last_name` | `VARCHAR(100)` | NO | — | 1–100 chars |

**Índices**
- `PRIMARY KEY (id)`
- `INDEX idx_actors_name (last_name, first_name)` — ordenación y búsqueda por apellido/nombre

**Notas**
- Sin timestamps.
- Modelo incluye getter virtual `fullName` (`firstName + ' ' + lastName`).

---

### 8. `content_actors` (N:M content ↔ actors con atributos)

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `content_id` | `INT UNSIGNED` | NO | — | PK + FK → `content.id` |
| `actor_id` | `INT UNSIGNED` | NO | — | PK + FK → `actors.id` |
| `character_name` | `VARCHAR(150)` | YES | `NULL` | Personaje interpretado |
| `credit_order` | `SMALLINT UNSIGNED` | YES | `NULL` | Orden en créditos (1 = principal) |

**Constraints**
- `PRIMARY KEY (content_id, actor_id)`
- `FK fk_content_actors_content (content_id) REFERENCES content(id) ON DELETE CASCADE ON UPDATE CASCADE`
- `FK fk_content_actors_actor (actor_id) REFERENCES actors(id) ON DELETE CASCADE ON UPDATE CASCADE`

**Índices**
- `INDEX idx_content_actors_actor (actor_id)` — consultas "contenidos de un actor"

**Notas**
- Tabla puente con atributos extra (`character_name`, `credit_order`).
- Modelo `ContentActor` expone ambos `belongsTo` (`content`, `actor`).
- Serializador en `src/utils/serializers.js` aplana `ContentActor` y devuelve `fullName`, `characterName`, `creditOrder` ordenados por `creditOrder` (nulls last).

---

### 9. `seasons`

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `id` | `INT UNSIGNED` | NO | `AUTO_INCREMENT` | PK |
| `series_id` | `INT UNSIGNED` | NO | — | FK → `series.content_id` |
| `season_number` | `SMALLINT UNSIGNED` | NO | — | ≥1, único por serie |
| `release_year` | `SMALLINT UNSIGNED` | YES | `NULL` | Año de emisión |
| `episode_count` | `SMALLINT UNSIGNED` | YES | `NULL` | Cantidad de episodios |

**Constraints**
- `PRIMARY KEY (id)`
- `UNIQUE uq_season_number (series_id, season_number)` — no repetir número en misma serie
- `FK fk_seasons_series (series_id) REFERENCES series(content_id) ON DELETE CASCADE ON UPDATE CASCADE`
- `CHECK chk_season_number (season_number > 0)`

**Índices**
- `INDEX idx_seasons_series (series_id)` — listar temporadas de una serie

**Notas**
- Sin timestamps.
- Modelo `Season` define `belongsTo Series` (alias `series`, FK `seriesId` → `series.content_id`).

---

### 10. `user_content` (estado por usuario)

| Campo | Tipo | Null | Default | Descripción |
|---|---|---|---|---|
| `id` | `INT UNSIGNED` | NO | `AUTO_INCREMENT` | PK |
| `user_id` | `INT UNSIGNED` | NO | — | FK → `users.id` |
| `content_id` | `INT UNSIGNED` | NO | — | FK → `content.id` |
| `status` | `ENUM('WATCHED','WATCHLIST')` | NO | — | Estado |
| `watched_at` | `DATETIME` | YES | `NULL` | Fecha de visualización |
| `created_at` | `TIMESTAMP` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `TIMESTAMP` | NO | `CURRENT_TIMESTAMP ON UPDATE` | Auto-update |

**Constraints**
- `PRIMARY KEY (id)`
- `UNIQUE uq_user_content (user_id, content_id)` — un estado actual por usuario+contenido
- `FK fk_user_content_user (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`
- `FK fk_user_content_content (content_id) REFERENCES content(id) ON DELETE CASCADE ON UPDATE CASCADE`
- `CHECK chk_user_content_watched_at ((status = 'WATCHED' AND watched_at IS NOT NULL) OR (status = 'WATCHLIST' AND watched_at IS NULL))`

**Índices**
- `INDEX idx_user_content_user_status (user_id, status)` — filtrar vistos/pendientes de un usuario
- `INDEX idx_user_content_content (content_id)` — consultas inversas

**Notas**
- Modelo valida `watchedAtMatchesStatus` (mismo regla que CHECK).
- `WATCHED` → `watchedAt` obligatorio (se setea en controller si no viene).
- `WATCHLIST` → `watchedAt` debe ser `null`.
- `updated_at` tiene `ON UPDATE CURRENT_TIMESTAMP` aplicado en migración (línea 80-82).

---

## Relaciones y asociaciones Sequelize (resumen)

Archivo: `src/database/models/index.js`

```js
// 1:1 Content ↔ Movie
Content.hasOne(Movie, { foreignKey: 'contentId', as: 'movie' });
Movie.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

// 1:1 Content ↔ Series
Content.hasOne(Series, { foreignKey: 'contentId', as: 'series' });
Series.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

// 1:N Series ↔ Season
Series.hasMany(Season, { foreignKey: 'seriesId', as: 'seasons' });
Season.belongsTo(Series, { foreignKey: 'seriesId', as: 'series' });

// N:M Content ↔ Genre (through ContentGenre)
Content.belongsToMany(Genre, {
  through: ContentGenre,
  foreignKey: 'contentId',
  otherKey: 'genreId',
  as: 'genres',
});
Genre.belongsToMany(Content, {
  through: ContentGenre,
  foreignKey: 'genreId',
  otherKey: 'contentId',
  as: 'contents',
});
ContentGenre.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });
ContentGenre.belongsTo(Genre, { foreignKey: 'genreId', as: 'genre' });

// N:M Content ↔ Actor (through ContentActor, attrs: characterName, creditOrder)
Content.belongsToMany(Actor, {
  through: ContentActor,
  foreignKey: 'contentId',
  otherKey: 'actorId',
  as: 'actors',
});
Actor.belongsToMany(Content, {
  through: ContentActor,
  foreignKey: 'actorId',
  otherKey: 'contentId',
  as: 'contents',
});
ContentActor.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });
ContentActor.belongsTo(Actor, { foreignKey: 'actorId', as: 'actor' });

// 1:N User ↔ UserContent ↔ Content
Content.hasMany(UserContent, { foreignKey: 'contentId', as: 'userEntries' });
UserContent.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });
User.hasMany(UserContent, { foreignKey: 'userId', as: 'contentEntries' });
UserContent.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.belongsToMany(Content, {
  through: UserContent,
  foreignKey: 'userId',
  otherKey: 'contentId',
  as: 'contents',
});
Content.belongsToMany(User, {
  through: UserContent,
  foreignKey: 'contentId',
  otherKey: 'userId',
  as: 'users',
});
```

**Aliases usados en includes/queries**:
- `content.movie`, `content.series`, `content.series.seasons`
- `content.genres` (through `ContentGenre`, `through.attributes: []`)
- `content.actors` (through `ContentActor`, `through.attributes: ['characterName','creditOrder']`)
- `userContent.content` (con nested includes)

---

## Configuración

### `src/config/environment.js`
Carga y valida `.env` (usa `dotenv/config`). Exporta objeto `environment` con:

```js
{
  nodeEnv: 'development' | 'test' | 'production',
  port: 3000,
  db: { host, port, name, user, password, dialect, logging },
  jwt: { secret, expiresIn: '1h' },
  bcryptSaltRounds: 10
}
```
- Lanza error si `JWT_SECRET` no está definido.
- En `production` exige `JWT_SECRET.length >= 32`.

### `src/config/database.cjs` (CommonJS — CLI Sequelize)
Configuración para `sequelize-cli` (migraciones/seeders). Usa `dotenv` y resuelve `.env` desde raíz del proyecto. Exporta:

```js
{
  development: { username, password, database, host, port, dialect, logging, define: { timestamps: true } },
  test: { ...development, database: 'trailerfix_db_test' },
  production: { ...development }
}
```

### `src/config/database.js` (ESM — runtime)
Importa `database.cjs` y `environment`, selecciona config por `environment.nodeEnv`, instancia `new Sequelize(...)`. Exporta la instancia `sequelize` usada en modelos.

### Variables relevantes
| Variable | Uso |
|---|---|
| `DB_LOGGING=true` | Activa `console.log` de SQL en runtime y CLI |
| `NODE_ENV=test` | Usa `trailerfix_db_test` (aisla tests) |
| `JWT_SECRET` | Obligatorio; firma/verifica tokens |
| `BCRYPT_SALT_ROUNDS` | Coste hash passwords (default 10) |

---

## Migraciones (orden y propósito)

| Archivo | Descripción |
|---|---|
| `20261113000000-create-users.js` | Tabla `users` (legacy camelCase timestamps) + unique username |
| `20261116000000-create-content.js` | Tabla `content` + índices `title`, `type`, `release_year` |
| `20261116000001-create-genres.js` | Tabla `genres` + unique `name` |
| `20261116000002-create-actors.js` | Tabla `actors` + índice `last_name, first_name` |
| `20261116000003-create-movies.js` | Tabla `movies` (PK/FK `content_id`, CHECK `duration_minutes > 0`) |
| `20261116000004-create-series.js` | Tabla `series` (PK/FK `content_id`, CHECK `end_year >= 1900`) |
| `20261116000005-create-content-genres.js` | Tabla `content_genres` (PK compuesta, 2 FK CASCADE, índice `genre_id`) |
| `20261116000006-create-content-actors.js` | Tabla `content_actors` (PK compuesta + attrs, 2 FK CASCADE, índice `actor_id`) |
| `20261116000007-create-seasons.js` | Tabla `seasons` (PK `id`, unique `series_id+season_number`, FK `series_id`, CHECK `season_number>0`, índice `series_id`) |
| `20261116000008-align-users-id-unsigned.js` | `ALTER TABLE users MODIFY COLUMN id INT UNSIGNED...` (alineación FK `user_content.user_id`) |
| `20261116000009-create-user-content.js` | Tabla `user_content` (PK, 2 FK CASCADE, unique `user_id+content_id`, CHECK `watched_at` vs `status`, índices `user_id+status` y `content_id`, `updated_at ON UPDATE`) |

**Comandos**
```bash
npm run db:migrate           # aplica pendientes
npm run db:migrate:undo      # revierte última
npm run db:migrate:undo:all  # revierte todas
```

---

## Seeders (orden y datos)

| Archivo | Descripción |
|---|---|
| `20261113000001-demo-user.js` | Usuario `admin` / `Admin123!` (idempotente: salta si existe) |
| `20261116000010-demo-genres.js` | 10 géneros (Drama, Acción, Ciencia ficción, Suspenso, Comedia, Terror, Aventura, Romance, Fantasía, Crimen) |
| `20261116000011-demo-content.js` | 6 contenidos con IDs fijos 1–6 (3 MOVIE, 3 SERIES) |
| `20261116000012-demo-movies.js` | Duraciones de las 3 películas |
| `20261116000013-demo-series.js` | `end_year`/`status` de las 3 series |
| `20261116000014-demo-content-genres.js` | 15 relaciones content↔genre (mapea por nombre → ID real) |
| `20261116000015-demo-actors.js` | 10 actores |
| `20261116000016-demo-content-actors.js` | 10 relaciones content↔actor con personaje/orden (mapea por nombre) |
| `20261116000017-demo-seasons.js` | 10 temporadas (5 Breaking Bad, 3 Dark, 2 The Office) |
| `20261116000018-demo-user-content.js` | 4 entradas para `admin` (2 WATCHED + 2 WATCHLIST, busca user por username) |

**Comandos**
```bash
npm run db:seed            # ejecuta todos (idempotentes donde aplica)
npm run db:seed:undo       # revierte último seeder
npm run db:seed:undo:all   # revierte todos
npm run db:reset           # migrate:undo:all + migrate + seed
```

**Conteos resultantes** (tras `db:seed` limpio):
- `users`: 2 (admin + pablo si se registró antes)
- `genres`: 10
- `content`: 6 (3 MOVIE, 3 SERIES)
- `movies`/`series`: 3 c/u
- `content_genres`: 15
- `actors`: 10
- `content_actors`: 10
- `seasons`: 10
- `user_content`: 4 (para admin)

---

## Diferencias con `data/Trailerflix.sql`

El archivo `data/Trailerflix.sql` es un **script de referencia/educativo** que define un esquema similar pero con diferencias intencionales:

| Aspecto | `data/Trailerflix.sql` | Migraciones/Seeders API |
|---|---|---|
| **Nombre BD** | `trailerflix` | `trailerfix_db` (config) |
| **`users` timestamps** | Solo `created_at` (no `updated_at`) | `createdAt` + `updatedAt` (camelCase, legacy) |
| **`users` password** | Hash placeholder (`$2b$12$REEMPLAZAR...`) | Hash real generado por seeder con `bcryptjs` |
| **Usuarios seed** | `dev_demo`, `ana_demo` | `admin` (y `pablo` si se registró via API) |
| **`content` timestamps** | Solo `created_at` | Solo `created_at` (coincide) |
| **Tablas puente** | Mismos nombres/columnas | Mismos + `underscored: true` en modelos |
| **Checks/Constraints** | Definidos en `CREATE TABLE` | Definidos en migraciones (equivalentes) |
| **Datos demo** | 2 usuarios, 6 contenidos, mismas relaciones | 1 usuario demo principal, mismos 6 contenidos, 4 `user_content` para admin |
| **Propósito** | Referencia canónica, portable, educativo | Esquema vivo versionado, usado por la API |

> **Recomendación**: Usar migraciones/seeders como fuente de verdad para desarrollo y CI. `Trailerflix.sql` sirve para documentación, onboarding o recrear esquema en otro entorno sin Sequelize.

---

## Referencias rápidas

- **Modelos**: `src/database/models/*.model.js`
- **Migraciones**: `src/database/migrations/*.js`
- **Seeders**: `src/database/seeders/*.js`
- **Config runtime**: `src/config/database.js`
- **Config CLI**: `src/config/database.cjs`
- **Env example**: `../.env.example`
- **README API**: [`../README.md`](../README.md)
- **README Proyecto**: [`../../README.md`](../../README.md)