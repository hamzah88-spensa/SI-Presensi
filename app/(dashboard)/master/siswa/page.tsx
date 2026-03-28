'use client';

import { useState, useRef } from 'react';
import { useData } from '@/lib/data-context';
import { Plus, Trash2, Users, Upload, Download, Edit2, Check, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export default function DataSiswa() {
  const { data, addSiswa, updateSiswa, deleteSiswa, importSiswa } = useData();
  const [newSiswaName, setNewSiswaName] = useState('');
  const [newSiswaNisn, setNewSiswaNisn] = useState('');
  const [newSiswaKelasId, setNewSiswaKelasId] = useState('');
  const [newSiswaJk, setNewSiswaJk] = useState<'L' | 'P'>('L');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNisn, setEditNisn] = useState('');
  const [editKelasId, setEditKelasId] = useState('');
  const [editJk, setEditJk] = useState<'L' | 'P'>('L');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSiswaName.trim() && newSiswaNisn.trim() && newSiswaKelasId) {
      try {
        await addSiswa(newSiswaName.trim(), newSiswaNisn.trim(), newSiswaKelasId, newSiswaJk);
        toast.success('Siswa berhasil ditambahkan');
        setNewSiswaName('');
        setNewSiswaNisn('');
      } catch (error) {
        toast.error('Gagal menambahkan siswa');
      }
    }
  };

  const handleEdit = (siswa: any) => {
    setEditingId(siswa.id);
    setEditName(siswa.name);
    setEditNisn(siswa.nisn);
    setEditKelasId(siswa.kelasId);
    setEditJk(siswa.jenisKelamin);
  };

  const saveEdit = async () => {
    if (editingId && editName.trim() && editNisn.trim() && editKelasId) {
      try {
        await updateSiswa(editingId, {
          name: editName.trim(),
          nisn: editNisn.trim(),
          kelasId: editKelasId,
          jenisKelamin: editJk
        });
        toast.success('Data siswa berhasil diperbarui');
        setEditingId(null);
      } catch (error) {
        toast.error('Gagal memperbarui data siswa');
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const importedData = XLSX.utils.sheet_to_json(ws) as any[];

        const newSiswaList = importedData.map(row => {
          const kelasName = row['Kelas']?.toString().trim() || '';
          const kelas = data.kelas.find(k => k.name.toLowerCase() === kelasName.toLowerCase());
          const jk = row['Jenis Kelamin']?.toString().trim().toUpperCase();
          
          return {
            name: row['Nama Siswa']?.toString().trim() || 'Unknown',
            nisn: row['NISN']?.toString().trim() || '',
            kelasId: kelas ? kelas.id : (data.kelas[0]?.id || ''),
            jenisKelamin: (jk === 'P' || jk === 'PEREMPUAN') ? 'P' : 'L' as 'L' | 'P',
          };
        }).filter(s => s.nisn && s.name);

        if (newSiswaList.length > 0) {
          await importSiswa(newSiswaList);
          toast.success(`Berhasil mengimpor ${newSiswaList.length} data siswa.`);
        } else {
          toast.error('Gagal mengimpor data. Pastikan format Excel sesuai template.');
        }
      } catch (error: any) {
        toast.error('Terjadi kesalahan saat membaca file: ' + error.message);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const wsData = [
      ['NISN', 'Nama Siswa', 'Kelas', 'Jenis Kelamin'],
      ['1234567890', 'Budi Santoso', 'X IPA 1', 'L'],
      ['0987654321', 'Siti Aminah', 'X IPS 1', 'P']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
    XLSX.writeFile(wb, "template_siswa.xlsx");
  };

  const filteredSiswa = data.siswa.filter(siswa => {
    const searchLower = searchQuery.toLowerCase();
    const kelas = data.kelas.find(k => k.id === siswa.kelasId);
    return (
      siswa.name.toLowerCase().includes(searchLower) ||
      siswa.nisn.toLowerCase().includes(searchLower) ||
      (kelas?.name.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Data Siswa
          </h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data siswa dan kelasnya.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari siswa, NISN, atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm w-full sm:w-64"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={downloadTemplate}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Template Excel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input
              type="text"
              value={newSiswaNisn}
              onChange={(e) => setNewSiswaNisn(e.target.value)}
              placeholder="NISN"
              className="md:col-span-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <input
              type="text"
              value={newSiswaName}
              onChange={(e) => setNewSiswaName(e.target.value)}
              placeholder="Nama Lengkap Siswa"
              className="md:col-span-2 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <select
              value={newSiswaJk}
              onChange={(e) => setNewSiswaJk(e.target.value as 'L' | 'P')}
              className="md:col-span-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            <select
              value={newSiswaKelasId}
              onChange={(e) => setNewSiswaKelasId(e.target.value)}
              className="md:col-span-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="" disabled>Pilih Kelas</option>
              {data.kelas.map((k) => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newSiswaName.trim() || !newSiswaNisn.trim() || !newSiswaKelasId}
              className="md:col-span-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah
            </button>
          </form>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-slate-100 w-16">No</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100 w-32">NISN</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100">Nama Lengkap</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100 w-32 text-center">L/P</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100 w-48">Kelas</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    {searchQuery ? 'Tidak ada data siswa yang cocok dengan pencarian.' : 'Belum ada data siswa.'}
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((siswa, index) => {
                  const kelas = data.kelas.find(k => k.id === siswa.kelasId);
                  const isEditing = editingId === siswa.id;

                  return (
                    <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editNisn}
                            onChange={(e) => setEditNisn(e.target.value)}
                            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          siswa.nisn
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          siswa.name
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <select
                            value={editJk}
                            onChange={(e) => setEditJk(e.target.value as 'L' | 'P')}
                            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="L">L</option>
                            <option value="P">P</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${siswa.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                            {siswa.jenisKelamin}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {isEditing ? (
                          <select
                            value={editKelasId}
                            onChange={(e) => setEditKelasId(e.target.value)}
                            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                          >
                            {data.kelas.map((k) => (
                              <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                            {kelas?.name || 'Tidak diketahui'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Simpan"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Batal"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(siswa)}
                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Siswa"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Yakin ingin menghapus siswa ini? Data kehadiran dan penilaiannya juga akan terhapus.')) {
                                    try {
                                      await deleteSiswa(siswa.id);
                                      toast.success('Siswa berhasil dihapus');
                                    } catch (error) {
                                      toast.error('Gagal menghapus siswa');
                                    }
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Siswa"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
