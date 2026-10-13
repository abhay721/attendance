const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const db = require('./config/db');
const { initializeDatabase } = require('./db/initDb');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check if tables exist, if not, auto-initialize
    try {
      await db.query('SELECT 1 FROM classes LIMIT 1;');
    } catch (checkErr) {
      console.log('⚡ First-time startup detected. Initializing database schema and seed data...');
      await initializeDatabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Attendance Backend Server running on http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
