-- Seed data for Classes, Students, and Sample Attendance

-- 1. Insert Classes
INSERT INTO classes (id, name, code) VALUES
(1, 'Grade 10 - Section A', 'G10-A'),
(2, 'Grade 10 - Section B', 'G10-B'),
(3, 'Grade 12 - Robotics (Empty Class)', 'G12-ROB')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Students for Class 1 (Grade 10 - Section A)
INSERT INTO students (id, class_id, name, roll_number) VALUES
(1, 1, 'Aarav Sharma', '10A-01'),
(2, 1, 'Diya Patel', '10A-02'),
(3, 1, 'Ishaan Verma', '10A-03'),
(4, 1, 'Ananya Iyer', '10A-04'),
(5, 1, 'Rohan Gupta', '10A-05'),
(6, 1, 'Sanya Malhotra', '10A-06'),
(7, 1, 'Kabir Singh', '10A-07'),
(8, 1, 'Meera Nair', '10A-08')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Students for Class 2 (Grade 10 - Section B)
INSERT INTO students (id, class_id, name, roll_number) VALUES
(9, 2, 'Aditya Rao', '10B-01'),
(10, 2, 'Kavya Sen', '10B-02'),
(11, 2, 'Rishi Deshmukh', '10B-03'),
(12, 2, 'Pooja Hegde', '10B-04'),
(13, 2, 'Vikram Joshi', '10B-05'),
(14, 2, 'Neha Kulkarni', '10B-06')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence counters so future SERIAL inserts continue properly
SELECT setval(pg_get_serial_sequence('classes', 'id'), coalesce(max(id), 1)) FROM classes;
SELECT setval(pg_get_serial_sequence('students', 'id'), coalesce(max(id), 1)) FROM students;

-- 4. Sample Attendance for Class 1 on 2026-10-12 (reopen test case)
INSERT INTO attendance (student_id, attendance_date, status) VALUES
(1, '2026-10-12', 'Present'),
(2, '2026-10-12', 'Present'),
(3, '2026-10-12', 'Absent'),
(4, '2026-10-12', 'Present'),
(5, '2026-10-12', 'Absent'),
(6, '2026-10-12', 'Present'),
(7, '2026-10-12', 'Present'),
(8, '2026-10-12', 'Present')
ON CONFLICT (student_id, attendance_date) DO NOTHING;
