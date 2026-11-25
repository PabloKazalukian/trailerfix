import sequelize from '../src/config/database.js';

async function test() {
  try {
    await sequelize.query('ALTER TABLE content ADD COLUMN trailer_url VARCHAR(500) NULL');
    console.log('trailer_url added');
    await sequelize.query('ALTER TABLE content ADD COLUMN poster_url VARCHAR(500) NULL');
    console.log('poster_url added');
    await sequelize.query('ALTER TABLE content ADD COLUMN backdrop_url VARCHAR(500) NULL');
    console.log('backdrop_url added');
    await sequelize.query('ALTER TABLE content ADD COLUMN rating DECIMAL(3,1) NULL');
    console.log('rating added');
    await sequelize.query('ALTER TABLE content ADD COLUMN vote_count INT UNSIGNED NULL DEFAULT 0');
    console.log('vote_count added');
    await sequelize.query('ALTER TABLE content ADD COLUMN imdb_id VARCHAR(20) NULL');
    console.log('imdb_id added');
    await sequelize.query('ALTER TABLE content ADD COLUMN tmdb_id INT UNSIGNED NULL');
    console.log('tmdb_id added');
    await sequelize.query('ALTER TABLE content ADD COLUMN original_language VARCHAR(10) NULL');
    console.log('original_language added');
    await sequelize.query('ALTER TABLE content ADD COLUMN origin_country JSON NULL');
    console.log('origin_country added');
    await sequelize.query('CREATE INDEX idx_content_imdb_id ON content(imdb_id)');
    console.log('idx_content_imdb_id created');
    await sequelize.query('CREATE INDEX idx_content_tmdb_id ON content(tmdb_id)');
    console.log('idx_content_tmdb_id created');
    await sequelize.query('CREATE INDEX idx_content_rating ON content(rating)');
    console.log('idx_content_rating created');
    await sequelize.query('INSERT INTO sequelizemeta (name) VALUES ("20261123000000-add-extended-content-fields.js")');
    console.log('Migration marked as completed');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();