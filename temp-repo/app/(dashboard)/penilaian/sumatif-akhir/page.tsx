'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/lib/data-context';
import { FileText, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SumatifAkhirPage() {
  const { data, activeSemester, saveSumatifAkhirBatch } = useData();
  
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [sumatifData, setSumatifData] = useState<Record<string, { id?: string, nilai: number | '' }>>({});
  const [isDataExists, setIsDataExists] = useState(false);

  useEffect(() => {
    if (!selectedKelasId || !activeSemester) {
      setSumatifData({});
      setIsDataExists(false);
      return;
    }

    const studentsInClass = data.siswa?.filter((s: any) => s.kelasId === selectedKelasId) || [];
    const existingRecords = data.sumatifAkhir?.filter((p: any) => 
      p.semesterId === activeSemester.id && 
      studentsInClass.some((s: any) => s.id === p.siswaId)
    ) || [];

    const newSumatifData: Record<string, any> = {};
    
    studentsInClass.forEach((siswa: any) => {
      const existing = existingRecords.find((p: any) => p.siswaId === siswa.id);
      if (existing) {
        newSumatifData[siswa.id] = {
          id: existing.id,
          nilai: existing.nilai,
        };
      } else {
        newSumatifData[siswa.id] = {
          nilai: '',
        };
      }
    });

    setSumatifData(newSumatifData);
    setIsDataExists(existingRecords.length > 0);
  }, [selectedKelasId, activeSemester, data.siswa, data.sumatifAkhir]);

  const handleNilaiChange = (siswaId: string, value: string) => {
    setSumatifData(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], nilai: value === '' ? '' : Number(value) }
    }));
  };

  const handleSave = async () => {
    if (!selectedKelasId || !activeSemester) return;
    
    const recordsToSave = Object.entries(sumatifData)
      .filter(([siswaId, record]) => record.nilai !== '')
      .map(([siswaId, record]) => ({
        id: record.id,
        siswaId,
        semesterId: activeSemester.id,
        nilai: Number(record.nilai)
      }));

    if (recordsToSave.length === 0) {
      toast.info('Tidak ada data nilai untuk disimpan.');
      return;
    }

    try {
      await saveSumatifAkhirBatch(recordsToSave);
      toast.success('Data sumatif akhir semester berhasil disimpan.');
      setIsDataExists(true);
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan data.');
    }
  };

  const studentsInClass = data.siswa?.filter((s: any) => s.kelasId === selectedKelasId) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-pink-500" />
            Input Sumatif Akhir Semester
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Semester Aktif: <span className="font-semibold text-pink-600">{activeSemester?.name || 'Belum dipilih'}</span>
          </p>
        </div>
      </div>

      {!activeSemester ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl text-center">
          Silakan pilih semester aktif terlebih dahulu di menu Data Semester atau di pojok kanan atas.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Kelas</label>
              <select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-white"
                required
              >
                <option value="" disabled>Pilih Kelas</option>
                {data.kelas?.map((k: any) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedKelasId && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {isDataExists && (
                <div className="bg-blue-50 border-b border-blue-100 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Data sudah ada</h4>
                    <p className="text-sm text-blue-600 mt-0.5">
                      Nilai sumatif akhir semester untuk kelas ini sudah pernah disimpan.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto pb-4">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-16">No</th>
                      <th className="px-6 py-4 font-medium border-b border-slate-100">Nama Siswa</th>
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-48 text-center">Nilai Sumatif Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsInClass.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                          Belum ada siswa di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      studentsInClass.map((siswa: any, index: number) => {
                        const record = sumatifData[siswa.id] || { nilai: '' };
                        
                        return (
                          <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                            <td className="px-6 py-4 font-medium text-slate-800">{siswa.name}</td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={record.nilai}
                                onChange={(e) => handleNilaiChange(siswa.id, e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm text-center"
                                placeholder="0-100"
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              {studentsInClass.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Save className="w-5 h-5" />
                    Simpan Penilaian
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
