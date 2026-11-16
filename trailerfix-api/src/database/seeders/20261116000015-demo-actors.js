export async function up(queryInterface) {
  const actors = [
    { first_name: 'Bryan', last_name: 'Cranston' },
    { first_name: 'Aaron', last_name: 'Paul' },
    { first_name: 'Matthew', last_name: 'McConaughey' },
    { first_name: 'Anne', last_name: 'Hathaway' },
    { first_name: 'Christian', last_name: 'Bale' },
    { first_name: 'Heath', last_name: 'Ledger' },
    { first_name: 'Keanu', last_name: 'Reeves' },
    { first_name: 'Laurence', last_name: 'Fishburne' },
    { first_name: 'Rami', last_name: 'Malek' },
    { first_name: 'Steve', last_name: 'Carell' },
  ];

  await queryInterface.bulkInsert('actors', actors);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('actors', {
    first_name: [
      'Bryan',
      'Aaron',
      'Matthew',
      'Anne',
      'Christian',
      'Heath',
      'Keanu',
      'Laurence',
      'Rami',
      'Steve',
    ],
    last_name: [
      'Cranston',
      'Paul',
      'McConaughey',
      'Hathaway',
      'Bale',
      'Ledger',
      'Reeves',
      'Fishburne',
      'Malek',
      'Carell',
    ],
  });
}