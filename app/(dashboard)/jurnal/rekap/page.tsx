'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { Printer } from 'lucide-react';

export default function RekapJurnalPage() {
  const { data, activeSemester } = useData();
  const [kelasId, setKelasId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const filteredJurnal = useMemo(() => {
    if (!activeSemester) return [];
    
    return data.jurnal
      .filter(j => j.semesterId === activeSemester.id)
      .filter(j => {
        const parsed = parseContent(j.content);
        return kelasId ? parsed.kelasId === kelasId : true;
      })
      .filter(j => {
        if (startDate && endDate) {
          return j.date >= startDate && j.date <= endDate;
        }
        if (startDate) return j.date >= startDate;
        if (endDate) return j.date <= endDate;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort ascending for report
  }, [data.jurnal, activeSemester, kelasId, startDate, endDate]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm 15mm;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          thead {
            display: table-header-group;
          }
        }
      `}</style>

      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold text-gray-800">Rekap Jurnal Mengajar</h1>
        <button
          onClick={handlePrint}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-sm"
        >
          <Printer size={20} />
          Cetak PDF
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-6 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
            <select
              value={kelasId}
              onChange={(e) => setKelasId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Semua Kelas --</option>
              {data.kelas.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div id="print-area" className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-6 print:shadow-none print:p-0 print:bg-transparent">
        
        {/* Kop Surat Resmi (Hanya tampil saat print) */}
        <div className="hidden print:flex justify-between items-center border-b-2 border-black pb-2 mb-6">
          {/* Placeholder untuk Logo Kiri */}
          <div className="w-16 h-16 flex items-center justify-center border border-gray-300 rounded-full overflow-hidden">
            <span className="text-[8px] text-center text-gray-500">Logo<br/>Kemdikbud</span>
          </div>
          
          <div className="text-center flex-1 px-4">
            <h1 className="text-xl font-bold uppercase tracking-wide">JURNAL MENGAJAR GURU</h1>
            <h2 className="text-lg font-bold">SMP NEGERI 1 BIAU</h2>
          </div>
          
          {/* Placeholder untuk Logo Kanan */}
          <div className="w-16 h-16 flex items-center justify-center border border-gray-300 rounded-full overflow-hidden">
            <span className="text-[8px] text-center text-gray-500">Logo<br/>Sekolah</span>
          </div>
        </div>

        {/* Informasi Tambahan (Hanya tampil saat print) */}
        <div className="hidden print:grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-24 font-semibold py-1">Kelas</td>
                  <td className="w-4 py-1">:</td>
                  <td className="py-1">{kelasId ? data.kelas.find(k => k.id === kelasId)?.name : 'Semua Kelas'}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-1">Semester</td>
                  <td className="py-1">:</td>
                  <td className="py-1">{activeSemester?.name || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-32 font-semibold py-1">Rentang Tanggal</td>
                  <td className="w-4 py-1">:</td>
                  <td className="py-1">
                    {startDate ? formatDate(startDate) : 'Awal'} s.d. {endDate ? formatDate(endDate) : 'Akhir'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 print:overflow-visible print:pb-0">
          <table className="w-full text-sm text-left text-gray-800 min-w-max print:text-black border-collapse">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 print:bg-gray-100 print:text-black">
              <tr>
                <th className="px-4 py-2 border print:border-black w-12 text-center">No</th>
                <th className="px-4 py-2 border print:border-black w-40">Tanggal & Kelas</th>
                <th className="px-4 py-2 border print:border-black">Materi & Tujuan Pembelajaran</th>
                <th className="px-4 py-2 border print:border-black">Catatan / Dinamika</th>
                <th className="px-4 py-2 border print:border-black">Refleksi, Hambatan & Ketidakhadiran</th>
              </tr>
            </thead>
            <tbody>
              {filteredJurnal.map((row, index) => {
                const parsed = parseContent(row.content);
                const kelasName = data.kelas.find(k => k.id === parsed.kelasId)?.name || '-';
                
                return (
                  <tr key={row.id} className="bg-white hover:bg-gray-50 print:break-inside-avoid">
                    <td className="px-4 py-3 border print:border-black text-center align-top">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 border print:border-black font-medium align-top">
                      <div>{formatDate(row.date)}</div>
                      <div className="text-indigo-600 print:text-black font-bold mt-1">{kelasName}</div>
                    </td>
                    <td className="px-4 py-3 border print:border-black whitespace-pre-wrap align-top">
                      {parsed.materi || '-'}
                    </td>
                    <td className="px-4 py-3 border print:border-black whitespace-pre-wrap align-top">
                      {parsed.dinamika || '-'}
                    </td>
                    <td className="px-4 py-3 border print:border-black whitespace-pre-wrap align-top">
                      {parsed.refleksi && (
                        <div className="mb-2">
                          <span className="font-semibold">Refleksi:</span><br/>{parsed.refleksi}
                        </div>
                      )}
                      {parsed.hambatan && (
                        <div className="mb-2">
                          <span className="font-semibold">Hambatan:</span><br/>{parsed.hambatan}
                        </div>
                      )}
                      {parsed.solusi && (
                        <div className="mb-2">
                          <span className="font-semibold">Solusi:</span><br/>{parsed.solusi}
                        </div>
                      )}
                      {parsed.absentStudents && parsed.absentStudents.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 print:border-black">
                          <span className="font-semibold text-orange-800 print:text-black">Siswa Tidak Hadir:</span>
                          <ul className="list-disc list-inside mt-1 text-orange-700 print:text-black">
                            {parsed.absentStudents.map((s: any, i: number) => (
                              <li key={i}>{s.name} ({s.status})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {!parsed.refleksi && !parsed.hambatan && !parsed.solusi && (!parsed.absentStudents || parsed.absentStudents.length === 0) && '-'}
                    </td>
                  </tr>
                );
              })}
              {filteredJurnal.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 border print:border-black">
                    Tidak ada data jurnal yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan (Hanya tampil saat print) */}
        <div className="hidden print:flex mt-12 justify-end">
          <div className="text-center">
            <p className="mb-[70px]">Guru Mata Pelajaran,</p>
            <p className="font-bold underline">Hamzah, S.Pd</p>
            <p>NIP. 198808172019031014</p>
          </div>
        </div>

      </div>
    </div>
  );

}
