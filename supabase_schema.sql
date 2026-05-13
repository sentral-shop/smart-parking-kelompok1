-- =================================================================================
-- SMART PARKING SUPABASE SCHEMA
-- Jalankan seluruh script ini di menu "SQL Editor" pada dashboard Supabase Anda.
-- =================================================================================

-- 1. Buat Tabel "parking_logs"
CREATE TABLE IF NOT EXISTS public.parking_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plat_nomor TEXT NOT NULL,
    status TEXT NOT NULL,
    waktu_masuk TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    waktu_keluar TIMESTAMP WITH TIME ZONE
);

-- 2. Aktifkan Row Level Security (RLS) pada tabel (Sangat direkomendasikan)
ALTER TABLE public.parking_logs ENABLE ROW LEVEL SECURITY;

-- 3. Buat Policies (Aturan Akses) agar Backend dan API bisa membaca/menulis data

-- Kebijakan untuk membaca data (SELECT)
CREATE POLICY "Enable read access for all users" 
ON public.parking_logs 
FOR SELECT 
USING (true);

-- Kebijakan untuk memasukkan data baru (INSERT)
CREATE POLICY "Enable insert for all users" 
ON public.parking_logs 
FOR INSERT 
WITH CHECK (true);

-- Kebijakan untuk memperbarui data (UPDATE - misal untuk mengganti status 'Keluar')
CREATE POLICY "Enable update for all users" 
ON public.parking_logs 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 4. Aktifkan Realtime (Opsional, sangat bagus untuk update frontend langsung)
-- Jika fitur ini error di Supabase Anda, hapus bagian ini.
alter publication supabase_realtime add table public.parking_logs;

-- Selesai! Tabel siap digunakan oleh Backend Node.js / Vercel Anda.
