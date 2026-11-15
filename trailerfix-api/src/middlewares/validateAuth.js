const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateRegister(req, res, next) {
  const username = cleanString(req.body?.username);
  const name = cleanString(req.body?.name);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const errors = [];

  if (username.length < 3 || username.length > 50) {
    errors.push('username es obligatorio y debe tener entre 3 y 50 caracteres');
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.push(
      'username solo puede contener letras, numeros, puntos, guiones y guiones bajos',
    );
  }

  if (name.length < 2 || name.length > 100) {
    errors.push('name es obligatorio y debe tener entre 2 y 100 caracteres');
  }

  if (password.length < 8 || password.length > 72) {
    errors.push('password es obligatorio y debe tener entre 8 y 72 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  req.body = { username, name, password };
  return next();
}

export function validateLogin(req, res, next) {
  const username = cleanString(req.body?.username);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: ['username y password son obligatorios'],
    });
  }

  req.body = { username, password };
  return next();
}
