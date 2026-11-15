const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const common = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trailerfix_db',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  define: {
    timestamps: true,
  },
};

module.exports = {
  development: common,
  test: { ...common, database: `${common.database}_test` },
  production: { ...common },
};
