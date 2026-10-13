const db = require('../config/db');

/**
 * GET /api/classes
 * Fetch all available classes for dropdown selection
 */
async function getAllClasses(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, code, created_at FROM classes ORDER BY id ASC;'
    );
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/classes/:id/students
 * Fetch all students belonging to the specified class
 */
async function getStudentsByClass(req, res, next) {
  try {
    const classId = req.parsedClassId;

    // Check if the class exists
    const classCheck = await db.query(
      'SELECT id, name, code FROM classes WHERE id = $1;',
      [classId]
    );

    if (classCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Class with ID ${classId} was not found.`,
      });
    }

    const currentClass = classCheck.rows[0];

    // Fetch students for the class
    const studentsResult = await db.query(
      'SELECT id, name, roll_number, class_id FROM students WHERE class_id = $1 ORDER BY roll_number ASC, id ASC;',
      [classId]
    );

    return res.status(200).json({
      success: true,
      data: {
        class: currentClass,
        totalStudents: studentsResult.rows.length,
        students: studentsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllClasses,
  getStudentsByClass,
};
