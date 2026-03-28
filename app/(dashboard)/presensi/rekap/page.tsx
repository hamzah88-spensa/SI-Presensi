'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { X, Printer } from 'lucide-react';

export default function RekapPresensiPage() {
  const { data, activeSemester } = useData();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<string | null>(null);

  const filteredSiswa = useMemo(() => {
    if (!selectedKelas) return [];
    return data.siswa.filter(s => s.kelasId === selectedKelas);
  }, [data.siswa, selectedKelas]);

  const rekapData = useMemo(() => {
    if (!selectedKelas || !startDate || !endDate || !activeSemester) return [];

    return filteredSiswa.map(siswa => {
      const kehadiranSiswa = data.kehadiran.filter(k => 
        k.siswaId === siswa.id && 
        k.semesterId === activeSemester.id &&
        k.date >= startDate &&
        k.date <= endDate
      );

      const rekap = {
        Hadir: 0,
        Izin: 0,
        Sakit: 0,
        Alpa: 0,
        Bolos: 0
      };

      kehadiranSiswa.forEach(k => {
        if (rekap[k.status] !== undefined) {
          rekap[k.status]++;
        }
      });

      return {
        ...siswa,
        rekap
      };
    });
  }, [filteredSiswa, data.kehadiran, selectedKelas, startDate, endDate, activeSemester]);

  const studentDetail = useMemo(() => {
    if (!selectedStudentDetail) return null;
    const student = data.siswa.find(s => s.id === selectedStudentDetail);
    if (!student) return null;

    const attendance = data.kehadiran.filter(k => 
      k.siswaId === student.id && 
      k.semesterId === activeSemester?.id &&
      k.date >= startDate &&
      k.date <= endDate
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const formative = data.penilaianFormatif.filter(f => 
      f.siswaId === student.id && 
      f.semesterId === activeSemester?.id
    );

    // Get rekap for this specific student
    const rekap = rekapData.find(r => r.id === student.id)?.rekap || {
      Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0, Bolos: 0
    };

    return { student, attendance, formative, rekap };
  }, [selectedStudentDetail, data, activeSemester, startDate, endDate, rekapData]);

  return (
    <div className="space-y-6 no-print">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Rekap Presensi</h1>
      </div>

      <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {selectedKelas && startDate && endDate && (
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-sm text-left text-gray-500 min-w-max">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 sticky left-0 bg-gray-50 z-10">Nama Siswa</th>
                  <th className="px-6 py-3 text-center">Hadir</th>
                  <th className="px-6 py-3 text-center">Sakit</th>
                  <th className="px-6 py-3 text-center">Izin</th>
                  <th className="px-6 py-3 text-center">Alpa</th>
                  <th className="px-6 py-3 text-center">Bolos</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rekapData.map((row, index) => (
                  <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white z-10">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-center text-green-600 font-semibold">{row.rekap.Hadir}</td>
                    <td className="px-6 py-4 text-center text-blue-600 font-semibold">{row.rekap.Sakit}</td>
                    <td className="px-6 py-4 text-center text-yellow-600 font-semibold">{row.rekap.Izin}</td>
                    <td className="px-6 py-4 text-center text-red-600 font-semibold">{row.rekap.Alpa}</td>
                    <td className="px-6 py-4 text-center text-purple-600 font-semibold">{row.rekap.Bolos}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedStudentDetail(row.id)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-xs font-medium shadow-sm"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
                {rekapData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data presensi untuk rentang tanggal ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Siswa */}
      {selectedStudentDetail && studentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <h2 className="text-xl font-bold">Detail Monitoring: {studentDetail.student.name}</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium no-print"
                >
                  <Printer className="w-4 h-4" />
                  Cetak
                </button>
                <button onClick={() => setSelectedStudentDetail(null)} className="text-white/80 hover:text-white transition-colors no-print">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* Detail Rekap Presensi */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Detail Rekap Presensi</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                    <div className="text-sm text-green-600 font-medium mb-1">Hadir</div>
                    <div className="text-2xl font-bold text-green-700">{studentDetail.rekap.Hadir}</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <div className="text-sm text-blue-600 font-medium mb-1">Sakit</div>
                    <div className="text-2xl font-bold text-blue-700">{studentDetail.rekap.Sakit}</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center">
                    <div className="text-sm text-yellow-600 font-medium mb-1">Izin</div>
                    <div className="text-2xl font-bold text-yellow-700">{studentDetail.rekap.Izin}</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                    <div className="text-sm text-red-600 font-medium mb-1">Alpa</div>
                    <div className="text-2xl font-bold text-red-700">{studentDetail.rekap.Alpa}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                    <div className="text-sm text-purple-600 font-medium mb-1">Bolos</div>
                    <div className="text-2xl font-bold text-purple-700">{studentDetail.rekap.Bolos}</div>
                  </div>
                </div>
              </div>

              {/* Attendance Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Detail Kehadiran & Catatan Individu</h3>
                {studentDetail.attendance.length > 0 ? (
                  <div className="space-y-3">
                    {studentDetail.attendance.map(k => (
                      <div key={k.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-700">{new Date(k.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            k.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                            k.status === 'Sakit' ? 'bg-blue-100 text-blue-700' :
                            k.status === 'Izin' ? 'bg-yellow-100 text-yellow-700' :
                            k.status === 'Alpa' ? 'bg-red-100 text-red-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>{k.status}</span>
                        </div>
                        {k.keterangan && (
                          <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <span className="font-semibold block mb-1 text-gray-700">Catatan Individu:</span>
                            {k.keterangan}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">Tidak ada data kehadiran pada rentang tanggal ini.</p>
                )}
              </div>

              {/* Anecdotal Notes / Formative */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Catatan Anekdot (Penilaian Formatif)</h3>
                {studentDetail.formative.filter(f => f.umpanBalik || f.halPenting || f.halBingung).length > 0 ? (
                  <div className="space-y-3">
                    {studentDetail.formative.map(f => {
                      const tp = data.tujuanPembelajaran.find(t => t.id === f.tpId);
                      if (!f.umpanBalik && !f.halPenting && !f.halBingung) return null;
                      return (
                        <div key={f.id} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                          <div className="font-medium text-indigo-900 mb-3 pb-2 border-b border-indigo-100/50">{tp?.name || 'TP Tidak Diketahui'} - {f.teknik}</div>
                          <div className="space-y-3 text-sm">
                            {f.umpanBalik && (
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Umpan Balik:</span> 
                                <div className="bg-white p-2 rounded-lg border border-indigo-50 text-gray-600">{f.umpanBalik}</div>
                              </div>
                            )}
                            {f.halPenting && (
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Hal Penting:</span> 
                                <div className="bg-white p-2 rounded-lg border border-indigo-50 text-gray-600">{f.halPenting}</div>
                              </div>
                            )}
                            {f.halBingung && (
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Hal yang Membingungkan:</span> 
                                <div className="bg-white p-2 rounded-lg border border-indigo-50 text-gray-600">{f.halBingung}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">Tidak ada catatan anekdot/formatif untuk semester ini.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide layout elements */
          aside, nav, header, .sidebar, .topbar {
            display: none !important;
          }
          /* Reset modal positioning for print */
          .fixed.inset-0 {
            position: relative !important;
            background: white !important;
            padding: 0 !important;
            display: block !important;
          }
          .bg-white.rounded-2xl {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .overflow-y-auto {
            overflow: visible !important;
            max-height: none !important;
          }
          .flex-1 {
            overflow: visible !important;
          }
          /* Ensure text colors are visible */
          .text-white {
            color: black !important;
          }
          .bg-gradient-to-r {
            background: none !important;
            border-bottom: 2px solid #eee !important;
          }
          .text-white h2 {
            color: black !important;
          }
          /* Grid adjustments for print */
          .grid {
            display: block !important;
          }
          .grid > div {
            margin-bottom: 1rem !important;
            width: 100% !important;
          }
          .md\:grid-cols-5 {
            display: grid !important;
            grid-template-columns: repeat(5, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
