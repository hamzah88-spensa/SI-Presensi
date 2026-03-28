'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/lib/data-context';
import { Plus, Trash2, FileText, Edit2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PenilaianSumatifPage() {
  const { data, activeSemester, savePenilaianSumatifBatch } = useData();
  
  // Form states
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedTpId, setSelectedTpId] = useState('');
  const [selectedTeknik, setSelectedTeknik] = useState<'Tes Tertulis' | 'Kinerja' | 'Proyek'>('Tes Tertulis');
  
  // Additional states for "Tes Tertulis"
  const [jumlahSoal, setJumlahSoal] = useState<number>(0);
  const [bobotSoal, setBobotSoal] = useState<number[]>([]);
  const [skorSiswa, setSkorSiswa] = useState<Record<string, (number | '')[]>>({});

  // State for the batch form
  const [sumatifData, setSumatifData] = useState<Record<string, { 
    id?: string, 
    nilai: number | '',
    nilaiRemedial?: number | ''
  }>>({});
  const [isDataExists, setIsDataExists] = useState(false);

  // When class, TP, or Teknik changes, load students and existing data
  useEffect(() => {
    if (!selectedKelasId || !selectedTpId || !selectedTeknik || !activeSemester) {
      setTimeout(() => {
        setSumatifData({});
        setIsDataExists(false);
      }, 0);
      return;
    }

    const studentsInClass = data.siswa.filter(s => s.kelasId === selectedKelasId);
    const existingRecords = data.penilaianSumatif.filter(p => 
      p.semesterId === activeSemester.id && 
      p.tpId === selectedTpId &&
      p.teknik === selectedTeknik &&
      studentsInClass.some(s => s.id === p.siswaId)
    );

    const newSumatifData: Record<string, any> = {};
    let loadedJumlahSoal = 0;
    let loadedBobotSoal: number[] = [];
    const loadedSkorSiswa: Record<string, (number | '')[]> = {};
    
    studentsInClass.forEach(siswa => {
      const existing = existingRecords.find(p => p.siswaId === siswa.id);
      if (existing) {
        newSumatifData[siswa.id] = {
          id: existing.id,
          nilai: existing.nilai,
          nilaiRemedial: existing.nilaiRemedial ?? ''
        };
        if (existing.jumlahSoal !== undefined && existing.jumlahSoal !== null && existing.jumlahSoal > 0) {
          loadedJumlahSoal = existing.jumlahSoal;
        }
        if (existing.bobotSoal && Array.isArray(existing.bobotSoal)) {
          loadedBobotSoal = existing.bobotSoal;
        }
        if (existing.skorDetail && Array.isArray(existing.skorDetail)) {
          loadedSkorSiswa[siswa.id] = existing.skorDetail;
        }
      } else {
        newSumatifData[siswa.id] = {
          nilai: '',
          nilaiRemedial: ''
        };
      }
    });

    setTimeout(() => {
      setSumatifData(newSumatifData);
      setIsDataExists(existingRecords.length > 0);
      
      if (existingRecords.length > 0 && selectedTeknik === 'Tes Tertulis') {
        if (loadedJumlahSoal > 0) {
          setJumlahSoal(loadedJumlahSoal);
        }
        if (loadedBobotSoal.length > 0) {
          setBobotSoal(loadedBobotSoal);
        }
        if (Object.keys(loadedSkorSiswa).length > 0) {
          setSkorSiswa(loadedSkorSiswa);
        } else if (loadedJumlahSoal > 0) {
          // Initialize empty scores if not present
          const emptySkor: Record<string, (number | '')[]> = {};
          studentsInClass.forEach(s => {
            emptySkor[s.id] = Array(loadedJumlahSoal).fill('');
          });
          setSkorSiswa(emptySkor);
        }
      } else {
        setJumlahSoal(0);
        setBobotSoal([]);
        setSkorSiswa({});
      }
    }, 0);
  }, [selectedKelasId, selectedTpId, selectedTeknik, activeSemester, data.siswa, data.penilaianSumatif]);

  const handleJumlahSoalChange = (val: string) => {
    const num = parseInt(val) || 0;
    if (num < 0 || num > 50) return;
    setJumlahSoal(num);
    
    setBobotSoal(prev => {
      const newBobot = [...prev];
      if (num > prev.length) {
        for (let i = prev.length; i < num; i++) newBobot.push(10);
      } else {
        newBobot.length = num;
      }
      return newBobot;
    });

    setSkorSiswa(prev => {
      const newSkor = { ...prev };
      data.siswa.filter(s => s.kelasId === selectedKelasId).forEach(s => {
        const currentSkor = newSkor[s.id] || [];
        if (num > currentSkor.length) {
          for (let i = currentSkor.length; i < num; i++) currentSkor.push('');
        } else {
          currentSkor.length = num;
        }
        newSkor[s.id] = currentSkor;
      });
      return newSkor;
    });
  };

  const handleBobotChange = (index: number, val: string) => {
    const num = parseInt(val) || 0;
    setBobotSoal(prev => {
      const newBobot = [...prev];
      newBobot[index] = num;
      return newBobot;
    });
  };

  const handleSkorChange = (siswaId: string, index: number, val: string) => {
    const num = val === '' ? '' : Number(val);
    setSkorSiswa(prev => {
      const newSkor = { ...prev };
      if (!newSkor[siswaId]) newSkor[siswaId] = Array(jumlahSoal).fill('');
      newSkor[siswaId][index] = num;
      return newSkor;
    });
  };

  // Effect to calculate final score for Tes Tertulis
  useEffect(() => {
    if (selectedTeknik !== 'Tes Tertulis' || jumlahSoal === 0) return;
    
    const totalBobot = bobotSoal.reduce((acc, curr) => acc + (curr || 0), 0);
    if (totalBobot === 0) return;

    setTimeout(() => {
      setSumatifData(prev => {
        const newData = { ...prev };
        let hasChanges = false;
        
        data.siswa.filter(s => s.kelasId === selectedKelasId).forEach(siswa => {
          const skorArray = skorSiswa[siswa.id] || [];
          let totalSkor = 0;
          let hasInput = false;
          
          skorArray.forEach((skor) => {
            if (skor !== '') {
              hasInput = true;
              totalSkor += Number(skor);
            }
          });

          if (hasInput) {
            const finalScore = Math.round((totalSkor / totalBobot) * 100);
            if (newData[siswa.id]?.nilai !== finalScore) {
              newData[siswa.id] = { ...newData[siswa.id], nilai: finalScore };
              hasChanges = true;
            }
          } else {
            if (newData[siswa.id]?.nilai !== '') {
              newData[siswa.id] = { ...newData[siswa.id], nilai: '' };
              hasChanges = true;
            }
          }
        });
        
        return hasChanges ? newData : prev;
      });
    }, 0);
  }, [skorSiswa, bobotSoal, selectedTeknik, jumlahSoal, selectedKelasId, data.siswa]);

  const handleNilaiChange = (siswaId: string, field: 'nilai' | 'nilaiRemedial', value: string) => {
    setSumatifData(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], [field]: value === '' ? '' : Number(value) }
    }));
  };

  const handleSave = async () => {
    if (!selectedKelasId || !selectedTpId || !selectedTeknik || !activeSemester) return;
    
    const recordsToSave = Object.entries(sumatifData)
      .filter(([siswaId, record]) => {
        // 1. Only save if nilai is filled
        if (record.nilai === '') return false;

        // 2. Find existing record to compare
        const existing = data.penilaianSumatif.find(p => 
          p.siswaId === siswaId && 
          p.tpId === selectedTpId && 
          p.semesterId === activeSemester.id &&
          p.teknik === selectedTeknik
        );

        // 3. If no existing record, it's new - save it
        if (!existing) return true;

        // 4. If existing, check if any field has changed
        const hasNilaiChanged = Number(record.nilai) !== existing.nilai;
        const hasRemedialChanged = (record.nilaiRemedial !== '' ? Number(record.nilaiRemedial) : null) !== (existing.nilaiRemedial ?? null);
        
        let hasDetailChanged = false;
        if (selectedTeknik === 'Tes Tertulis') {
          const hasJumlahChanged = (jumlahSoal || null) !== (existing.jumlahSoal ?? null);
          const hasBobotChanged = JSON.stringify(bobotSoal) !== JSON.stringify(existing.bobotSoal || []);
          const hasSkorChanged = JSON.stringify(skorSiswa[siswaId] || []) !== JSON.stringify(existing.skorDetail || []);
          hasDetailChanged = hasJumlahChanged || hasBobotChanged || hasSkorChanged;
        }

        return hasNilaiChanged || hasRemedialChanged || hasDetailChanged;
      })
      .map(([siswaId, record]) => ({
        id: record.id,
        siswaId,
        tpId: selectedTpId,
        teknik: selectedTeknik,
        nilai: Number(record.nilai),
        nilaiRemedial: record.nilaiRemedial !== '' ? Number(record.nilaiRemedial) : null,
        jumlahSoal: selectedTeknik === 'Tes Tertulis' ? jumlahSoal : null,
        bobotSoal: selectedTeknik === 'Tes Tertulis' ? bobotSoal : null,
        skorDetail: selectedTeknik === 'Tes Tertulis' ? (skorSiswa[siswaId] || []) : null
      }));

    if (recordsToSave.length === 0) {
      toast.info('Tidak ada perubahan data untuk disimpan.');
      return;
    }

    try {
      await savePenilaianSumatifBatch(recordsToSave);
      toast.success('Data penilaian sumatif berhasil disimpan.');
      setIsDataExists(true);
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan data.');
    }
  };

  const studentsInClass = data.siswa.filter(s => s.kelasId === selectedKelasId);
  const selectedTp = data.tujuanPembelajaran.find(tp => tp.id === selectedTpId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-pink-500" />
            Input Penilaian Sumatif Kolektif
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                <select
                  value={selectedKelasId}
                  onChange={(e) => setSelectedKelasId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-white"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-white"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-white"
                  required
                >
                  <option value="Tes Tertulis">Tes Tertulis</option>
                  <option value="Kinerja">Kinerja</option>
                  <option value="Proyek">Proyek</option>
                </select>
              </div>
            </div>
          </div>

          {selectedKelasId && selectedTpId && selectedTeknik && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {selectedTeknik === 'Tes Tertulis' && (
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Jumlah Soal</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={jumlahSoal || ''}
                      onChange={(e) => handleJumlahSoalChange(e.target.value)}
                      placeholder="0"
                      className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm"
                    />
                  </div>
                  
                  {jumlahSoal > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                      {bobotSoal.map((bobot, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">Bobot Soal {idx + 1}</label>
                          <input
                            type="number"
                            min="0"
                            value={bobot}
                            onChange={(e) => handleBobotChange(idx, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isDataExists && (
                <div className="bg-blue-50 border-b border-blue-100 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Data sudah ada</h4>
                    <p className="text-sm text-blue-600 mt-0.5">
                      Penilaian sumatif untuk kelas, TP, dan teknik ini sudah pernah disimpan. Anda dapat melihat dan mengubah data di bawah ini, lalu klik Simpan untuk memperbarui.
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
                      {selectedTeknik === 'Tes Tertulis' && jumlahSoal > 0 && (
                        Array.from({ length: jumlahSoal }).map((_, idx) => (
                          <th key={idx} className="px-4 py-4 font-medium border-b border-slate-100 text-center w-24 whitespace-nowrap">Soal {idx + 1}</th>
                        ))
                      )}
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-32 text-center whitespace-nowrap">Nilai Akhir</th>
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-32 text-center whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 font-medium border-b border-slate-100 w-40 text-center whitespace-nowrap">Nilai Remedial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsInClass.length === 0 ? (
                      <tr>
                        <td colSpan={selectedTeknik === 'Tes Tertulis' && jumlahSoal > 0 ? 5 + jumlahSoal : 5} className="px-6 py-8 text-center text-slate-400">
                          Belum ada siswa di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      studentsInClass.map((siswa, index) => {
                        const record = sumatifData[siswa.id] || { nilai: '', nilaiRemedial: '' };
                        const isRemedial = record.nilai !== '' && Number(record.nilai) < (selectedTp?.kktp || 75);
                        
                        return (
                          <tr key={siswa.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-500 sticky left-0 bg-white z-10 group-hover:bg-slate-50 transition-colors shadow-[1px_0_0_0_#f1f5f9]">{index + 1}</td>
                            <td className="px-6 py-4 font-medium text-slate-800 sticky left-[64px] bg-white z-10 group-hover:bg-slate-50 transition-colors shadow-[1px_0_0_0_#f1f5f9]">{siswa.name}</td>
                            {selectedTeknik === 'Tes Tertulis' && jumlahSoal > 0 && (
                              Array.from({ length: jumlahSoal }).map((_, idx) => (
                                <td key={idx} className="px-2 py-4">
                                  <input
                                    type="number"
                                    min="0"
                                    max={bobotSoal[idx] || 100}
                                    value={skorSiswa[siswa.id]?.[idx] ?? ''}
                                    onChange={(e) => handleSkorChange(siswa.id, idx, e.target.value)}
                                    className="w-full px-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm text-center"
                                  />
                                </td>
                              ))
                            )}
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={record.nilai}
                                onChange={(e) => handleNilaiChange(siswa.id, 'nilai', e.target.value)}
                                readOnly={selectedTeknik === 'Tes Tertulis' && jumlahSoal > 0}
                                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm text-center ${isRemedial ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200'} ${(selectedTeknik === 'Tes Tertulis' && jumlahSoal > 0) ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              {record.nilai !== '' ? (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isRemedial ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {isRemedial ? 'Tidak Tuntas' : 'Tuntas'}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={record.nilaiRemedial}
                                onChange={(e) => handleNilaiChange(siswa.id, 'nilaiRemedial', e.target.value)}
                                disabled={!isRemedial}
                                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm text-center ${!isRemedial ? 'bg-slate-100 cursor-not-allowed border-slate-200' : 'border-slate-200 bg-white'}`}
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
