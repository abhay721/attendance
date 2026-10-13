import React from 'react';
import { CalendarCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-black text-white rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-black tracking-tight leading-tight">
                Attendance Management
              </h1>
              <p className="text-xs text-gray-500">
                Class attendance tracking and records
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 font-mono hidden sm:block">
            Attendance Portal
          </div>
        </div>
      </div>
    </header>
  );
}
