export async function up(queryInterface) {
  const [genres] = await queryInterface.sequelize.query(
    "SELECT id, name FROM genres ORDER BY id",
  );

  const genreIdByName = {};
  for (const genre of genres) {
    genreIdByName[genre.name] = genre.id;
  }

  const contentGenres = [
    { content_id: 1, genre_id: genreIdByName.Drama },
    { content_id: 1, genre_id: genreIdByName.Crimen },
    { content_id: 1, genre_id: genreIdByName.Suspenso },
    { content_id: 2, genre_id: genreIdByName.Drama },
    { content_id: 2, genre_id: genreIdByName['Ciencia ficcion'] },
    { content_id: 2, genre_id: genreIdByName.Aventura },
    { content_id: 3, genre_id: genreIdByName.Drama },
    { content_id: 3, genre_id: genreIdByName.Accion },
    { content_id: 3, genre_id: genreIdByName.Crimen },
    { content_id: 4, genre_id: genreIdByName.Drama },
    { content_id: 4, genre_id: genreIdByName['Ciencia ficcion'] },
    { content_id: 4, genre_id: genreIdByName.Suspenso },
    { content_id: 5, genre_id: genreIdByName.Accion },
    { content_id: 5, genre_id: genreIdByName['Ciencia ficcion'] },
    { content_id: 6, genre_id: genreIdByName.Comedia },
  ];

  await queryInterface.bulkInsert('content_genres', contentGenres);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('content_genres', {
    content_id: [1, 2, 3, 4, 5, 6],
  });
}