const db = require('../config/db');

/**
 * GET /api/attendance?classId=&date=
 * Fetch saved attendance for the given class and date
 */
async function getAttendance(req, res, next) {
  try {
    const classId = req.parsedClassId;
    const date = req.parsedDate;

    // Check if class exists
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

    // Fetch all students of this class along with their attendance for this specific date
    // Note: attendance_date in DB is formatted as YYYY-MM-DD
    const queryText = `
      SELECT 
        s.id AS "studentId",
        s.name,
        s.roll_number AS "rollNumber",
        s.class_id AS "classId",
        a.id AS "attendanceId",
        TO_CHAR(a.attendance_date, 'YYYY-MM-DD') AS "attendanceDate",
        a.status,
        a.updated_at AS "updatedAt"
      FROM students s
      LEFT JOIN attendance a 
        ON s.id = a.student_id AND a.attendance_date = $2
      WHERE s.class_id = $1
      ORDER BY s.roll_number ASC, s.id ASC;
    `;

    const result = await db.query(queryText, [classId, date]);
    const records = result.rows;

    // Calculate summary statistics
    const totalStudents = records.length;
    let presentCount = 0;
    let absentCount = 0;
    let unmarkedCount = 0;

    for (const record of records) {
      if (record.status === 'Present') {
        presentCount++;
      } else if (record.status === 'Absent') {
        absentCount++;
      } else {
        unmarkedCount++;
      }
    }

    const hasSavedRecords = presentCount > 0 || absentCount > 0;

    return res.status(200).json({
      success: true,
      data: {
        class: currentClass,
        date,
        summary: {
          totalStudents,
          presentCount,
          absentCount,
          unmarkedCount,
          hasSavedRecords,
        },
        records,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/attendance
 * Bulk create or update attendance for students on a given date
 */
async function saveAttendance(req, res, next) {
  try {
    const classId = req.parsedClassId;
    const date = req.parsedDate;
    const records = req.sanitizedRecords;

    // 1. Verify class exists
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

    // 2. Fetch all student IDs belonging to this class to verify relationship
    const classStudentsResult = await db.query(
      'SELECT id FROM students WHERE class_id = $1;',
      [classId]
    );
    const validStudentIds = new Set(classStudentsResult.rows.map((s) => s.id));

    // 3. Check for any foreign students that do not belong to this class
    for (const rec of records) {
      if (!validStudentIds.has(rec.studentId)) {
        return res.status(400).json({
          success: false,
          error: `Student with ID ${rec.studentId} does not belong to Class ${classId}.`,
        });
      }
    }

    // 4. Perform atomic UPSERT inside a transaction
    const upsertResults = await db.transaction(async (client) => {
      const saved = [];
      const upsertSql = `
        INSERT INTO attendance (student_id, attendance_date, status, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, attendance_date)
        DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, student_id AS "studentId", TO_CHAR(attendance_date, 'YYYY-MM-DD') AS "attendanceDate", status, updated_at AS "updatedAt";
      `;

      for (const rec of records) {
        const res = await client.query(upsertSql, [rec.studentId, date, rec.status]);
        if (res.rows && res.rows[0]) {
          saved.push(res.rows[0]);
        }
      }

      return saved;
    });

    // 5. Compute summary of saved records
    let presentCount = 0;
    let absentCount = 0;
    for (const item of upsertResults) {
      if (item.status === 'Present') presentCount++;
      if (item.status === 'Absent') absentCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Successfully saved attendance for ${upsertResults.length} students.`,
      data: {
        classId,
        date,
        totalSaved: upsertResults.length,
        presentCount,
        absentCount,
        records: upsertResults,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAttendance,
  saveAttendance,
};
