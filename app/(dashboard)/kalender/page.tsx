'use client';

import React, { useState, useMemo } from 'react';
import { useData, Agenda } from '@/lib/data-context';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isWeekend, 
  addMonths, 
  subMonths,
  isWithinInterval,
  parseISO,
  startOfDay
} from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  'Kegiatan',
  'Libur',
  'Sumatif Lingkup Materi',
  'Sumatif Akhir Semester',
  'Sumatif Akhir Tahun',
  'Sumatif Akhir Fase',
  'Lainnya'
];

const CATEGORY_COLORS: Record<string, string> = {
  'Kegiatan': 'bg-blue-100 text-blue-700 border-blue-200',
  'Libur': 'bg-red-100 text-red-700 border-red-200',
  'Sumatif Lingkup Materi': 'bg-green-100 text-green-700 border-green-200',
  'Sumatif Akhir Semester': 'bg-purple-100 text-purple-700 border-purple-200',
  'Sumatif Akhir Tahun': 'bg-orange-100 text-orange-700 border-orange-200',
  'Sumatif Akhir Fase': 'bg-teal-100 text-teal-700 border-teal-200',
  'Lainnya': 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function KalenderPage() {
  const { data, addAgenda, updateAgenda, deleteAgenda } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    category: 'Kegiatan' as Agenda['category']
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const currentYear = format(currentDate, 'yyyy');

  // Fetch holidays
  React.useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoadingHolidays(true);
      try {
        const response = await fetch(`/api/holidays?year=${currentYear}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setHolidays(data);
          } else if (data.error) {
            console.error('Holiday API Error:', data.error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
      } finally {
        setIsLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, [currentYear]);

  // Agendas for current month
  const monthAgendas = useMemo(() => {
    return data.agendas.filter(agenda => {
      const start = parseISO(agenda.startDate);
      const end = parseISO(agenda.endDate);
      return (
        (start >= monthStart && start <= monthEnd) ||
        (end >= monthStart && end <= monthEnd) ||
        (start <= monthStart && end >= monthEnd)
      );
    });
  }, [data.agendas, monthStart, monthEnd]);

  // National holidays for current month
  const monthHolidays = useMemo(() => {
    return holidays.filter(h => {
      const date = parseISO(h.tanggal);
      return date >= monthStart && date <= monthEnd;
    });
  }, [holidays, monthStart, monthEnd]);

  // Calculations
  const stats = useMemo(() => {
    const totalDays = daysInMonth.length;
    let liburCount = 0;
    let hebSubtractions = 0; // Kegiatan, SAS, SAT

    daysInMonth.forEach(day => {
      const isDayWeekend = isWeekend(day);
      const isNationalHoliday = holidays.some(h => isSameDay(day, parseISO(h.tanggal)));
      
      const dayAgendas = monthAgendas.filter(a => 
        isWithinInterval(startOfDay(day), {
          start: startOfDay(parseISO(a.startDate)),
          end: startOfDay(parseISO(a.endDate))
        })
      );

      const isLiburAgenda = dayAgendas.some(a => a.category === 'Libur');
      const isKegiatanOrSumatif = dayAgendas.some(a => 
        ['Kegiatan', 'Sumatif Akhir Semester', 'Sumatif Akhir Tahun'].includes(a.category)
      );

      if (isDayWeekend || isLiburAgenda || isNationalHoliday) {
        liburCount++;
      } else if (isKegiatanOrSumatif) {
        hebSubtractions++;
      }
    });

    const hes = totalDays - liburCount;
    const heb = totalDays - (liburCount + hebSubtractions);

    return { totalDays, liburCount, hebSubtractions, hes, heb };
  }, [daysInMonth, monthAgendas, holidays]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleOpenModal = (agenda?: Agenda) => {
    if (agenda) {
      setEditingAgenda(agenda);
      setFormData({
        title: agenda.title,
        startDate: agenda.startDate,
        endDate: agenda.endDate,
        category: agenda.category
      });
    } else {
      setEditingAgenda(null);
      setFormData({
        title: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        category: 'Kegiatan'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAgenda) {
        await updateAgenda(editingAgenda.id, formData);
        toast.success('Agenda berhasil diperbarui');
      } else {
        await addAgenda(formData.title, formData.startDate, formData.endDate, formData.category);
        toast.success('Agenda berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Gagal menyimpan agenda');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      try {
        await deleteAgenda(id);
        toast.success('Agenda berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus agenda');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kalender Akademik</h1>
          <p className="text-slate-500">Kelola agenda dan hari efektif sekolah</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Agenda</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              {format(currentDate, 'MMMM yyyy', { locale: id })}
              {isLoadingHolidays && (
                <span className="text-[10px] font-normal text-slate-400 animate-pulse">
                  (Memuat Libur Nasional...)
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-medium hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                Hari Ini
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => (
                <div key={day} className={`p-2 text-center text-xs font-bold uppercase tracking-wider bg-slate-50 ${i === 0 || i === 6 ? 'text-red-500' : 'text-slate-500'}`}>
                  {day}
                </div>
              ))}
              
              {/* Padding for start of month */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`pad-${i}`} className="bg-white min-h-[100px] p-2 opacity-30" />
              ))}

              {daysInMonth.map((day) => {
                const isDayWeekend = isWeekend(day);
                const holiday = holidays.find(h => isSameDay(day, parseISO(h.tanggal)));
                const isNationalHoliday = !!holiday;
                
                const dayAgendas = monthAgendas.filter(a => 
                  isWithinInterval(startOfDay(day), {
                    start: startOfDay(parseISO(a.startDate)),
                    end: startOfDay(parseISO(a.endDate))
                  })
                );

                return (
                  <div 
                    key={day.toString()} 
                    className={`bg-white min-h-[100px] p-2 border-t border-l border-slate-100 transition-colors hover:bg-slate-50/50 relative ${isDayWeekend || isNationalHoliday ? 'bg-red-50/30' : ''}`}
                  >
                    <span className={`text-sm font-medium ${isDayWeekend || isNationalHoliday ? 'text-red-500' : 'text-slate-700'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1">
                      {isNationalHoliday && (
                        <div 
                          className="text-[10px] px-1.5 py-0.5 rounded border truncate bg-red-100 text-red-700 border-red-200 font-medium"
                          title={holiday.keterangan}
                        >
                          {holiday.keterangan}
                        </div>
                      )}
                      {dayAgendas.map((agenda) => (
                        <div 
                          key={agenda.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded border truncate cursor-pointer hover:brightness-95 transition-all ${CATEGORY_COLORS[agenda.category]}`}
                          onClick={() => handleOpenModal(agenda)}
                          title={agenda.title}
                        >
                          {agenda.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats & Agenda List Section */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-500" />
              Detail Efektifitas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Hari</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalDays}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-500 font-medium uppercase tracking-wider">Hari Libur</p>
                <p className="text-2xl font-bold text-red-600">{stats.liburCount}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">HES</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.hes}</p>
                <p className="text-[10px] text-indigo-400 mt-1 italic">Hari Efektif Sekolah</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider">HEB</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.heb}</p>
                <p className="text-[10px] text-emerald-400 mt-1 italic">Hari Efektif Belajar</p>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 space-y-1 bg-slate-50 p-2 rounded-lg">
              <p>• HES = Total Hari - Libur</p>
              <p>• HEB = Total Hari - (Libur + Kegiatan/SAS/SAT)</p>
            </div>
          </div>

          {/* Agenda List Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col max-h-[500px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Agenda Bulan Ini</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {monthAgendas.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Tidak ada agenda bulan ini</p>
                </div>
              ) : (
                monthAgendas.map((agenda) => (
                  <div 
                    key={agenda.id}
                    className="group p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all relative"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[agenda.category]}`}>
                        {agenda.category}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(agenda)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(agenda.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{agenda.title}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {agenda.startDate === agenda.endDate 
                        ? format(parseISO(agenda.startDate), 'd MMMM yyyy', { locale: id })
                        : `${format(parseISO(agenda.startDate), 'd MMM', { locale: id })} - ${format(parseISO(agenda.endDate), 'd MMM yyyy', { locale: id })}`
                      }
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Agenda Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-900">
                  {editingAgenda ? 'Edit Agenda' : 'Tambah Agenda Baru'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Judul Agenda</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Contoh: Libur Semester Ganjil"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tanggal Mulai</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value > formData.endDate ? e.target.value : formData.endDate })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tanggal Selesai</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Kategori Agenda</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Agenda['category'] })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none bg-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-900/20"
                  >
                    {editingAgenda ? 'Simpan Perubahan' : 'Tambah Agenda'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
