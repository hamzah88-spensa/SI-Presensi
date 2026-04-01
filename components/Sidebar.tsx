'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Home, Users, BookOpen, CheckSquare, FileText, Settings, GraduationCap, ChevronDown, ChevronRight, BookMarked, X, LogOut, Calendar } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const menuGroups = useMemo(() => [
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
        { name: 'Status Nilai', href: '/penilaian/status', icon: CheckSquare },
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
  ], []);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const activeGroup = menuGroups.find(group => 
      group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
    );
    return activeGroup ? { [activeGroup.key]: true } : {
      referensi: false,
      presensi: false,
      penilaian: false,
      jurnal: false,
      kalender: false,
    };
  });

  // Automatically open the menu that contains the active child when pathname changes
  useEffect(() => {
    const activeGroup = menuGroups.find(group => 
      group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
    );
    
    if (activeGroup) {
      setTimeout(() => {
        setOpenMenus(prev => {
          if (prev[activeGroup.key]) return prev;
          return { [activeGroup.key]: true };
        });
      }, 0);
    }
  }, [pathname, menuGroups]);

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => {
      const newState = { ...prev };
      // Close all other menus
      Object.keys(newState).forEach(k => {
        if (k !== key) newState[k] = false;
      });
      newState[key] = !prev[key];
      return newState;
    });
  };

  const handleLogout = () => {
    Cookies.remove('auth_token');
    toast.success('Berhasil keluar dari aplikasi');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col overflow-y-auto">
      <div className="p-6 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">SMP NEGERI 1 BIAU</h1>
            <p className="text-xs text-slate-400">Sistem Kehadiran & Penilaian</p>
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

        <Link
          href="/kalender"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/kalender'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="font-medium">Kalender</span>
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
                  hasActiveChild ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
                        onClick={() => onClose && onClose()}
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
      
      <div className="p-4 border-t border-slate-800 space-y-4 sticky bottom-0 bg-slate-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Keluar</span>
        </button>
        <div className="text-xs text-slate-500 text-center">
          &copy; 2026 Sistem Akademik
        </div>
      </div>
    </div>
  );
}
