# Attendance Management System
### Leaplooms Technologies LLP | Week 2 Full Stack Assignment

A responsive, robust full-stack attendance management workflow built with **React**, **Tailwind CSS**, **Node.js**, **Express.js**, and **PostgreSQL**.

---

## 🌟 Key Features

- **Class & Date Selection:** Seamlessly select classes and calendar dates with automatic synchronization.
- **Bulk Student Attendance Entry:** Mark attendance for all students in a single atomic request (`POST /api/attendance`).
- **Idempotent & Safe Persistence:**
  - Database-enforced uniqueness rule on `(student_id, attendance_date)`.
  - Atomic PostgreSQL `UPSERT` (`ON CONFLICT ... DO UPDATE`) prevents duplicate rows and safely modifies records when reopened.
- **Reopening Previously Saved Attendance:** Automatically displays saved values, badges, and timestamps when a saved date is revisited.
- **Quick Actions:**
  - **Mark All Present:** Sets all students in roster to Present.
  - **Mark All Absent:** Sets all students in roster to Absent.
  - **Clear Selection:** Resets roster status to unmarked.
- **Interactive UI Feedback:**
  - Loading skeleton indicators.
  - Informative Empty States (e.g. classes with 0 students).
  - Success toasts and descriptive error banners.
  - Live "Unsaved changes" indicator.
  - Real-time student search/filter by name or roll number.
- **Stretch Goal Completed:** Live summary cards displaying Total Students, Present Count, Absent Count, Unmarked Count, and Attendance Rate percentage.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19, Tailwind CSS, Lucide Icons | Responsive modern SPA with Vite dev server and proxy |
| **Backend** | Node.js, Express.js | Modular REST API with centralized error handling and validators |
| **Database** | PostgreSQL | Relational schema with foreign keys, indexes, and unique constraints |
| **DB Engine Support** | `pg` Pool + Embedded PGlite fallback | Supports real PostgreSQL (`DATABASE_URL`) with zero-setup embedded PostgreSQL engine |
| **Testing** | Node test runner + Supertest | 19 automated integration and edge-case tests |

---

## 📁 Project Structure

```
leaploom/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Unified database connection (pg + embedded fallback)
│   │   ├── db/
│   │   │   ├── schema.sql            # PostgreSQL DDL table definitions & unique constraints
│   │   │   ├── seed.sql              # Seed data for classes, students, and sample attendance
│   │   │   └── initDb.js             # Migration runner script
│   │   ├── controllers/
│   │   │   ├── classController.js    # Classes and student roster endpoints
│   │   │   └── attendanceController.js# Bulk attendance fetch and UPSERT handler
│   │   ├── routes/
│   │   │   ├── classRoutes.js        # /api/classes routes
│   │   │   └── attendanceRoutes.js   # /api/attendance routes
│   │   ├── middleware/
│   │   │   ├── validator.js          # Request payload and query validation middleware
│   │   │   └── errorHandler.js       # Centralized error handler & status code mapper
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server entry point with auto-migration
│   ├── tests/
│   │   └── api.test.js               # Comprehensive automated test suite (19 test cases)
│   ├── .env.example                  # Environment configuration template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # Top navigation header
│   │   │   ├── FilterControls.jsx    # Class/date pickers & quick action buttons
│   │   │   ├── SummaryCards.jsx      # Summary metrics (Stretch Goal)
│   │   │   ├── AttendanceTable.jsx   # Student roster with Present/Absent toggles & search
│   │   │   └── AlertBanner.jsx       # Success / Error / Info notification banner
│   │   ├── services/
│   │   │   └── api.js                # Frontend API client
│   │   ├── App.jsx                   # Main orchestration component
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Tailwind CSS styles
│   ├── tailwind.config.js
│   ├── vite.config.js                # Vite configuration with backend API proxy
│   └── package.json
├── postman/
│   └── attendance_api.postman_collection.json # Exported Postman collection
├── package.json                      # Root package.json for convenience scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v26)
- **npm** v9+

### 2. Setup & Installation

Clone repository and install dependencies:

```bash
# Clone repository
git clone <repository-url>
cd leaploom

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Environment Configuration

Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

Contents of `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Optional: To connect to an external PostgreSQL instance (Docker, local, Supabase, Neon):
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/attendance_db

# If DATABASE_URL is not set, the embedded PostgreSQL engine (PGlite) runs automatically
# with persistent storage on disk in backend/.pglite_data, requiring zero extra setup!
```

### 4. Database Setup & Seeding

Run the database schema and seed data script:
```bash
npm run init-db
# or from root: npm --prefix backend run init-db
```

This creates:
- **Classes:** 
  1. `Grade 10 - Section A` (8 students)
  2. `Grade 10 - Section B` (6 students)
  3. `Grade 12 - Robotics` (0 students, for empty state testing)
- **Attendance:**
  - Sample saved attendance on `2026-10-12` for Class 1 to immediately test reopening saved attendance.

### 5. Running the Application

You can run both backend and frontend concurrently:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server runs at: http://localhost:5000
# Health check:  http://localhost:5000/api/health
```

**Terminal 2 (Frontend UI):**
```bash
cd frontend
npm run dev
# Frontend runs at: http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Edge Cases Handled

### Backend Edge Cases:
1. **Uniqueness Constraint (`student_id + attendance_date`):**
   - Enforced at database table level (`CONSTRAINT unique_student_attendance_date UNIQUE (student_id, attendance_date)`).
2. **Safe Bulk UPSERT:**
   - Instead of throwing duplicate key errors or inserting duplicate rows, existing records are updated with new timestamps and status using `ON CONFLICT (student_id, attendance_date) DO UPDATE`.
