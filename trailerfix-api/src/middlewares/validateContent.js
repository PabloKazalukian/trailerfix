const TYPES = ['MOVIE', 'SERIES'];
const STATUSES = ['ONGOING', 'COMPLETED', 'CANCELLED'];
const MIN_YEAR = 1888;
const MAX_YEAR = 2100;
const MAX_SMALLINT = 65535;
const MAX_INT = 4294967295;
const MAX_BIGINT = 9007199254740991;

function isValidYouTubeUrl(url) {
  if (!url) return true; // Optional field
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(url);
}

function isValidImdbId(id) {
  if (!id) return true; // Optional field
  return /^tt\d{7,8}$/.test(id);
}

function isValidLanguageCode(code) {
  if (!code) return true; // Optional field
  return /^[a-z]{2,3}(-[A-Z]{2})?$/.test(code);
}

function isValidUrl(url) {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function parseBigInt(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0 && value <= MAX_BIGINT ? value : Number.NaN;
  }
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const num = Number(value.trim());
    return num >= 0 && num <= MAX_BIGINT ? num : Number.NaN;
  }
  return Number.NaN;
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseInteger(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : Number.NaN;
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }

  return Number.NaN;
}

export function validateContentCreate(req, res, next) {
  const body = req.body ?? {};
  const errors = [];
  const data = {};

  const title = cleanString(body.title);
  if (title.length < 1 || title.length > 255) {
    errors.push('title es obligatorio y debe tener entre 1 y 255 caracteres');
  }
  data.title = title;

  if (body.description === undefined || body.description === null) {
    data.description = null;
  } else if (typeof body.description === 'string') {
    data.description = body.description.trim() || null;
  } else {
    errors.push('description debe ser texto o null');
  }

  if (
    body.releaseYear === undefined ||
    body.releaseYear === null ||
    body.releaseYear === ''
  ) {
    data.releaseYear = null;
  } else {
    const releaseYear = parseInteger(body.releaseYear);

    if (
      !Number.isInteger(releaseYear) ||
      releaseYear < MIN_YEAR ||
      releaseYear > MAX_YEAR
    ) {
      errors.push(`releaseYear debe ser un año entre ${MIN_YEAR} y ${MAX_YEAR}`);
    } else {
      data.releaseYear = releaseYear;
    }
  }

  const type = cleanString(body.type).toUpperCase();
  if (!TYPES.includes(type)) {
    errors.push('type es obligatorio y debe ser MOVIE o SERIES');
  }
  data.type = type;

  // Extended fields (optional, apply to both MOVIE and SERIES)
  if (body.trailerUrl !== undefined) {
    if (body.trailerUrl === null || body.trailerUrl === '') {
      data.trailerUrl = null;
    } else if (typeof body.trailerUrl === 'string' && isValidYouTubeUrl(body.trailerUrl)) {
      data.trailerUrl = body.trailerUrl.trim();
    } else {
      errors.push('trailerUrl debe ser una URL válida de YouTube (ej. https://youtu.be/VIDEO_ID o https://www.youtube.com/watch?v=VIDEO_ID)');
    }
  }

  if (body.posterUrl !== undefined) {
    if (body.posterUrl === null || body.posterUrl === '') {
      data.posterUrl = null;
    } else if (typeof body.posterUrl === 'string' && isValidUrl(body.posterUrl)) {
      data.posterUrl = body.posterUrl.trim();
    } else {
      errors.push('posterUrl debe ser una URL válida');
    }
  }

  if (body.backdropUrl !== undefined) {
    if (body.backdropUrl === null || body.backdropUrl === '') {
      data.backdropUrl = null;
    } else if (typeof body.backdropUrl === 'string' && isValidUrl(body.backdropUrl)) {
      data.backdropUrl = body.backdropUrl.trim();
    } else {
      errors.push('backdropUrl debe ser una URL válida');
    }
  }

  if (body.rating !== undefined) {
    if (body.rating === null || body.rating === '') {
      data.rating = null;
    } else {
      const rating = Number(body.rating);
      if (!Number.isFinite(rating) || rating < 0 || rating > 10) {
        errors.push('rating debe ser un número entre 0 y 10');
      } else {
        data.rating = Math.round(rating * 10) / 10; // Round to 1 decimal
      }
    }
  }

  if (body.voteCount !== undefined) {
    if (body.voteCount === null || body.voteCount === '') {
      data.voteCount = null;
    } else {
      const voteCount = parseInteger(body.voteCount);
      if (!Number.isInteger(voteCount) || voteCount < 0 || voteCount > MAX_INT) {
        errors.push('voteCount debe ser un entero positivo');
      } else {
        data.voteCount = voteCount;
      }
    }
  }

  if (body.imdbId !== undefined) {
    if (body.imdbId === null || body.imdbId === '') {
      data.imdbId = null;
    } else if (typeof body.imdbId === 'string' && isValidImdbId(body.imdbId.trim())) {
      data.imdbId = body.imdbId.trim().toLowerCase();
    } else {
      errors.push('imdbId debe tener formato ttXXXXXXX (ej. tt0111161)');
    }
  }

  if (body.tmdbId !== undefined) {
    if (body.tmdbId === null || body.tmdbId === '') {
      data.tmdbId = null;
    } else {
      const tmdbId = parseInteger(body.tmdbId);
      if (!Number.isInteger(tmdbId) || tmdbId < 1 || tmdbId > MAX_INT) {
        errors.push('tmdbId debe ser un entero positivo');
      } else {
        data.tmdbId = tmdbId;
      }
    }
  }

  if (body.originalLanguage !== undefined) {
    if (body.originalLanguage === null || body.originalLanguage === '') {
      data.originalLanguage = null;
    } else if (typeof body.originalLanguage === 'string' && isValidLanguageCode(body.originalLanguage.trim())) {
      data.originalLanguage = body.originalLanguage.trim().toLowerCase();
    } else {
      errors.push('originalLanguage debe ser un código ISO 639-1 válido (ej. en, es, fr)');
    }
  }

  if (body.originCountry !== undefined) {
    if (body.originCountry === null || body.originCountry === '') {
      data.originCountry = null;
    } else if (Array.isArray(body.originCountry) && body.originCountry.every(c => typeof c === 'string' && /^[A-Z]{2}$/.test(c))) {
      data.originCountry = body.originCountry;
    } else {
      errors.push('originCountry debe ser un array de códigos ISO 3166-1 alpha-2 (ej. ["US", "GB"])');
    }
  }

  if (type === 'MOVIE') {
    const durationMinutes = parseInteger(body.durationMinutes);

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > MAX_SMALLINT
    ) {
      errors.push(
        'durationMinutes es obligatorio para MOVIE y debe ser un entero entre 1 y 65535',
      );
    } else {
      data.durationMinutes = durationMinutes;
    }

    if (body.endYear !== undefined || body.status !== undefined) {
      errors.push('endYear y status solo aplican a SERIES');
    }

    // Movie-specific extended fields
    if (body.budget !== undefined) {
      if (body.budget === null || body.budget === '') {
        data.budget = null;
      } else {
        const budget = parseBigInt(body.budget);
        if (isNaN(budget)) {
          errors.push('budget debe ser un entero positivo (presupuesto en USD)');
        } else {
          data.budget = budget;
        }
      }
    }

    if (body.revenue !== undefined) {
      if (body.revenue === null || body.revenue === '') {
        data.revenue = null;
      } else {
        const revenue = parseBigInt(body.revenue);
        if (isNaN(revenue)) {
          errors.push('revenue debe ser un entero positivo (recaudación en USD)');
        } else {
          data.revenue = revenue;
        }
      }
    }

    if (body.originalTitle !== undefined) {
      if (body.originalTitle === null || body.originalTitle === '') {
        data.originalTitle = null;
      } else if (typeof body.originalTitle === 'string' && body.originalTitle.trim().length <= 255) {
        data.originalTitle = body.originalTitle.trim();
      } else {
        errors.push('originalTitle debe ser texto de máximo 255 caracteres');
      }
    }

    if (body.runtimeMinutes !== undefined) {
      if (body.runtimeMinutes === null || body.runtimeMinutes === '') {
        data.runtimeMinutes = null;
      } else {
        const runtimeMinutes = parseInteger(body.runtimeMinutes);
        if (!Number.isInteger(runtimeMinutes) || runtimeMinutes < 1 || runtimeMinutes > MAX_SMALLINT) {
          errors.push('runtimeMinutes debe ser un entero entre 1 y 65535');
        } else {
          data.runtimeMinutes = runtimeMinutes;
        }
      }
    }
  }

  if (type === 'SERIES') {
    if (body.durationMinutes !== undefined) {
      errors.push('durationMinutes solo aplica a MOVIE');
    }

    if (
      body.endYear === undefined ||
      body.endYear === null ||
      body.endYear === ''
    ) {
      data.endYear = null;
    } else {
      const endYear = parseInteger(body.endYear);

      if (
        !Number.isInteger(endYear) ||
        endYear < 1900 ||
        endYear > MAX_SMALLINT
      ) {
        errors.push('endYear debe ser un año mayor o igual a 1900');
      } else {
        data.endYear = endYear;
      }
    }

    const status =
      body.status === undefined ? 'ONGOING' : cleanString(body.status).toUpperCase();

    if (!STATUSES.includes(status)) {
      errors.push(`status debe ser uno de: ${STATUSES.join(', ')}`);
    } else {
      data.status = status;
    }

    // Series-specific extended fields
    if (body.numberOfSeasons !== undefined) {
      if (body.numberOfSeasons === null || body.numberOfSeasons === '') {
        data.numberOfSeasons = null;
      } else {
        const numberOfSeasons = parseInteger(body.numberOfSeasons);
        if (!Number.isInteger(numberOfSeasons) || numberOfSeasons < 0 || numberOfSeasons > MAX_SMALLINT) {
          errors.push('numberOfSeasons debe ser un entero entre 0 y 65535');
        } else {
          data.numberOfSeasons = numberOfSeasons;
        }
      }
    }

    if (body.numberOfEpisodes !== undefined) {
      if (body.numberOfEpisodes === null || body.numberOfEpisodes === '') {
        data.numberOfEpisodes = null;
      } else {
        const numberOfEpisodes = parseInteger(body.numberOfEpisodes);
        if (!Number.isInteger(numberOfEpisodes) || numberOfEpisodes < 0 || numberOfEpisodes > MAX_INT) {
          errors.push('numberOfEpisodes debe ser un entero positivo');
        } else {
          data.numberOfEpisodes = numberOfEpisodes;
        }
      }
    }

    if (body.firstAirDate !== undefined) {
      if (body.firstAirDate === null || body.firstAirDate === '') {
        data.firstAirDate = null;
      } else if (typeof body.firstAirDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.firstAirDate)) {
        data.firstAirDate = body.firstAirDate;
      } else {
        errors.push('firstAirDate debe ser una fecha en formato YYYY-MM-DD');
      }
    }

    if (body.lastAirDate !== undefined) {
      if (body.lastAirDate === null || body.lastAirDate === '') {
        data.lastAirDate = null;
      } else if (typeof body.lastAirDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.lastAirDate)) {
        data.lastAirDate = body.lastAirDate;
      } else {
        errors.push('lastAirDate debe ser una fecha en formato YYYY-MM-DD');
      }
    }

    if (body.networks !== undefined) {
      if (body.networks === null || body.networks === '') {
        data.networks = null;
      } else if (Array.isArray(body.networks) && body.networks.every(n => typeof n === 'string')) {
        data.networks = body.networks;
      } else {
        errors.push('networks debe ser un array de strings (nombres de cadenas/emisoras)');
      }
    }

    if (body.inProduction !== undefined) {
      if (body.inProduction === null) {
        data.inProduction = null;
      } else if (typeof body.inProduction === 'boolean') {
        data.inProduction = body.inProduction;
      } else {
        errors.push('inProduction debe ser boolean (true/false)');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  req.body = data;
  return next();
}

export function validateContentUpdate(req, res, next) {
  const body = req.body ?? {};
  const errors = [];
  const data = {};
  let hasField = false;

  if (Object.hasOwn(body, 'title')) {
    hasField = true;
    const title = cleanString(body.title);

    if (title.length < 1 || title.length > 255) {
      errors.push('title debe tener entre 1 y 255 caracteres');
    } else {
      data.title = title;
    }
  }

  if (Object.hasOwn(body, 'description')) {
    hasField = true;

    if (body.description === null) {
      data.description = null;
    } else if (typeof body.description === 'string') {
      data.description = body.description.trim() || null;
    } else {
      errors.push('description debe ser texto o null');
    }
  }

  if (Object.hasOwn(body, 'releaseYear')) {
    hasField = true;

    if (body.releaseYear === null) {
      data.releaseYear = null;
    } else {
      const releaseYear = parseInteger(body.releaseYear);

      if (
        !Number.isInteger(releaseYear) ||
        releaseYear < MIN_YEAR ||
        releaseYear > MAX_YEAR
      ) {
        errors.push(
          `releaseYear debe ser un año entre ${MIN_YEAR} y ${MAX_YEAR}`,
        );
      } else {
        data.releaseYear = releaseYear;
      }
    }
  }

  if (Object.hasOwn(body, 'type')) {
    hasField = true;
    const type = cleanString(body.type).toUpperCase();

    if (!TYPES.includes(type)) {
      errors.push('type debe ser MOVIE o SERIES');
    } else {
      data.type = type;
    }
  }

  // Extended fields (optional, apply to both MOVIE and SERIES)
  if (Object.hasOwn(body, 'trailerUrl')) {
    hasField = true;
    if (body.trailerUrl === null || body.trailerUrl === '') {
      data.trailerUrl = null;
    } else if (typeof body.trailerUrl === 'string' && isValidYouTubeUrl(body.trailerUrl)) {
      data.trailerUrl = body.trailerUrl.trim();
    } else {
      errors.push('trailerUrl debe ser una URL válida de YouTube');
    }
  }

  if (Object.hasOwn(body, 'posterUrl')) {
    hasField = true;
    if (body.posterUrl === null || body.posterUrl === '') {
      data.posterUrl = null;
    } else if (typeof body.posterUrl === 'string' && isValidUrl(body.posterUrl)) {
      data.posterUrl = body.posterUrl.trim();
    } else {
      errors.push('posterUrl debe ser una URL válida');
    }
  }

  if (Object.hasOwn(body, 'backdropUrl')) {
    hasField = true;
    if (body.backdropUrl === null || body.backdropUrl === '') {
      data.backdropUrl = null;
    } else if (typeof body.backdropUrl === 'string' && isValidUrl(body.backdropUrl)) {
      data.backdropUrl = body.backdropUrl.trim();
    } else {
      errors.push('backdropUrl debe ser una URL válida');
    }
  }

  if (Object.hasOwn(body, 'rating')) {
    hasField = true;
    if (body.rating === null || body.rating === '') {
      data.rating = null;
    } else {
      const rating = Number(body.rating);
      if (!Number.isFinite(rating) || rating < 0 || rating > 10) {
        errors.push('rating debe ser un número entre 0 y 10');
      } else {
        data.rating = Math.round(rating * 10) / 10;
      }
    }
  }

  if (Object.hasOwn(body, 'voteCount')) {
    hasField = true;
    if (body.voteCount === null || body.voteCount === '') {
      data.voteCount = null;
    } else {
      const voteCount = parseInteger(body.voteCount);
      if (!Number.isInteger(voteCount) || voteCount < 0 || voteCount > MAX_INT) {
        errors.push('voteCount debe ser un entero positivo');
      } else {
        data.voteCount = voteCount;
      }
    }
  }

  if (Object.hasOwn(body, 'imdbId')) {
    hasField = true;
    if (body.imdbId === null || body.imdbId === '') {
      data.imdbId = null;
    } else if (typeof body.imdbId === 'string' && isValidImdbId(body.imdbId.trim())) {
      data.imdbId = body.imdbId.trim().toLowerCase();
    } else {
      errors.push('imdbId debe tener formato ttXXXXXXX (ej. tt0111161)');
    }
  }

  if (Object.hasOwn(body, 'tmdbId')) {
    hasField = true;
    if (body.tmdbId === null || body.tmdbId === '') {
      data.tmdbId = null;
    } else {
      const tmdbId = parseInteger(body.tmdbId);
      if (!Number.isInteger(tmdbId) || tmdbId < 1 || tmdbId > MAX_INT) {
        errors.push('tmdbId debe ser un entero positivo');
      } else {
        data.tmdbId = tmdbId;
      }
    }
  }

  if (Object.hasOwn(body, 'originalLanguage')) {
    hasField = true;
    if (body.originalLanguage === null || body.originalLanguage === '') {
      data.originalLanguage = null;
    } else if (typeof body.originalLanguage === 'string' && isValidLanguageCode(body.originalLanguage.trim())) {
      data.originalLanguage = body.originalLanguage.trim().toLowerCase();
    } else {
      errors.push('originalLanguage debe ser un código ISO 639-1 válido (ej. en, es, fr)');
    }
  }

  if (Object.hasOwn(body, 'originCountry')) {
    hasField = true;
    if (body.originCountry === null || body.originCountry === '') {
      data.originCountry = null;
    } else if (Array.isArray(body.originCountry) && body.originCountry.every(c => typeof c === 'string' && /^[A-Z]{2}$/.test(c))) {
      data.originCountry = body.originCountry;
    } else {
      errors.push('originCountry debe ser un array de códigos ISO 3166-1 alpha-2 (ej. ["US", "GB"])');
    }
  }

  if (Object.hasOwn(body, 'durationMinutes')) {
    hasField = true;
    const durationMinutes = parseInteger(body.durationMinutes);

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > MAX_SMALLINT
    ) {
      errors.push('durationMinutes debe ser un entero entre 1 y 65535');
    } else {
      data.durationMinutes = durationMinutes;
    }
  }

  if (Object.hasOwn(body, 'endYear')) {
    hasField = true;

    if (body.endYear === null) {
      data.endYear = null;
    } else {
      const endYear = parseInteger(body.endYear);

      if (
        !Number.isInteger(endYear) ||
        endYear < 1900 ||
        endYear > MAX_SMALLINT
      ) {
        errors.push('endYear debe ser un año mayor o igual a 1900');
      } else {
        data.endYear = endYear;
      }
    }
  }

  if (Object.hasOwn(body, 'status')) {
    hasField = true;
    const status = cleanString(body.status).toUpperCase();

    if (!STATUSES.includes(status)) {
      errors.push(`status debe ser uno de: ${STATUSES.join(', ')}`);
    } else {
      data.status = status;
    }
  }

  // Movie-specific extended fields
  if (Object.hasOwn(body, 'budget')) {
    hasField = true;
    if (body.budget === null || body.budget === '') {
      data.budget = null;
    } else {
      const budget = parseBigInt(body.budget);
      if (isNaN(budget)) {
        errors.push('budget debe ser un entero positivo (presupuesto en USD)');
      } else {
        data.budget = budget;
      }
    }
  }

  if (Object.hasOwn(body, 'revenue')) {
    hasField = true;
    if (body.revenue === null || body.revenue === '') {
      data.revenue = null;
    } else {
      const revenue = parseBigInt(body.revenue);
      if (isNaN(revenue)) {
        errors.push('revenue debe ser un entero positivo (recaudación en USD)');
      } else {
        data.revenue = revenue;
      }
    }
  }

  if (Object.hasOwn(body, 'originalTitle')) {
    hasField = true;
    if (body.originalTitle === null || body.originalTitle === '') {
      data.originalTitle = null;
    } else if (typeof body.originalTitle === 'string' && body.originalTitle.trim().length <= 255) {
      data.originalTitle = body.originalTitle.trim();
    } else {
      errors.push('originalTitle debe ser texto de máximo 255 caracteres');
    }
  }

  if (Object.hasOwn(body, 'runtimeMinutes')) {
    hasField = true;
    if (body.runtimeMinutes === null || body.runtimeMinutes === '') {
      data.runtimeMinutes = null;
    } else {
      const runtimeMinutes = parseInteger(body.runtimeMinutes);
      if (!Number.isInteger(runtimeMinutes) || runtimeMinutes < 1 || runtimeMinutes > MAX_SMALLINT) {
        errors.push('runtimeMinutes debe ser un entero entre 1 y 65535');
      } else {
        data.runtimeMinutes = runtimeMinutes;
      }
    }
  }

  // Series-specific extended fields
  if (Object.hasOwn(body, 'numberOfSeasons')) {
    hasField = true;
    if (body.numberOfSeasons === null || body.numberOfSeasons === '') {
      data.numberOfSeasons = null;
    } else {
      const numberOfSeasons = parseInteger(body.numberOfSeasons);
      if (!Number.isInteger(numberOfSeasons) || numberOfSeasons < 0 || numberOfSeasons > MAX_SMALLINT) {
        errors.push('numberOfSeasons debe ser un entero entre 0 y 65535');
      } else {
        data.numberOfSeasons = numberOfSeasons;
      }
    }
  }

  if (Object.hasOwn(body, 'numberOfEpisodes')) {
    hasField = true;
    if (body.numberOfEpisodes === null || body.numberOfEpisodes === '') {
      data.numberOfEpisodes = null;
    } else {
      const numberOfEpisodes = parseInteger(body.numberOfEpisodes);
      if (!Number.isInteger(numberOfEpisodes) || numberOfEpisodes < 0 || numberOfEpisodes > MAX_INT) {
        errors.push('numberOfEpisodes debe ser un entero positivo');
      } else {
        data.numberOfEpisodes = numberOfEpisodes;
      }
    }
  }

  if (Object.hasOwn(body, 'firstAirDate')) {
    hasField = true;
    if (body.firstAirDate === null || body.firstAirDate === '') {
      data.firstAirDate = null;
    } else if (typeof body.firstAirDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.firstAirDate)) {
      data.firstAirDate = body.firstAirDate;
    } else {
      errors.push('firstAirDate debe ser una fecha en formato YYYY-MM-DD');
    }
  }

  if (Object.hasOwn(body, 'lastAirDate')) {
    hasField = true;
    if (body.lastAirDate === null || body.lastAirDate === '') {
      data.lastAirDate = null;
    } else if (typeof body.lastAirDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.lastAirDate)) {
      data.lastAirDate = body.lastAirDate;
    } else {
      errors.push('lastAirDate debe ser una fecha en formato YYYY-MM-DD');
    }
  }

  if (Object.hasOwn(body, 'networks')) {
    hasField = true;
    if (body.networks === null || body.networks === '') {
      data.networks = null;
    } else if (Array.isArray(body.networks) && body.networks.every(n => typeof n === 'string')) {
      data.networks = body.networks;
    } else {
      errors.push('networks debe ser un array de strings (nombres de cadenas/emisoras)');
    }
  }

  if (Object.hasOwn(body, 'inProduction')) {
    hasField = true;
    if (body.inProduction === null) {
      data.inProduction = null;
    } else if (typeof body.inProduction === 'boolean') {
      data.inProduction = body.inProduction;
    } else {
      errors.push('inProduction debe ser boolean (true/false)');
    }
  }

  if (!hasField) {
    errors.push('Debe enviar al menos un campo para actualizar');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  req.body = data;
  return next();
}

