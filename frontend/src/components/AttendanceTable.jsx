import React, { useState } from 'react';
import { Check, X, User, Clock, Search } from 'lucide-react';

export default function AttendanceTable({
  students = [],
  onStatusChange,
  isLoading,
  selectedClass,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 rounded-lg flex items-center justify-between p-3"
              >
                <div className="flex items-center space-x-3 w-1/3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-36"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
        <div className="w-12 h-12 bg-gray-100 text-black rounded-lg flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-black">No Students Found</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          {selectedClass
            ? `There are no students enrolled in ${selectedClass.name}.`
            : 'Please select a class above to view students and mark attendance.'}
        </p>
      </div>
    );
  }

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.rollNumber.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white">
        <div>
          <h3 className="text-sm font-bold text-black">
            Student Roster ({students.length})
          </h3>
          <p className="text-xs text-gray-500">
            Select Present or Absent for each student
          </p>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-white">
          No students match "{searchQuery}"
        </div>
      ) : (
        <div className="divide-y divide-gray-100 bg-white">
          {filteredStudents.map((student, index) => {
            const isPresent = student.status === 'Present';
            const isAbsent = student.status === 'Absent';

            return (
              <div
                key={student.studentId}
                className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-gray-50/70 transition-colors bg-white"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-semibold text-black">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-black">
                        {student.name}
                      </span>
                      {student.updatedAt && (
                        <span
                          title={`Last updated: ${new Date(student.updatedAt).toLocaleString()}`}
                          className="inline-flex items-center text-[10px] text-gray-400 font-mono"
                        >
                          <Clock className="w-2.5 h-2.5 mr-0.5" />
                          Saved
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                        {student.rollNumber}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                          isPresent
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isAbsent
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {isPresent ? 'Present' : isAbsent ? 'Absent' : 'Unmarked'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onStatusChange(student.studentId, 'Present')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isPresent
                        ? 'bg-emerald-600 text-white border border-emerald-600'
                        : 'bg-white text-gray-700 hover:text-black hover:border-gray-400 border border-gray-300'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isPresent ? 'text-white' : 'text-emerald-600'}`} />
                    Present
                  </button>

                  <button
                    type="button"
                    onClick={() => onStatusChange(student.studentId, 'Absent')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isAbsent
                        ? 'bg-rose-600 text-white border border-rose-600'
                        : 'bg-white text-gray-700 hover:text-black hover:border-gray-400 border border-gray-300'
                    }`}
                  >
                    <X className={`w-3.5 h-3.5 ${isAbsent ? 'text-white' : 'text-rose-600'}`} />
                    Absent
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
