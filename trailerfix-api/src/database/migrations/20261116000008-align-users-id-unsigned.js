export async function up(queryInterface) {
  await queryInterface.sequelize.query(
    'ALTER TABLE users MODIFY COLUMN id INT UNSIGNED NOT NULL AUTO_INCREMENT',
  );
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query(
    'ALTER TABLE users MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT',
  );
}
