import 'dotenv/config';

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCorsOrigins(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

const environment = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 3000),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: toNumber(process.env.DB_PORT, 3306),
    name: process.env.DB_NAME ?? 'trailerfix_db',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    dialect: process.env.DB_DIALECT ?? 'mysql',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
  cookie: {
    name: process.env.COOKIE_NAME ?? 'trailerfix_token',
    secure: process.env.COOKIE_SECURE === 'true' ? true : process.env.COOKIE_SECURE === 'false' ? false : 'auto',
    sameSite: process.env.COOKIE_SAME_SITE ?? 'lax',
    domain: process.env.COOKIE_DOMAIN ?? undefined,
    maxAge: toNumber(process.env.COOKIE_MAX_AGE, 1000 * 60 * 60),
  },
  cors: {
    origins: parseCorsOrigins(process.env.CORS_ORIGIN),
  },
};

if (!environment.jwt.secret) {
  throw new Error(
    'JWT_SECRET es obligatorio. Copia .env.example a .env y define un secreto.',
  );
}

if (environment.nodeEnv === 'production' && environment.jwt.secret.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres en produccion.');
}

export default environment;
