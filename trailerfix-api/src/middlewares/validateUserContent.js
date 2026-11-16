const STATUSES = ['WATCHED', 'WATCHLIST'];

export function validateUserContentCreate(req, res, next) {
  const body = req.body ?? {};
  const errors = [];
  const data = {};

  const contentId = Number(body.contentId);

  if (!Number.isInteger(contentId) || contentId <= 0) {
    errors.push('contentId es obligatorio y debe ser un entero positivo');
  } else {
    data.contentId = contentId;
  }

  const status =
    body.status === undefined ? 'WATCHLIST' : String(body.status).trim().toUpperCase();

  if (!STATUSES.includes(status)) {
    errors.push(`status debe ser uno de: ${STATUSES.join(', ')}`);
  } else {
    data.status = status;
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  req.body = data;
  return next();
}

export function validateUserContentUpdate(req, res, next) {
  const body = req.body ?? {};
  const status = String(body.status ?? '').trim().toUpperCase();

  if (!STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: [`status es obligatorio y debe ser uno de: ${STATUSES.join(', ')}`],
    });
  }

  req.body = { status };
  return next();
}
