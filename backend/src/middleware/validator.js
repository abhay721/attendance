function isValidPositiveInt(val) {
  if (val === undefined || val === null || val === '') return false;
  const num = Number(val);
  return Number.isInteger(num) && num > 0;
}

function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

function validateClassIdParam(req, res, next) {
  const { id } = req.params;
  if (!isValidPositiveInt(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid class ID. It must be a positive integer.',
    });
  }
  req.parsedClassId = parseInt(id, 10);
  next();
}

function validateAttendanceQuery(req, res, next) {
  const { classId, date } = req.query;

  if (!classId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required query parameter: classId.',
    });
  }

  if (!isValidPositiveInt(classId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid classId query parameter. Must be a positive integer.',
    });
  }

  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Missing required query parameter: date.',
    });
  }

  if (!isValidDateString(date)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid date format. Expected a valid YYYY-MM-DD calendar date.',
    });
  }

  req.parsedClassId = parseInt(classId, 10);
  req.parsedDate = date;
  next();
}

function validateAttendancePayload(req, res, next) {
  const { classId, date, records } = req.body;

  if (!classId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: classId.',
    });
  }

  if (!isValidPositiveInt(classId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid classId. Must be a positive integer.',
    });
  }

  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: date.',
    });
  }

  if (!isValidDateString(date)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid date format. Expected a valid YYYY-MM-DD calendar date.',
    });
  }

  if (!Array.isArray(records)) {
    return res.status(400).json({
      success: false,
      error: 'Records must be an array of student attendance entries.',
    });
  }

  if (records.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Records array cannot be empty. Must include at least one student attendance record.',
    });
  }

  const sanitizedRecords = [];
  const seenStudentIds = new Set();

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];

    if (!rec || typeof rec !== 'object') {
      return res.status(400).json({
        success: false,
        error: `Record at index ${i} is invalid. Expected an object with studentId and status.`,
      });
    }

    if (!isValidPositiveInt(rec.studentId)) {
      return res.status(400).json({
        success: false,
        error: `Record at index ${i} has an invalid studentId. Must be a positive integer.`,
      });
    }

    if (!rec.status || typeof rec.status !== 'string') {
      return res.status(400).json({
        success: false,
        error: `Record for student ${rec.studentId} is missing a valid status.`,
      });
    }

    const trimmedStatus = rec.status.trim();
    const normalizedStatus =
      trimmedStatus.toLowerCase() === 'present'
        ? 'Present'
        : trimmedStatus.toLowerCase() === 'absent'
        ? 'Absent'
        : null;

    if (!normalizedStatus) {
      return res.status(400).json({
        success: false,
        error: `Invalid status "${rec.status}" for student ${rec.studentId}. Allowed values: "Present", "Absent".`,
      });
    }

    const studentIdNum = parseInt(rec.studentId, 10);
    sanitizedRecords.push({
      studentId: studentIdNum,
      status: normalizedStatus,
    });
    seenStudentIds.add(studentIdNum);
  }

  const deduplicated = [];
  const processed = new Set();
  for (let i = sanitizedRecords.length - 1; i >= 0; i--) {
    const item = sanitizedRecords[i];
    if (!processed.has(item.studentId)) {
      processed.add(item.studentId);
      deduplicated.unshift(item);
    }
  }

  req.parsedClassId = parseInt(classId, 10);
  req.parsedDate = date;
  req.sanitizedRecords = deduplicated;
  next();
}

module.exports = {
  isValidPositiveInt,
  isValidDateString,
  validateClassIdParam,
  validateAttendanceQuery,
  validateAttendancePayload,
};