export function validateContentGenresReplace(req, res, next) {
  const genreIds = req.body?.genreIds;
  const errors = [];

  if (!Array.isArray(genreIds)) {
    errors.push('genreIds debe ser un arreglo de ids');
  } else {
    const normalized = genreIds.map((genreId) => Number(genreId));

    if (
      normalized.some(
        (genreId) => !Number.isInteger(genreId) || genreId <= 0,
      )
    ) {
      errors.push('genreIds solo puede contener enteros positivos');
    }

    if (new Set(normalized).size !== normalized.length) {
      errors.push('genreIds no puede contener duplicados');
    }

    req.body = { genreIds: normalized };
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  return next();
}

function validateActorPayload(actor, index, errors) {
  const prefix = `actors[${index}]`;
  const data = {};

  const actorId = Number(actor?.actorId);
  if (!Number.isInteger(actorId) || actorId <= 0) {
    errors.push(`${prefix}.actorId debe ser un entero positivo`);
  } else {
    data.actorId = actorId;
  }

  if (actor?.characterName === undefined || actor?.characterName === null) {
    data.characterName = null;
  } else if (typeof actor.characterName === 'string') {
    const characterName = actor.characterName.trim();

    if (characterName.length > 150) {
      errors.push(`${prefix}.characterName debe tener hasta 150 caracteres`);
    } else {
      data.characterName = characterName || null;
    }
  } else {
    errors.push(`${prefix}.characterName debe ser texto o null`);
  }

  if (actor?.creditOrder === undefined || actor?.creditOrder === null) {
    data.creditOrder = null;
  } else {
    const creditOrder = Number(actor.creditOrder);

    if (
      !Number.isInteger(creditOrder) ||
      creditOrder < 1 ||
      creditOrder > MAX_SMALLINT
    ) {
      errors.push(
        `${prefix}.creditOrder debe ser un entero entre 1 y 65535`,
      );
    } else {
      data.creditOrder = creditOrder;
    }
  }

  return data;
}

export function validateContentActorsReplace(req, res, next) {
  const actors = req.body?.actors;
  const errors = [];

  if (!Array.isArray(actors)) {
    errors.push('actors debe ser un arreglo de actores');
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  const normalized = actors.map((actor, index) =>
    validateActorPayload(actor, index, errors),
  );

  const actorIds = normalized
    .map((actor) => actor.actorId)
    .filter((actorId) => actorId !== undefined);

  if (new Set(actorIds).size !== actorIds.length) {
    errors.push('actors no puede repetir actorId');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  req.body = { actors: normalized };
  return next();
}

export function validateContentActorCreate(req, res, next) {
  const errors = [];
  const data = validateActorPayload(req.body, 0, errors);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  req.body = data;
  return next();
}

export function validateContentActorUpdate(req, res, next) {
  const body = req.body ?? {};
  const errors = [];
  const data = {};
  let hasField = false;

  if (Object.hasOwn(body, 'characterName')) {
    hasField = true;

    if (body.characterName === null) {
      data.characterName = null;
    } else if (typeof body.characterName === 'string') {
      const characterName = body.characterName.trim();

      if (characterName.length > 150) {
        errors.push('characterName debe tener hasta 150 caracteres');
      } else {
        data.characterName = characterName || null;
      }
    } else {
      errors.push('characterName debe ser texto o null');
    }
  }

  if (Object.hasOwn(body, 'creditOrder')) {
    hasField = true;

    if (body.creditOrder === null) {
      data.creditOrder = null;
    } else {
      const creditOrder = Number(body.creditOrder);

      if (
        !Number.isInteger(creditOrder) ||
        creditOrder < 1 ||
        creditOrder > MAX_SMALLINT
      ) {
        errors.push('creditOrder debe ser un entero entre 1 y 65535');
      } else {
        data.creditOrder = creditOrder;
      }
    }
  }

  if (!hasField) {
    errors.push('Debe enviar characterName o creditOrder');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  req.body = data;
  return next();
}
