export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      semesters: {
        Row: {
          id: string
          name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
          created_at?: string
        }
      }
      kelas: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      siswa: {
        Row: {
          id: string
          name: string
          nisn: string
          kelas_id: string
          jenis_kelamin: 'L' | 'P'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          nisn: string
          kelas_id: string
          jenis_kelamin: 'L' | 'P'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          nisn?: string
          kelas_id?: string
          jenis_kelamin?: 'L' | 'P'
          created_at?: string
        }
      }
      tujuan_pembelajaran: {
        Row: {
          id: string
          name: string
          kktp: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          kktp: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          kktp?: number
          created_at?: string
        }
      }
      kehadiran: {
        Row: {
          id: string
          date: string
          siswa_id: string
          status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Bolos'
          keterangan: string | null
          semester_id: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          siswa_id: string
          status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Bolos'
          keterangan?: string | null
          semester_id: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          siswa_id?: string
          status?: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Bolos'
          keterangan?: string | null
          semester_id?: string
          created_at?: string
        }
      }
      penilaian_formatif: {
        Row: {
          id: string
          siswa_id: string
          semester_id: string
          tp_id: string
          teknik: 'Observasi' | 'CATs' | 'Exit Ticket'
          nilai: 'SB' | 'B' | 'C' | 'PB'
          umpan_balik: string | null
          hal_penting: string | null
          hal_bingung: string | null
          created_at: string
        }
        Insert: {
          id?: string
          siswa_id: string
          semester_id: string
          tp_id: string
          teknik: 'Observasi' | 'CATs' | 'Exit Ticket'
          nilai: 'SB' | 'B' | 'C' | 'PB'
          umpan_balik?: string | null
          hal_penting?: string | null
          hal_bingung?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          siswa_id?: string
          semester_id?: string
          tp_id?: string
          teknik?: 'Observasi' | 'CATs' | 'Exit Ticket'
          nilai?: 'SB' | 'B' | 'C' | 'PB'
          umpan_balik?: string | null
          hal_penting?: string | null
          hal_bingung?: string | null
          created_at?: string
        }
      }
      penilaian_sumatif: {
        Row: {
          id: string
          siswa_id: string
          semester_id: string
          tp_id: string
          teknik: 'Tes Tertulis' | 'Kinerja' | 'Proyek'
          nilai: number
          nilai_remedial: number | null
          jumlah_soal: number | null
          bobot_soal: Json | null
          skor_detail: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          siswa_id: string
          semester_id: string
          tp_id: string
          teknik: 'Tes Tertulis' | 'Kinerja' | 'Proyek'
          nilai: number
          nilai_remedial?: number | null
          jumlah_soal?: number | null
          bobot_soal?: Json | null
          skor_detail?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          siswa_id?: string
          semester_id?: string
          tp_id?: string
          teknik?: 'Tes Tertulis' | 'Kinerja' | 'Proyek'
          nilai?: number
          nilai_remedial?: number | null
          jumlah_soal?: number | null
          bobot_soal?: Json | null
          skor_detail?: Json | null
          created_at?: string
        }
      }
      jurnal: {
        Row: {
          id: string
          date: string
          type: 'Mengajar' | 'Refleksi'
          content: string
          semester_id: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          type: 'Mengajar' | 'Refleksi'
          content: string
          semester_id: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          type?: 'Mengajar' | 'Refleksi'
          content?: string
          semester_id?: string
          created_at?: string
        }
      }
      agendas: {
        Row: {
          id: string
          title: string
          start_date: string
          end_date: string
          category: 'Kegiatan' | 'Libur' | 'Sumatif Lingkup Materi' | 'Sumatif Akhir Semester' | 'Sumatif Akhir Tahun' | 'Sumatif Akhir Fase' | 'Lainnya'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          start_date: string
          end_date: string
          category: 'Kegiatan' | 'Libur' | 'Sumatif Lingkup Materi' | 'Sumatif Akhir Semester' | 'Sumatif Akhir Tahun' | 'Sumatif Akhir Fase' | 'Lainnya'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          start_date?: string
          end_date?: string
          category?: 'Kegiatan' | 'Libur' | 'Sumatif Lingkup Materi' | 'Sumatif Akhir Semester' | 'Sumatif Akhir Tahun' | 'Sumatif Akhir Fase' | 'Lainnya'
          created_at?: string
        }
      }
    }
  }
}
