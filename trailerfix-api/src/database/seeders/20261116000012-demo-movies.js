export async function up(queryInterface) {
  const movies = [
    {
      content_id: 2,
      duration_minutes: 169,
      budget: 165000000,
      revenue: 773100000,
      original_title: 'Interstellar',
      runtime_minutes: 169,
    },
    {
      content_id: 3,
      duration_minutes: 152,
      budget: 185000000,
      revenue: 1006000000,
      original_title: 'The Dark Knight',
      runtime_minutes: 152,
    },
    {
      content_id: 5,
      duration_minutes: 136,
      budget: 63000000,
      revenue: 467200000,
      original_title: 'The Matrix',
      runtime_minutes: 136,
    },
  ];

  await queryInterface.bulkInsert('movies', movies);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('movies', {
    content_id: [2, 3, 5],
  });
}