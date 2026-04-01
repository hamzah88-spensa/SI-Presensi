'use client';

import { useData } from '@/lib/data-context';
import { Users, BookOpen, CheckSquare, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { data, activeSemester, isLoaded } = useData();

  if (!isLoaded) return <div className="animate-pulse flex flex-col gap-6">
    <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
    <div className="grid grid-cols-4 gap-6"><div className="h-32 bg-slate-200 rounded-2xl"></div></div>
  </div>;

  const currentKehadiran = data.kehadiran.filter(k => k.semesterId === activeSemester?.id);
  const currentPenilaianFormatif = data.penilaianFormatif.filter(p => p.semesterId === activeSemester?.id);
  const currentPenilaianSumatif = data.penilaianSumatif.filter(p => p.semesterId === activeSemester?.id);
  const totalPenilaian = currentPenilaianFormatif.length + currentPenilaianSumatif.length;

  const stats = [
    { name: 'Total Kelas', value: data.kelas.length, icon: BookOpen, color: 'bg-blue-500', link: '/master/kelas' },
    { name: 'Total Siswa', value: data.siswa.length, icon: Users, color: 'bg-indigo-500', link: '/master/siswa' },
    { name: 'Data Kehadiran', value: currentKehadiran.length, icon: CheckSquare, color: 'bg-emerald-500', link: '/presensi/rekap' },
    { name: 'Data Penilaian', value: totalPenilaian, icon: FileText, color: 'bg-purple-500', link: '/penilaian/rekap' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang Hamzah, S.Pd</h1>
          <p className="text-indigo-100 max-w-2xl text-lg">
            SIGMA (Sistem Integrasi Guru Modern Aktif), Kelola data kehadiran, penilaian siswa dan jurnal mengajar guru dengan mudah. Anda sedang mengakses data untuk semester <span className="font-bold text-white">{activeSemester?.name || 'Belum dipilih'}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} href={stat.link} className="block group">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl text-white ${stat.color} shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-500" />
            Aktivitas Kehadiran Terakhir
          </h3>
          {currentKehadiran.length > 0 ? (
            <div className="space-y-4">
              {currentKehadiran.slice(-5).reverse().map(k => {
                const siswa = data.siswa.find(s => s.id === k.siswaId);
                return (
                  <div key={k.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {siswa?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{siswa?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{k.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      k.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :
                      k.status === 'Izin' ? 'bg-blue-100 text-blue-700' :
                      k.status === 'Sakit' ? 'bg-amber-100 text-amber-700' :
                      k.status === 'Bolos' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {k.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Belum ada data kehadiran di semester ini.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Penilaian Sumatif Terakhir
          </h3>
          {currentPenilaianSumatif.length > 0 ? (
            <div className="space-y-4">
              {currentPenilaianSumatif.slice(-5).reverse().map(p => {
                const siswa = data.siswa.find(s => s.id === p.siswaId);
                const tp = data.tujuanPembelajaran.find(t => t.id === p.tpId);
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                        {siswa?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{siswa?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{tp?.name || 'TP'} - {p.teknik}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-800">{p.nilai}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Belum ada data penilaian sumatif di semester ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
