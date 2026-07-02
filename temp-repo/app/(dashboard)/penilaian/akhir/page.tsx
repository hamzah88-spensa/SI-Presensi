'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { Download, Search, Filter, FilterIcon, Users, CalendarDays, BookOpen, AlertCircle } from 'lucide-react';

export default function NilaiAkhirPage() {
  const { data, activeSemester } = useData();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSiswaDetail, setSelectedSiswaDetail] = useState<any>(null);

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

  const openSiswaDetail = (siswaInfo: any) => {
    setSelectedSiswaDetail(siswaInfo);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 print:hidden">
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
      <div className="hidden print:block mb-6 pt-4">
        <h1 className="text-xl font-bold text-center text-slate-900">Data Nilai Akhir kelas {currentKelasName !== 'Semua Kelas' ? currentKelasName : 'Semua'}</h1>
        <p className="text-center text-sm text-slate-500 mt-1">Semester: {activeSemester?.name || '-'}</p>
        <div className="mt-4 border-b-2 border-slate-900"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-0 print:shadow-none">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 print:bg-transparent">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 w-16 border-r border-slate-200 text-center print:border-slate-300">No</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 border-r border-slate-200 min-w-[200px] print:border-slate-300">Nama Siswa</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 w-32 border-r border-slate-200 text-center print:border-slate-300">Nilai Akhir</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 w-32 border-r border-slate-200 text-center print:border-slate-300">% Kehadiran</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 border-r border-slate-200 min-w-[250px] text-center print:border-slate-300">Status Lulus/Tidak Lulus per TP</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 w-24 text-center print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-300">
              {filteredSiswa.length > 0 ? (
                filteredSiswa.map((siswa, idx) => {
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
                      const s = sumatif[0];
                      const bestScore = Math.max(s.nilai, s.nilaiRemedial || 0);
                      sumNilai += bestScore;
                      sumatifCount++;
                      tpDetails.push({ tpName: tp.name, score: bestScore, kktp: tp.kktp, tuntas: bestScore >= tp.kktp, hasNilai: true, isRemedial: !!s.nilaiRemedial && s.nilaiRemedial >= Math.max(tp.kktp, s.nilai) });
                    } else {
                      tpDetails.push({ tpName: tp.name, score: 0, kktp: tp.kktp, tuntas: false, hasNilai: false, isRemedial: false });
                    }
                  });

                  const finalGrade = sumatifCount === 0 ? 0 : Math.round(sumNilai / sumatifCount);

                  // Notes
                  const catatans = data.catatanKognitif?.filter(c => c.siswaId === siswa.id && c.semesterId === activeSemester?.id) || [];

                  const siswaInfo = {
                    siswa,
                    percentage,
                    totalHadir, totalSakit, totalIzin, totalAlpa, totalBolos,
                    finalGrade,
                    tpDetails,
                    catatans
                  };

                  return (
                    <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-100 text-center">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm border-r border-slate-100">
                        <div className="font-medium text-slate-900">{siswa.name}</div>
                        <div className="text-xs text-slate-400">{siswa.nisn}</div>
                      </td>
                      <td className="px-6 py-4 text-center border-r border-slate-100">
                        <span className="font-bold text-lg text-slate-700">{finalGrade > 0 ? finalGrade : '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center border-r border-slate-100">
                        <span className={`font-bold ${percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-100">
                        <div className="flex flex-col gap-1 items-center">
                          {tpDetails.length > 0 ? tpDetails.map((td, i) => (
                            <div key={i} className="flex justify-between items-center w-full max-w-[200px] text-xs">
                              <span className="truncate mr-2 text-slate-600" title={td.tpName}>TP {i+1}</span>
                              <span className={`px-2 py-0.5 rounded font-medium ${!td.hasNilai ? 'bg-slate-100 text-slate-500' : td.tuntas ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {!td.hasNilai ? 'Belum Dinilai' : td.tuntas ? (td.isRemedial ? 'Lulus (Remedial)' : 'Lulus') : 'Tidak Lulus'}
                              </span>
                            </div>
                          )) : (
                            <span className="text-xs text-slate-400 italic">Belum ada data</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center print:hidden">
                        <button
                          onClick={() => openSiswaDetail(siswaInfo)}
                          className="px-3 py-1.5 bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    Tidak ada siswa yang sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailModalOpen && selectedSiswaDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedSiswaDetail.siswa.name}</h3>
                <p className="text-sm text-slate-500">NISN: {selectedSiswaDetail.siswa.nisn}</p>
              </div>
              <button 
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                Tutup
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-fuchsia-50 p-4 rounded-xl border border-fuchsia-100 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-fuchsia-600 mb-1">Nilai Akhir</p>
                  <p className="text-3xl font-bold text-fuchsia-700">{selectedSiswaDetail.finalGrade > 0 ? selectedSiswaDetail.finalGrade : '-'}</p>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${selectedSiswaDetail.percentage < 75 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <p className={`text-sm font-semibold mb-1 ${selectedSiswaDetail.percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>Kehadiran</p>
                  <p className={`text-3xl font-bold ${selectedSiswaDetail.percentage < 75 ? 'text-rose-700' : 'text-emerald-700'}`}>{selectedSiswaDetail.percentage}%</p>
                </div>
              </div>

              {/* Rincian Kehadiran */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm border-b pb-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  Rincian Kehadiran
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center text-sm">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><div className="font-bold text-emerald-600">{selectedSiswaDetail.totalHadir}</div><div className="text-xs text-slate-500 mt-1">Hadir</div></div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><div className="font-bold text-blue-600">{selectedSiswaDetail.totalIzin}</div><div className="text-xs text-slate-500 mt-1">Izin</div></div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><div className="font-bold text-amber-600">{selectedSiswaDetail.totalSakit}</div><div className="text-xs text-slate-500 mt-1">Sakit</div></div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><div className="font-bold text-rose-600">{selectedSiswaDetail.totalAlpa}</div><div className="text-xs text-slate-500 mt-1">Alpa</div></div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><div className="font-bold text-purple-600">{selectedSiswaDetail.totalBolos}</div><div className="text-xs text-slate-500 mt-1">Bolos</div></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm border-b pb-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    Detail Nilai per TP
                  </h4>
                  <div className="space-y-2">
                    {selectedSiswaDetail.tpDetails.length > 0 ? selectedSiswaDetail.tpDetails.map((tp: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-slate-700 w-2/3 leading-snug">{tp.tpName}</span>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            {tp.isRemedial && <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[10px] font-bold">R</span>}
                            <span className={`font-bold text-lg ${!tp.hasNilai ? 'text-slate-400 text-sm' : tp.tuntas ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {!tp.hasNilai ? '-' : tp.score}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">KKTP {tp.kktp}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-400 italic">Belum ada nilai yang diinput.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm border-b pb-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    Catatan Perkembangan (Anekdot)
                  </h4>
                  {selectedSiswaDetail.catatans.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSiswaDetail.catatans.map((c: any) => {
                        const tpName = data.tujuanPembelajaran.find(t => t.id === c.tpId)?.name || 'Umum';
                        return (
                          <div key={c.id} className="bg-slate-50 p-3 rounded-xl text-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[11px] font-semibold text-indigo-600 max-w-[70%]">{tpName}</span>
                              <span className="text-[10px] bg-white px-2 py-1 rounded text-slate-500 border border-slate-200">{new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{c.catatan}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Belum ada catatan anekdot/kognitif yang dimasukkan.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
