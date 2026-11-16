export default function validateIdParams(...paramNames) {
  return (req, res, next) => {
    const errors = [];

    for (const name of paramNames) {
      const value = Number(req.params[name]);

      if (!Number.isInteger(value) || value <= 0) {
        errors.push(`${name} debe ser un entero positivo`);
      } else {
        req.params[name] = value;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Datos invalidos', details: errors });
    }

    return next();
  };
}
