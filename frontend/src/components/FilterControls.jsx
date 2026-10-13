import React from 'react';
import {
  Calendar,
  GraduationCap,
  CheckCheck,
  RotateCcw,
  Save,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

export default function FilterControls({
  classes = [],
  selectedClassId,
  onSelectClass,
  selectedDate,
  onSelectDate,
  onMarkAllPresent,
  onMarkAllAbsent,
  onClearSelection,
  onSave,
  isSaving,
  isDirty,
  hasStudents,
  isReopenedSaved,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 mb-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
        {/* Class Selector */}
        <div>
          <label
            htmlFor="class-selector"
            className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4 text-black" />
            <span>Select Class</span>
          </label>
          <select
            id="class-selector"
            value={selectedClassId || ''}
            onChange={(e) => onSelectClass(e.target.value)}
            className="w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-1 focus:ring-black focus:border-black block p-2.5 font-medium transition-colors"
          >
            <option value="" disabled>
              -- Choose a Class --
            </option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.code})
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div>
          <label
            htmlFor="date-selector"
            className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>Attendance Date</span>
          </label>
          <input
            id="date-selector"
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-1 focus:ring-black focus:border-black block p-2.5 font-medium transition-colors"
          />
        </div>
      </div>

      {/* Action Bar & Quick Actions */}
      <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status indicator on reopening */}
        <div className="flex items-center gap-2">
          {isReopenedSaved ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-black border border-gray-200">
              <CheckCircle className="w-3.5 h-3.5 text-black" />
              Saved Attendance Loaded
            </span>
          ) : selectedClassId && hasStudents ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              Unsaved / New Entry
            </span>
          ) : null}

          {isDirty && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              ● Unsaved changes
            </span>
          )}
        </div>

        {/* Quick Actions Buttons & Save Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onMarkAllPresent}
            disabled={!hasStudents || isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            Mark All Present
          </button>

          <button
            type="button"
            onClick={onMarkAllAbsent}
            disabled={!hasStudents || isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-800 bg-white hover:bg-rose-50 border border-rose-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Mark All Absent
          </button>

          <button
            type="button"
            onClick={onClearSelection}
            disabled={!hasStudents || isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-black bg-white hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
            Clear Selection
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!hasStudents || isSaving}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-black hover:bg-neutral-800 active:bg-neutral-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto sm:ml-2"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}
