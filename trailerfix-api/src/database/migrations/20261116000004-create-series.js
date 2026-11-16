export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    'series',
    {
      content_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      end_year: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('ONGOING', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ONGOING',
      },
    },
    { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
  );

  await queryInterface.addConstraint('series', {
    fields: ['content_id'],
    type: 'foreign key',
    name: 'fk_series_content',
    references: { table: 'content', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('series', {
    fields: ['end_year'],
    type: 'check',
    name: 'chk_series_end_year',
    where: Sequelize.literal('end_year IS NULL OR end_year >= 1900'),
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('series');
}
