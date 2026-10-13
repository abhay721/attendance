const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const db = require('./config/db');
const { initializeDatabase } = require('./db/initDb');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    try {
      await db.query('SELECT 1 FROM classes LIMIT 1;');
    } catch (checkErr) {
      await initializeDatabase();
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
