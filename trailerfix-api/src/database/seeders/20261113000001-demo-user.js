import bcrypt from 'bcryptjs';

const DEMO_USER = {
  username: 'admin',
  name: 'Administrador',
  password: 'Admin123!',
};

export async function up(queryInterface) {
  const [existing] = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE username = 'admin' LIMIT 1",
  );

  if (existing.length > 0) {
    console.log('Usuario demo ya existe, seeder saltado');
    return;
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const password = await bcrypt.hash(DEMO_USER.password, saltRounds);
  const now = new Date();

  await queryInterface.bulkInsert('users', [
    {
      username: DEMO_USER.username,
      name: DEMO_USER.name,
      password,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('users', { username: DEMO_USER.username });
}