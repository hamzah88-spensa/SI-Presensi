'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, FileText, TrendingUp, AlertCircle } from 'lucide-react';

export default function PerkembanganSiswaPage() {
  const { data, activeSemester } = useData();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState('');

  const filteredSiswa = useMemo(() => {
    if (!selectedKelas) return [];
    return data.siswa.filter(s => s.kelasId === selectedKelas);
  }, [data.siswa, selectedKelas]);

  const chartData = useMemo(() => {
    if (!selectedSiswa || !activeSemester) return [];

    // Menggabungkan nilai formatif dan sumatif berdasarkan TP
    const perkembangan = data.tujuanPembelajaran.map(tp => {
      const sumatif = data.penilaianSumatif.find(s => 
        s.siswaId === selectedSiswa && 
        s.tpId === tp.id && 
        s.semesterId === activeSemester.id
      );

      return {
        name: tp.name.length > 20 ? tp.name.substring(0, 20) + '...' : tp.name,
        fullName: tp.name,
        kktp: tp.kktp,
        nilai: sumatif?.nilai || 0,
        remedial: sumatif?.nilaiRemedial || 0
      };
    });

    return perkembangan;
  }, [selectedSiswa, data.tujuanPembelajaran, data.penilaianSumatif, activeSemester]);

  const presensiSiswa = useMemo(() => {
    if (!selectedSiswa || !activeSemester) return null;
    
    const kehadiran = data.kehadiran.filter(k => k.siswaId === selectedSiswa && k.semesterId === activeSemester.id);
    
    const summary = {
      Hadir: 0,
      Izin: 0,
      Sakit: 0,
      Alpa: 0,
      Bolos: 0
    };
    
    const catatan: Array<{date: string, status: string, keterangan: string}> = [];

    kehadiran.forEach(k => {
      if (summary[k.status] !== undefined) {
        summary[k.status]++;
      }
      if (k.keterangan) {
        catatan.push({
          date: k.date,
          status: k.status,
          keterangan: k.keterangan
        });
      }
    });

    catatan.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { summary, catatan };
  }, [selectedSiswa, activeSemester, data.kehadiran]);

  const catatanFormatif = useMemo(() => {
    if (!selectedSiswa || !activeSemester) return [];
    
    return data.penilaianFormatif
      .filter(f => f.siswaId === selectedSiswa && f.semesterId === activeSemester.id && (f.umpanBalik || f.halPenting || f.halBingung))
      .map(f => {
        const tp = data.tujuanPembelajaran.find(t => t.id === f.tpId);
        return {
          tpName: tp?.name || 'Unknown TP',
          teknik: f.teknik,
          nilai: f.nilai,
          umpanBalik: f.umpanBalik,
          halPenting: f.halPenting,
          halBingung: f.halBingung
        };
      });
  }, [selectedSiswa, activeSemester, data.penilaianFormatif, data.tujuanPembelajaran]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Perkembangan Siswa</h1>
      </div>

      <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
            <select
              value={selectedKelas}
              onChange={(e) => {
                setSelectedKelas(e.target.value);
                setSelectedSiswa('');
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Pilih Kelas --</option>
              {data.kelas.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Siswa</label>
            <select
              value={selectedSiswa}
              onChange={(e) => setSelectedSiswa(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!selectedKelas}
            >
              <option value="">-- Pilih Siswa --</option>
              {filteredSiswa.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedSiswa && chartData.length > 0 && (
          <div className="mt-8 space-y-8">
            {/* Grafik Nilai */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-800">Grafik Perkembangan Nilai Sumatif</h3>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [value, name === 'kktp' ? 'KKTP' : name === 'nilai' ? 'Nilai Sumatif' : 'Nilai Remedial']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return payload[0].payload.fullName;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="kktp" stroke="#ef4444" name="KKTP" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="nilai" stroke="#3b82f6" name="Nilai Sumatif" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="remedial" stroke="#f59e0b" name="Nilai Remedial" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Presensi */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Rekap Kehadiran</h3>
                </div>
                
                {presensiSiswa && (
                  <>
                    <div className="grid grid-cols-5 gap-2 mb-6">
                      <div className="bg-green-50 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-green-600">{presensiSiswa.summary.Hadir}</div>
                        <div className="text-xs text-green-800 font-medium">Hadir</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-600">{presensiSiswa.summary.Izin}</div>
                        <div className="text-xs text-blue-800 font-medium">Izin</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-yellow-600">{presensiSiswa.summary.Sakit}</div>
                        <div className="text-xs text-yellow-800 font-medium">Sakit</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-red-600">{presensiSiswa.summary.Alpa}</div>
                        <div className="text-xs text-red-800 font-medium">Alpa</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-purple-600">{presensiSiswa.summary.Bolos}</div>
                        <div className="text-xs text-purple-800 font-medium">Bolos</div>
                      </div>
                    </div>

                    {presensiSiswa.catatan.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Catatan Kehadiran:</h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                          {presensiSiswa.catatan.map((catatan, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-xl text-sm border border-gray-100">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-gray-800">{new Date(catatan.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  catatan.status === 'Sakit' ? 'bg-yellow-100 text-yellow-800' :
                                  catatan.status === 'Izin' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {catatan.status}
                                </span>
                              </div>
                              <p className="text-gray-600">{catatan.keterangan}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Catatan Anekdot / Formatif */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Catatan Anekdot & Formatif</h3>
                </div>
                
                {catatanFormatif.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {catatanFormatif.map((catatan, idx) => (
                      <div key={idx} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-indigo-900 text-sm">{catatan.tpName}</h4>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium whitespace-nowrap ml-2">
                            Nilai: {catatan.nilai}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {catatan.umpanBalik && (
                            <div>
                              <span className="font-medium text-gray-700">Umpan Balik: </span>
                              <span className="text-gray-600">{catatan.umpanBalik}</span>
                            </div>
                          )}
                          {catatan.halPenting && (
                            <div>
                              <span className="font-medium text-gray-700">Hal Penting: </span>
                              <span className="text-gray-600">{catatan.halPenting}</span>
                            </div>
                          )}
                          {catatan.halBingung && (
                            <div>
                              <span className="font-medium text-gray-700">Hal yang Membingungkan: </span>
                              <span className="text-gray-600">{catatan.halBingung}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Belum ada catatan formatif</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabel Detail Nilai */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Nilai Sumatif & Remedial</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-xl">Tujuan Pembelajaran</th>
                      <th className="px-6 py-3 text-center">KKTP</th>
                      <th className="px-6 py-3 text-center">Nilai Sumatif</th>
                      <th className="px-6 py-3 text-center">Nilai Remedial</th>
                      <th className="px-6 py-3 text-center rounded-tr-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row, index) => {
                      const finalNilai = row.remedial > 0 ? row.remedial : row.nilai;
                      const isTuntas = finalNilai >= row.kktp;
                      
                      return (
                        <tr key={index} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {row.fullName}
                          </td>
                          <td className="px-6 py-4 text-center text-red-600 font-semibold">{row.kktp}</td>
                          <td className="px-6 py-4 text-center font-semibold">{row.nilai || '-'}</td>
                          <td className="px-6 py-4 text-center font-semibold text-yellow-600">{row.remedial || '-'}</td>
                          <td className="px-6 py-4 text-center">
                            {row.nilai > 0 ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isTuntas ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {isTuntas ? 'Tuntas' : 'Belum Tuntas'}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Belum dinilai</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
