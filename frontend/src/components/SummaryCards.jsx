import React from 'react';
import { Users, UserCheck, UserX, Percent } from 'lucide-react';

export default function SummaryCards({ students = [], isReopenedSaved = false }) {
  const total = students.length;
  const present = students.filter((s) => s.status === 'Present').length;
  const absent = students.filter((s) => s.status === 'Absent').length;
  const unmarked = total - present - absent;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-black">
          Summary {isReopenedSaved && <span className="text-gray-500 font-normal lowercase">(saved records)</span>}
        </h2>
        {unmarked > 0 ? (
          <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {unmarked} unmarked
          </span>
        ) : (
          <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            All marked
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-black mt-0.5">{total}</p>
          </div>
          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-black">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Present</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{present}</p>
          </div>
          <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Absent</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">{absent}</p>
          </div>
          <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-600">
            <UserX className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Attendance Rate</p>
            <p className="text-2xl font-bold text-black mt-0.5">{attendanceRate}%</p>
          </div>
          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-black">
            <Percent className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
