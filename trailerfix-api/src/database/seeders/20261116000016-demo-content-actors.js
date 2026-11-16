export async function up(queryInterface) {
  const [actors] = await queryInterface.sequelize.query(
    "SELECT id, first_name, last_name FROM actors",
  );

  const actorIdByName = {};
  for (const actor of actors) {
    actorIdByName[`${actor.first_name} ${actor.last_name}`] = actor.id;
  }

  const contentActors = [
    { content_id: 1, actor_id: actorIdByName['Bryan Cranston'], character_name: 'Walter White', credit_order: 1 },
    { content_id: 1, actor_id: actorIdByName['Aaron Paul'], character_name: 'Jesse Pinkman', credit_order: 2 },
    { content_id: 2, actor_id: actorIdByName['Matthew McConaughey'], character_name: 'Cooper', credit_order: 1 },
    { content_id: 2, actor_id: actorIdByName['Anne Hathaway'], character_name: 'Brand', credit_order: 2 },
    { content_id: 3, actor_id: actorIdByName['Christian Bale'], character_name: 'Bruce Wayne / Batman', credit_order: 1 },
    { content_id: 3, actor_id: actorIdByName['Heath Ledger'], character_name: 'Joker', credit_order: 2 },
    { content_id: 5, actor_id: actorIdByName['Keanu Reeves'], character_name: 'Neo', credit_order: 1 },
    { content_id: 5, actor_id: actorIdByName['Laurence Fishburne'], character_name: 'Morpheus', credit_order: 2 },
    { content_id: 4, actor_id: actorIdByName['Rami Malek'], character_name: 'Elliot Alderson', credit_order: 1 },
    { content_id: 6, actor_id: actorIdByName['Steve Carell'], character_name: 'Michael Scott', credit_order: 1 },
  ];

  await queryInterface.bulkInsert('content_actors', contentActors);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('content_actors', {
    content_id: [1, 2, 3, 4, 5, 6],
  });
}