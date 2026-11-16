export async function up(queryInterface) {
  const genres = [
    'Drama',
    'Accion',
    'Ciencia ficcion',
    'Suspenso',
    'Comedia',
    'Terror',
    'Aventura',
    'Romance',
    'Fantasia',
    'Crimen',
  ];

  await queryInterface.bulkInsert(
    'genres',
    genres.map((name) => ({ name })),
  );
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('genres', {
    name: [
      'Drama',
      'Accion',
      'Ciencia ficcion',
      'Suspenso',
      'Comedia',
      'Terror',
      'Aventura',
      'Romance',
      'Fantasia',
      'Crimen',
    ],
  });
}