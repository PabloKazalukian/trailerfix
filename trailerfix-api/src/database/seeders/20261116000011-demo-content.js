export async function up(queryInterface) {
  const contents = [
    {
      id: 1,
      title: 'Breaking Bad',
      description: 'Un profesor de quimica comienza a fabricar metanfetamina.',
      release_year: 2008,
      type: 'SERIES',
      created_at: new Date('2026-10-10 21:30:00'),
    },
    {
      id: 2,
      title: 'Interstellar',
      description: 'Un grupo de astronautas busca un nuevo hogar para la humanidad.',
      release_year: 2014,
      type: 'MOVIE',
      created_at: new Date('2026-10-10 21:30:00'),
    },
    {
      id: 3,
      title: 'The Dark Knight',
      description: 'Batman se enfrenta al Joker en Gotham.',
      release_year: 2008,
      type: 'MOVIE',
      created_at: new Date('2026-10-10 21:30:00'),
    },
    {
      id: 4,
      title: 'Dark',
      description: 'La desaparicion de un nino revela secretos entre varias familias.',
      release_year: 2017,
      type: 'SERIES',
      created_at: new Date('2026-10-10 21:30:00'),
    },
    {
      id: 5,
      title: 'The Matrix',
      description: 'Un programador descubre que la realidad que conoce es una simulacion.',
      release_year: 1999,
      type: 'MOVIE',
      created_at: new Date('2026-10-10 21:30:00'),
    },
    {
      id: 6,
      title: 'The Office',
      description: 'Comedia sobre la vida cotidiana de los empleados de una oficina.',
      release_year: 2005,
      type: 'SERIES',
      created_at: new Date('2026-10-10 21:30:00'),
    },
  ];

  await queryInterface.bulkInsert('content', contents);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('content', {
    id: [1, 2, 3, 4, 5, 6],
  });
}