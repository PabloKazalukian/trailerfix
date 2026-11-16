export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    'actors',
    {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
    },
    { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
  );

  await queryInterface.addIndex('actors', ['last_name', 'first_name'], {
    name: 'idx_actors_name',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('actors');
}
