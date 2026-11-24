import sequelize from './src/config/database.js';

async function test() {
  try {
    // Add missing movie columns
    await sequelize.query('ALTER TABLE movies ADD COLUMN budget BIGINT UNSIGNED NULL');
    console.log('movies.budget added');
    await sequelize.query('ALTER TABLE movies ADD COLUMN revenue BIGINT UNSIGNED NULL');
    console.log('movies.revenue added');
    await sequelize.query('ALTER TABLE movies ADD COLUMN original_title VARCHAR(255) NULL');
    console.log('movies.original_title added');
    await sequelize.query('ALTER TABLE movies ADD COLUMN runtime_minutes SMALLINT UNSIGNED NULL');
    console.log('movies.runtime_minutes added');
    
    // Add missing series columns
    await sequelize.query('ALTER TABLE series ADD COLUMN number_of_seasons SMALLINT UNSIGNED NULL DEFAULT 0');
    console.log('series.number_of_seasons added');
    await sequelize.query('ALTER TABLE series ADD COLUMN number_of_episodes INT UNSIGNED NULL DEFAULT 0');
    console.log('series.number_of_episodes added');
    await sequelize.query('ALTER TABLE series ADD COLUMN first_air_date DATE NULL');
    console.log('series.first_air_date added');
    await sequelize.query('ALTER TABLE series ADD COLUMN last_air_date DATE NULL');
    console.log('series.last_air_date added');
    await sequelize.query('ALTER TABLE series ADD COLUMN networks JSON NULL');
    console.log('series.networks added');
    await sequelize.query('ALTER TABLE series ADD COLUMN in_production BOOLEAN NULL DEFAULT true');
    console.log('series.in_production added');
    
    console.log('All columns added successfully!');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();