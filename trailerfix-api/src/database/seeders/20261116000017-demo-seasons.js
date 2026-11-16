export async function up(queryInterface) {
  const seasons = [
    { series_id: 1, season_number: 1, release_year: 2008, episode_count: 7 },
    { series_id: 1, season_number: 2, release_year: 2009, episode_count: 13 },
    { series_id: 1, season_number: 3, release_year: 2010, episode_count: 13 },
    { series_id: 1, season_number: 4, release_year: 2011, episode_count: 13 },
    { series_id: 1, season_number: 5, release_year: 2012, episode_count: 16 },
    { series_id: 4, season_number: 1, release_year: 2017, episode_count: 10 },
    { series_id: 4, season_number: 2, release_year: 2019, episode_count: 8 },
    { series_id: 4, season_number: 3, release_year: 2020, episode_count: 8 },
    { series_id: 6, season_number: 1, release_year: 2005, episode_count: 6 },
    { series_id: 6, season_number: 2, release_year: 2005, episode_count: 22 },
  ];

  await queryInterface.bulkInsert('seasons', seasons);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('seasons', {
    series_id: [1, 4, 6],
  });
}