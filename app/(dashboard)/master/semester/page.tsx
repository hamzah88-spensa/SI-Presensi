'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SemesterPage() {
  const { data, activeSemester, setActiveSemester, addSemester, updateSemester, deleteSemester } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [semesterName, setSemesterName] = useState('');

  const handleAdd = async () => {
    if (semesterName.trim()) {
      try {
        await addSemester(semesterName.trim());
        toast.success('Semester berhasil ditambahkan');
        setSemesterName('');
        setIsAdding(false);
      } catch (error) {
        toast.error('Gagal menambahkan semester');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    if (semesterName.trim()) {
      try {
        await updateSemester(id, semesterName.trim());
        toast.success('Semester berhasil diperbarui');
        setEditingId(null);
        setSemesterName('');
      } catch (error) {
        toast.error('Gagal memperbarui semester');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (activeSemester?.id === id) {
      toast.error('Tidak dapat menghapus semester yang sedang aktif.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus semester ini?')) {
      try {
        await deleteSemester(id);
        toast.success('Semester berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus semester');
      }
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setSemesterName(currentName);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Data Semester</h1>
        <button
          onClick={() => {
            setIsAdding(true);
            setSemesterName('');
            setEditingId(null);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={20} />
          Tambah Semester
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nama Semester</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-indigo-50/50">
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={semesterName}
                    onChange={(e) => setSemesterName(e.target.value)}
                    placeholder="Contoh: Ganjil 2024/2025"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-gray-400 italic">Baru</span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={handleAdd}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Batal
                  </button>
                </td>
              </tr>
            )}
            
            {data.semesters.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  {editingId === s.id ? (
                    <input
                      type="text"
                      value={semesterName}
                      onChange={(e) => setSemesterName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-800 font-medium">{s.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {s.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={14} /> Aktif
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveSemester(s.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-800 transition"
                    >
                      Set Aktif
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === s.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdate(s.id)}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => startEdit(s.id, s.name)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className={`transition ${s.isActive ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                        disabled={s.isActive}
                        title={s.isActive ? "Semester aktif tidak dapat dihapus" : "Hapus semester"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.semesters.length === 0 && !isAdding && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data semester. Silakan tambah semester baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
