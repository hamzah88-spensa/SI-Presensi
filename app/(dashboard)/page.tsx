'use client';

import { useData } from '@/lib/data-context';
import { Users, BookOpen, CheckSquare, FileText, TrendingUp, AlertTriangle, CheckCircle2, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

export default function Dashboard() {
  const { data, activeSemester, isLoaded } = useData();
  const [tindakanData, setTindakanData] = useState<Record<string, { notes: string, date: string }>>({});
  const [selectedSiswaTindakan, setSelectedSiswaTindakan] = useState<any>(null);
  const [tindakanInput, setTindakanInput] = useState('');

  useEffect(() => {
    if (activeSemester) {
      const saved = localStorage.getItem(`tindakan_siswa_${activeSemester.id}`);
      if (saved) {
        try {
          setTindakanData(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse tindakan data', e);
        }
      } else {
        setTindakanData({});
      }
    }
  }, [activeSemester]);

  const saveTindakan = () => {
    if (!selectedSiswaTindakan || !activeSemester) return;
    const newData = {
      ...tindakanData,
      [selectedSiswaTindakan.siswa.id]: {
        notes: tindakanInput,
        date: new Date().toISOString()
      }
    };
    setTindakanData(newData);
    localStorage.setItem(`tindakan_siswa_${activeSemester.id}`, JSON.stringify(newData));
    setSelectedSiswaTindakan(null);
    setTindakanInput('');
  };

  const siswaPerluPerhatian = useMemo(() => {
    if (!activeSemester) return [];
    
    const kehadiranSemester = data.kehadiran.filter(k => k.semesterId === activeSemester.id);
    
    const statsPerSiswa: Record<string, { Hadir: number, Izin: number, Sakit: number, Alpa: number, Bolos: number, total: number }> = {};
    
    kehadiranSemester.forEach(k => {
      if (!statsPerSiswa[k.siswaId]) {
        statsPerSiswa[k.siswaId] = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0, Bolos: 0, total: 0 };
      }
      statsPerSiswa[k.siswaId][k.status]++;
      statsPerSiswa[k.siswaId].total++;
    });
    
    const result = [];
    for (const siswaId in statsPerSiswa) {
      const stats = statsPerSiswa[siswaId];
      if (stats.total > 0) {
        const persentaseAlpaBolos = ((stats.Alpa + stats.Bolos) / stats.total) * 100;
        const persentaseKehadiranAsli = (stats.Hadir / stats.total) * 100;
        
        if (persentaseAlpaBolos > 40 || stats.Bolos > 2) {
          const siswa = data.siswa.find(s => s.id === siswaId);
          const kelas = data.kelas.find(k => k.id === siswa?.kelasId);
          if (siswa) {
            result.push({
              siswa,
              kelas,
              stats,
              persentaseKehadiranAsli,
              alasan: persentaseAlpaBolos > 40 ? `Alpa/Bolos > 40% (${persentaseAlpaBolos.toFixed(0)}%)` : `Bolos > 2 kali (${stats.Bolos} kali)`
            });
          }
        }
      }
    }
    return result;
  }, [data.kehadiran, data.siswa, data.kelas, activeSemester]);

  if (!isLoaded) return <div className="animate-pulse flex flex-col gap-6">
    <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
    <div className="grid grid-cols-4 gap-6"><div className="h-32 bg-slate-200 rounded-2xl"></div></div>
  </div>;

  const currentKehadiran = data.kehadiran.filter(k => k.semesterId === activeSemester?.id);
  const currentPenilaianFormatif = data.penilaianFormatif.filter(p => p.semesterId === activeSemester?.id);
  const currentPenilaianSumatif = data.penilaianSumatif.filter(p => p.semesterId === activeSemester?.id);
  const totalPenilaian = currentPenilaianFormatif.length + currentPenilaianSumatif.length;

  const stats = [
    { name: 'Total Kelas', value: data.kelas.length, icon: BookOpen, color: 'bg-blue-500', link: '/master/kelas' },
    { name: 'Total Siswa', value: data.siswa.length, icon: Users, color: 'bg-indigo-500', link: '/master/siswa' },
    { name: 'Data Kehadiran', value: currentKehadiran.length, icon: CheckSquare, color: 'bg-emerald-500', link: '/presensi/rekap' },
    { name: 'Data Penilaian', value: totalPenilaian, icon: FileText, color: 'bg-purple-500', link: '/penilaian/rekap' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang Hamzah, S.Pd</h1>
          <p className="text-indigo-100 max-w-2xl text-lg">
            SIGMA (Sistem Integrasi Guru Modern Aktif), Kelola data kehadiran, penilaian siswa dan jurnal mengajar guru dengan mudah. Anda sedang mengakses data untuk semester <span className="font-bold text-white">{activeSemester?.name || 'Belum dipilih'}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} href={stat.link} className="block group">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl text-white ${stat.color} shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Siswa Perlu Perhatian Section */}
      {siswaPerluPerhatian.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-bold text-slate-800">Siswa Perlu Perhatian</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {siswaPerluPerhatian.map((item) => {
              const hasTindakan = !!tindakanData[item.siswa.id];
              return (
                <div key={item.siswa.id} className={`p-4 rounded-xl border ${hasTindakan ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800">{item.siswa.name}</h4>
                      <p className="text-xs text-slate-500">Kelas {item.kelas?.name}</p>
                    </div>
                    {hasTindakan ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm text-slate-600 mb-3">
                    <p><span className="font-medium">Alasan:</span> {item.alasan}</p>
                    <p><span className="font-medium">Kehadiran:</span> {item.persentaseKehadiranAsli.toFixed(0)}%</p>
                  </div>
                  
                  {hasTindakan ? (
                    <div className="bg-white/60 p-2 rounded-lg text-xs text-slate-700 border border-emerald-100 mb-3">
                      <p className="font-medium text-emerald-700 mb-1">Tindakan dilakukan:</p>
                      <p>{tindakanData[item.siswa.id].notes}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(tindakanData[item.siswa.id].date).toLocaleDateString('id-ID')}</p>
                    </div>
                  ) : null}

                  <button
                    onClick={() => {
                      setSelectedSiswaTindakan(item);
                      setTindakanInput(tindakanData[item.siswa.id]?.notes || '');
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      hasTindakan 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {hasTindakan ? 'Edit Tindakan' : 'Beri Tindakan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-500" />
            Aktivitas Kehadiran Terakhir
          </h3>
          {currentKehadiran.length > 0 ? (
            <div className="space-y-4">
              {currentKehadiran.slice(-5).reverse().map(k => {
                const siswa = data.siswa.find(s => s.id === k.siswaId);
                return (
                  <div key={k.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {siswa?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{siswa?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{k.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      k.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :
                      k.status === 'Izin' ? 'bg-blue-100 text-blue-700' :
                      k.status === 'Sakit' ? 'bg-amber-100 text-amber-700' :
                      k.status === 'Bolos' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {k.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Belum ada data kehadiran di semester ini.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Penilaian Sumatif Terakhir
          </h3>
          {currentPenilaianSumatif.length > 0 ? (
            <div className="space-y-4">
              {currentPenilaianSumatif.slice(-5).reverse().map(p => {
                const siswa = data.siswa.find(s => s.id === p.siswaId);
                const tp = data.tujuanPembelajaran.find(t => t.id === p.tpId);
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                        {siswa?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{siswa?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{tp?.name || 'TP'} - {p.teknik}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-800">{p.nilai}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Belum ada data penilaian sumatif di semester ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tindakan */}
      {selectedSiswaTindakan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Catatan Tindakan</h3>
              <button 
                onClick={() => setSelectedSiswaTindakan(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">Siswa</p>
                <p className="font-medium text-slate-800">{selectedSiswaTindakan.siswa.name}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tindakan yang dilakukan
                </label>
                <textarea
                  value={tindakanInput}
                  onChange={(e) => setTindakanInput(e.target.value)}
                  placeholder="Misal: Pembinaan dengan Guru BK, Undang orang tua..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedSiswaTindakan(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={saveTindakan}
                  disabled={!tindakanInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Tindakan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
