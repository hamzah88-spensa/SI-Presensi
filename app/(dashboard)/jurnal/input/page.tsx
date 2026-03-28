'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function InputJurnalPage() {
  const { data, addJurnal, updateJurnal, deleteJurnal, activeSemester } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [kelasId, setKelasId] = useState('');
  const [materi, setMateri] = useState('');
  const [dinamika, setDinamika] = useState('');
  const [refleksi, setRefleksi] = useState('');
  const [hambatan, setHambatan] = useState('');
  const [solusi, setSolusi] = useState('');

  const filteredJurnal = data.jurnal
    .filter(j => j.semesterId === activeSemester?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const parseContent = (contentStr: string) => {
    try {
      return JSON.parse(contentStr);
    } catch {
      return {
        kelasId: '',
        materi: contentStr,
        dinamika: '',
        refleksi: '',
        hambatan: '',
        solusi: ''
      };
    }
  };

  const handleAdd = async () => {
    if (date && kelasId && materi.trim()) {
      try {
        const contentObj = { kelasId, materi, dinamika, refleksi, hambatan, solusi, absentStudents };
        await addJurnal(date, 'Mengajar', JSON.stringify(contentObj));
        toast.success('Jurnal berhasil ditambahkan');
        resetForm();
        setIsAdding(false);
      } catch (error) {
        toast.error('Gagal menambahkan jurnal');
      }
    } else {
      toast.error('Tanggal, Kelas, dan Materi wajib diisi.');
    }
  };

  const handleUpdate = async (id: string) => {
    if (date && kelasId && materi.trim()) {
      try {
        const contentObj = { kelasId, materi, dinamika, refleksi, hambatan, solusi, absentStudents };
        await updateJurnal(id, { date, type: 'Mengajar', content: JSON.stringify(contentObj) });
        toast.success('Jurnal berhasil diperbarui');
        setEditingId(null);
        resetForm();
      } catch (error) {
        toast.error('Gagal memperbarui jurnal');
      }
    } else {
      toast.error('Tanggal, Kelas, dan Materi wajib diisi.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      try {
        await deleteJurnal(id);
        toast.success('Jurnal berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus jurnal');
      }
    }
  };

  const startEdit = (id: string, currentDate: string, currentContent: string) => {
    const parsed = parseContent(currentContent);
    setEditingId(id);
    setDate(currentDate);
    setKelasId(parsed.kelasId || '');
    setMateri(parsed.materi || '');
    setDinamika(parsed.dinamika || '');
    setRefleksi(parsed.refleksi || '');
    setHambatan(parsed.hambatan || '');
    setSolusi(parsed.solusi || '');
    setIsAdding(false);
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setKelasId('');
    setMateri('');
    setDinamika('');
    setRefleksi('');
    setHambatan('');
    setSolusi('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get absent students for selected date and class
  let absentStudents: any[] = [];
  if (kelasId && date && activeSemester) {
    // Get all students in the selected class
    const classStudents = data.siswa.filter(s => s.kelasId === kelasId);
    
    // Get attendance records for these students on the selected date
    const attendanceRecords = data.kehadiran.filter(k => 
      k.date === date && 
      k.semesterId === activeSemester.id &&
      classStudents.some(s => s.id === k.siswaId)
    );

    // Filter students who are NOT 'Hadir'
    absentStudents = attendanceRecords
      .filter(k => k.status !== 'Hadir')
      .map(k => {
        const student = classStudents.find(s => s.id === k.siswaId);
        return {
          name: student?.name || 'Unknown',
          status: k.status,
          keterangan: k.keterangan
        };
      });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Input Jurnal Mengajar</h1>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
            setEditingId(null);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-sm"
        >
          <Plus size={20} />
          Tambah Jurnal
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-6 border-l-4 border-indigo-500">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Jurnal' : 'Tambah Jurnal Baru'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Pilih Kelas --</option>
                {data.kelas.map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Absent Students Info */}
          {kelasId && date && (
            <div className="mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
              <h3 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                <Users size={16} />
                Siswa Tidak Hadir (Otomatis dari Presensi)
              </h3>
              {absentStudents.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                  {absentStudents.map((student, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{student.name}</span> - {student.status} 
                      {student.keterangan ? ` (${student.keterangan})` : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-orange-600/80 italic">Semua siswa hadir atau presensi belum diisi.</p>
              )}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1. Materi & Tujuan Pembelajaran</label>
              <textarea
                value={materi}
                onChange={(e) => setMateri(e.target.value)}
                placeholder="Tuliskan materi dan tujuan pembelajaran..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2. Catatan Kejadian / Dinamika Kelas</label>
              <textarea
                value={dinamika}
                onChange={(e) => setDinamika(e.target.value)}
                placeholder="Catat kejadian penting atau dinamika kelas..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">3. Refleksi Guru</label>
              <textarea
                value={refleksi}
                onChange={(e) => setRefleksi(e.target.value)}
                placeholder="Tuliskan refleksi Anda setelah mengajar..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">4. Hambatan Belajar</label>
              <textarea
                value={hambatan}
                onChange={(e) => setHambatan(e.target.value)}
                placeholder="Catat hambatan yang dialami siswa..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">5. Solusi dan Rencana</label>
              <textarea
                value={solusi}
                onChange={(e) => setSolusi(e.target.value)}
                placeholder="Tuliskan solusi dan rencana tindak lanjut..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
              className="px-6 py-2 text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 rounded-xl transition font-medium shadow-sm"
            >
              {editingId ? 'Simpan Perubahan' : 'Simpan Jurnal'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredJurnal.map((j) => {
          const parsed = parseContent(j.content);
          const kelasName = data.kelas.find(k => k.id === parsed.kelasId)?.name || 'Kelas Tidak Diketahui';
          
          return (
            <div key={j.id} className="bg-white/80 backdrop-blur shadow-sm rounded-2xl p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800">
                      {kelasName}
                    </span>
                    <span className="text-sm font-medium text-gray-500">{formatDate(j.date)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(j.id, j.date, j.content)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 text-sm text-gray-700">
                {parsed.materi && (
                  <div>
                    <h4 className="font-semibold text-gray-900">1. Materi & Tujuan Pembelajaran</h4>
                    <p className="whitespace-pre-wrap mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">{parsed.materi}</p>
                  </div>
                )}
                {parsed.dinamika && (
                  <div>
                    <h4 className="font-semibold text-gray-900">2. Catatan Kejadian / Dinamika Kelas</h4>
                    <p className="whitespace-pre-wrap mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">{parsed.dinamika}</p>
                  </div>
                )}
                {parsed.refleksi && (
                  <div>
                    <h4 className="font-semibold text-gray-900">3. Refleksi Guru</h4>
                    <p className="whitespace-pre-wrap mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">{parsed.refleksi}</p>
                  </div>
                )}
                {parsed.hambatan && (
                  <div>
                    <h4 className="font-semibold text-gray-900">4. Hambatan Belajar</h4>
                    <p className="whitespace-pre-wrap mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">{parsed.hambatan}</p>
                  </div>
                )}
                {parsed.solusi && (
                  <div>
                    <h4 className="font-semibold text-gray-900">5. Solusi dan Rencana</h4>
                    <p className="whitespace-pre-wrap mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">{parsed.solusi}</p>
                  </div>
                )}
                {parsed.absentStudents && parsed.absentStudents.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                      <Users size={16} />
                      Siswa Tidak Hadir
                    </h4>
                    <ul className="list-disc list-inside mt-1 bg-orange-50 p-3 rounded-xl border border-orange-100 text-orange-700">
                      {parsed.absentStudents.map((student: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-medium">{student.name}</span> - {student.status} 
                          {student.keterangan ? ` (${student.keterangan})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredJurnal.length === 0 && !isAdding && !editingId && (
          <div className="bg-white/80 backdrop-blur shadow-sm rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">Belum ada catatan jurnal. Silakan tambah jurnal baru.</p>
          </div>
        )}
      </div>
    </div>
  );
}
