import React from 'react';
import { CalendarCheck, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Attendance Management
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Week 2
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Track, mark, and update class attendance with real-time persistence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-stretch sm:self-auto justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaplooms Full Stack Module</span>
          </div>
        </div>
      </div>
    </header>
  );
}
