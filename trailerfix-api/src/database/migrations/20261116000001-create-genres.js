export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    'genres',
    {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    },
    { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
  );

  await queryInterface.addIndex('genres', ['name'], {
    name: 'uq_genres_name',
    unique: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('genres');
}
