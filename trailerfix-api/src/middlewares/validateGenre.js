function validateName(req, res, next, { required }) {
  const body = req.body ?? {};

  if (!required && !Object.hasOwn(body, 'name')) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: ['Debe enviar el campo name'],
    });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (name.length < 1 || name.length > 50) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: ['name debe tener entre 1 y 50 caracteres'],
    });
  }

  req.body = { name };
  return next();
}

export function validateGenreCreate(req, res, next) {
  return validateName(req, res, next, { required: true });
}

export function validateGenreUpdate(req, res, next) {
  return validateName(req, res, next, { required: false });
}
