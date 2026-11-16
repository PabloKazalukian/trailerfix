export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    'movies',
    {
      content_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      duration_minutes: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: false,
      },
    },
    { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
  );

  await queryInterface.addConstraint('movies', {
    fields: ['content_id'],
    type: 'foreign key',
    name: 'fk_movies_content',
    references: { table: 'content', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('movies', {
    fields: ['duration_minutes'],
    type: 'check',
    name: 'chk_movies_duration',
    where: Sequelize.literal('duration_minutes > 0'),
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('movies');
}
