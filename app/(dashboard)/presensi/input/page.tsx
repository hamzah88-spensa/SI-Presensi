'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/lib/data-context';
import { Plus, CheckSquare, Save, AlertCircle } from 'lucide-react';

export default function InputPresensi() {
  const { data, activeSemester, saveKehadiranBatch } = useData();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  
  // State for the batch form
  const [attendanceData, setAttendanceData] = useState<Record<string, { id?: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Bolos', keterangan: string }>>({});
  const [isDataExists, setIsDataExists] = useState(false);

  // When date or class changes, load students and existing data
  useEffect(() => {
    if (!selectedKelasId || !selectedDate || !activeSemester) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAttendanceData({});
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDataExists(false);
      return;
    }

    const studentsInClass = data.siswa.filter(s => s.kelasId === selectedKelasId);
    const existingRecords = data.kehadiran.filter(k => 
      k.semesterId === activeSemester.id && 
      k.date === selectedDate &&
      studentsInClass.some(s => s.id === k.siswaId)
    );

    const newAttendanceData: Record<string, any> = {};
    
    studentsInClass.forEach(siswa => {
      const existing = existingRecords.find(k => k.siswaId === siswa.id);
      if (existing) {
        newAttendanceData[siswa.id] = {
          id: existing.id,
          status: existing.status,
          keterangan: existing.keterangan || ''
        };
      } else {
        newAttendanceData[siswa.id] = {
          status: 'Hadir',
          keterangan: ''
        };
      }
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttendanceData(newAttendanceData);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDataExists(existingRecords.length > 0);
  }, [selectedKelasId, selectedDate, activeSemester, data.siswa, data.kehadiran]);

  const handleStatusChange = (siswaId: string, status: any) => {
    setAttendanceData(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], status }
    }));
  };

  const handleKeteranganChange = (siswaId: string, keterangan: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], keterangan }
    }));
  };

  const handleSave = async () => {
    if (!selectedDate || !selectedKelasId || !activeSemester) return;
    
    const recordsToSave = Object.entries(attendanceData).map(([siswaId, record]) => ({
      id: record.id,
      date: selectedDate,
      siswaId,
      status: record.status,
      keterangan: record.keterangan
    }));

    try {
      await saveKehadiranBatch(recordsToSave);
      alert('Data presensi berhasil disimpan.');
      setIsDataExists(true); // After saving, data exists
    } catch (error) {
      alert('Terjadi kesalahan saat menyimpan data.');
    }
  };

  const studentsInClass = data.siswa.filter(s => s.kelasId === selectedKelasId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            Input Presensi Kolektif
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Semester Aktif: <span className="font-semibold text-indigo-600">{activeSemester?.name || 'Belum dipilih'}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                <select
                  value={selectedKelasId}
                  onChange={(e) => setSelectedKelasId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                  required
                >
                  <option value="" disabled>Pilih Kelas</option>
                  {data.kelas.map((k) => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedKelasId && selectedDate && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {isDataExists && (
                <div className="bg-blue-50 border-b border-blue-100 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Data sudah ada</h4>
                    <p className="text-sm text-blue-600 mt-0.5">
                      Presensi untuk kelas dan tanggal ini sudah pernah disimpan. Anda dapat melihat dan mengubah data di bawah ini, lalu klik Simpan untuk memperbarui.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto pb-4">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-16 sticky left-0 bg-slate-50 z-20 shadow-[1px_0_0_0_#f1f5f9]">No</th>
                      <th className="px-6 py-4 font-medium border-b border-slate-100 min-w-[200px] sticky left-[64px] bg-slate-50 z-20 shadow-[1px_0_0_0_#f1f5f9]">Nama Siswa</th>
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-auto">Status Kehadiran</th>
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-1/3">Catatan Anekdot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsInClass.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                          Belum ada siswa di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      studentsInClass.map((siswa, index) => {
                        const record = attendanceData[siswa.id] || { status: 'Hadir', keterangan: '' };
                        return (
                          <tr key={siswa.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-500 sticky left-0 bg-white z-10 group-hover:bg-slate-50 transition-colors shadow-[1px_0_0_0_#f1f5f9]">{index + 1}</td>
                            <td className="px-6 py-4 font-medium text-slate-800 sticky left-[64px] bg-white z-10 group-hover:bg-slate-50 transition-colors shadow-[1px_0_0_0_#f1f5f9]">{siswa.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {['Hadir', 'Izin', 'Sakit', 'Alpa', 'Bolos'].map((status) => (
                                  <label key={status} className={`cursor-pointer border rounded-lg px-3 py-1.5 text-sm flex items-center justify-center transition-all ${record.status === status ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    <input
                                      type="radio"
                                      name={`status-${siswa.id}`}
                                      value={status}
                                      checked={record.status === status}
                                      onChange={(e) => handleStatusChange(siswa.id, e.target.value)}
                                      className="hidden"
                                    />
                                    {status}
                                  </label>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={record.keterangan}
                                onChange={(e) => handleKeteranganChange(siswa.id, e.target.value)}
                                placeholder="Tambahkan catatan..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Save className="w-5 h-5" />
                    Simpan Presensi
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