3. **Invalid Date Validation:**
   - Rejects non-date strings (`/api/attendance?date=abc`).
   - Rejects impossible calendar dates (e.g. `2026-02-31`).
4. **Cross-Class Integrity Check:**
   - In `POST /api/attendance`, verifies that every student ID in the payload actually belongs to the specified `classId`. Prevents cross-class data corruption.
5. **Class with Zero Students (Empty State):**
   - `GET /api/classes/3/students` returns `200 OK` with an empty array `[]` rather than an error.
6. **Payload Payload Validation:**
   - Validates that `records` is a non-empty array.
   - Enforces status values to strictly `'Present'` or `'Absent'`.
   - Normalizes case and trims whitespace.
7. **Transactional Atomicity:**
   - Bulk upserts are wrapped in a database transaction (`BEGIN ... COMMIT`) so either all records persist or none do.

### Frontend Edge Cases:
1. **Reopening Saved Dates:**
   - Instantly loads previously saved statuses and displays a "Saved Attendance Loaded" indicator.
2. **Unsaved Changes Notice:**
   - Tracks state against initially fetched data and displays an active pulse badge: `● Unsaved changes`.
3. **Unmarked Students Guard:**
   - When saving with unmarked students, prompts teacher with options to mark remaining students as Absent or return to finish manually.
4. **Empty Class Handling:**
   - Renders a clean empty-state graphic when a class has 0 enrolled students, disabling save and bulk buttons gracefully.
5. **Real-time Live Roster Search:**
   - Teachers can search by student name or roll number instantaneously.

---

## 📡 API Reference

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Response:**
  ```json
  { "status": "ok", "message": "Attendance API is healthy" }
  ```

### 2. List Classes
- **Endpoint:** `GET /api/classes`
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      { "id": 1, "name": "Grade 10 - Section A", "code": "G10-A" },
      { "id": 2, "name": "Grade 10 - Section B", "code": "G10-B" }
    ]
  }
  ```

### 3. Fetch Students by Class
- **Endpoint:** `GET /api/classes/:id/students`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "class": { "id": 1, "name": "Grade 10 - Section A", "code": "G10-A" },
      "totalStudents": 8,
      "students": [
        { "id": 1, "name": "Aarav Sharma", "roll_number": "10A-01", "class_id": 1 }
      ]
    }
  }
  ```

### 4. Fetch Attendance for Class on Date
- **Endpoint:** `GET /api/attendance?classId=1&date=2026-10-12`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "class": { "id": 1, "name": "Grade 10 - Section A" },
      "date": "2026-10-12",
      "summary": {
        "totalStudents": 8,
        "presentCount": 6,
        "absentCount": 2,
        "unmarkedCount": 0,
        "hasSavedRecords": true
      },
      "records": [
        {
          "studentId": 1,
          "name": "Aarav Sharma",
          "rollNumber": "10A-01",
          "status": "Present",
          "attendanceDate": "2026-10-12"
        }
      ]
    }
  }
  ```

### 5. Bulk Create / Update Attendance
- **Endpoint:** `POST /api/attendance`
- **Payload:**
  ```json
  {
    "classId": 1,
    "date": "2026-10-13",
    "records": [
      { "studentId": 1, "status": "Present" },
      { "studentId": 2, "status": "Absent" },
      { "studentId": 3, "status": "Present" }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Successfully saved attendance for 3 students.",
    "data": {
      "classId": 1,
      "date": "2026-10-13",
      "totalSaved": 3,
      "presentCount": 2,
      "absentCount": 1,
      "records": [...]
    }
  }
  ```

---

## 🧪 Automated Tests

The backend includes 19 automated integration and edge-case tests.

Run tests using:
```bash
npm --prefix backend test
```

**Test Output:**
```
✔ returns health status 200 ok
✔ returns 200 and list of all seeded classes
✔ returns 200 with list of students for valid class ID
✔ returns 200 with empty array for empty class (Edge Case: 0 students)
✔ returns 400 for non-numeric class ID (Edge Case: invalid param)
✔ returns 404 for non-existent class ID (Edge Case: missing class)
✔ returns saved attendance when reopening class and date with records
✔ returns unmarked status when date has no previous records
✔ returns 400 when classId query parameter is missing (Edge Case)
✔ returns 400 when date query parameter is missing (Edge Case)
✔ returns 400 for invalid date format (Edge Case: malformed date string)
✔ returns 400 for impossible calendar date (Edge Case: 2026-02-31)
✔ returns 404 for non-existent classId in attendance query (Edge Case)
✔ successfully saves attendance in bulk for all students in one request
✔ reopening and editing attendance updates existing rows without duplicates (UPSERT Requirement)
✔ returns 400 when records array is missing or empty (Edge Case)
✔ returns 400 for invalid status values (Edge Case)
✔ returns 400 when student does not belong to the selected class (Edge Case)
✔ returns 404 if saving attendance for non-existent classId (Edge Case)

ℹ tests 19 | pass 19 | fail 0
```

---

## 📮 Postman Collection

Import `postman/attendance_api.postman_collection.json` into Postman.
- Configured with environment variable `baseUrl` (defaults to `http://localhost:5000`).
- Contains all endpoints and positive/negative edge test cases.

---

## 📜 Git Commit History

The repository has 6 incremental, descriptive commits:
1. `feat: initial project setup with Express backend and React + Tailwind frontend`
2. `feat: PostgreSQL database schema, seed data, and connection module with zero-setup fallback`
3. `feat: implement REST APIs, validation middleware, and automated test suite`
4. `feat: implement React frontend with Tailwind CSS, bulk actions, and live summary cards`
5. `feat: add Postman collection, student roster search, and Mark All Absent action`
6. `docs: add comprehensive README with setup instructions, API docs, and edge case checklist`
