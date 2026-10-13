const express = require('express');
const cors = require('cors');
const classRoutes = require('./routes/classRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Attendance API is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
