'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function KelasPage() {
  const { data, addKelas, updateKelas, deleteKelas } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [jenjang, setJenjang] = useState<'7' | '8' | '9'>('7');

  const handleAdd = async () => {
    if (className.trim()) {
      try {
        await addKelas(className.trim(), jenjang);
        toast.success('Kelas berhasil ditambahkan');
        setClassName('');
        setJenjang('7');
        setIsAdding(false);
      } catch (error) {
        toast.error('Gagal menambahkan kelas');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    if (className.trim()) {
      try {
        await updateKelas(id, className.trim(), jenjang);
        toast.success('Kelas berhasil diperbarui');
        setEditingId(null);
        setClassName('');
        setJenjang('7');
      } catch (error) {
        toast.error('Gagal memperbarui kelas');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      try {
        await deleteKelas(id);
        toast.success('Kelas berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus kelas');
      }
    }
  };

  const startEdit = (id: string, currentName: string, currentJenjang: '7' | '8' | '9') => {
    setEditingId(id);
    setClassName(currentName);
    setJenjang(currentJenjang);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Data Kelas</h1>
        <button
          onClick={() => {
            setIsAdding(true);
            setClassName('');
            setJenjang('7');
            setEditingId(null);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={20} />
          Tambah Kelas
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nama Kelas</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Jenjang</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-indigo-50/50">
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Nama Kelas Baru"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </td>
                <td className="px-6 py-4">
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value as '7' | '8' | '9')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                  </select>
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
            
            {data.kelas.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  {editingId === k.id ? (
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-800 font-medium">{k.name}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === k.id ? (
                    <select
                      value={jenjang}
                      onChange={(e) => setJenjang(e.target.value as '7' | '8' | '9')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                    </select>
                  ) : (
                    <span className="text-gray-600">{k.jenjang}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === k.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdate(k.id)}
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
                        onClick={() => startEdit(k.id, k.name, k.jenjang)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.kelas.length === 0 && !isAdding && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data kelas. Silakan tambah kelas baru.
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
