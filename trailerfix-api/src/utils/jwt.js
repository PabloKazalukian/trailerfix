import jwt from 'jsonwebtoken';
import environment from '../config/environment.js';

export function signToken(user) {
  return jwt.sign({ username: user.username }, environment.jwt.secret, {
    subject: String(user.id),
    expiresIn: environment.jwt.expiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, environment.jwt.secret);
}
