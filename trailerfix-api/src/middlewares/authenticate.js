import userRepository from '../repositories/user.repository.js';
import { verifyToken } from '../utils/jwt.js';

export default async function authenticate(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token de autenticacion requerido' });
  }

  try {
    const payload = verifyToken(token);
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}
