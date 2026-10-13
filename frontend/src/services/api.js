const API_BASE = '/api';

export async function fetchClasses() {
  const response = await fetch(`${API_BASE}/classes`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch classes.');
  }
  return data.data;
}

export async function fetchClassStudents(classId) {
  const response = await fetch(`${API_BASE}/classes/${classId}/students`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Failed to fetch students for class ${classId}.`);
  }
  return data.data;
}

export async function fetchAttendance(classId, date) {
  const response = await fetch(
    `${API_BASE}/attendance?classId=${encodeURIComponent(classId)}&date=${encodeURIComponent(date)}`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch attendance.');
  }
  return data.data;
}

export async function saveAttendance(classId, date, records) {
  const response = await fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      classId: Number(classId),
      date,
      records,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to save attendance.');
  }
  return data;
}
