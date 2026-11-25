import { sequelize, Content } from '../src/database/models/index.js';

async function updatePosters() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Update Breaking Bad (id: 1)
    await Content.update(
      { posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_face/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg' },
      { where: { id: 1 } }
    );
    console.log('Updated Breaking Bad poster');

    // Update Dark (id: 4)
    await Content.update(
      { posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_face/wiiyc3m6HKaQhFBYeuM7ySCNQsG.jpg' },
      { where: { id: 4 } }
    );
    console.log('Updated Dark poster');

    // Update The Office (id: 6)
    await Content.update(
      { posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_face/5uwetbr0X8BPRy3Wmh63S9EhsiY.jpg' },
      { where: { id: 6 } }
    );
    console.log('Updated The Office poster');

    console.log('All posters updated successfully!');
  } catch (error) {
    console.error('Error updating posters:', error);
  } finally {
    await sequelize.close();
  }
}

updatePosters();