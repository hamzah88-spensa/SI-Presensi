'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Database } from './database.types';

type DbSemester = Database['public']['Tables']['semesters']['Row'];
type DbKelas = Database['public']['Tables']['kelas']['Row'];
type DbSiswa = Database['public']['Tables']['siswa']['Row'];
type DbTP = Database['public']['Tables']['tujuan_pembelajaran']['Row'];
type DbKehadiran = Database['public']['Tables']['kehadiran']['Row'];
type DbPenilaianFormatif = Database['public']['Tables']['penilaian_formatif']['Row'];
type DbPenilaianSumatif = Database['public']['Tables']['penilaian_sumatif']['Row'];
type DbJurnal = Database['public']['Tables']['jurnal']['Row'];

export type Semester = { id: string; name: string; isActive: boolean };
export type Kelas = { id: string; name: string };
export type Siswa = { id: string; name: string; nisn: string; kelasId: string; jenisKelamin: 'L' | 'P' };
export type TujuanPembelajaran = { id: string; name: string; kktp: number };
export type Kehadiran = { id: string; date: string; siswaId: string; status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Bolos'; keterangan: string; semesterId: string };
export type PenilaianFormatif = { id: string; siswaId: string; semesterId: string; tpId: string; teknik: 'Observasi' | 'CATs' | 'Exit Ticket'; nilai: 'SB' | 'B' | 'C' | 'PB'; umpanBalik?: string; halPenting?: string; halBingung?: string };
export type PenilaianSumatif = { id: string; siswaId: string; semesterId: string; tpId: string; teknik: 'Tes Tertulis' | 'Kinerja' | 'Proyek'; nilai: number; nilaiRemedial?: number; jumlahSoal?: number; bobotSoal?: any; skorDetail?: any };
export type Jurnal = { id: string; date: string; type: 'Mengajar' | 'Refleksi'; content: string; semesterId: string };

type AppData = {
  semesters: Semester[];
  kelas: Kelas[];
  siswa: Siswa[];
  tujuanPembelajaran: TujuanPembelajaran[];
  kehadiran: Kehadiran[];
  penilaianFormatif: PenilaianFormatif[];
  penilaianSumatif: PenilaianSumatif[];
  jurnal: Jurnal[];
};

const defaultData: AppData = {
  semesters: [],
  kelas: [],
  siswa: [],
  tujuanPembelajaran: [],
  kehadiran: [],
  penilaianFormatif: [],
  penilaianSumatif: [],
  jurnal: [],
};

type DataContextType = {
  data: AppData;
  activeSemester: Semester | null;
  setActiveSemester: (id: string) => Promise<void>;
  addSemester: (name: string) => Promise<void>;
  updateSemester: (id: string, name: string) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  addKelas: (name: string) => Promise<void>;
  updateKelas: (id: string, name: string) => Promise<void>;
  addSiswa: (name: string, nisn: string, kelasId: string, jenisKelamin: 'L' | 'P') => Promise<void>;
  updateSiswa: (id: string, updates: Partial<Siswa>) => Promise<void>;
  importSiswa: (siswaList: Omit<Siswa, 'id'>[]) => Promise<void>;
  addTujuanPembelajaran: (name: string, kktp: number) => Promise<void>;
  updateTujuanPembelajaran: (id: string, updates: Partial<TujuanPembelajaran>) => Promise<void>;
  addKehadiran: (date: string, siswaId: string, status: Kehadiran['status'], keterangan: string) => Promise<void>;
  updateKehadiran: (id: string, updates: Partial<Kehadiran>) => Promise<void>;
  saveKehadiranBatch: (records: { id?: string, date: string, siswaId: string, status: Kehadiran['status'], keterangan: string }[]) => Promise<void>;
  addPenilaianFormatif: (siswaId: string, tpId: string, teknik: PenilaianFormatif['teknik'], nilai: PenilaianFormatif['nilai'], umpanBalik?: string, halPenting?: string, halBingung?: string) => Promise<void>;
  updatePenilaianFormatif: (id: string, updates: Partial<PenilaianFormatif>) => Promise<void>;
  savePenilaianFormatifBatch: (records: { id?: string, siswaId: string, tpId: string, teknik: PenilaianFormatif['teknik'], nilai: PenilaianFormatif['nilai'], umpanBalik?: string | null, halPenting?: string | null, halBingung?: string | null }[]) => Promise<void>;
  addPenilaianSumatif: (siswaId: string, tpId: string, teknik: PenilaianSumatif['teknik'], nilai: number) => Promise<void>;
  updatePenilaianSumatif: (id: string, updates: Partial<PenilaianSumatif>) => Promise<void>;
  savePenilaianSumatifBatch: (records: { id?: string, siswaId: string, tpId: string, teknik: PenilaianSumatif['teknik'], nilai: number, nilaiRemedial?: number | null, jumlahSoal?: number | null, bobotSoal?: any | null, skorDetail?: any | null }[]) => Promise<void>;
  addJurnal: (date: string, type: Jurnal['type'], content: string) => Promise<void>;
  updateJurnal: (id: string, updates: Partial<Jurnal>) => Promise<void>;
  deleteKelas: (id: string) => Promise<void>;
  deleteSiswa: (id: string) => Promise<void>;
  deleteTujuanPembelajaran: (id: string) => Promise<void>;
  deleteKehadiran: (id: string) => Promise<void>;
  deletePenilaianFormatif: (id: string) => Promise<void>;
  deletePenilaianSumatif: (id: string) => Promise<void>;
  deleteJurnal: (id: string) => Promise<void>;
  isLoaded: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        { data: semesters },
        { data: kelas },
        { data: siswa },
        { data: tps },
        { data: kehadiran },
        { data: formatif },
        { data: sumatif },
        { data: jurnal }
      ] = await Promise.all([
        supabase.from('semesters').select('*').order('created_at', { ascending: true }),
        supabase.from('kelas').select('*').order('created_at', { ascending: true }),
        supabase.from('siswa').select('*').order('created_at', { ascending: true }),
        supabase.from('tujuan_pembelajaran').select('*').order('created_at', { ascending: true }),
        supabase.from('kehadiran').select('*').order('date', { ascending: false }),
        supabase.from('penilaian_formatif').select('*').order('created_at', { ascending: false }),
        supabase.from('penilaian_sumatif').select('*').order('created_at', { ascending: false }),
        supabase.from('jurnal').select('*').order('date', { ascending: false }),
      ]);

      setData({
        semesters: (semesters || []).map(s => ({ id: s.id, name: s.name, isActive: s.is_active })),
        kelas: (kelas || []).map(k => ({ id: k.id, name: k.name })),
        siswa: (siswa || []).map(s => ({ id: s.id, name: s.name, nisn: s.nisn, kelasId: s.kelas_id, jenisKelamin: s.jenis_kelamin })),
        tujuanPembelajaran: (tps || []).map(t => ({ id: t.id, name: t.name, kktp: t.kktp })),
        kehadiran: (kehadiran || []).map(k => ({ id: k.id, date: k.date, siswaId: k.siswa_id, status: k.status, keterangan: k.keterangan || '', semesterId: k.semester_id })),
        penilaianFormatif: (formatif || []).map(f => ({ id: f.id, siswaId: f.siswa_id, semesterId: f.semester_id, tpId: f.tp_id, teknik: f.teknik, nilai: f.nilai, umpanBalik: f.umpan_balik || undefined, halPenting: f.hal_penting || undefined, halBingung: f.hal_bingung || undefined })),
        penilaianSumatif: (sumatif || []).map(s => ({ 
          id: s.id, 
          siswaId: s.siswa_id, 
          semesterId: s.semester_id, 
          tpId: s.tp_id, 
          teknik: s.teknik as PenilaianSumatif['teknik'], 
          nilai: s.nilai, 
          nilaiRemedial: s.nilai_remedial ?? undefined, 
          jumlahSoal: s.jumlah_soal ?? undefined, 
          bobotSoal: (s.bobot_soal as number[]) ?? undefined, 
          skorDetail: (s.skor_detail as number[]) ?? undefined 
        })),
        jurnal: (jurnal || []).map(j => ({ id: j.id, date: j.date, type: j.type, content: j.content, semesterId: j.semester_id })),
      });
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const activeSemester = data.semesters.find((s) => s.isActive) || null;

  const setActiveSemester = async (id: string) => {
    try {
      // Set all to false first
      await supabase.from('semesters').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // dummy condition to update all
      // Set selected to true
      await supabase.from('semesters').update({ is_active: true }).eq('id', id);
      
      setData((prev) => ({
        ...prev,
        semesters: prev.semesters.map((s) => ({ ...s, isActive: s.id === id })),
      }));
    } catch (error) {
      console.error('Error setting active semester:', error);
    }
  };

  const addSemester = async (name: string) => {
    try {
      const { data: newSem, error } = await supabase.from('semesters').insert([{ name, is_active: false }]).select().single();
      if (error) throw error;
      if (newSem) {
        setData((prev) => ({ ...prev, semesters: [...prev.semesters, { id: newSem.id, name: newSem.name, isActive: newSem.is_active }] }));
      }
    } catch (error) {
      console.error('Error adding semester:', error);
    }
  };

  const updateSemester = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from('semesters').update({ name }).eq('id', id);
      if (error) throw error;
      setData((prev) => ({
        ...prev,
        semesters: prev.semesters.map((s) => s.id === id ? { ...s, name } : s),
      }));
    } catch (error) {
      console.error('Error updating semester:', error);
    }
  };

  const deleteSemester = async (id: string) => {
    try {
      const { error } = await supabase.from('semesters').delete().eq('id', id);
      if (error) throw error;
      setData((prev) => ({
        ...prev,
        semesters: prev.semesters.filter((s) => s.id !== id),
        kehadiran: prev.kehadiran.filter((k) => k.semesterId !== id),
        penilaianFormatif: prev.penilaianFormatif.filter((p) => p.semesterId !== id),
        penilaianSumatif: prev.penilaianSumatif.filter((p) => p.semesterId !== id),
        jurnal: prev.jurnal.filter((j) => j.semesterId !== id),
      }));
    } catch (error) {
      console.error('Error deleting semester:', error);
    }
  };

  const addKelas = async (name: string) => {
    try {
      const { data: newKls, error } = await supabase.from('kelas').insert([{ name }]).select().single();
      if (error) throw error;
      if (newKls) {
        setData((prev) => ({ ...prev, kelas: [...prev.kelas, { id: newKls.id, name: newKls.name }] }));
      }
    } catch (error) {
      console.error('Error adding kelas:', error);
    }
  };

  const updateKelas = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from('kelas').update({ name }).eq('id', id);
      if (error) throw error;
      setData((prev) => ({
        ...prev,
        kelas: prev.kelas.map((k) => k.id === id ? { ...k, name } : k),
      }));
    } catch (error) {
      console.error('Error updating kelas:', error);
    }
  };

  const addSiswa = async (name: string, nisn: string, kelasId: string, jenisKelamin: 'L' | 'P') => {
    try {
      const { data: newSiswa, error } = await supabase.from('siswa').insert([{ name, nisn, kelas_id: kelasId, jenis_kelamin: jenisKelamin }]).select().single();
      if (error) throw error;
      if (newSiswa) {
        setData((prev) => ({ ...prev, siswa: [...prev.siswa, { id: newSiswa.id, name: newSiswa.name, nisn: newSiswa.nisn, kelasId: newSiswa.kelas_id, jenisKelamin: newSiswa.jenis_kelamin }] }));
      }
    } catch (error) {
      console.error('Error adding siswa:', error);
    }
  };

  const updateSiswa = async (id: string, updates: Partial<Siswa>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.nisn) dbUpdates.nisn = updates.nisn;
      if (updates.kelasId) dbUpdates.kelas_id = updates.kelasId;
      if (updates.jenisKelamin) dbUpdates.jenis_kelamin = updates.jenisKelamin;

      const { error } = await supabase.from('siswa').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setData((prev) => ({
        ...prev,
        siswa: prev.siswa.map((s) => s.id === id ? { ...s, ...updates } : s),
      }));
    } catch (error) {
      console.error('Error updating siswa:', error);
    }
  };

  const importSiswa = async (siswaList: Omit<Siswa, 'id'>[]) => {
    try {
      const insertData = siswaList.map(s => ({
        name: s.name,
        nisn: s.nisn,
        kelas_id: s.kelasId,
        jenis_kelamin: s.jenisKelamin
      }));
      const { data: newSiswaList, error } = await supabase.from('siswa').insert(insertData).select();
      if (error) throw error;
      if (newSiswaList) {
        const mappedList = newSiswaList.map(s => ({ id: s.id, name: s.name, nisn: s.nisn, kelasId: s.kelas_id, jenisKelamin: s.jenis_kelamin }));
        setData((prev) => ({ ...prev, siswa: [...prev.siswa, ...mappedList] }));
      }
    } catch (error) {
      console.error('Error importing siswa:', error);
    }
  };

  const addTujuanPembelajaran = async (name: string, kktp: number) => {
    try {
      const { data: newTP, error } = await supabase.from('tujuan_pembelajaran').insert([{ name, kktp }]).select().single();
      if (error) throw error;
      if (newTP) {
        setData((prev) => ({ ...prev, tujuanPembelajaran: [...prev.tujuanPembelajaran, { id: newTP.id, name: newTP.name, kktp: newTP.kktp }] }));
      }
    } catch (error) {
      console.error('Error adding TP:', error);
    }
  };

  const updateTujuanPembelajaran = async (id: string, updates: Partial<TujuanPembelajaran>) => {
    try {
      const { error } = await supabase.from('tujuan_pembelajaran').update(updates).eq('id', id);
      if (error) throw error;
      setData((prev) => ({
        ...prev,
        tujuanPembelajaran: prev.tujuanPembelajaran.map((t) => t.id === id ? { ...t, ...updates } : t),
      }));
    } catch (error) {
      console.error('Error updating TP:', error);
    }
  };

  const saveKehadiranBatch = async (records: { id?: string, date: string, siswaId: string, status: Kehadiran['status'], keterangan: string }[]) => {
    if (!activeSemester) return;
    try {
      const upsertData = records.map(r => ({
        ...(r.id ? { id: r.id } : {}),
        date: r.date,
        siswa_id: r.siswaId,
        status: r.status,
        keterangan: r.keterangan,
        semester_id: activeSemester.id
      }));
      
      const { data: savedRecords, error } = await supabase.from('kehadiran').upsert(upsertData).select();
      if (error) throw error;
      
      if (savedRecords) {
        setData(prev => {
          const newKehadiran = [...prev.kehadiran];
          savedRecords.forEach(saved => {
            const index = newKehadiran.findIndex(k => k.id === saved.id);
            const mapped = { id: saved.id, date: saved.date, siswaId: saved.siswa_id, status: saved.status, keterangan: saved.keterangan || '', semesterId: saved.semester_id };
            if (index >= 0) {
              newKehadiran[index] = mapped;
            } else {
              newKehadiran.push(mapped);
            }
          });
          return { ...prev, kehadiran: newKehadiran };
        });
      }
    } catch (error) {
      console.error('Error saving kehadiran batch:', error);
      throw error;
    }
  };

  const savePenilaianFormatifBatch = async (records: { id?: string, siswaId: string, tpId: string, teknik: PenilaianFormatif['teknik'], nilai: PenilaianFormatif['nilai'], umpanBalik?: string | null, halPenting?: string | null, halBingung?: string | null }[]) => {
    if (!activeSemester) return;
    try {
      const upsertData = records.map(r => {
        const row: any = {
          siswa_id: r.siswaId,
          semester_id: activeSemester.id,
          tp_id: r.tpId,
          teknik: r.teknik,
          nilai: r.nilai,
          umpan_balik: r.umpanBalik !== undefined ? r.umpanBalik : null,
          hal_penting: r.halPenting !== undefined ? r.halPenting : null,
          hal_bingung: r.halBingung !== undefined ? r.halBingung : null
        };
        if (r.id) {
          row.id = r.id;
        }
        return row;
      });

      const { data: savedRecords, error } = await supabase.from('penilaian_formatif').upsert(upsertData).select();
      if (error) throw error;

      if (savedRecords) {
        setData(prev => {
          const newFormatif = [...prev.penilaianFormatif];
          savedRecords.forEach(saved => {
            const index = newFormatif.findIndex(p => p.id === saved.id);
            const mapped = { id: saved.id, siswaId: saved.siswa_id, semesterId: saved.semester_id, tpId: saved.tp_id, teknik: saved.teknik, nilai: saved.nilai, umpanBalik: saved.umpan_balik || undefined, halPenting: saved.hal_penting || undefined, halBingung: saved.hal_bingung || undefined };
            if (index >= 0) {
              newFormatif[index] = mapped;
            } else {
              newFormatif.push(mapped);
            }
          });
          return { ...prev, penilaianFormatif: newFormatif };
        });
      }
    } catch (error) {
      console.error('Error saving penilaian formatif batch:', error);
      throw error;
    }
  };

  const savePenilaianSumatifBatch = async (records: { id?: string, siswaId: string, tpId: string, teknik: PenilaianSumatif['teknik'], nilai: number, nilaiRemedial?: number | null, jumlahSoal?: number | null, bobotSoal?: any | null, skorDetail?: any | null }[]) => {
    if (!activeSemester) return;
    try {
      const upsertData = records.map(r => {
        const row: any = {
          siswa_id: r.siswaId,
          semester_id: activeSemester.id,
          tp_id: r.tpId,
          teknik: r.teknik,
          nilai: r.nilai,
          nilai_remedial: r.nilaiRemedial !== undefined ? r.nilaiRemedial : null,
          jumlah_soal: r.jumlahSoal !== undefined ? r.jumlahSoal : null,
          bobot_soal: r.bobotSoal !== undefined ? r.bobotSoal : null,
          skor_detail: r.skorDetail !== undefined ? r.skorDetail : null
        };
        if (r.id) {
          row.id = r.id;
        }
        return row;
      });

      const { data: savedRecords, error } = await supabase.from('penilaian_sumatif').upsert(upsertData).select();
      if (error) throw error;

      if (savedRecords) {
        setData(prev => {
          const newSumatif = [...prev.penilaianSumatif];
          savedRecords.forEach(saved => {
            const index = newSumatif.findIndex(p => p.id === saved.id);
            const mapped: PenilaianSumatif = { 
              id: saved.id, 
              siswaId: saved.siswa_id, 
              semesterId: saved.semester_id, 
              tpId: saved.tp_id, 
              teknik: saved.teknik as PenilaianSumatif['teknik'], 
              nilai: saved.nilai, 
              nilaiRemedial: saved.nilai_remedial ?? undefined, 
              jumlahSoal: saved.jumlah_soal ?? undefined, 
              bobotSoal: (saved.bobot_soal as number[]) ?? undefined, 
              skorDetail: (saved.skor_detail as number[]) ?? undefined 
            };
            if (index >= 0) {
              newSumatif[index] = mapped;
            } else {
              newSumatif.push(mapped);
            }
          });
          return { ...prev, penilaianSumatif: newSumatif };
        });
      }
    } catch (error) {
      console.error('Error saving penilaian sumatif batch:', JSON.stringify(error, null, 2), error);
      throw error;
    }
  };
  const addKehadiran = async (date: string, siswaId: string, status: Kehadiran['status'], keterangan?: string) => {
    if (!activeSemester) return;
    try {
      const { data: newKeh, error } = await supabase.from('kehadiran').insert([{ date, siswa_id: siswaId, status, keterangan, semester_id: activeSemester.id }]).select().single();
      if (error) throw error;
      if (newKeh) {
        setData((prev) => ({ ...prev, kehadiran: [...prev.kehadiran, { id: newKeh.id, date: newKeh.date, siswaId: newKeh.siswa_id, status: newKeh.status, keterangan: newKeh.keterangan || '', semesterId: newKeh.semester_id }] }));
      }
    } catch (error) {
      console.error('Error adding kehadiran:', error);
    }
  };

  const updateKehadiran = async (id: string, updates: Partial<Kehadiran>) => {
    try {
      const dbUpdates: any = {};
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.siswaId) dbUpdates.siswa_id = updates.siswaId;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.keterangan !== undefined) dbUpdates.keterangan = updates.keterangan;

      const { error } = await supabase.from('kehadiran').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setData((prev) => ({
        ...prev,
        kehadiran: prev.kehadiran.map((k) => k.id === id ? { ...k, ...updates } : k),
      }));
    } catch (error) {
      console.error('Error updating kehadiran:', error);
    }
  };

  const addPenilaianFormatif = async (siswaId: string, tpId: string, teknik: PenilaianFormatif['teknik'], nilai: PenilaianFormatif['nilai'], umpanBalik?: string, halPenting?: string, halBingung?: string) => {
    if (!activeSemester) return;
    try {
      const { data: newPen, error } = await supabase.from('penilaian_formatif').insert([{ siswa_id: siswaId, semester_id: activeSemester.id, tp_id: tpId, teknik, nilai, umpan_balik: umpanBalik, hal_penting: halPenting, hal_bingung: halBingung }]).select().single();
      if (error) throw error;
      if (newPen) {
        setData((prev) => ({ ...prev, penilaianFormatif: [...prev.penilaianFormatif, { id: newPen.id, siswaId: newPen.siswa_id, semesterId: newPen.semester_id, tpId: newPen.tp_id, teknik: newPen.teknik, nilai: newPen.nilai, umpanBalik: newPen.umpan_balik || undefined, halPenting: newPen.hal_penting || undefined, halBingung: newPen.hal_bingung || undefined }] }));
      }
    } catch (error) {
      console.error('Error adding penilaian formatif:', error);
    }
  };

  const updatePenilaianFormatif = async (id: string, updates: Partial<PenilaianFormatif>) => {
    try {
      const dbUpdates: any = {};
      if (updates.siswaId) dbUpdates.siswa_id = updates.siswaId;
      if (updates.tpId) dbUpdates.tp_id = updates.tpId;
      if (updates.teknik) dbUpdates.teknik = updates.teknik;
      if (updates.nilai) dbUpdates.nilai = updates.nilai;
      if (updates.umpanBalik !== undefined) dbUpdates.umpan_balik = updates.umpanBalik;
      if (updates.halPenting !== undefined) dbUpdates.hal_penting = updates.halPenting;
      if (updates.halBingung !== undefined) dbUpdates.hal_bingung = updates.halBingung;

      const { error } = await supabase.from('penilaian_formatif').update(dbUpdates).eq('id', id);
      if (error) throw error;
      
      setData((prev) => ({
        ...prev,
        penilaianFormatif: prev.penilaianFormatif.map((p) => p.id === id ? { ...p, ...updates } : p),
      }));
    } catch (error) {
      console.error('Error updating penilaian formatif:', error);
    }
  };

  const addPenilaianSumatif = async (siswaId: string, tpId: string, teknik: PenilaianSumatif['teknik'], nilai: number) => {
    if (!activeSemester) return;
    try {
      const { data: newPen, error } = await supabase.from('penilaian_sumatif').insert([{ siswa_id: siswaId, semester_id: activeSemester.id, tp_id: tpId, teknik, nilai }]).select().single();
      if (error) throw error;
      if (newPen) {
        setData((prev) => ({ ...prev, penilaianSumatif: [...prev.penilaianSumatif, { id: newPen.id, siswaId: newPen.siswa_id, semesterId: newPen.semester_id, tpId: newPen.tp_id, teknik: newPen.teknik, nilai: newPen.nilai, nilaiRemedial: newPen.nilai_remedial || undefined }] }));
      }
    } catch (error) {
      console.error('Error adding penilaian sumatif:', error);
    }
  };

  const updatePenilaianSumatif = async (id: string, updates: Partial<PenilaianSumatif>) => {
    try {
      const dbUpdates: any = {};
      if (updates.siswaId) dbUpdates.siswa_id = updates.siswaId;
      if (updates.tpId) dbUpdates.tp_id = updates.tpId;
      if (updates.teknik) dbUpdates.teknik = updates.teknik;
      if (updates.nilai !== undefined) dbUpdates.nilai = updates.nilai;
      if (updates.nilaiRemedial !== undefined) dbUpdates.nilai_remedial = updates.nilaiRemedial;

      const { error } = await supabase.from('penilaian_sumatif').update(dbUpdates).eq('id', id);
      if (error) throw error;

      setData((prev) => ({
        ...prev,
        penilaianSumatif: prev.penilaianSumatif.map((p) => p.id === id ? { ...p, ...updates } : p),
      }));
    } catch (error) {
      console.error('Error updating penilaian sumatif:', error);
    }
  };

  const addJurnal = async (date: string, type: Jurnal['type'], content: string) => {
    if (!activeSemester) return;
    try {
      const { data: newJur, error } = await supabase.from('jurnal').insert([{ date, type, content, semester_id: activeSemester.id }]).select().single();
      if (error) throw error;
      if (newJur) {
        setData((prev) => ({ ...prev, jurnal: [...prev.jurnal, { id: newJur.id, date: newJur.date, type: newJur.type, content: newJur.content, semesterId: newJur.semester_id }] }));
      }
    } catch (error) {
      console.error('Error adding jurnal:', error);
    }
  };

  const updateJurnal = async (id: string, updates: Partial<Jurnal>) => {
    try {
      const { error } = await supabase.from('jurnal').update(updates).eq('id', id);
      if (error) throw error;

      setData((prev) => ({
        ...prev,
        jurnal: prev.jurnal.map((j) => j.id === id ? { ...j, ...updates } : j),
      }));
    } catch (error) {
      console.error('Error updating jurnal:', error);
    }
  };

  const deleteKelas = async (id: string) => {
    try {
      const { error } = await supabase.from('kelas').delete().eq('id', id);
      if (error) throw error;
      setData((prev) => ({
        ...prev,
        kelas: prev.kelas.filter((k) => k.id !== id),
        siswa: prev.siswa.filter((s) => s.kelasId !== id),
      }));
    } catch (error) {
      console.error('Error deleting kelas:', error);
    }
  };

  const deleteSiswa = async (id: string) => {
    try {
      const { error } = await supabase.from('siswa').delete().eq('id', id);
      if (error) throw error;
      setData((prev) => ({
        ...prev,
        siswa: prev.siswa.filter((s) => s.id !== id),
        kehadiran: prev.kehadiran.filter((k) => k.siswaId !== id),
        penilaianFormatif: prev.penilaianFormatif.filter((p) => p.siswaId !== id),
        penilaianSumatif: prev.penilaianSumatif.filter((p) => p.siswaId !== id),
      }));
    } catch (error) {
      console.error('Error deleting siswa:', error);
    }
  };

  const deleteTujuanPembelajaran = async (id: string) => {
    try {
      const { error } = await supabase.from('tujuan_pembelajaran').delete().eq('id', id);
      if (error) throw error;
      setData((prev) => ({
        ...prev,
        tujuanPembelajaran: prev.tujuanPembelajaran.filter((t) => t.id !== id),
        penilaianFormatif: prev.penilaianFormatif.filter((p) => p.tpId !== id),
        penilaianSumatif: prev.penilaianSumatif.filter((p) => p.tpId !== id),
      }));
    } catch (error) {
      console.error('Error deleting TP:', error);
    }
  };

  const deleteKehadiran = async (id: string) => {
    try {
      const { error } = await supabase.from('kehadiran').delete().eq('id', id);
      if (error) throw error;
      setData((prev) => ({ ...prev, kehadiran: prev.kehadiran.filter((k) => k.id !== id) }));
    } catch (error) {
      console.error('Error deleting kehadiran:', error);
    }
  };

  const deletePenilaianFormatif = async (id: string) => {
    try {
      const { error } = await supabase.from('penilaian_formatif').delete().eq('id', id);
      if (error) throw error;
      setData((prev) => ({ ...prev, penilaianFormatif: prev.penilaianFormatif.filter((p) => p.id !== id) }));
    } catch (error) {
      console.error('Error deleting penilaian formatif:', error);
    }
  };

  const deletePenilaianSumatif = async (id: string) => {
    try {
      const { error } = await supabase.from('penilaian_sumatif').delete().eq('id', id);
      if (error) throw error;
      setData((prev) => ({ ...prev, penilaianSumatif: prev.penilaianSumatif.filter((p) => p.id !== id) }));
    } catch (error) {
      console.error('Error deleting penilaian sumatif:', error);
    }
  };

  const deleteJurnal = async (id: string) => {
    try {
      const { error } = await supabase.from('jurnal').delete().eq('id', id);
      if (error) throw error;
      setData((prev) => ({ ...prev, jurnal: prev.jurnal.filter((j) => j.id !== id) }));
    } catch (error) {
      console.error('Error deleting jurnal:', error);
    }
  };

  return (
    <DataContext.Provider
      value={{
        data,
        activeSemester,
        setActiveSemester,
        addSemester,
        updateSemester,
        deleteSemester,
        addKelas,
        updateKelas,
        addSiswa,
        updateSiswa,
        importSiswa,
        addTujuanPembelajaran,
        updateTujuanPembelajaran,
        addKehadiran,
        updateKehadiran,
        saveKehadiranBatch,
        addPenilaianFormatif,
        updatePenilaianFormatif,
        savePenilaianFormatifBatch,
        addPenilaianSumatif,
        updatePenilaianSumatif,
        savePenilaianSumatifBatch,
        addJurnal,
        updateJurnal,
        deleteKelas,
        deleteSiswa,
        deleteTujuanPembelajaran,
        deleteKehadiran,
        deletePenilaianFormatif,
        deletePenilaianSumatif,
        deleteJurnal,
        isLoaded,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
