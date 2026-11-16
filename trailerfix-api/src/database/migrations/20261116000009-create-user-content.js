export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    'user_content',
    {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      content_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('WATCHED', 'WATCHLIST'),
        allowNull: false,
      },
      watched_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' },
  );

  await queryInterface.addIndex('user_content', ['user_id', 'content_id'], {
    name: 'uq_user_content',
    unique: true,
  });

  await queryInterface.addConstraint('user_content', {
    fields: ['user_id'],
    type: 'foreign key',
    name: 'fk_user_content_user',
    references: { table: 'users', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('user_content', {
    fields: ['content_id'],
    type: 'foreign key',
    name: 'fk_user_content_content',
    references: { table: 'content', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('user_content', {
    fields: ['status', 'watched_at'],
    type: 'check',
    name: 'chk_user_content_watched_at',
    where: Sequelize.literal(
      "((status = 'WATCHED' AND watched_at IS NOT NULL) OR (status = 'WATCHLIST' AND watched_at IS NULL))",
    ),
  });

  await queryInterface.addIndex('user_content', ['user_id', 'status'], {
    name: 'idx_user_content_user_status',
  });
  await queryInterface.addIndex('user_content', ['content_id'], {
    name: 'idx_user_content_content',
  });

  await queryInterface.sequelize.query(
    'ALTER TABLE user_content MODIFY COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable('user_content');
}
