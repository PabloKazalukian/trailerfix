import sequelize from './src/config/database.js';

async function test() {
  try {
    await sequelize.query('DELETE FROM sequelizemeta WHERE name = "20261116000011-demo-content.js"');
    console.log('Content seeder unmarked');
    await sequelize.query('DELETE FROM content WHERE id BETWEEN 1 AND 6');
    console.log('Old content deleted');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();