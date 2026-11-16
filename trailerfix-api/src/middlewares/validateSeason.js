const MIN_YEAR = 1888;
const MAX_YEAR = 2100;
const MAX_SMALLINT = 65535;

function parseInteger(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : Number.NaN;
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }

  return Number.NaN;
}

function parseNullableYear(value, errors, field) {
  if (value === null || value === '') {
    return null;
  }

  const year = parseInteger(value);

  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    errors.push(`${field} debe ser un año entre ${MIN_YEAR} y ${MAX_YEAR}`);
    return undefined;
  }

  return year;
}

function parseNullableEpisodeCount(value, errors) {
  if (value === null || value === '') {
    return null;
  }

  const episodeCount = parseInteger(value);

  if (
    !Number.isInteger(episodeCount) ||
    episodeCount < 1 ||
    episodeCount > MAX_SMALLINT
  ) {
    errors.push('episodeCount debe ser un entero entre 1 y 65535');
    return undefined;
  }

  return episodeCount;
}

export function validateSeasonCreate(req, res, next) {
  const body = req.body ?? {};
  const errors = [];
  const data = {};

  const seasonNumber = parseInteger(body.seasonNumber);

  if (
    !Number.isInteger(seasonNumber) ||
    seasonNumber < 1 ||
    seasonNumber > MAX_SMALLINT
  ) {
    errors.push('seasonNumber es obligatorio y debe ser un entero entre 1 y 65535');
  } else {
    data.seasonNumber = seasonNumber;
  }

  if (body.releaseYear === undefined) {
    data.releaseYear = null;
  } else {
    const releaseYear = parseNullableYear(
      body.releaseYear,
      errors,
      'releaseYear',
    );

    if (releaseYear !== undefined) {
      data.releaseYear = releaseYear;
    }
  }

  if (body.episodeCount === undefined) {
    data.episodeCount = null;
  } else {
    const episodeCount = parseNullableEpisodeCount(body.episodeCount, errors);

    if (episodeCount !== undefined) {
      data.episodeCount = episodeCount;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  req.body = data;
  return next();
}

export function validateSeasonUpdate(req, res, next) {
  const body = req.body ?? {};
  const errors = [];
  const data = {};
  let hasField = false;

  if (Object.hasOwn(body, 'seasonNumber')) {
    hasField = true;
    const seasonNumber = parseInteger(body.seasonNumber);

    if (
      !Number.isInteger(seasonNumber) ||
      seasonNumber < 1 ||
      seasonNumber > MAX_SMALLINT
    ) {
      errors.push('seasonNumber debe ser un entero entre 1 y 65535');
    } else {
      data.seasonNumber = seasonNumber;
    }
  }

  if (Object.hasOwn(body, 'releaseYear')) {
    hasField = true;
    const releaseYear = parseNullableYear(
      body.releaseYear,
      errors,
      'releaseYear',
    );

    if (releaseYear !== undefined) {
      data.releaseYear = releaseYear;
    }
  }

  if (Object.hasOwn(body, 'episodeCount')) {
    hasField = true;
    const episodeCount = parseNullableEpisodeCount(body.episodeCount, errors);

    if (episodeCount !== undefined) {
      data.episodeCount = episodeCount;
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
