'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { Check, X, Printer, Info, Search, Filter } from 'lucide-react';

export default function StatusNilaiPage() {
  const { data, activeSemester } = useData();
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const filteredSiswa = useMemo(() => {
    return data.siswa.filter(s => 
      (!selectedKelas || s.kelasId === selectedKelas) &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [data.siswa, selectedKelas, searchQuery]);

  const getTPStatus = (siswaId: string, tpId: string) => {
    const tp = data.tujuanPembelajaran.find(t => t.id === tpId);
    if (!tp) return { tuntas: false, score: 0, hasScore: false };

    const sumatif = data.penilaianSumatif.find(s => 
      s.siswaId === siswaId && 
      s.tpId === tpId && 
      s.semesterId === activeSemester?.id
    );

    if (!sumatif) return { tuntas: false, score: 0, hasScore: false };

    const bestScore = Math.max(sumatif.nilai, sumatif.nilaiRemedial || 0);
    return {
      tuntas: bestScore >= tp.kktp,
      score: bestScore,
      hasScore: true
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedSiswaDetail = useMemo(() => {
    if (!showDetail) return null;
    return data.siswa.find(s => s.id === showDetail);
  }, [showDetail, data.siswa]);

  const currentKelasName = useMemo(() => {
    const kelas = data.kelas.find(k => k.id === selectedKelas);
    return kelas ? kelas.name : 'Semua Kelas';
  }, [selectedKelas, data.kelas]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Status Nilai Siswa</h1>
          <p className="text-slate-500">Pantau ketuntasan belajar siswa per Tujuan Pembelajaran</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
        >
          <Printer className="w-4 h-4" />
          Cetak Halaman
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              Pilih Kelas
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
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
              placeholder="Nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-xl font-bold text-center">STATUS KETUNTASAN NILAI SISWA</h1>
        <h2 className="text-lg font-semibold text-center uppercase">{currentKelasName}</h2>
        <p className="text-center text-sm text-slate-500 mt-1">Semester: {activeSemester?.name || '-'}</p>
        <div className="mt-4 border-b-2 border-slate-900"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-0 print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">No</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 sticky left-[52px] bg-slate-50 z-10 border-r border-slate-200 min-w-[200px]">Nama Siswa</th>
                {data.tujuanPembelajaran.map((tp, idx) => (
                  <th key={tp.id} className="px-4 py-4 text-sm font-semibold text-slate-700 text-center min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">TP {idx + 1}</span>
                      <span className="truncate max-w-[100px]" title={tp.name}>{tp.name}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded mt-1">KKTP: {tp.kktp}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSiswa.length > 0 ? (
                filteredSiswa.map((siswa, index) => (
                  <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 sticky left-0 bg-white z-10 border-r border-slate-100">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 sticky left-[52px] bg-white z-10 border-r border-slate-100">
                      <div className="flex flex-col">
                        <span>{siswa.name}</span>
                        <span className="text-xs text-slate-400">{siswa.nisn}</span>
                      </div>
                    </td>
                    {data.tujuanPembelajaran.map((tp) => {
                      const status = getTPStatus(siswa.id, tp.id);
                      return (
                        <td key={tp.id} className="px-4 py-4 text-center">
                          {status.hasScore ? (
                            <div className="flex flex-col items-center gap-1">
                              {status.tuntas ? (
                                <div className="bg-emerald-100 p-1.5 rounded-full print:bg-transparent">
                                  <Check className="w-4 h-4 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="bg-rose-100 p-1.5 rounded-full print:bg-transparent">
                                  <X className="w-4 h-4 text-rose-600" />
                                </div>
                              )}
                              <span className={`text-xs font-bold ${status.tuntas ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {status.score}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center no-print">
                      <button
                        onClick={() => setShowDetail(siswa.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Detail Nilai"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={data.tujuanPembelajaran.length + 3} className="px-6 py-12 text-center text-slate-400">
                    {selectedKelas ? 'Tidak ada data siswa di kelas ini.' : 'Pilih kelas untuk menampilkan data.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedSiswaDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedSiswaDetail.name}</h2>
                <p className="text-indigo-100 text-sm">NISN: {selectedSiswaDetail.nisn}</p>
              </div>
              <button 
                onClick={() => setShowDetail(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <h3 className="font-semibold text-slate-800 mb-4">Detail Capaian Tujuan Pembelajaran</h3>
              <div className="space-y-4">
                {data.tujuanPembelajaran.map((tp, idx) => {
                  const status = getTPStatus(selectedSiswaDetail.id, tp.id);
                  const sumatif = data.penilaianSumatif.find(s => 
                    s.siswaId === selectedSiswaDetail.id && 
                    s.tpId === tp.id && 
                    s.semesterId === activeSemester?.id
                  );
                  const formatif = data.penilaianFormatif.filter(f => 
                    f.siswaId === selectedSiswaDetail.id && 
                    f.tpId === tp.id && 
                    f.semesterId === activeSemester?.id
                  );

                  return (
                    <div key={tp.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase">TP {idx + 1}</span>
                          <h4 className="font-medium text-slate-900">{tp.name}</h4>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${status.tuntas ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {status.tuntas ? 'Tuntas' : 'Belum Tuntas'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block mb-1">Nilai Sumatif</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-800">{status.score || '-'}</span>
                            {sumatif?.nilaiRemedial && (
                              <span className="text-xs text-slate-400 line-through">({sumatif.nilai})</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block mb-1">KKTP</span>
                          <span className="text-lg font-bold text-slate-800">{tp.kktp}</span>
                        </div>
                      </div>

                      {formatif.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Catatan Formatif</span>
                          <div className="flex flex-wrap gap-2">
                            {formatif.map((f, fIdx) => (
                              <div key={f.id} className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-xs">
                                <span className="font-bold text-indigo-600 mr-1">{f.nilai}</span>
                                <span className="text-slate-500">({f.teknik})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetail(null)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-all font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .flex-1 {
            overflow: visible !important;
            height: auto !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #e2e8f0 !important;
            padding: 8px !important;
          }
          th {
            background-color: #f8fafc !important;
          }
          .sticky {
            position: static !important;
          }
          .bg-white {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
}
