const express = require('express');
const router = express.Router();
const { getAllClasses, getStudentsByClass } = require('../controllers/classController');
const { validateClassIdParam } = require('../middleware/validator');

router.get('/', getAllClasses);
router.get('/:id/students', validateClassIdParam, getStudentsByClass);

module.exports = router;
