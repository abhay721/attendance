const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initializeDatabase() {
  try {
    console.log(' Starting database initialization...');
    
    // Ensure DB connection is active
    await db.getDb();

    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log(' Applying schema.sql...');
    await db.exec(schemaSql);
    console.log(' Schema applied successfully.');

    console.log(' Applying seed.sql...');
    await db.exec(seedSql);
    console.log(' Seed data inserted successfully.');

    console.log(' Database initialization completed successfully!');
  } catch (error) {
    console.error(' Database initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = { initializeDatabase };
