export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    'seasons',
    {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      series_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      season_number: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: false,
      },
      release_year: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: true,
      },
      episode_count: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: true,
      },
    },
    { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
  );

  await queryInterface.addIndex('seasons', ['series_id', 'season_number'], {
    name: 'uq_season_number',
    unique: true,
  });

  await queryInterface.addConstraint('seasons', {
    fields: ['series_id'],
    type: 'foreign key',
    name: 'fk_seasons_series',
    references: { table: 'series', field: 'content_id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('seasons', {
    fields: ['season_number'],
    type: 'check',
    name: 'chk_season_number',
    where: Sequelize.literal('season_number > 0'),
  });

  await queryInterface.addIndex('seasons', ['series_id'], {
    name: 'idx_seasons_series',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('seasons');
}
