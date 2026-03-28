'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { Eye, X, AlertCircle } from 'lucide-react';

export default function RekapPenilaianPage() {
  const { data, activeSemester } = useData();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedTP, setSelectedTP] = useState('');
  const [detailSiswa, setDetailSiswa] = useState<any | null>(null);

  const filteredSiswa = useMemo(() => {
    if (!selectedKelas) return [];
    return data.siswa.filter(s => s.kelasId === selectedKelas);
  }, [data.siswa, selectedKelas]);

  const rekapData = useMemo(() => {
    if (!selectedKelas || !selectedTP || !activeSemester) return [];

    return filteredSiswa.map(siswa => {
      const formatifSiswa = data.penilaianFormatif.filter(f => 
        f.siswaId === siswa.id && 
        f.semesterId === activeSemester.id &&
        f.tpId === selectedTP
      );

      const sumatifSiswa = data.penilaianSumatif.filter(s => 
        s.siswaId === siswa.id && 
        s.semesterId === activeSemester.id &&
        s.tpId === selectedTP
      );

      return {
        ...siswa,
        formatif: formatifSiswa,
        sumatif: sumatifSiswa
      };
    });
  }, [filteredSiswa, data.penilaianFormatif, data.penilaianSumatif, selectedKelas, selectedTP, activeSemester]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Rekap Penilaian</h1>
      </div>

      <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Pilih Kelas --</option>
              {data.kelas.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tujuan Pembelajaran</label>
            <select
              value={selectedTP}
              onChange={(e) => setSelectedTP(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!selectedKelas}
            >
              <option value="">-- Pilih TP --</option>
              {data.tujuanPembelajaran.map(tp => (
                <option key={tp.id} value={tp.id}>{tp.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedKelas && selectedTP && (
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-sm text-left text-gray-500 min-w-max">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Nama Siswa</th>
                  <th className="px-6 py-3">Nilai Formatif</th>
                  <th className="px-6 py-3">Nilai Sumatif</th>
                  <th className="px-6 py-3">Remedial</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rekapData.map((row) => (
                  <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-6 py-4">
                      {row.formatif.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.formatif.map(f => (
                            <span key={f.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {f.nilai} ({f.teknik})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Belum ada nilai</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {row.sumatif.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.sumatif.map(s => (
                            <span key={s.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {s.nilai} ({s.teknik})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Belum ada nilai</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {row.sumatif.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.sumatif.map(s => (
                            s.nilaiRemedial ? (
                              <span key={s.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {s.nilaiRemedial} ({s.teknik})
                              </span>
                            ) : null
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setDetailSiswa(row)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors inline-flex items-center gap-2"
                        title="Lihat Detail"
                      >
                        <Eye className="w-5 h-5" />
                        <span className="text-sm font-medium">Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {rekapData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data siswa untuk kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailSiswa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Detail Penilaian Siswa</h2>
                <p className="text-sm text-slate-500 mt-1">{detailSiswa.name} - {data.kelas.find(k => k.id === detailSiswa.kelasId)?.name}</p>
              </div>
              <button
                onClick={() => setDetailSiswa(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Formatif Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Penilaian Formatif</h3>
                {detailSiswa.formatif.length > 0 ? (
                  <div className="space-y-4">
                    {detailSiswa.formatif.map((f: any) => (
                      <div key={f.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-slate-700">Teknik: {f.teknik}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Nilai: {f.nilai}
                          </span>
                        </div>
                        {f.umpanBalik && <p className="text-sm text-slate-600 mt-1"><span className="font-medium">Umpan Balik:</span> {f.umpanBalik}</p>}
                        {f.halPenting && <p className="text-sm text-slate-600 mt-1"><span className="font-medium">Hal Penting:</span> {f.halPenting}</p>}
                        {f.halBingung && <p className="text-sm text-slate-600 mt-1"><span className="font-medium">Hal Membingungkan:</span> {f.halBingung}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Belum ada data penilaian formatif.</p>
                )}
              </div>

              {/* Sumatif Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Penilaian Sumatif</h3>
                {detailSiswa.sumatif.length > 0 ? (
                  <div className="space-y-4">
                    {detailSiswa.sumatif.map((s: any) => {
                      const isTertulis = s.teknik === 'Tes Tertulis';
                      const hasDetail = isTertulis && s.jumlahSoal > 0 && Array.isArray(s.bobotSoal) && Array.isArray(s.skorDetail);
                      
                      let recommendations: string[] = [];
                      let isSusulan = false;

                      if (hasDetail) {
                        let emptyCount = 0;
                        if (s.skorDetail.length === 0) {
                          isSusulan = true;
                        } else {
                          s.skorDetail.forEach((skor: any, idx: number) => {
                            if (skor === '' || skor === null) {
                              emptyCount++;
                            } else {
                              const bobot = s.bobotSoal[idx] || 0;
                              const threshold = bobot * 0.75;
                              if (Number(skor) < threshold) {
                                recommendations.push(`Soal No. ${idx + 1}`);
                              }
                            }
                          });
                          if (emptyCount === s.jumlahSoal) {
                            isSusulan = true;
                          }
                        }
                      }

                      return (
                        <div key={s.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-medium text-slate-700">Teknik: {s.teknik}</span>
                            <div className="flex gap-2">
                              {s.nilaiRemedial && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Remedial: {s.nilaiRemedial}
                                </span>
                              )}
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Nilai Akhir: {s.nilai}
                              </span>
                            </div>
                          </div>
                          
                          {hasDetail && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-slate-700 mb-2">Detail Skor per Soal:</h4>
                              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 mb-4">
                                {s.skorDetail.map((skor: any, idx: number) => {
                                  const bobot = s.bobotSoal[idx] || 0;
                                  const isBelowThreshold = skor !== '' && skor !== null && Number(skor) < (bobot * 0.75);
                                  return (
                                    <div key={idx} className={`p-2 rounded-lg border text-center ${isBelowThreshold ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                                      <div className="text-xs text-slate-500 mb-1">No. {idx + 1}</div>
                                      <div className={`font-semibold text-sm ${isBelowThreshold ? 'text-red-700' : 'text-slate-800'}`}>
                                        {skor === '' || skor === null ? '-' : skor}
                                        <span className="text-xs text-slate-400 font-normal ml-1">/{bobot}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {isSusulan ? (
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
                                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                  <div>
                                    <h5 className="text-sm font-semibold text-amber-800">Rekomendasi: Ujian Susulan</h5>
                                    <p className="text-xs text-amber-700 mt-0.5">Siswa belum memiliki nilai untuk soal manapun pada TP ini.</p>
                                  </div>
                                </div>
                              ) : recommendations.length > 0 ? (
                                <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2">
                                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                  <div>
                                    <h5 className="text-sm font-semibold text-red-800">Rekomendasi Remedial:</h5>
                                    <p className="text-xs text-red-700 mt-0.5">
                                      Siswa perlu mengulang atau diberikan pendalaman materi pada: <span className="font-medium">{recommendations.join(', ')}</span> (Skor &lt; 75% dari bobot).
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-start gap-2">
                                  <AlertCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                  <div>
                                    <h5 className="text-sm font-semibold text-green-800">Tuntas</h5>
                                    <p className="text-xs text-green-700 mt-0.5">Siswa telah mencapai standar pada semua soal.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Belum ada data penilaian sumatif.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setDetailSiswa(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
