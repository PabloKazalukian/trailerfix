export async function up(queryInterface) {
  const movies = [
    { content_id: 2, duration_minutes: 169 },
    { content_id: 3, duration_minutes: 152 },
    { content_id: 5, duration_minutes: 136 },
  ];

  await queryInterface.bulkInsert('movies', movies);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('movies', {
    content_id: [2, 3, 5],
  });
}