'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/lib/data-context';
import { Plus, Trash2, FileText, Edit2, Save, AlertCircle } from 'lucide-react';

export default function PenilaianFormatifPage() {
  const { data, activeSemester, savePenilaianFormatifBatch } = useData();
  
  // Form states
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedTpId, setSelectedTpId] = useState('');
  const [selectedTeknik, setSelectedTeknik] = useState<'Observasi' | 'CATs' | 'Exit Ticket'>('Observasi');
  
  // State for the batch form
  const [formatifData, setFormatifData] = useState<Record<string, { 
    id?: string, 
    nilai: 'SB' | 'B' | 'C' | 'PB', 
    umpanBalik: string, 
    halPenting: string, 
    halBingung: string 
  }>>({});
  const [isDataExists, setIsDataExists] = useState(false);

  // When class, TP, or Teknik changes, load students and existing data
  useEffect(() => {
    if (!selectedKelasId || !selectedTpId || !selectedTeknik || !activeSemester) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormatifData({});
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDataExists(false);
      return;
    }

    const studentsInClass = data.siswa.filter(s => s.kelasId === selectedKelasId);
    const existingRecords = data.penilaianFormatif.filter(p => 
      p.semesterId === activeSemester.id && 
      p.tpId === selectedTpId &&
      p.teknik === selectedTeknik &&
      studentsInClass.some(s => s.id === p.siswaId)
    );

    const newFormatifData: Record<string, any> = {};
    
    studentsInClass.forEach(siswa => {
      const existing = existingRecords.find(p => p.siswaId === siswa.id);
      if (existing) {
        newFormatifData[siswa.id] = {
          id: existing.id,
          nilai: existing.nilai,
          umpanBalik: existing.umpanBalik || '',
          halPenting: existing.halPenting || '',
          halBingung: existing.halBingung || ''
        };
      } else {
        newFormatifData[siswa.id] = {
          nilai: 'B', // Default value
          umpanBalik: '',
          halPenting: '',
          halBingung: ''
        };
      }
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormatifData(newFormatifData);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDataExists(existingRecords.length > 0);
  }, [selectedKelasId, selectedTpId, selectedTeknik, activeSemester, data.siswa, data.penilaianFormatif]);

  const handleNilaiChange = (siswaId: string, nilai: any) => {
    setFormatifData(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], nilai }
    }));
  };

  const handleTextChange = (siswaId: string, field: 'umpanBalik' | 'halPenting' | 'halBingung', value: string) => {
    setFormatifData(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], [field]: value }
    }));
  };

  const handleSave = async () => {
    if (!selectedKelasId || !selectedTpId || !selectedTeknik || !activeSemester) return;
    
    const recordsToSave = Object.entries(formatifData).map(([siswaId, record]) => ({
      id: record.id,
      siswaId,
      tpId: selectedTpId,
      teknik: selectedTeknik,
      nilai: record.nilai,
      umpanBalik: selectedTeknik === 'Observasi' ? record.umpanBalik : null,
      halPenting: selectedTeknik === 'CATs' ? record.halPenting : null,
      halBingung: selectedTeknik === 'CATs' ? record.halBingung : null
    }));

    try {
      await savePenilaianFormatifBatch(recordsToSave);
      alert('Data penilaian formatif berhasil disimpan.');
      setIsDataExists(true);
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
            <FileText className="w-6 h-6 text-purple-500" />
            Input Penilaian Formatif Kolektif
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Semester Aktif: <span className="font-semibold text-purple-600">{activeSemester?.name || 'Belum dipilih'}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                <select
                  value={selectedKelasId}
                  onChange={(e) => setSelectedKelasId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white"
                  required
                >
                  <option value="" disabled>Pilih Kelas</option>
                  {data.kelas.map((k) => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tujuan Pembelajaran</label>
                <select
                  value={selectedTpId}
                  onChange={(e) => setSelectedTpId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white"
                  required
                >
                  <option value="" disabled>Pilih TP</option>
                  {data.tujuanPembelajaran.map((tp) => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teknik Penilaian</label>
                <select
                  value={selectedTeknik}
                  onChange={(e) => setSelectedTeknik(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white"
                  required
                >
                  <option value="Observasi">Observasi</option>
                  <option value="CATs">CATs</option>
                  <option value="Exit Ticket">Exit Ticket</option>
                </select>
              </div>
            </div>
          </div>

          {selectedKelasId && selectedTpId && selectedTeknik && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {isDataExists && (
                <div className="bg-blue-50 border-b border-blue-100 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Data sudah ada</h4>
                    <p className="text-sm text-blue-600 mt-0.5">
                      Penilaian formatif untuk kelas, TP, dan teknik ini sudah pernah disimpan. Anda dapat melihat dan mengubah data di bawah ini, lalu klik Simpan untuk memperbarui.
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
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-auto">Nilai (Rubrik)</th>
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-1/3">Catatan / Umpan Balik</th>
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
                        const record = formatifData[siswa.id] || { nilai: 'B', umpanBalik: '', halPenting: '', halBingung: '' };
                        return (
                          <tr key={siswa.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-500 sticky left-0 bg-white z-10 group-hover:bg-slate-50 transition-colors shadow-[1px_0_0_0_#f1f5f9]">{index + 1}</td>
                            <td className="px-6 py-4 font-medium text-slate-800 sticky left-[64px] bg-white z-10 group-hover:bg-slate-50 transition-colors shadow-[1px_0_0_0_#f1f5f9]">{siswa.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { val: 'SB', label: 'Sangat Berkembang' },
                                  { val: 'B', label: 'Berkembang' },
                                  { val: 'C', label: 'Cukup' },
                                  { val: 'PB', label: 'Perlu Bimbingan' }
                                ].map((n) => (
                                  <label key={n.val} title={n.label} className={`cursor-pointer border rounded-lg px-3 py-1.5 text-sm flex items-center justify-center transition-all ${record.nilai === n.val ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    <input
                                      type="radio"
                                      name={`nilai-${siswa.id}`}
                                      value={n.val}
                                      checked={record.nilai === n.val}
                                      onChange={(e) => handleNilaiChange(siswa.id, e.target.value)}
                                      className="hidden"
                                    />
                                    {n.val}
                                  </label>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 space-y-2">
                              {selectedTeknik === 'Observasi' && (
                                <input
                                  type="text"
                                  value={record.umpanBalik}
                                  onChange={(e) => handleTextChange(siswa.id, 'umpanBalik', e.target.value)}
                                  placeholder="Umpan balik observasi..."
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                                />
                              )}
                              {selectedTeknik === 'CATs' && (
                                <>
                                  <input
                                    type="text"
                                    value={record.halPenting}
                                    onChange={(e) => handleTextChange(siswa.id, 'halPenting', e.target.value)}
                                    placeholder="Hal penting dipelajari..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                                  />
                                  <input
                                    type="text"
                                    value={record.halBingung}
                                    onChange={(e) => handleTextChange(siswa.id, 'halBingung', e.target.value)}
                                    placeholder="Hal yang membingungkan..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                                  />
                                </>
                              )}
                              {selectedTeknik === 'Exit Ticket' && (
                                <span className="text-sm text-slate-400 italic">Tidak ada catatan untuk Exit Ticket</span>
                              )}
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
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
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
