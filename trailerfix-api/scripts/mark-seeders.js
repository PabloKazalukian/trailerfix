import sequelize from '../src/config/database.js';

async function test() {
  try {
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261116000010-demo-genres.js")');
    console.log('Genres seeder marked as completed');
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261116000011-demo-content.js")');
    console.log('Content seeder marked as completed');
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261116000012-demo-movies.js")');
    console.log('Movies seeder marked as completed');
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261116000013-demo-series.js")');
    console.log('Series seeder marked as completed');
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261116000014-demo-content-genres.js")');
    console.log('Content-Genres seeder marked as completed');
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261116000015-demo-actors.js")');
    console.log('Actors seeder marked as completed');
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261116000016-demo-content-actors.js")');
    console.log('Content-Actors seeder marked as completed');
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261116000017-demo-seasons.js")');
    console.log('Seasons seeder marked as completed');
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261116000018-demo-user-content.js")');
    console.log('User-Content seeder marked as completed');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();