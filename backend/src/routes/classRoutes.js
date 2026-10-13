const express = require('express');
const router = express.Router();
const { getAllClasses, getStudentsByClass } = require('../controllers/classController');
const { validateClassIdParam } = require('../middleware/validator');

// GET /api/classes - List all classes
router.get('/', getAllClasses);

// GET /api/classes/:id/students - List students for specific class
router.get('/:id/students', validateClassIdParam, getStudentsByClass);

module.exports = router;
