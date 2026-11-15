import bcrypt from 'bcryptjs';
import environment from '../config/environment.js';
import userRepository from '../repositories/user.repository.js';
import { signToken } from '../utils/jwt.js';

async function register(req, res) {
  const { username, name, password } = req.body;

  const existingUser = await userRepository.findByUsername(username);
  if (existingUser) {
    return res.status(409).json({ error: 'El username ya esta en uso' });
  }

  const passwordHash = await bcrypt.hash(password, environment.bcryptSaltRounds);
  const user = await userRepository.create({ username, name, password: passwordHash });

  return res.status(201).json({
    user: user.toJSON(),
    token: signToken(user),
  });
}

async function login(req, res) {
  const { username, password } = req.body;

  const user = await userRepository.findByUsernameWithPassword(username);
  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  return res.json({
    user: user.toJSON(),
    token: signToken(user),
  });
}

async function me(req, res) {
  return res.json({ user: req.user.toJSON() });
}

export default { register, login, me };
