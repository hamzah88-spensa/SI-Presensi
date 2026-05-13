'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { Download, Search, Filter, FilterIcon, Users, CalendarDays, BookOpen, AlertCircle } from 'lucide-react';

export default function NilaiAkhirPage() {
  const { data, activeSemester } = useData();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentKelasName = useMemo(() => {
    const kelas = data.kelas.find(k => k.id === selectedKelas);
    return kelas ? kelas.name : 'Semua Kelas';
  }, [selectedKelas, data.kelas]);

  const filteredSiswa = useMemo(() => {
    return data.siswa.filter(s => 
      (!selectedKelas || s.kelasId === selectedKelas) &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [data.siswa, selectedKelas, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-fuchsia-500" />
            Nilai Akhir Siswa
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Rekapitulasi nilai dan perkembangan siswa semester ini
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 text-white rounded-xl hover:bg-fuchsia-700 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Cetak Rekap
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              Pilih Kelas
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all bg-white"
            >
              <option value="">Semua Kelas</option>
              {data.kelas.map((k) => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              Cari Siswa
            </label>
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-xl font-bold text-center">NILAI AKHIR & PERKEMBANGAN SISWA</h1>
        <h2 className="text-lg font-semibold text-center uppercase">{currentKelasName}</h2>
        <p className="text-center text-sm text-slate-500 mt-1">Semester: {activeSemester?.name || '-'}</p>
        <div className="mt-4 border-b-2 border-slate-900"></div>
      </div>

      <div className="space-y-4">
        {filteredSiswa.length > 0 ? (
          filteredSiswa.map((siswa) => {
            // Calculate Kehadiran
            const kehadiran = data.kehadiran.filter(k => k.siswaId === siswa.id && k.semesterId === activeSemester?.id);
            const totalHadir = kehadiran.filter(k => k.status === 'Hadir').length;
            const totalSakit = kehadiran.filter(k => k.status === 'Sakit').length;
            const totalIzin = kehadiran.filter(k => k.status === 'Izin').length;
            const totalAlpa = kehadiran.filter(k => k.status === 'Alpa').length;
            const totalBolos = kehadiran.filter(k => k.status === 'Bolos').length;
            const totalPertemuan = kehadiran.length;
            const percentage = totalPertemuan === 0 ? 0 : Math.round(((totalHadir + totalSakit + totalIzin) / totalPertemuan) * 100);

            // Calculate Nilai Akhir
            const tps = data.tujuanPembelajaran.find(tp => tp.id) ? data.tujuanPembelajaran.filter(tp => {
              const kls = data.kelas.find(k => k.id === siswa.kelasId);
              return kls && tp.jenjang === kls.jenjang;
            }) : [];

            let sumNilai = 0;
            let sumatifCount = 0;
            let tpDetails: any[] = [];
            
            tps.forEach(tp => {
              const sumatif = data.penilaianSumatif.filter(s => s.siswaId === siswa.id && s.tpId === tp.id && s.semesterId === activeSemester?.id);
              if (sumatif.length > 0) {
                // assume one record per TP for simplicity or avg them
                const s = sumatif[0];
                const bestScore = Math.max(s.nilai, s.nilaiRemedial || 0);
                sumNilai += bestScore;
                sumatifCount++;
                tpDetails.push({ tpName: tp.name, score: bestScore, kktp: tp.kktp });
              }
            });

            const finalGrade = sumatifCount === 0 ? 0 : Math.round(sumNilai / sumatifCount);

            // Notes
            const catatans = data.catatanKognitif?.filter(c => c.siswaId === siswa.id && c.semesterId === activeSemester?.id) || [];

            return (
              <div key={siswa.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-b print:rounded-none">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{siswa.name}</h3>
                        <p className="text-slate-500 text-sm">NISN: {siswa.nisn}</p>
                      </div>
                      <div className="flex gap-4 text-center">
                        <div className="bg-fuchsia-50 p-3 rounded-xl border border-fuchsia-100 min-w-[100px]">
                          <p className="text-xs font-semibold text-fuchsia-600 mb-1">Nilai Akhir</p>
                          <p className="text-2xl font-bold text-fuchsia-700">{finalGrade > 0 ? finalGrade : '-'}</p>
                        </div>
                        <div className={`p-3 rounded-xl border min-w-[100px] ${percentage < 75 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                          <p className={`text-xs font-semibold mb-1 ${percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>Kehadiran</p>
                          <p className={`text-2xl font-bold ${percentage < 75 ? 'text-rose-700' : 'text-emerald-700'}`}>{percentage}%</p>
                          <p className={`text-[10px] mt-1 ${percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>H:{totalHadir} S:{totalSakit} I:{totalIzin} A:{totalAlpa} B:{totalBolos}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          Detail Nilai per TP
                        </h4>
                        <div className="space-y-2">
                          {tpDetails.length > 0 ? tpDetails.map((tp, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                              <span className="text-slate-600 truncate max-w-[200px]" title={tp.tpName}>{tp.tpName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">KKTP {tp.kktp}</span>
                                <span className={`font-bold ${tp.score >= tp.kktp ? 'text-emerald-600' : 'text-rose-600'}`}>{tp.score}</span>
                              </div>
                            </div>
                          )) : (
                            <p className="text-sm text-slate-400 italic">Belum ada nilai yang diinput.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          Catatan Perkembangan
                        </h4>
                        {catatans.length > 0 ? (
                          <div className="space-y-3">
                            {catatans.map(c => {
                              const tpName = data.tujuanPembelajaran.find(t => t.id === c.tpId)?.name || 'Umum';
                              return (
                                <div key={c.id} className="bg-slate-50 p-3 rounded-xl text-sm border border-slate-100">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-semibold text-indigo-600">{tpName}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
                                  </div>
                                  <p className="text-slate-700">{c.catatan}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic">Belum ada catatan anekdot/kognitif.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Tidak ada siswa yang sesuai kriteria pencarian.</p>
          </div>
        )}
      </div>
    </div>
  );
}
