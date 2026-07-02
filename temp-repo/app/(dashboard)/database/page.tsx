'use client';

import { useState } from 'react';
import { DownloadCloud, UploadCloud, Trash2, Database as DatabaseIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'hapus'>('backup');

  const handleBackup = () => {
    // Generate mock backup functionality
    toast.success('Backup berhasil dibuat dan diunduh.');
  };

  const handleRestore = () => {
    // Generate mock restore functionality
    toast.success('Data berhasil di-restore dari sistem.');
  };

  const handleDeleteData = (type: string) => {
    if (confirm(`Apakah Anda yakin ingin melakukan: ${type}? data yang dihapus tidak dapat dikembalikan.`)) {
      toast.success(`${type} berhasil dilakukan.`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <DatabaseIcon className="w-7 h-7 text-indigo-500" />
          Manajemen Database
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola pencadangan, pemulihan, dan penghapusan data secara masal.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'backup' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <DownloadCloud className="w-4 h-4" /> Backup
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'restore' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Restore
          </button>
          <button
            onClick={() => setActiveTab('hapus')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'hapus' ? 'bg-rose-50 text-rose-600 border-b-2 border-rose-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Trash2 className="w-4 h-4" /> Hapus Data
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'backup' && (
            <div className="space-y-6 text-center max-w-xl mx-auto py-8">
              <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <DownloadCloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Backup Data Sistem</h3>
                <p className="text-slate-500 text-sm mt-2">
                  Unduh seluruh konfigurasi dan data ke dalam file aman yang dapat dikembalikan kapan saja.
                </p>
              </div>
              <button
                onClick={handleBackup}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                Mulai Backup Sekarang
              </button>
            </div>
          )}

          {activeTab === 'restore' && (
            <div className="space-y-6 text-center max-w-xl mx-auto py-8">
              <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Restore Data Sistem</h3>
                <p className="text-slate-500 text-sm mt-2">
                  Kembalikan data dari file backup yang pernah Anda unduh.
                </p>
              </div>
              <div className="border border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 hover:bg-slate-100 transition cursor-pointer flex flex-col items-center justify-center">
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">Klik atau drag file backup ke sini</p>
                <p className="text-xs text-slate-400 mt-1">Format berekstensi .json atau .zip</p>
              </div>
              <button
                onClick={handleRestore}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition w-full"
              >
                Jalankan Restore
              </button>
            </div>
          )}

          {activeTab === 'hapus' && (
            <div className="space-y-6">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-4 items-start">
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Peringatan Penghapusan</h4>
                  <p className="text-rose-700/80 text-xs mt-1">
                    Tindakan ini bersifat permanen. Data yang telah dihapus tidak dapat dipulihkan kecuali Anda memiliki file backup terbaru.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-slate-200 p-5 rounded-2xl hover:border-rose-300 hover:shadow-sm transition bg-white flex flex-col">
                  <h5 className="font-bold text-slate-800 mb-1">Hapus Penilaian</h5>
                  <p className="text-xs text-slate-500 mb-4 flex-1">Hapus semua riwayat penilaian formatif dan sumatif, termasuk data remedial.</p>
                  <button onClick={() => handleDeleteData('Hapus Penilaian')} className="text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 flex items-center justify-center gap-2 rounded-xl transition">
                    <Trash2 className="w-4 h-4" /> Eksekusi
                  </button>
                </div>
                
                <div className="border border-slate-200 p-5 rounded-2xl hover:border-rose-300 hover:shadow-sm transition bg-white flex flex-col">
                  <h5 className="font-bold text-slate-800 mb-1">Hapus Presensi</h5>
                  <p className="text-xs text-slate-500 mb-4 flex-1">Hapus seluruh data kehadiran harian dan semesteran siswa.</p>
                  <button onClick={() => handleDeleteData('Hapus Presensi')} className="text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 flex items-center justify-center gap-2 rounded-xl transition">
                    <Trash2 className="w-4 h-4" /> Eksekusi
                  </button>
                </div>

                <div className="border border-slate-200 p-5 rounded-2xl hover:border-rose-300 hover:shadow-sm transition bg-white flex flex-col">
                  <h5 className="font-bold text-slate-800 mb-1">Hapus Jurnal</h5>
                  <p className="text-xs text-slate-500 mb-4 flex-1">Kosongkan semua log atau jurnal guru mengenai aktivitas belajar harian.</p>
                  <button onClick={() => handleDeleteData('Hapus Jurnal')} className="text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 flex items-center justify-center gap-2 rounded-xl transition">
                    <Trash2 className="w-4 h-4" /> Eksekusi
                  </button>
                </div>

                <div className="border border-slate-200 p-5 rounded-2xl hover:border-rose-300 hover:shadow-sm transition bg-white flex flex-col">
                  <h5 className="font-bold text-slate-800 mb-1">Hapus Data Siswa</h5>
                  <p className="text-xs text-slate-500 mb-4 flex-1">Menghapus tabel referensi data siswa beserta seluruh relasinya (Nilai, Presensi dll).</p>
                  <button onClick={() => handleDeleteData('Hapus Data Siswa')} className="text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 flex items-center justify-center gap-2 rounded-xl transition">
                    <Trash2 className="w-4 h-4" /> Eksekusi
                  </button>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="border-2 border-rose-500 p-6 rounded-2xl bg-rose-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h5 className="font-extrabold text-rose-800 text-lg">Hapus Seluruh Data</h5>
                    <p className="text-sm text-rose-700/80 mt-1">Kembalikan aplikasi ke kondisi bersih seperti terinstall baru. Semua record akan dihapus secara permanen.</p>
                  </div>
                  <button onClick={() => handleDeleteData('Hapus seluruh data')} className="whitespace-nowrap bg-rose-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-700 transition flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" /> Hapus Seluruh Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
