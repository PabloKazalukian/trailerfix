function validateActor(req, res, next, { partial }) {
  const body = req.body ?? {};
  const errors = [];
  const data = {};

  const fields = ['firstName', 'lastName'];

  for (const field of fields) {
    if (partial && !Object.hasOwn(body, field)) {
      continue;
    }

    const value = typeof body[field] === 'string' ? body[field].trim() : '';

    if (value.length < 1 || value.length > 100) {
      errors.push(`${field} es obligatorio y debe tener entre 1 y 100 caracteres`);
    } else {
      data[field] = value;
    }
  }

  if (partial && Object.keys(data).length === 0 && errors.length === 0) {
    errors.push('Debe enviar firstName o lastName');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  req.body = data;
  return next();
}

export function validateActorCreate(req, res, next) {
  return validateActor(req, res, next, { partial: false });
}

export function validateActorUpdate(req, res, next) {
  return validateActor(req, res, next, { partial: true });
}
