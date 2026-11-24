export async function up(queryInterface) {
  const series = [
    {
      content_id: 1,
      end_year: 2013,
      status: 'COMPLETED',
      number_of_seasons: 5,
      number_of_episodes: 62,
      first_air_date: '2008-01-20',
      last_air_date: '2013-09-29',
      networks: JSON.stringify(['AMC']),
      in_production: false,
    },
    {
      content_id: 4,
      end_year: 2020,
      status: 'COMPLETED',
      number_of_seasons: 3,
      number_of_episodes: 26,
      first_air_date: '2017-12-01',
      last_air_date: '2020-06-27',
      networks: JSON.stringify(['Netflix']),
      in_production: false,
    },
    {
      content_id: 6,
      end_year: 2013,
      status: 'COMPLETED',
      number_of_seasons: 9,
      number_of_episodes: 201,
      first_air_date: '2005-03-24',
      last_air_date: '2013-05-16',
      networks: JSON.stringify(['NBC']),
      in_production: false,
    },
  ];

  await queryInterface.bulkInsert('series', series);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('series', {
    content_id: [1, 4, 6],
  });
}