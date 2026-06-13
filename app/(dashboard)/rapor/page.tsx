'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function RaporPage() {
  const { data, activeSemester } = useData();
  const [selectedKelasId, setSelectedKelasId] = useState('');

  const studentsInClass = useMemo(() => {
    return data.siswa?.filter((s: any) => s.kelasId === selectedKelasId) || [];
  }, [data.siswa, selectedKelasId]);

  const raporData = useMemo(() => {
    if (!selectedKelasId || !activeSemester) return [];

    return studentsInClass.map((siswa: any) => {
      // 1. Get Sumatif TP (Penilaian Sumatif)
      const sumatifTpSiswa = data.penilaianSumatif?.filter(
        (p: any) => p.siswaId === siswa.id && p.semesterId === activeSemester.id
      ) || [];

      // Calculate Sumatif TP average and find highest/lowest
      let avgSumatifTP = 0;
      let highestTp = null;
      let lowestTp = null;

      if (sumatifTpSiswa.length > 0) {
        let total = 0;
        let maxVal = -1;
        let minVal = 101;

        sumatifTpSiswa.forEach((p: any) => {
          const nilai = Number(p.nilai) || 0;
          total += nilai;

          if (nilai > maxVal) {
            maxVal = nilai;
            highestTp = p.tpId;
          }
          if (nilai < minVal) {
            minVal = nilai;
            lowestTp = p.tpId;
          }
        });

        avgSumatifTP = total / sumatifTpSiswa.length;
      }

      // 2. Get Sumatif Akhir
      const sumatifAkhir = data.sumatifAkhir?.find(
        (p: any) => p.siswaId === siswa.id && p.semesterId === activeSemester.id
      );
      const nilaiAkhir = sumatifAkhir ? Number(sumatifAkhir.nilai) : 0;

      // 3. Calculate Nilai Rapor
      // 70% rata-rata sumatif TP + 30% sumatif akhir
      const nilaiRapor = (0.7 * avgSumatifTP) + (0.3 * nilaiAkhir);

      // 4. Generate Deskripsi
      let deskripsi = 'Belum ada data penilaian yang cukup untuk membuat deskripsi.';
      if (highestTp && lowestTp) {
        const highestTpName = data.tujuanPembelajaran?.find((t: any) => t.id === highestTp)?.name?.toLowerCase();
        const lowestTpName = data.tujuanPembelajaran?.find((t: any) => t.id === lowestTp)?.name?.toLowerCase();

        if (highestTpName && lowestTpName) {
          deskripsi = `${siswa.name} sangat baik dalam ${highestTpName}, perlu peningkatan dalam ${lowestTpName}.`;
        }
      }

      return {
        siswaId: siswa.id,
        siswaName: siswa.name,
        avgSumatifTP: Math.round(avgSumatifTP),
        nilaiAkhir: Math.round(nilaiAkhir),
        nilaiRapor: Math.round(nilaiRapor),
        deskripsi
      };
    });
  }, [selectedKelasId, activeSemester, studentsInClass, data.penilaianSumatif, data.sumatifAkhir, data.tujuanPembelajaran]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Cetak Rapor
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Rekap Nilai Rapor dan Deskripsi per Siswa
          </p>
        </div>
        {selectedKelasId && studentsInClass.length > 0 && (
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-5 h-5" />
            Cetak
          </button>
        )}
      </div>

      {!activeSemester ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl text-center print:hidden">
          Silakan pilih semester aktif terlebih dahulu.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 print:hidden">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Kelas</label>
              <select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              >
                <option value="" disabled>Pilih Kelas</option>
                {data.kelas?.map((k: any) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedKelasId && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
              <div className="p-6 border-b border-slate-100 bg-slate-50 print:bg-transparent print:border-b-2 print:border-slate-800">
                <h2 className="text-lg font-bold text-slate-800">
                  Laporan Hasil Belajar - Kelas {data.kelas?.find((k: any) => k.id === selectedKelasId)?.name}
                </h2>
                <p className="text-sm text-slate-500 print:text-slate-800">Semester: {activeSemester?.name}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max print:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-sm tracking-wider print:bg-slate-100">
                      <th className="px-6 py-4 font-bold border-b border-slate-200 w-16 print:border-slate-800">No</th>
                      <th className="px-6 py-4 font-bold border-b border-slate-200 w-48 print:border-slate-800">Nama Siswa</th>
                      <th className="px-6 py-4 font-bold border-b border-slate-200 w-32 text-center print:border-slate-800">Rata-rata Sumatif TP</th>
                      <th className="px-6 py-4 font-bold border-b border-slate-200 w-32 text-center print:border-slate-800">Sumatif Akhir</th>
                      <th className="px-6 py-4 font-bold border-b border-slate-200 w-32 text-center print:border-slate-800">Nilai Rapor</th>
                      <th className="px-6 py-4 font-bold border-b border-slate-200 print:border-slate-800">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                    {raporData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          Belum ada siswa di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      raporData.map((rapor: any, index: number) => (
                        <tr key={rapor.siswaId} className="hover:bg-slate-50/50 transition-colors print:break-inside-avoid">
                          <td className="px-6 py-4 text-slate-500 print:text-slate-800">{index + 1}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{rapor.siswaName}</td>
                          <td className="px-6 py-4 text-center text-slate-600">{rapor.avgSumatifTP}</td>
                          <td className="px-6 py-4 text-center text-slate-600">{rapor.nilaiAkhir}</td>
                          <td className="px-6 py-4 text-center font-bold text-indigo-700 print:text-slate-900">{rapor.nilaiRapor}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 print:text-slate-800 max-w-sm">{rapor.deskripsi}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
