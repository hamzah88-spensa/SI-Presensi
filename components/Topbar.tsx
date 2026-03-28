'use client';

import { useData } from '@/lib/data-context';
import { Calendar, ChevronDown, Bell, Menu } from 'lucide-react';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data, activeSemester, setActiveSemester, isLoaded } = useData();

  if (!isLoaded) return <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8" />;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 truncate max-w-[150px] md:max-w-none">
          {activeSemester ? `Semester: ${activeSemester.name}` : 'Pilih Semester'}
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative group">
          <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 md:px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">{activeSemester?.name || 'Pilih Semester'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
            <div className="p-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
              Ganti Semester
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {data.semesters.map((semester) => (
                <button
                  key={semester.id}
                  onClick={() => setActiveSemester(semester.id)}
                  className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                    semester.isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {semester.name}
                  {semester.isActive && <span className="float-right text-indigo-500 text-xs mt-0.5">Aktif</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700 leading-none">Admin</p>
            <p className="text-xs text-slate-500 mt-1">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
