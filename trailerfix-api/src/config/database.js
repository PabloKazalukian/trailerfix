import { Sequelize } from 'sequelize';
import dbConfig from './database.cjs';
import environment from './environment.js';

const config = dbConfig[environment.nodeEnv] ?? dbConfig.development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging,
  define: config.define,
});

export default sequelize;
