const express = require('express');
const router = express.Router();
const { getAttendance, saveAttendance } = require('../controllers/attendanceController');
const {
  validateAttendanceQuery,
  validateAttendancePayload,
} = require('../middleware/validator');

// GET /api/attendance?classId=&date= - Fetch saved attendance
router.get('/', validateAttendanceQuery, getAttendance);

// POST /api/attendance - Bulk save/update attendance
router.post('/', validateAttendancePayload, saveAttendance);

module.exports = router;
