import app from './app.js';
import environment from './config/environment.js';
import { sequelize } from './database/models/index.js';

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a la base de datos establecida.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }

  app.listen(environment.port, () => {
    console.log(`API escuchando en http://localhost:${environment.port}`);
  });
}

start();
