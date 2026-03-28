-- Create tables for Sistem Kehadiran & Penilaian

-- 1. Semesters Table
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Kelas Table
CREATE TABLE kelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  jenjang TEXT NOT NULL CHECK (jenjang IN ('7', '8', '9')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Siswa Table
CREATE TABLE siswa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  nisn TEXT NOT NULL UNIQUE,
  kelas_id UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tujuan Pembelajaran Table
CREATE TABLE tujuan_pembelajaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  kktp INTEGER NOT NULL,
  jenjang TEXT NOT NULL CHECK (jenjang IN ('7', '8', '9')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Kehadiran Table
CREATE TABLE kehadiran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alpa', 'Bolos')),
  keterangan TEXT,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Penilaian Formatif Table
CREATE TABLE penilaian_formatif (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  tp_id UUID NOT NULL REFERENCES tujuan_pembelajaran(id) ON DELETE CASCADE,
  teknik TEXT NOT NULL CHECK (teknik IN ('Observasi', 'CATs', 'Exit Ticket')),
  nilai TEXT NOT NULL CHECK (nilai IN ('SB', 'B', 'C', 'PB')),
  umpan_balik TEXT,
  hal_penting TEXT,
  hal_bingung TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Penilaian Sumatif Table
CREATE TABLE penilaian_sumatif (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  tp_id UUID NOT NULL REFERENCES tujuan_pembelajaran(id) ON DELETE CASCADE,
  teknik TEXT NOT NULL CHECK (teknik IN ('Tes Tertulis', 'Kinerja', 'Proyek')),
  nilai INTEGER NOT NULL,
  nilai_remedial INTEGER,
  jumlah_soal INTEGER,
  bobot_soal JSONB,
  skor_detail JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Jurnal Table
CREATE TABLE jurnal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Mengajar', 'Refleksi')),
  content TEXT NOT NULL,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Agendas Table
CREATE TABLE agendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Kegiatan', 'Libur', 'Sumatif Lingkup Materi', 'Sumatif Akhir Semester', 'Sumatif Akhir Tahun', 'Sumatif Akhir Fase', 'Lainnya')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
-- Since this is a single-user admin app for now, we'll allow all operations for authenticated users (anon key in this context)
-- In a real production app with multiple users, you'd restrict this based on auth.uid()

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE tujuan_pembelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran ENABLE ROW LEVEL SECURITY;
ALTER TABLE penilaian_formatif ENABLE ROW LEVEL SECURITY;
ALTER TABLE penilaian_sumatif ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurnal ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for demo/admin purposes)
CREATE POLICY "Allow all operations for anon" ON semesters FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON kelas FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON siswa FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON tujuan_pembelajaran FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON kehadiran FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON penilaian_formatif FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON penilaian_sumatif FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON jurnal FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON agendas FOR ALL USING (true);
