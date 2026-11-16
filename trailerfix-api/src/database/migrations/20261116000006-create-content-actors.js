export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    'content_actors',
    {
      content_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      actor_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      character_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      credit_order: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: true,
      },
    },
    { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
  );

  await queryInterface.addConstraint('content_actors', {
    fields: ['content_id'],
    type: 'foreign key',
    name: 'fk_content_actors_content',
    references: { table: 'content', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('content_actors', {
    fields: ['actor_id'],
    type: 'foreign key',
    name: 'fk_content_actors_actor',
    references: { table: 'actors', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addIndex('content_actors', ['actor_id'], {
    name: 'idx_content_actors_actor',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('content_actors');
}
