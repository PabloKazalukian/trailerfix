import 'dotenv/config';

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
