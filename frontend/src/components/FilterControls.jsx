import React from 'react';
import {
  Calendar,
  GraduationCap,
  CheckCheck,
  RotateCcw,
  Save,
  CheckCircle,
  Clock,
  Sparkles,
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
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-slate-100">
        {/* Class Selector */}
        <div>
          <label
            htmlFor="class-selector"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Select Class</span>
          </label>
          <div className="relative">
            <select
              id="class-selector"
              value={selectedClassId || ''}
              onChange={(e) => onSelectClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-10 font-medium transition-all hover:bg-slate-100/70"
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
        </div>

        {/* Date Selector */}
        <div>
          <label
            htmlFor="date-selector"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Attendance Date</span>
          </label>
          <div className="relative">
            <input
              id="date-selector"
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 font-medium transition-all hover:bg-slate-100/70"
            />
          </div>
        </div>
      </div>

      {/* Action Bar & Quick Actions */}
      <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status indicator on reopening */}
        <div className="flex items-center gap-2">
          {isReopenedSaved ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              Saved Attendance Loaded
            </span>
          ) : selectedClassId && hasStudents ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <Clock className="w-3.5 h-3.5" />
              Unsaved / New Entry
            </span>
          ) : null}

          {isDirty && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              ● Unsaved changes
            </span>
          )}
        </div>

        {/* Quick Actions Buttons & Save Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onMarkAllPresent}
            disabled={!hasStudents || isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Mark All Present
          </button>

          <button
            type="button"
            onClick={onMarkAllAbsent}
            disabled={!hasStudents || isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            Mark All Absent
          </button>

          <button
            type="button"
            onClick={onClearSelection}
            disabled={!hasStudents || isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Clear Selection
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!hasStudents || isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed ml-auto sm:ml-0"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}
