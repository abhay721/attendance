import React from 'react';
import { Users, UserCheck, UserX, AlertCircle, Percent } from 'lucide-react';

export default function SummaryCards({ students = [], isReopenedSaved = false }) {
  const total = students.length;
  const present = students.filter((s) => s.status === 'Present').length;
  const absent = students.filter((s) => s.status === 'Absent').length;
  const unmarked = total - present - absent;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Attendance Summary {isReopenedSaved && <span className="text-emerald-600 font-normal lowercase">(saved records)</span>}
        </h2>
        {unmarked > 0 ? (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {unmarked} student{unmarked > 1 ? 's' : ''} unmarked
          </span>
        ) : (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            All students marked
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Students</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Present Count */}
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between ring-1 ring-emerald-50">
          <div>
            <p className="text-xs font-medium text-emerald-600">Present</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{present}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Absent Count */}
        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between ring-1 ring-rose-50">
          <div>
            <p className="text-xs font-medium text-rose-600">Absent</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{absent}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between ring-1 ring-indigo-50">
          <div>
            <p className="text-xs font-medium text-indigo-600">Attendance Rate</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-indigo-700">{attendanceRate}%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
