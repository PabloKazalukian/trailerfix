import userRepository from '../repositories/user.repository.js';
import { verifyToken } from '../utils/jwt.js';
import cookieConfig from '../config/cookies.js';

export default async function authenticate(req, res, next) {
  let token = req.cookies?.[cookieConfig.name];

  if (!token) {
    const header = req.headers.authorization ?? '';
    const [scheme, headerToken] = header.split(' ');
    if (scheme === 'Bearer' && headerToken) {
      token = headerToken;
    }
  }

  if (!token) {
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