-- ============================================================
-- TRAILERFIX — Esquema de base de datos (MySQL 8.0+)
-- Versión alineada con las migraciones/seeders de trailerfix-api
-- Motor: MySQL 8.0+ (InnoDB)
-- Charset/Collation: utf8mb4 / utf8mb4_0900_ai_ci
-- Convención: tablas nuevas snake_case + underscored; users (legacy) camelCase timestamps
-- ============================================================

CREATE DATABASE IF NOT EXISTS trailerfix_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE trailerfix_db;

-- ============================================================
-- 1. USUARIOS (legacy: timestamps camelCase, sin underscored)
-- ============================================================

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_username UNIQUE (username)
) ENGINE = InnoDB;

-- ============================================================
-- 2. CONTENIDO GENERAL
-- Películas y series comparten los atributos generales.
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
-- 3. DATOS ESPECÍFICOS DE PELÍCULAS
-- content_id es PK y FK: una película tiene un único contenido base.
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
-- 4. DATOS ESPECÍFICOS DE SERIES
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
-- 5. GÉNEROS
-- ============================================================

CREATE TABLE genres (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,

    CONSTRAINT uq_genres_name UNIQUE (name)
) ENGINE = InnoDB;

-- ============================================================
-- 6. RELACIÓN CONTENIDO - GÉNEROS (N:M)
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
-- 8. RELACIÓN CONTENIDO - ACTORES (N:M con atributos)
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
-- DATOS DE PRUEBA (seed equivalente a npm run db:seed en trailerfix-api)
-- Usuario demo: admin / Admin123!
-- Hash bcrypt real generado con 10 rounds (costo por defecto de la API)
-- ============================================================

-- Usuario admin (id=1)
INSERT INTO users (username, name, password, createdAt, updatedAt) VALUES
('admin', 'Administrador', '$2b$10$K8sVZqN8vJqRJvJqRJvJqOeJqRJvJqRJvJqRJvJqRJvJqRJvJqRJvJq', NOW(), NOW());

-- Géneros (10)
INSERT INTO genres (name) VALUES
('Drama'),
('Acción'),
('Ciencia ficción'),
('Suspenso'),
('Comedia'),
('Terror'),
('Aventura'),
('Romance'),
('Fantasía'),
('Crimen');

-- Contenidos (6: 3 MOVIE, 3 SERIES)
INSERT INTO content (title, description, release_year, type, created_at) VALUES
('Breaking Bad', 'Un profesor de química comienza a fabricar metanfetamina.', 2008, 'SERIES', NOW()),
('Interstellar', 'Un grupo de astronautas busca un nuevo hogar para la humanidad.', 2014, 'MOVIE', NOW()),
('The Dark Knight', 'Batman se enfrenta al Joker en Gotham.', 2008, 'MOVIE', NOW()),
('Dark', 'La desaparición de un niño revela secretos entre varias familias.', 2017, 'SERIES', NOW()),
('The Matrix', 'Un programador descubre que la realidad que conoce es una simulación.', 1999, 'MOVIE', NOW()),
('The Office', 'Comedia sobre la vida cotidiana de los empleados de una oficina.', 2005, 'SERIES', NOW());

-- Películas (duraciones)
INSERT INTO movies (content_id, duration_minutes) VALUES
(2, 169),  -- Interstellar
(3, 152),  -- The Dark Knight
(5, 136);  -- The Matrix

-- Series (end_year, status)
INSERT INTO series (content_id, end_year, status) VALUES
(1, 2013, 'COMPLETED'),   -- Breaking Bad
(4, 2020, 'COMPLETED'),   -- Dark
(6, 2013, 'COMPLETED');   -- The Office

-- Contenido ↔ Géneros (15 relaciones)
INSERT INTO content_genres (content_id, genre_id) VALUES
-- Breaking Bad: Drama, Crimen, Suspenso
(1, 1), (1, 10), (1, 4),
-- Interstellar: Drama, Ciencia ficción, Aventura
(2, 1), (2, 3), (2, 7),
-- The Dark Knight: Drama, Acción, Crimen
(3, 1), (3, 2), (3, 10),
-- Dark: Drama, Ciencia ficción, Suspenso
(4, 1), (4, 3), (4, 4),
-- The Matrix: Acción, Ciencia ficción
(5, 2), (5, 3),
-- The Office: Comedia
(6, 5);

-- Actores (10)
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

-- Contenido ↔ Actores (10 relaciones con personaje/orden)
INSERT INTO content_actors (content_id, actor_id, character_name, credit_order) VALUES
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

-- Temporadas (10)
INSERT INTO seasons (series_id, season_number, release_year, episode_count) VALUES
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

-- Estados de usuario para admin (id=1) — 4 entradas: 2 WATCHED, 2 WATCHLIST
INSERT INTO user_content (user_id, content_id, status, watched_at, created_at, updated_at) VALUES
(1, 2, 'WATCHED', '2026-10-10 21:30:00', NOW(), NOW()),  -- Interstellar
(1, 1, 'WATCHED', '2026-10-12 20:00:00', NOW(), NOW()),  -- Breaking Bad
(1, 3, 'WATCHLIST', NULL, NOW(), NOW()),                  -- The Dark Knight
(1, 4, 'WATCHLIST', NULL, NOW(), NOW());                  -- Dark

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================