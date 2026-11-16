import bcrypt from 'bcryptjs';
import environment from '../config/environment.js';
import userRepository from '../repositories/user.repository.js';
import { signToken } from '../utils/jwt.js';
import cookieConfig from '../config/cookies.js';

function setAuthCookie(res, token) {
  res.cookie(cookieConfig.name, token, cookieConfig.options);
}

function clearAuthCookie(res) {
  res.clearCookie(cookieConfig.name, cookieConfig.clearOptions);
}

async function register(req, res) {
  const { username, name, password } = req.body;

  const existingUser = await userRepository.findByUsername(username);
  if (existingUser) {
    return res.status(409).json({ error: 'El username ya esta en uso' });
  }

  const passwordHash = await bcrypt.hash(password, environment.bcryptSaltRounds);
  const user = await userRepository.create({ username, name, password: passwordHash });

  const token = signToken(user);
  setAuthCookie(res, token);

  return res.status(201).json({
    user: user.toJSON(),
  });
}

async function login(req, res) {
  const { username, password } = req.body;

  const user = await userRepository.findByUsernameWithPassword(username);
  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const token = signToken(user);
  setAuthCookie(res, token);

  return res.json({
    user: user.toJSON(),
  });
}

async function logout(req, res) {
  clearAuthCookie(res);
  return res.status(204).end();
}

async function me(req, res) {
  return res.json({ user: req.user.toJSON() });
}

export default { register, login, logout, me };