import userRepository from '../repositories/user.repository.js';
import { verifyToken } from '../utils/jwt.js';
import cookieConfig from '../config/cookies.js';

export default async function optionalAuth(req, res, next) {
  let token = req.cookies?.[cookieConfig.name];

  if (!token) {
    const header = req.headers.authorization ?? '';
    const [scheme, headerToken] = header.split(' ');
    if (scheme === 'Bearer' && headerToken) {
      token = headerToken;
    }
  }

  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const user = await userRepository.findById(payload.sub);

    if (user) {
      req.user = user;
    }
  } catch {
    // Token inválido/expirado: ignoramos y continuamos sin usuario
  }

  return next();
}