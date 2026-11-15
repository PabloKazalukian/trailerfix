export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'El username ya esta en uso' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: err.errors.map((validationError) => validationError.message),
    });
  }

  if (err.type === 'entity.parse.failed') {
    console.error(`JSON invalido en ${req.method} ${req.originalUrl}`);
    return res.status(400).json({ error: 'JSON invalido en el body' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Body demasiado grande' });
  }

  console.error(`${req.method} ${req.originalUrl}`, err);

  return res.status(500).json({ error: 'Error interno del servidor' });
}
