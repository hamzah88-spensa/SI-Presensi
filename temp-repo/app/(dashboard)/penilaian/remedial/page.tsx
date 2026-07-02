'use client';

import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/lib/data-context';
import { AlertCircle, UserCheck, Search, Filter, BookOpen, Clock, Calendar, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface ProgramRemedial {
  id: string;
  siswaId: string;
  tpId: string;
  jenis: 'Pembelajaran Ulang' | 'Pendampingan' | 'Tugas Pengayaan Terarah' | 'Program Khusus';
  jadwal: string;
  pic: string;
  targetSelesai: string;
  status: 'Direncanakan' | 'Berlangsung' | 'Selesai' | 'Dibatalkan';
  createdAt: number;
}

export default function RemedialPage() {
  const { data, activeSemester, updatePenilaianSumatif, savePenilaianSumatifBatch } = useData();
  
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [programs, setPrograms] = useState<ProgramRemedial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramRemedial | null>(null);

  // Auto Deteksi Siswa Perlu Remedial
  const studentsNeedingRemedial = useMemo(() => {
    if (!activeSemester) return [];
    
    let result: { siswa: any, tp: any, sumatif: any }[] = [];
    
    data.siswa.forEach(siswa => {
      if (selectedKelas && siswa.kelasId !== selectedKelas) return;
      if (searchQuery && !siswa.name.toLowerCase().includes(searchQuery.toLowerCase())) return;

      const kelasSiswa = data.kelas.find(k => k.id === siswa.kelasId);
      const tps = kelasSiswa ? data.tujuanPembelajaran.filter(tp => tp.jenjang === kelasSiswa.jenjang) : [];

      tps.forEach(tp => {
        const sumatif = data.penilaianSumatif.find(s => s.siswaId === siswa.id && s.tpId === tp.id && s.semesterId === activeSemester.id);
        
        if (sumatif) {
          const finalScore = Math.max(sumatif.nilai, sumatif.nilaiRemedial || 0);
          if (finalScore < tp.kktp) {
            result.push({ siswa, tp, sumatif });
          }
        }
      });
    });
    
    return result;
  }, [data.siswa, data.tujuanPembelajaran, data.penilaianSumatif, data.kelas, activeSemester, selectedKelas, searchQuery]);

  // Form State
  const [formSiswaTp, setFormSiswaTp] = useState<string>(''); // format: "siswaId|tpId"
  const [formJenis, setFormJenis] = useState<ProgramRemedial['jenis']>('Pembelajaran Ulang');
  const [formJadwal, setFormJadwal] = useState('');
  const [formPic, setFormPic] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formStatus, setFormStatus] = useState<ProgramRemedial['status']>('Direncanakan');
  const [formNilai, setFormNilai] = useState<number | ''>('');
  
  // Input Nilai Remedial State
  const [inputNilaiModal, setInputNilaiModal] = useState(false);
  const [selectedSumatifForNilai, setSelectedSumatifForNilai] = useState<any>(null);
  const [nilaiRemedialInput, setNilaiRemedialInput] = useState<number | ''>('');

  useEffect(() => {
    if (activeSemester) {
      const fetchFromSupabase = async () => {
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('remedial_programs')
              .select('*');
            if (!error && data) {
              setPrograms(data);
              return;
            }
          } catch (err) {
            console.error("Failed to fetch from supabase", err);
          }
        }
        
        const saved = localStorage.getItem(`remedial_programs_${activeSemester.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setTimeout(() => setPrograms(parsed), 0);
          } catch (e) {
            console.error("Failed to parse remedial programs");
            setTimeout(() => setPrograms([]), 0);
          }
        } else {
          setTimeout(() => setPrograms([]), 0);
        }
      };
      
      fetchFromSupabase();
    }
  }, [activeSemester]);

  const savePrograms = async (newPrograms: ProgramRemedial[], newProgOrUpdated: ProgramRemedial | null = null, deleteId: string | null = null) => {
    if (!activeSemester) return;
    setPrograms(newPrograms);
    localStorage.setItem(`remedial_programs_${activeSemester.id}`, JSON.stringify(newPrograms));
    
    if (supabase) {
      try {
        if (deleteId) {
          await supabase.from('remedial_programs').delete().eq('id', deleteId);
        } else if (newProgOrUpdated) {
          await supabase.from('remedial_programs').upsert({
            id: newProgOrUpdated.id,
            siswaId: newProgOrUpdated.siswaId,
            tpId: newProgOrUpdated.tpId,
            jenis: newProgOrUpdated.jenis,
            jadwal: newProgOrUpdated.jadwal,
            pic: newProgOrUpdated.pic,
            targetSelesai: newProgOrUpdated.targetSelesai,
            status: newProgOrUpdated.status,
            createdAt: newProgOrUpdated.createdAt
          });
        }
      } catch(err) {
        console.error("Failed to sync to supabase", err);
      }
    }
  };

  const openNewModal = (siswaId?: string, tpId?: string) => {
    setEditingProgram(null);
    if (siswaId && tpId) {
      setFormSiswaTp(`${siswaId}|${tpId}`);
    } else {
      setFormSiswaTp('');
    }
    setFormJenis('Pembelajaran Ulang');
    setFormJadwal('');
    setFormPic('');
    setFormTarget('');
    setFormStatus('Direncanakan');
    setFormNilai('');
    setIsModalOpen(true);
  };

  const openEditModal = (prog: ProgramRemedial) => {
    setEditingProgram(prog);
    setFormSiswaTp(`${prog.siswaId}|${prog.tpId}`);
    setFormJenis(prog.jenis);
    setFormJadwal(prog.jadwal);
    setFormPic(prog.pic);
    setFormTarget(prog.targetSelesai);
    setFormStatus(prog.status);
    
    const sumatif = data.penilaianSumatif.find(s => s.siswaId === prog.siswaId && s.tpId === prog.tpId && s.semesterId === activeSemester?.id);
    setFormNilai(sumatif?.nilaiRemedial || '');
    
    setIsModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSiswaTp || !formJadwal || !formPic || !formTarget) {
      toast.error('Gagal, Harap lengkapi semua field!');
      return;
    }

    if (formStatus === 'Selesai' && formNilai === '') {
      toast.error('Harap masukkan nilai remedial!');
      return;
    }

    const [siswaId, tpId] = formSiswaTp.split('|');

    let updatedOrNewProg: ProgramRemedial;

    if (editingProgram) {
      updatedOrNewProg = {
        ...editingProgram,
        siswaId,
        tpId,
        jenis: formJenis,
        jadwal: formJadwal,
        pic: formPic,
        targetSelesai: formTarget,
        status: formStatus
      };
      const updated = programs.map(p => p.id === editingProgram.id ? updatedOrNewProg : p);
      await savePrograms(updated, updatedOrNewProg);
      toast.success('Program remedial berhasil diperbarui');
    } else {
      updatedOrNewProg = {
        id: crypto.randomUUID(),
        siswaId,
        tpId,
        jenis: formJenis,
        jadwal: formJadwal,
        pic: formPic,
        targetSelesai: formTarget,
        status: formStatus,
        createdAt: Date.now()
      };
      await savePrograms([...programs, updatedOrNewProg], updatedOrNewProg);
      toast.success('Program remedial berhasil dibuat');
    }
    
    if (formStatus === 'Selesai' && formNilai !== '') {
      // Save Nilai Ke Sumatif
      const sumatif = data.penilaianSumatif.find(s => s.siswaId === siswaId && s.tpId === tpId && s.semesterId === activeSemester?.id);
      if (sumatif) {
        try {
          await savePenilaianSumatifBatch([{
            ...sumatif,
            nilaiRemedial: Number(formNilai)
          }]);
          toast.success('Nilai Remedial tersimpan ke database sumatif');
        } catch (e) {
          toast.error('Gagal menyimpan nilai ke database sumatif');
        }
      } else {
        toast.error('Data Sumatif tidak ditemukan untuk kelas/TP ini. Nilai remedial hanya tersimpan di program.');
      }
    }
    
    setIsModalOpen(false);
  };

  const deleteProgram = async (id: string) => {
    if(confirm('Yakin ingin menghapus program ini?')) {
      await savePrograms(programs.filter(p => p.id !== id), null, id);
      toast.success('Program dihapus');
    }
  };

  const openNilaiModal = (prog: ProgramRemedial) => {
    const sumatif = data.penilaianSumatif.find(s => s.siswaId === prog.siswaId && s.tpId === prog.tpId && s.semesterId === activeSemester?.id);
    if (!sumatif) {
      toast.error('Data Sumatif tidak ditemukan untuk TP tersebut!');
      return;
    }
    setSelectedSumatifForNilai(sumatif);
    setNilaiRemedialInput(sumatif.nilaiRemedial || '');
    setInputNilaiModal(true);
  };

  const saveNilaiRemedial = async () => {
    if (!selectedSumatifForNilai || nilaiRemedialInput === '') {
      toast.error('Masukkan nilai remedial terlebih dahulu');
      return;
    }
    try {
      await savePenilaianSumatifBatch([{
        id: selectedSumatifForNilai.id,
        siswaId: selectedSumatifForNilai.siswaId,
        tpId: selectedSumatifForNilai.tpId,
        teknik: selectedSumatifForNilai.teknik,
        nilai: selectedSumatifForNilai.nilai,
        nilaiRemedial: Number(nilaiRemedialInput),
        jumlahSoal: selectedSumatifForNilai.jumlahSoal,
        bobotSoal: selectedSumatifForNilai.bobotSoal,
        skorDetail: selectedSumatifForNilai.skorDetail
      }]);
      toast.success('Nilai Remedial berhasil disimpan');
      setInputNilaiModal(false);
    } catch (e) {
      toast.error('Gagal menyimpan nilai remedial');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-500" />
            Program Remedial
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tracking dan tindak lanjut siswa yang belum mencapai KKTP
          </p>
        </div>
        <button
          onClick={() => openNewModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          + Buat Program Remedial
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              Filter Kelas
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
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
              Cari Nama / NISN
            </label>
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full max-h-[800px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50 rounded-t-2xl">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Deteksi Belum Tuntas
              </h2>
              <span className="bg-rose-100 text-rose-700 font-bold text-xs px-2.5 py-1 rounded-full">
                {studentsNeedingRemedial.length} Siswa
              </span>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {studentsNeedingRemedial.length > 0 ? (
                studentsNeedingRemedial.map((item, idx) => {
                  const alreadyPlanned = programs.some(p => p.siswaId === item.siswa.id && p.tpId === item.tp.id);
                  return (
                    <div key={`${item.siswa.id}-${item.tp.id}-${idx}`} className="bg-white border text-sm border-slate-200 rounded-xl p-3 hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-slate-800">{item.siswa.name}</p>
                          <p className="text-xs text-slate-500">{data.kelas.find(k => k.id === item.siswa.kelasId)?.name} • {item.siswa.nisn}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-rose-600 text-lg leading-none">{item.sumatif.nilaiRemedial ? item.sumatif.nilaiRemedial : item.sumatif.nilai}</p>
                          <p className="text-[10px] text-slate-400">KKTP {item.tp.kktp}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg mb-3">
                        <p className="text-xs text-slate-600 font-medium line-clamp-2" title={item.tp.name}>{item.tp.name}</p>
                      </div>
                      {!alreadyPlanned && (
                        <button 
                          onClick={() => openNewModal(item.siswa.id, item.tp.id)}
                          className="w-full text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 rounded-lg border border-rose-100 transition-colors"
                        >
                          Ciptakan Program Remedial
                        </button>
                      )}
                      {alreadyPlanned && (
                        <div className="w-full text-center text-xs font-semibold bg-emerald-50 text-emerald-600 py-1.5 rounded-lg border border-emerald-100">
                          Program Sudah Direncanakan
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Semua siswa tuntas untuk kriteria ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full max-h-[800px] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Tracking Program Remedial
              </h2>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {programs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.map((prog) => {
                    const siswa = data.siswa.find(s => s.id === prog.siswaId);
                    const tp = data.tujuanPembelajaran.find(t => t.id === prog.tpId);
                    if (!siswa || !tp) return null;
                    if (selectedKelas && siswa.kelasId !== selectedKelas) return null;
                    if (searchQuery && !siswa.name.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                    const statusColors = {
                      'Direncanakan': 'bg-slate-100 text-slate-700',
                      'Berlangsung': 'bg-amber-100 text-amber-700',
                      'Selesai': 'bg-emerald-100 text-emerald-700',
                      'Dibatalkan': 'bg-rose-100 text-rose-700',
                    };

                    const sumatif = data.penilaianSumatif.find(s => s.siswaId === prog.siswaId && s.tpId === prog.tpId && s.semesterId === activeSemester?.id);
                    const isTuntasNow = sumatif && (Math.max(sumatif.nilai, sumatif.nilaiRemedial || 0) >= tp.kktp);
                    
                    return (
                      <div key={prog.id} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow bg-white">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-slate-800 text-sm">{siswa.name}</h3>
                              <p className="text-xs text-slate-500">{data.kelas.find(k => k.id === siswa.kelasId)?.name}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${statusColors[prog.status]}`}>
                              {prog.status}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-700 border border-slate-100">
                              <span className="font-semibold block mb-0.5">TP:</span> {tp.name} (KKTP: {tp.kktp})
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400 block">Jenis:</span>
                                <span className="font-medium text-slate-700">{prog.jenis}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">PIC:</span>
                                <span className="font-medium text-slate-700">{prog.pic}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Jadwal:</span>
                                <span className="font-medium text-slate-700">{new Date(prog.jadwal).toLocaleDateString('id-ID')}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Target:</span>
                                <span className="font-medium text-slate-700">{new Date(prog.targetSelesai).toLocaleDateString('id-ID')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 border-t border-slate-100 pt-3">
                          {prog.status === 'Selesai' ? (
                            <div className="flex-1">
                              {!isTuntasNow ? (
                                <button 
                                  onClick={() => openNilaiModal(prog)}
                                  className="w-full px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold"
                                >
                                  Input Nilai Remedial
                                </button>
                              ) : (
                                <div className="text-center px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Sudah Tuntas (Nilai: {sumatif?.nilaiRemedial})
                                </div>
                              )}
                            </div>
                          ) : (
                            <button 
                              onClick={() => openEditModal(prog)}
                              className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                            >
                              Edit Program
                            </button>
                          )}
                          <button 
                            onClick={() => deleteProgram(prog.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-medium transition"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Belum ada program remedial</p>
                  <p className="text-xs text-slate-400 mt-1">Buat program baru dari daftar belum tuntas di sebelah kiri.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingProgram ? 'Edit Program Remedial' : 'Buat Program Remedial'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProgram} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 text-left">Siswa & Tujuan Pembelajaran</label>
                <select 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm bg-slate-50"
                  value={formSiswaTp}
                  onChange={(e) => setFormSiswaTp(e.target.value)}
                  disabled={!!editingProgram}
                >
                  <option value="">Pilih Siswa & TP (Belum Tuntas)</option>
                  {studentsNeedingRemedial.map((item, i) => (
                    <option key={i} value={`${item.siswa.id}|${item.tp.id}`}>
                      {item.siswa.name} - {item.tp.name} (T: {Math.max(item.sumatif.nilai, item.sumatif.nilaiRemedial || 0)} / {item.tp.kktp})
                    </option>
                  ))}
                  {editingProgram && !studentsNeedingRemedial.some(s => `${s.siswa.id}|${s.tp.id}` === `${editingProgram.siswaId}|${editingProgram.tpId}`) && (
                    <option value={`${editingProgram.siswaId}|${editingProgram.tpId}`}>
                       {data.siswa.find(s => s.id === editingProgram.siswaId)?.name} - {data.tujuanPembelajaran.find(t => t.id === editingProgram.tpId)?.name}
                    </option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Jenis Remedial</label>
                <select 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value as any)}
                >
                  <option value="Pembelajaran Ulang">Pembelajaran Ulang</option>
                  <option value="Pendampingan">Pendampingan (Tutor Sebaya/Guru)</option>
                  <option value="Tugas Pengayaan Terarah">Tugas Pengayaan Terarah</option>
                  <option value="Program Khusus">Program Khusus</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Jadwal (Mulai)</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    value={formJadwal}
                    onChange={(e) => setFormJadwal(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Target Selesai</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">PIC (Penanggung Jawab)</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Guru Mapel, Fulan (Tutor)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    value={formPic}
                    onChange={(e) => setFormPic(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                  >
                    <option value="Direncanakan">Direncanakan</option>
                    <option value="Berlangsung">Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {formStatus === 'Selesai' && (
                <div className="space-y-1 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <label className="text-sm font-semibold text-indigo-900">Nilai Remedial yang Diperoleh</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0 - 100"
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
                    value={formNilai}
                    onChange={(e) => setFormNilai(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <p className="text-xs text-indigo-600/80 mt-1">Nilai ini juga akan otomatis tersimpan ke database nilai akhir (Sumatif).</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium">Simpan Program</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inputNilaiModal && selectedSumatifForNilai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="font-bold text-lg text-indigo-900">Input Nilai Remedial</h3>
              <button onClick={() => setInputNilaiModal(false)} className="text-indigo-400 hover:text-indigo-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
                <span className="text-xs text-rose-600 font-medium">Nilai Awal (Sumatif):</span>
                <span className="font-bold text-rose-700 text-lg">{selectedSumatifForNilai.nilai}</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nilai Remedial Baru</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={nilaiRemedialInput}
                  onChange={(e) => setNilaiRemedialInput(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold text-center"
                  placeholder="0 - 100"
                />
                <p className="text-xs text-slate-400 text-center">Nilai remedial akan menggantikan nilai sumatif sebelumnya jika lebih besar.</p>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setInputNilaiModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-medium">Batal</button>
                <button onClick={saveNilaiRemedial} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium">Simpan Nilai</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
