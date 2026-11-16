export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = Object.keys(err.fields ?? {});
    const message = fields.includes('username')
      ? 'El username ya esta en uso'
      : 'Ya existe un registro con esos datos';

    return res.status(409).json({
      error: message,
      details: err.errors?.map((validationError) => validationError.message),
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      error: 'La referencia indicada no existe o esta en uso',
    });
  }

  if (
    err.name === 'SequelizeDatabaseError' &&
    (err.parent?.code === 'ER_CHECK_CONSTRAINT_VIOLATED' ||
      /check constraint/i.test(err.message))
  ) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: ['Una restriccion de la base de datos rechazo los datos enviados'],
    });
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
