-- ============================================================
-- TRAILERFLIX
-- Modelo relacional para peliculas, series y listas de usuarios
-- Motor: MySQL 8.0+
--
-- IMPORTANTE:
--   1. Ejecutar este script en una base de datos nueva.
--   2. No contiene DROP DATABASE ni DROP TABLE para evitar
--      borrar informacion accidentalmente.
--   3. La columna users.password almacena hashes, nunca texto plano.
--   4. Reemplazar el hash de ejemplo antes de utilizar el usuario
--      demo para autenticacion real.
-- ============================================================

CREATE DATABASE IF NOT EXISTS trailerflix
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE trailerflix;

-- ============================================================
-- 1. USUARIOS
-- ============================================================

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_username UNIQUE (username)
) ENGINE = InnoDB;

-- ============================================================
-- 2. CONTENIDO GENERAL
-- Peliculas y series comparten los atributos generales.
-- ============================================================

CREATE TABLE content (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    release_year SMALLINT UNSIGNED NULL,
    type ENUM('MOVIE', 'SERIES') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_content_title (title),
    INDEX idx_content_type (type),
    INDEX idx_content_release_year (release_year)
) ENGINE = InnoDB;

-- ============================================================
-- 3. DATOS ESPECIFICOS DE PELICULAS
-- content_id es PK y FK: una pelicula tiene un unico contenido base.
-- ============================================================

