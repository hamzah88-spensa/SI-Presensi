'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TPPage() {
  const { data, addTujuanPembelajaran, updateTujuanPembelajaran, deleteTujuanPembelajaran } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tpName, setTpName] = useState('');
  const [tpKktp, setTpKktp] = useState<number>(75);

  const handleAdd = async () => {
    if (tpName.trim() && tpKktp > 0) {
      try {
        await addTujuanPembelajaran(tpName.trim(), tpKktp);
        toast.success('Tujuan Pembelajaran berhasil ditambahkan');
        setTpName('');
        setTpKktp(75);
        setIsAdding(false);
      } catch (error) {
        toast.error('Gagal menambahkan Tujuan Pembelajaran');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    if (tpName.trim() && tpKktp > 0) {
      try {
        await updateTujuanPembelajaran(id, { name: tpName.trim(), kktp: tpKktp });
        toast.success('Tujuan Pembelajaran berhasil diperbarui');
        setEditingId(null);
        setTpName('');
        setTpKktp(75);
      } catch (error) {
        toast.error('Gagal memperbarui Tujuan Pembelajaran');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus Tujuan Pembelajaran ini?')) {
      try {
        await deleteTujuanPembelajaran(id);
        toast.success('Tujuan Pembelajaran berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus Tujuan Pembelajaran');
      }
    }
  };

  const startEdit = (id: string, currentName: string, currentKktp: number) => {
    setEditingId(id);
    setTpName(currentName);
    setTpKktp(currentKktp);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tujuan Pembelajaran</h1>
        <button
          onClick={() => {
            setIsAdding(true);
            setTpName('');
            setTpKktp(75);
            setEditingId(null);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={20} />
          Tambah TP
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tujuan Pembelajaran</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 w-32">KKTP</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-indigo-50/50">
                <td className="px-6 py-4">
                  <textarea
                    value={tpName}
                    onChange={(e) => setTpName(e.target.value)}
                    placeholder="Deskripsi Tujuan Pembelajaran"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={2}
                    autoFocus
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={tpKktp}
                    onChange={(e) => setTpKktp(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    min="0"
                    max="100"
                  />
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
            
            {data.tujuanPembelajaran.map((tp) => (
              <tr key={tp.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  {editingId === tp.id ? (
                    <textarea
                      value={tpName}
                      onChange={(e) => setTpName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={2}
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-800 font-medium">{tp.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {editingId === tp.id ? (
                    <input
                      type="number"
                      value={tpKktp}
                      onChange={(e) => setTpKktp(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                      min="0"
                      max="100"
                    />
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {tp.kktp}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === tp.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdate(tp.id)}
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
                        onClick={() => startEdit(tp.id, tp.name, tp.kktp)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(tp.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.tujuanPembelajaran.length === 0 && !isAdding && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data Tujuan Pembelajaran. Silakan tambah data baru.
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
