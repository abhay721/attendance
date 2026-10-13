import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import SummaryCards from './components/SummaryCards';
import AttendanceTable from './components/AttendanceTable';
import AlertBanner from './components/AlertBanner';
import {
  fetchClasses,
  fetchAttendance,
  saveAttendance,
} from './services/api';

// Helper to format date as YYYY-MM-DD
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function App() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [students, setStudents] = useState([]);
  const [initialStudentsState, setInitialStudentsState] = useState([]);
  const [isReopenedSaved, setIsReopenedSaved] = useState(false);

  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Load all classes on initial mount
  useEffect(() => {
    async function loadClasses() {
      setIsLoadingClasses(true);
      try {
        const classList = await fetchClasses();
        setClasses(classList);
        if (classList.length > 0) {
          // Pre-select the first class for immediate usability
          setSelectedClassId(classList[0].id.toString());
        }
      } catch (err) {
        setAlert({
          type: 'error',
          message: `Failed to load classes: ${err.message}`,
        });
      } finally {
        setIsLoadingClasses(false);
      }
    }

    loadClasses();
  }, []);

  // Fetch attendance whenever selectedClassId or selectedDate changes
  const loadClassAttendance = useCallback(async (classId, date) => {
    if (!classId || !date) return;

    setIsLoadingAttendance(true);
    setAlert(null);

    try {
      const data = await fetchAttendance(classId, date);
      const studentRecords = (data.records || []).map((r) => ({
        studentId: r.studentId,
        name: r.name,
        rollNumber: r.rollNumber,
        status: r.status, // 'Present', 'Absent', or null
        updatedAt: r.updatedAt,
      }));

      setStudents(studentRecords);
      setInitialStudentsState(JSON.parse(JSON.stringify(studentRecords)));
      setIsReopenedSaved(Boolean(data.summary?.hasSavedRecords));

      if (data.summary?.hasSavedRecords) {
        setAlert({
          type: 'info',
          message: `Saved attendance loaded for ${data.class?.name || 'Class'} on ${date}. You can review and update values.`,
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: `Failed to load attendance: ${err.message}`,
      });
      setStudents([]);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedDate) {
      loadClassAttendance(selectedClassId, selectedDate);
    }
  }, [selectedClassId, selectedDate, loadClassAttendance]);

  // Handle single student status change
  const handleStatusChange = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          // If clicked again on the same status, keep it or toggle
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
  };

  // Quick Action: Mark All Present
  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'Present',
      }))
    );
  };

  // Quick Action: Clear Selection
  const handleClearSelection = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: null,
      }))
    );
  };

  // Calculate if changes were made compared to initial fetched state
  const isDirty =
    students.length > 0 &&
    JSON.stringify(students.map((s) => ({ id: s.studentId, status: s.status }))) !==
      JSON.stringify(initialStudentsState.map((s) => ({ id: s.studentId, status: s.status })));

  // Save Attendance Handler
  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedDate) {
      setAlert({
        type: 'error',
        message: 'Please choose a valid class and date.',
      });
      return;
    }

    if (students.length === 0) {
      setAlert({
        type: 'error',
        message: 'No students available to mark attendance for.',
      });
      return;
    }

    // Check for unmarked students
    const unmarkedStudents = students.filter((s) => !s.status);
    if (unmarkedStudents.length > 0) {
      const confirmSave = window.confirm(
        `There are ${unmarkedStudents.length} student(s) still unmarked. Unmarked students will be skipped or need to be marked. Do you want to mark remaining students as Absent and save, or cancel? Click OK to mark remaining as Absent and save, or Cancel to finish marking manually.`
      );

      if (!confirmSave) {
        return;
      }

      // Automatically default remaining unmarked students to Absent
      const completeStudents = students.map((s) => ({
        ...s,
        status: s.status || 'Absent',
      }));
      setStudents(completeStudents);
      await proceedSave(completeStudents);
      return;
    }

    await proceedSave(students);
  };

  const proceedSave = async (studentListToSave) => {
    setIsSaving(true);
    setAlert(null);

    const records = studentListToSave
      .filter((s) => s.status === 'Present' || s.status === 'Absent')
      .map((s) => ({
        studentId: s.studentId,
        status: s.status,
      }));

    try {
      const res = await saveAttendance(selectedClassId, selectedDate, records);
      setIsReopenedSaved(true);
      setAlert({
        type: 'success',
        message: `Attendance successfully saved for ${res.data?.totalSaved || records.length} students on ${selectedDate}!`,
      });

      // Reload fresh state to synchronize timestamps and state
      await loadClassAttendance(selectedClassId, selectedDate);
    } catch (err) {
      setAlert({
        type: 'error',
        message: `Failed to save attendance: ${err.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentClass = classes.find((c) => c.id.toString() === selectedClassId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AlertBanner alert={alert} onDismiss={() => setAlert(null)} />

        {/* Filter Controls (Class, Date & Quick Actions) */}
        <FilterControls
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={setSelectedClassId}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onMarkAllPresent={handleMarkAllPresent}
          onClearSelection={handleClearSelection}
          onSave={handleSaveAttendance}
          isSaving={isSaving}
          isDirty={isDirty}
          hasStudents={students.length > 0}
          isReopenedSaved={isReopenedSaved}
        />

        {/* Stretch Goal: Summary Cards */}
        <SummaryCards
          students={students}
          isReopenedSaved={isReopenedSaved}
        />

        {/* Student Attendance List */}
        <AttendanceTable
          students={students}
          onStatusChange={handleStatusChange}
          isLoading={isLoadingClasses || isLoadingAttendance}
          selectedClass={currentClass}
        />
      </main>
    </div>
  );
}
