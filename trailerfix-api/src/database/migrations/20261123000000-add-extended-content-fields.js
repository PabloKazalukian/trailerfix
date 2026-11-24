export async function up(queryInterface, Sequelize) {
  // Add extended fields to content table
  await queryInterface.addColumn('content', 'trailer_url', {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: 'YouTube trailer URL (watch or embed link)',
  });

  await queryInterface.addColumn('content', 'poster_url', {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: 'Poster image URL (TMDB/IMDb)',
  });

  await queryInterface.addColumn('content', 'backdrop_url', {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: 'Backdrop/background image URL (TMDB)',
  });

  await queryInterface.addColumn('content', 'rating', {
    type: Sequelize.DECIMAL(3, 1),
    allowNull: true,
    validate: { min: 0, max: 10 },
    comment: 'Average rating (0-10, e.g., IMDb/TMDB score)',
  });

  await queryInterface.addColumn('content', 'vote_count', {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: 0,
    comment: 'Number of votes for the rating',
  });

  await queryInterface.addColumn('content', 'imdb_id', {
    type: Sequelize.STRING(20),
    allowNull: true,
    unique: true,
    comment: 'IMDb ID (e.g., tt0111161)',
  });

  await queryInterface.addColumn('content', 'tmdb_id', {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    unique: true,
    comment: 'TMDB ID (The Movie Database)',
  });

  await queryInterface.addColumn('content', 'original_language', {
    type: Sequelize.STRING(10),
    allowNull: true,
    comment: 'Original language code (ISO 639-1)',
  });

  await queryInterface.addColumn('content', 'origin_country', {
    type: Sequelize.JSON,
    allowNull: true,
    comment: 'Array of origin country codes (ISO 3166-1)',
  });

  // Add extended fields to movies table
  await queryInterface.addColumn('movies', 'budget', {
    type: Sequelize.BIGINT.UNSIGNED,
    allowNull: true,
    comment: 'Production budget in USD',
  });

  await queryInterface.addColumn('movies', 'revenue', {
    type: Sequelize.BIGINT.UNSIGNED,
    allowNull: true,
    comment: 'Box office revenue in USD',
  });

  await queryInterface.addColumn('movies', 'original_title', {
    type: Sequelize.STRING(255),
    allowNull: true,
    comment: 'Original title in original language',
  });

  await queryInterface.addColumn('movies', 'runtime_minutes', {
    type: Sequelize.SMALLINT.UNSIGNED,
    allowNull: true,
    comment: 'Runtime in minutes (alternative to duration_minutes)',
  });

  // Add extended fields to series table
  await queryInterface.addColumn('series', 'number_of_seasons', {
    type: Sequelize.SMALLINT.UNSIGNED,
    allowNull: true,
    defaultValue: 0,
    comment: 'Total number of seasons',
  });

  await queryInterface.addColumn('series', 'number_of_episodes', {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: 0,
    comment: 'Total number of episodes',
  });

  await queryInterface.addColumn('series', 'first_air_date', {
    type: Sequelize.DATEONLY,
    allowNull: true,
    comment: 'First air date',
  });

  await queryInterface.addColumn('series', 'last_air_date', {
    type: Sequelize.DATEONLY,
    allowNull: true,
    comment: 'Last air date',
  });

  await queryInterface.addColumn('series', 'networks', {
    type: Sequelize.JSON,
    allowNull: true,
    comment: 'Array of network names',
  });

  await queryInterface.addColumn('series', 'in_production', {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    comment: 'Whether the series is still in production',
  });

  // Add indexes for common lookups
  await queryInterface.addIndex('content', ['imdb_id'], {
    name: 'idx_content_imdb_id',
  });

  await queryInterface.addIndex('content', ['tmdb_id'], {
    name: 'idx_content_tmdb_id',
  });

  await queryInterface.addIndex('content', ['rating'], {
    name: 'idx_content_rating',
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('content', 'trailer_url');
  await queryInterface.removeColumn('content', 'poster_url');
  await queryInterface.removeColumn('content', 'backdrop_url');
  await queryInterface.removeColumn('content', 'rating');
  await queryInterface.removeColumn('content', 'vote_count');
  await queryInterface.removeColumn('content', 'imdb_id');
  await queryInterface.removeColumn('content', 'tmdb_id');
  await queryInterface.removeColumn('content', 'original_language');
  await queryInterface.removeColumn('content', 'origin_country');

  await queryInterface.removeColumn('movies', 'budget');
  await queryInterface.removeColumn('movies', 'revenue');
  await queryInterface.removeColumn('movies', 'original_title');
  await queryInterface.removeColumn('movies', 'runtime_minutes');

  await queryInterface.removeColumn('series', 'number_of_seasons');
  await queryInterface.removeColumn('series', 'number_of_episodes');
  await queryInterface.removeColumn('series', 'first_air_date');
  await queryInterface.removeColumn('series', 'last_air_date');
  await queryInterface.removeColumn('series', 'networks');
  await queryInterface.removeColumn('series', 'in_production');

  await queryInterface.removeIndex('content', 'idx_content_imdb_id');
  await queryInterface.removeIndex('content', 'idx_content_tmdb_id');
  await queryInterface.removeIndex('content', 'idx_content_rating');
}