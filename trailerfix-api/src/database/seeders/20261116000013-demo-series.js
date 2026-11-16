export async function up(queryInterface) {
  const series = [
    { content_id: 1, end_year: 2013, status: 'COMPLETED' },
    { content_id: 4, end_year: 2020, status: 'COMPLETED' },
    { content_id: 6, end_year: 2013, status: 'COMPLETED' },
  ];

  await queryInterface.bulkInsert('series', series);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('series', {
    content_id: [1, 4, 6],
  });
}