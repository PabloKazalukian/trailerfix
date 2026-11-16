export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    'content_genres',
    {
      content_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      genre_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
    },
    { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
  );

  await queryInterface.addConstraint('content_genres', {
    fields: ['content_id'],
    type: 'foreign key',
    name: 'fk_content_genres_content',
    references: { table: 'content', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('content_genres', {
    fields: ['genre_id'],
    type: 'foreign key',
    name: 'fk_content_genres_genre',
    references: { table: 'genres', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addIndex('content_genres', ['genre_id'], {
    name: 'idx_content_genres_genre',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('content_genres');
}
