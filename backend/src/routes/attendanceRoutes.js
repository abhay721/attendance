const express = require('express');
const router = express.Router();
const { getAttendance, saveAttendance } = require('../controllers/attendanceController');
const {
  validateAttendanceQuery,
  validateAttendancePayload,
} = require('../middleware/validator');

router.get('/', validateAttendanceQuery, getAttendance);
router.post('/', validateAttendancePayload, saveAttendance);

module.exports = router;
