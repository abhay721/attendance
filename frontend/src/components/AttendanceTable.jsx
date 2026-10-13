import React from 'react';
import { Check, X, User, Clock, AlertCircle } from 'lucide-react';

export default function AttendanceTable({
  students = [],
  onStatusChange,
  isLoading,
  selectedClass,
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 rounded-xl flex items-center justify-between p-4"
              >
                <div className="flex items-center space-x-4 w-1/3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-9 bg-slate-200 rounded-lg w-40"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Students Found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          {selectedClass
            ? `There are no students enrolled in ${selectedClass.name}.`
            : 'Please select a class above to view students and mark attendance.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Student Roster ({students.length})
          </h3>
          <p className="text-xs text-slate-500">
            Click Present or Absent for each student
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {students.map((student, index) => {
          const isPresent = student.status === 'Present';
          const isAbsent = student.status === 'Absent';
          const isUnmarked = !isPresent && !isAbsent;

          return (
            <div
              key={student.studentId}
              className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-slate-50/70 ${
                isPresent
                  ? 'bg-emerald-50/20'
                  : isAbsent
                  ? 'bg-rose-50/20'
                  : ''
              }`}
            >
              {/* Student Details */}
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                    isPresent
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : isAbsent
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {student.name}
                    </span>
                    {student.updatedAt && (
                      <span
                        title={`Last updated: ${new Date(student.updatedAt).toLocaleString()}`}
                        className="inline-flex items-center text-[10px] text-slate-400"
                      >
                        <Clock className="w-2.5 h-2.5 mr-0.5" />
                        Saved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {student.rollNumber}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isPresent
                          ? 'bg-emerald-50 text-emerald-700'
                          : isAbsent
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPresent ? 'Present' : isAbsent ? 'Absent' : 'Unmarked'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Present Button */}
                <button
                  type="button"
                  onClick={() => onStatusChange(student.studentId, 'Present')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    isPresent
                      ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-600 ring-offset-1'
                      : 'bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${isPresent ? 'text-white' : 'text-emerald-500'}`} />
                  Present
                </button>

                {/* Absent Button */}
                <button
                  type="button"
                  onClick={() => onStatusChange(student.studentId, 'Absent')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    isAbsent
                      ? 'bg-rose-600 text-white shadow-rose-200 ring-2 ring-rose-600 ring-offset-1'
                      : 'bg-white text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200'
                  }`}
                >
                  <X className={`w-3.5 h-3.5 ${isAbsent ? 'text-white' : 'text-rose-500'}`} />
                  Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
