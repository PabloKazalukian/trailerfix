const { sequelize } = require('./src/database/models/index.js');
const fs = require('fs');
const path = require('path');

async function runSeeders() {
  const seedersDir = path.join(__dirname, 'src', 'database', 'seeders');
  const files = fs.readdirSync(seedersDir).filter(f => f.endsWith('.js')).sort();
  
  for (const file of files) {
    // Skip genres as they already exist
    if (file.includes('demo-genres')) continue;
    
    console.log('Running:', file);
    const fullPath = path.join(seedersDir, file);
    const seeder = require(fullPath);
    try {
      await seeder.up(sequelize.getQueryInterface());
    } catch (e) {
      console.error('Error running', file, ':', e.message);
    }
  }
  
  console.log('All seeders done');
  await sequelize.close();
}

runSeeders().catch(e => { console.error(e); sequelize.close(); });