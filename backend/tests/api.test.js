const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { initializeDatabase } = require('../src/db/initDb');

describe('Attendance Management API Endpoints & Edge Cases', () => {
  before(async () => {
    // Ensure clean database state before running tests
    await initializeDatabase();
  });

  describe('GET /api/health', () => {
    test('returns health status 200 ok', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
    });
  });

  describe('GET /api/classes', () => {
    test('returns 200 and list of all seeded classes', async () => {
      const res = await request(app).get('/api/classes');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 3);
      assert.equal(res.body.data[0].name, 'Grade 10 - Section A');
    });
  });

  describe('GET /api/classes/:id/students', () => {
    test('returns 200 with list of students for valid class ID', async () => {
      const res = await request(app).get('/api/classes/1/students');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.class.id, 1);
      assert.equal(res.body.data.students.length, 8);
      assert.equal(res.body.data.students[0].roll_number, '10A-01');
    });

    test('returns 200 with empty array for empty class (Edge Case: 0 students)', async () => {
      const res = await request(app).get('/api/classes/3/students');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.students.length, 0);
      assert.equal(res.body.data.totalStudents, 0);
    });

    test('returns 400 for non-numeric class ID (Edge Case: invalid param)', async () => {
      const res = await request(app).get('/api/classes/invalid_id/students');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /positive integer/i);
    });

    test('returns 404 for non-existent class ID (Edge Case: missing class)', async () => {
      const res = await request(app).get('/api/classes/9999/students');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /not found/i);
    });
  });

  describe('GET /api/attendance', () => {
    test('returns saved attendance when reopening class and date with records', async () => {
      // 2026-10-12 was seeded in seed.sql
      const res = await request(app).get('/api/attendance?classId=1&date=2026-10-12');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.class.id, 1);
      assert.equal(res.body.data.summary.totalStudents, 8);
      assert.equal(res.body.data.summary.presentCount, 6);
      assert.equal(res.body.data.summary.absentCount, 2);
      assert.equal(res.body.data.summary.unmarkedCount, 0);
      assert.equal(res.body.data.summary.hasSavedRecords, true);
    });

    test('returns unmarked status when date has no previous records', async () => {
      const res = await request(app).get('/api/attendance?classId=1&date=2026-01-01');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.summary.totalStudents, 8);
      assert.equal(res.body.data.summary.presentCount, 0);
      assert.equal(res.body.data.summary.absentCount, 0);
      assert.equal(res.body.data.summary.unmarkedCount, 8);
      assert.equal(res.body.data.summary.hasSavedRecords, false);
      assert.equal(res.body.data.records[0].status, null);
    });

    test('returns 400 when classId query parameter is missing (Edge Case)', async () => {
      const res = await request(app).get('/api/attendance?date=2026-10-12');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /classId/i);
    });

    test('returns 400 when date query parameter is missing (Edge Case)', async () => {
      const res = await request(app).get('/api/attendance?classId=1');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /date/i);
    });

    test('returns 400 for invalid date format (Edge Case: malformed date string)', async () => {
      const res = await request(app).get('/api/attendance?classId=1&date=not-a-date');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /YYYY-MM-DD/i);
    });

    test('returns 400 for impossible calendar date (Edge Case: 2026-02-31)', async () => {
      const res = await request(app).get('/api/attendance?classId=1&date=2026-02-31');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    test('returns 404 for non-existent classId in attendance query (Edge Case)', async () => {
      const res = await request(app).get('/api/attendance?classId=9999&date=2026-10-12');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });

  describe('POST /api/attendance (Bulk Creation, Upsert & Edge Cases)', () => {
    const testDate = '2026-10-13';

    test('successfully saves attendance in bulk for all students in one request', async () => {
      const payload = {
        classId: 1,
        date: testDate,
        records: [
          { studentId: 1, status: 'Present' },
          { studentId: 2, status: 'Present' },
          { studentId: 3, status: 'Absent' },
          { studentId: 4, status: 'Present' },
          { studentId: 5, status: 'Present' },
          { studentId: 6, status: 'Absent' },
          { studentId: 7, status: 'Present' },
          { studentId: 8, status: 'Present' },
        ],
      };

      const res = await request(app).post('/api/attendance').send(payload);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.totalSaved, 8);
      assert.equal(res.body.data.presentCount, 6);
      assert.equal(res.body.data.absentCount, 2);

      // Verify persistence via GET
      const getRes = await request(app).get(`/api/attendance?classId=1&date=${testDate}`);
      assert.equal(getRes.status, 200);
      assert.equal(getRes.body.data.summary.presentCount, 6);
      assert.equal(getRes.body.data.summary.absentCount, 2);
    });

    test('reopening and editing attendance updates existing rows without duplicates (UPSERT Requirement)', async () => {
      // Modify student 3 from Absent to Present, and student 1 from Present to Absent
      const updatePayload = {
        classId: 1,
        date: testDate,
        records: [
          { studentId: 1, status: 'Absent' },
          { studentId: 2, status: 'Present' },
          { studentId: 3, status: 'Present' },
          { studentId: 4, status: 'Present' },
          { studentId: 5, status: 'Present' },
          { studentId: 6, status: 'Absent' },
          { studentId: 7, status: 'Present' },
          { studentId: 8, status: 'Present' },
        ],
      };

      const res = await request(app).post('/api/attendance').send(updatePayload);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      // Fetch again to verify updated values and no duplicate rows
      const getRes = await request(app).get(`/api/attendance?classId=1&date=${testDate}`);
      assert.equal(getRes.status, 200);
      assert.equal(getRes.body.data.records.length, 8); // Still exactly 8 students!
      
      const student1 = getRes.body.data.records.find((r) => r.studentId === 1);
      const student3 = getRes.body.data.records.find((r) => r.studentId === 3);
      assert.equal(student1.status, 'Absent');
      assert.equal(student3.status, 'Present');
    });

    test('returns 400 when records array is missing or empty (Edge Case)', async () => {
      const res = await request(app).post('/api/attendance').send({
        classId: 1,
        date: testDate,
        records: [],
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /cannot be empty/i);
    });

    test('returns 400 for invalid status values (Edge Case: status other than Present/Absent)', async () => {
      const res = await request(app).post('/api/attendance').send({
        classId: 1,
        date: testDate,
        records: [{ studentId: 1, status: 'OnLeave' }],
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /allowed values/i);
    });

    test('returns 400 when student does not belong to the selected class (Edge Case: cross-class security check)', async () => {
      // Student ID 9 belongs to Class 2, but request specifies Class 1
      const res = await request(app).post('/api/attendance').send({
        classId: 1,
        date: testDate,
        records: [{ studentId: 9, status: 'Present' }],
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /does not belong to class 1/i);
    });

    test('returns 404 if saving attendance for non-existent classId (Edge Case)', async () => {
      const res = await request(app).post('/api/attendance').send({
        classId: 9999,
        date: testDate,
        records: [{ studentId: 1, status: 'Present' }],
      });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });
});
