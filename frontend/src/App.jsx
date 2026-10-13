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

  useEffect(() => {
    async function loadClasses() {
      setIsLoadingClasses(true);
      try {
        const classList = await fetchClasses();
        setClasses(classList);
        if (classList.length > 0) {
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
        status: r.status,
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

  const handleStatusChange = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'Present',
      }))
    );
  };

  const handleMarkAllAbsent = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'Absent',
      }))
    );
  };

  const handleClearSelection = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: null,
      }))
    );
  };

  const isDirty =
    students.length > 0 &&
    JSON.stringify(students.map((s) => ({ id: s.studentId, status: s.status }))) !==
      JSON.stringify(initialStudentsState.map((s) => ({ id: s.studentId, status: s.status })));

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

    const unmarkedStudents = students.filter((s) => !s.status);
    if (unmarkedStudents.length > 0) {
      const confirmSave = window.confirm(
        `There are ${unmarkedStudents.length} student(s) still unmarked. Unmarked students will be skipped or need to be marked. Do you want to mark remaining students as Absent and save, or cancel? Click OK to mark remaining as Absent and save, or Cancel to finish marking manually.`
      );

      if (!confirmSave) {
        return;
      }

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
    <div className="min-h-screen bg-white text-black pb-16">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <AlertBanner alert={alert} onDismiss={() => setAlert(null)} />

        <FilterControls
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={setSelectedClassId}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onMarkAllPresent={handleMarkAllPresent}
          onMarkAllAbsent={handleMarkAllAbsent}
          onClearSelection={handleClearSelection}
          onSave={handleSaveAttendance}
          isSaving={isSaving}
          isDirty={isDirty}
          hasStudents={students.length > 0}
          isReopenedSaved={isReopenedSaved}
        />

        <SummaryCards
          students={students}
          isReopenedSaved={isReopenedSaved}
        />

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
