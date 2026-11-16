export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    'content',
    {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      release_year: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('MOVIE', 'SERIES'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
  );

  await queryInterface.addIndex('content', ['title'], {
    name: 'idx_content_title',
  });
  await queryInterface.addIndex('content', ['type'], {
    name: 'idx_content_type',
  });
  await queryInterface.addIndex('content', ['release_year'], {
    name: 'idx_content_release_year',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('content');
}