CREATE TABLE movies (
    content_id INT UNSIGNED PRIMARY KEY,
    duration_minutes SMALLINT UNSIGNED NOT NULL,

    CONSTRAINT fk_movies_content
        FOREIGN KEY (content_id)
        REFERENCES content(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_movies_duration
        CHECK (duration_minutes > 0)
) ENGINE = InnoDB;

-- ============================================================
-- 4. DATOS ESPECIFICOS DE SERIES
-- ============================================================

CREATE TABLE series (
    content_id INT UNSIGNED PRIMARY KEY,
    end_year SMALLINT UNSIGNED NULL,
    status ENUM('ONGOING', 'COMPLETED', 'CANCELLED')
        NOT NULL DEFAULT 'ONGOING',

    CONSTRAINT fk_series_content
        FOREIGN KEY (content_id)
        REFERENCES content(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_series_end_year
        CHECK (end_year IS NULL OR end_year >= 1900)
) ENGINE = InnoDB;

-- ============================================================
-- 5. GENEROS
-- ============================================================

CREATE TABLE genres (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,

    CONSTRAINT uq_genres_name UNIQUE (name)
) ENGINE = InnoDB;

-- ============================================================
-- 6. RELACION CONTENIDO - GENEROS (N:M)
-- Una produccion puede tener varios generos.
-- Un genero puede clasificar muchas producciones.
-- ============================================================

CREATE TABLE content_genres (
    content_id INT UNSIGNED NOT NULL,
    genre_id INT UNSIGNED NOT NULL,

    PRIMARY KEY (content_id, genre_id),

    CONSTRAINT fk_content_genres_content
        FOREIGN KEY (content_id)
        REFERENCES content(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_content_genres_genre
        FOREIGN KEY (genre_id)
        REFERENCES genres(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_content_genres_genre (genre_id)
) ENGINE = InnoDB;

-- ============================================================
-- 7. ACTORES
-- ============================================================

CREATE TABLE actors (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    INDEX idx_actors_name (last_name, first_name)
) ENGINE = InnoDB;

-- ============================================================
-- 8. RELACION CONTENIDO - ACTORES (N:M)
-- character_name permite guardar el personaje interpretado.
-- ============================================================

CREATE TABLE content_actors (
    content_id INT UNSIGNED NOT NULL,
    actor_id INT UNSIGNED NOT NULL,
    character_name VARCHAR(150) NULL,
    credit_order SMALLINT UNSIGNED NULL,

    PRIMARY KEY (content_id, actor_id),

    CONSTRAINT fk_content_actors_content
        FOREIGN KEY (content_id)
        REFERENCES content(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_content_actors_actor
        FOREIGN KEY (actor_id)
        REFERENCES actors(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_content_actors_actor (actor_id)
) ENGINE = InnoDB;

-- ============================================================
-- 9. TEMPORADAS
-- Una serie puede tener muchas temporadas.
-- ============================================================

CREATE TABLE seasons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    series_id INT UNSIGNED NOT NULL,
    season_number SMALLINT UNSIGNED NOT NULL,
    release_year SMALLINT UNSIGNED NULL,
    episode_count SMALLINT UNSIGNED NULL,

    CONSTRAINT uq_season_number UNIQUE (series_id, season_number),

    CONSTRAINT fk_seasons_series
        FOREIGN KEY (series_id)
        REFERENCES series(content_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_season_number
        CHECK (season_number > 0),

    INDEX idx_seasons_series (series_id)
) ENGINE = InnoDB;

-- ============================================================
-- 10. ESTADO DEL CONTENIDO POR USUARIO
-- WATCHED  = visto
-- WATCHLIST = pendiente / recomendado para ver
--
-- UNIQUE(user_id, content_id) garantiza un unico estado actual
-- por contenido y usuario. Para pasar de pendiente a visto,
-- se actualiza el mismo registro.
-- ============================================================

CREATE TABLE user_content (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    content_id INT UNSIGNED NOT NULL,
    status ENUM('WATCHED', 'WATCHLIST') NOT NULL,
    watched_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_content UNIQUE (user_id, content_id),

    CONSTRAINT fk_user_content_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_user_content_content
        FOREIGN KEY (content_id)
        REFERENCES content(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_user_content_watched_at
        CHECK (
            (status = 'WATCHED' AND watched_at IS NOT NULL)
            OR
            (status = 'WATCHLIST' AND watched_at IS NULL)
        ),

    INDEX idx_user_content_user_status (user_id, status),
    INDEX idx_user_content_content (content_id)
) ENGINE = InnoDB;

-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================

INSERT INTO users (username, name, password) VALUES
(
    'dev_demo',
    'Usuario Demo',
    '$2b$12$REEMPLAZAR_POR_UN_HASH_BCRYPT_REAL'
),
(
    'ana_demo',
    'Ana Demo',
    '$2b$12$REEMPLAZAR_POR_UN_HASH_BCRYPT_REAL'
);

INSERT INTO genres (name) VALUES
('Drama'),
('Accion'),
('Ciencia ficcion'),
('Suspenso'),
('Comedia'),
('Terror'),
('Aventura'),
('Romance'),
('Fantasia'),
('Crimen');

INSERT INTO content (title, description, release_year, type) VALUES
(
    'Breaking Bad',
    'Un profesor de quimica comienza a fabricar metanfetamina.',
    2008,
    'SERIES'
),
(
    'Interstellar',
    'Un grupo de astronautas busca un nuevo hogar para la humanidad.',
    2014,
    'MOVIE'
),
(
    'The Dark Knight',
    'Batman se enfrenta al Joker en Gotham.',
    2008,
    'MOVIE'
),
(
    'Dark',
    'La desaparicion de un nino revela secretos entre varias familias.',
    2017,
    'SERIES'
),
(
    'The Matrix',
    'Un programador descubre que la realidad que conoce es una simulacion.',
    1999,
    'MOVIE'
),
(
    'The Office',
    'Comedia sobre la vida cotidiana de los empleados de una oficina.',
    2005,
    'SERIES'
);

-- Los IDs de content corresponden al orden de insercion anterior.
INSERT INTO movies (content_id, duration_minutes) VALUES
(2, 169),
(3, 152),
(5, 136);

INSERT INTO series (content_id, end_year, status) VALUES
(1, 2013, 'COMPLETED'),
(4, 2020, 'COMPLETED'),
(6, 2013, 'COMPLETED');

INSERT INTO content_genres (content_id, genre_id) VALUES
-- Breaking Bad: Drama, Crimen, Suspenso
(1, 1), (1, 10), (1, 4),
-- Interstellar: Drama, Ciencia ficcion, Aventura
(2, 1), (2, 3), (2, 7),
-- The Dark Knight: Drama, Accion, Crimen
(3, 1), (3, 2), (3, 10),
-- Dark: Drama, Ciencia ficcion, Suspenso
(4, 1), (4, 3), (4, 4),
-- The Matrix: Accion, Ciencia ficcion
(5, 2), (5, 3),
-- The Office: Comedia
(6, 5);

INSERT INTO actors (first_name, last_name) VALUES
('Bryan', 'Cranston'),
('Aaron', 'Paul'),
('Matthew', 'McConaughey'),
('Anne', 'Hathaway'),
('Christian', 'Bale'),
('Heath', 'Ledger'),
('Keanu', 'Reeves'),
('Laurence', 'Fishburne'),
('Rami', 'Malek'),
('Steve', 'Carell');

INSERT INTO content_actors
    (content_id, actor_id, character_name, credit_order)
VALUES
-- Breaking Bad
(1, 1, 'Walter White', 1),
(1, 2, 'Jesse Pinkman', 2),
-- Interstellar
(2, 3, 'Cooper', 1),
(2, 4, 'Brand', 2),
-- The Dark Knight
(3, 5, 'Bruce Wayne / Batman', 1),
(3, 6, 'Joker', 2),
-- The Matrix
(5, 7, 'Neo', 1),
(5, 8, 'Morpheus', 2),
-- Dark
(4, 9, 'Elliot Alderson', 1),
-- The Office
(6, 10, 'Michael Scott', 1);

INSERT INTO seasons
    (series_id, season_number, release_year, episode_count)
VALUES
(1, 1, 2008, 7),
(1, 2, 2009, 13),
(1, 3, 2010, 13),
(1, 4, 2011, 13),
(1, 5, 2012, 16),
(4, 1, 2017, 10),
(4, 2, 2019, 8),
(4, 3, 2020, 8),
(6, 1, 2005, 6),
(6, 2, 2005, 22);

-- Usuario 1: vio Interstellar y Breaking Bad.
-- Tiene The Dark Knight y Dark en su lista pendiente.
INSERT INTO user_content
    (user_id, content_id, status, watched_at)
VALUES
(1, 2, 'WATCHED', '2026-10-10 21:30:00'),
(1, 1, 'WATCHED', '2026-10-12 20:00:00'),
(1, 3, 'WATCHLIST', NULL),
(1, 4, 'WATCHLIST', NULL);

-- Usuario 2: tiene The Matrix pendiente y vio The Office.
INSERT INTO user_content
    (user_id, content_id, status, watched_at)
VALUES
(2, 5, 'WATCHLIST', NULL),
(2, 6, 'WATCHED', '2026-10-15 19:00:00');

-- ============================================================
-- CONSULTAS DE EJEMPLO
-- Ejecutar individualmente segun la necesidad de la aplicacion.
-- ============================================================

-- 1. Listar todo el catalogo.
SELECT
    id,
    title,
    release_year,
    type
FROM content
ORDER BY title;

-- 2. Buscar por nombre (peliculas y series).
SELECT
    id,
    title,
    release_year,
    type
FROM content
WHERE title LIKE '%dark%'
ORDER BY title;

-- 3. Filtrar por genero.
SELECT DISTINCT
    c.id,
    c.title,
    c.release_year,
    c.type
FROM content c
INNER JOIN content_genres cg
    ON cg.content_id = c.id
INNER JOIN genres g
    ON g.id = cg.genre_id
WHERE g.name = 'Ciencia ficcion'
ORDER BY c.title;

-- 4. Buscar todas las producciones en las que trabajo un actor.
SELECT
    c.id,
    c.title,
    c.release_year,
    c.type,
    ca.character_name
FROM content c
INNER JOIN content_actors ca
    ON ca.content_id = c.id
INNER JOIN actors a
    ON a.id = ca.actor_id
WHERE a.first_name = 'Bryan'
  AND a.last_name = 'Cranston'
ORDER BY c.release_year;

-- 5. Listar peliculas y series vistas por un usuario.
SELECT
    c.id,
    c.title,
    c.release_year,
    c.type,
    uc.watched_at
FROM user_content uc
INNER JOIN content c
    ON c.id = uc.content_id
WHERE uc.user_id = 1
  AND uc.status = 'WATCHED'
ORDER BY uc.watched_at DESC;

-- 6. Listar peliculas y series pendientes de un usuario.
SELECT
    c.id,
    c.title,
    c.release_year,
    c.type
FROM user_content uc
INNER JOIN content c
    ON c.id = uc.content_id
WHERE uc.user_id = 1
  AND uc.status = 'WATCHLIST'
ORDER BY c.title;

-- 7. Buscar por nombre y genero simultaneamente.
SELECT DISTINCT
    c.id,
    c.title,
    c.release_year,
    c.type
FROM content c
INNER JOIN content_genres cg
    ON cg.content_id = c.id
INNER JOIN genres g
    ON g.id = cg.genre_id
WHERE c.title LIKE '%dark%'
  AND g.name = 'Drama'
ORDER BY c.title;

-- 8. Consultar el reparto de una produccion.
SELECT
    c.title,
    CONCAT(a.first_name, ' ', a.last_name) AS actor,
    ca.character_name,
    ca.credit_order
FROM content c
INNER JOIN content_actors ca
    ON ca.content_id = c.id
INNER JOIN actors a
    ON a.id = ca.actor_id
WHERE c.id = 1
ORDER BY ca.credit_order;

-- 9. Consultar las temporadas de una serie.
SELECT
    c.title AS series_title,
    s.season_number,
    s.release_year,
    s.episode_count
FROM seasons s
INNER JOIN series sr
    ON sr.content_id = s.series_id
INNER JOIN content c
    ON c.id = sr.content_id
WHERE sr.content_id = 1
ORDER BY s.season_number;

-- 10. Pasar un contenido de pendiente a visto.
-- El usuario 1 marca The Dark Knight (content_id = 3) como visto.
UPDATE user_content
SET
    status = 'WATCHED',
    watched_at = CURRENT_TIMESTAMP
WHERE user_id = 1
  AND content_id = 3
  AND status = 'WATCHLIST';

-- 11. Agregar una produccion a la lista pendiente.
-- Si ya existe una relacion para ese usuario y contenido,
-- se debe actualizar el estado en lugar de insertar otra fila.
INSERT INTO user_content (user_id, content_id, status, watched_at)
VALUES (1, 5, 'WATCHLIST', NULL)
ON DUPLICATE KEY UPDATE
    status = 'WATCHLIST',
    watched_at = NULL;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
