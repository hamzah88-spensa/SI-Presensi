'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Users, BookOpen, CheckSquare, FileText, Settings, GraduationCap, ChevronDown, ChevronRight, BookMarked, X } from 'lucide-react';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    referensi: true,
    presensi: true,
    penilaian: true,
    jurnal: true,
  });

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const menuGroups = [
    {
      title: 'Referensi',
      key: 'referensi',
      icon: Settings,
      items: [
        { name: 'Data Semester', href: '/master/semester', icon: Settings },
        { name: 'Data Kelas', href: '/master/kelas', icon: BookOpen },
        { name: 'Data Siswa', href: '/master/siswa', icon: Users },
        { name: 'Tujuan Pembelajaran', href: '/master/tp', icon: BookMarked },
      ]
    },
    {
      title: 'Presensi',
      key: 'presensi',
      icon: CheckSquare,
      items: [
        { name: 'Input Presensi', href: '/presensi/input', icon: CheckSquare },
        { name: 'Rekap Presensi', href: '/presensi/rekap', icon: FileText },
      ]
    },
    {
      title: 'Penilaian',
      key: 'penilaian',
      icon: FileText,
      items: [
        { name: 'Input Formatif', href: '/penilaian/formatif', icon: FileText },
        { name: 'Input Sumatif', href: '/penilaian/sumatif', icon: FileText },
        { name: 'Rekap Nilai', href: '/penilaian/rekap', icon: FileText },
        { name: 'Perkembangan Siswa', href: '/penilaian/perkembangan', icon: Users },
      ]
    },
    {
      title: 'Jurnal',
      key: 'jurnal',
      icon: BookOpen,
      items: [
        { name: 'Input Jurnal', href: '/jurnal/input', icon: BookOpen },
        { name: 'Rekap Jurnal', href: '/jurnal/rekap', icon: FileText },
      ]
    }
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col overflow-y-auto">
      <div className="p-6 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Sistem Akademik</h1>
            <p className="text-xs text-slate-400">Kehadiran & Penilaian</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-4">
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>

        {menuGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openMenus[group.key];
          const hasActiveChild = group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

          return (
            <div key={group.key} className="space-y-1">
              <button
                onClick={() => toggleMenu(group.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  hasActiveChild && !isOpen ? 'text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GroupIcon className="w-5 h-5" />
                  <span className="font-medium">{group.title}</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {isOpen && (
                <div className="pl-11 pr-2 space-y-1 mt-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-400 font-medium'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center sticky bottom-0 bg-slate-900">
        &copy; 2026 Sistem Akademik
      </div>
    </div>
  );
}
