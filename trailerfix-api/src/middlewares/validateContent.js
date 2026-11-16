const TYPES = ['MOVIE', 'SERIES'];
const STATUSES = ['ONGOING', 'COMPLETED', 'CANCELLED'];
const MIN_YEAR = 1888;
const MAX_YEAR = 2100;
const MAX_SMALLINT = 65535;

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
