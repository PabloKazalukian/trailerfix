export async function up(queryInterface) {
  const [users] = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE username = 'admin' LIMIT 1",
  );

  if (users.length === 0) {
    throw new Error('Usuario admin no encontrado para el seeder de user_content');
  }

  const userId = users[0].id;

  const userContent = [
    {
      user_id: userId,
      content_id: 2,
      status: 'WATCHED',
      watched_at: new Date('2026-10-10 21:30:00'),
      created_at: new Date('2026-10-10 21:30:00'),
      updated_at: new Date('2026-10-10 21:30:00'),
    },
    {
      user_id: userId,
      content_id: 1,
      status: 'WATCHED',
      watched_at: new Date('2026-10-12 20:00:00'),
      created_at: new Date('2026-10-12 20:00:00'),
      updated_at: new Date('2026-10-12 20:00:00'),
    },
    {
      user_id: userId,
      content_id: 3,
      status: 'WATCHLIST',
      watched_at: null,
      created_at: new Date('2026-10-12 20:00:00'),
      updated_at: new Date('2026-10-12 20:00:00'),
    },
    {
      user_id: userId,
      content_id: 4,
      status: 'WATCHLIST',
      watched_at: null,
      created_at: new Date('2026-10-12 20:00:00'),
      updated_at: new Date('2026-10-12 20:00:00'),
    },
  ];

  await queryInterface.bulkInsert('user_content', userContent);
}

export async function down(queryInterface) {
  const [users] = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE username = 'admin' LIMIT 1",
  );

  if (users.length > 0) {
    await queryInterface.bulkDelete('user_content', {
      user_id: users[0].id,
      content_id: [1, 2, 3, 4],
    });
  }
}