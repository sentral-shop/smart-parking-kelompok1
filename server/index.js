require('dotenv').config({ path: '../.env' }); // Baca .env dari root
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

let perintahBukaGerbang = false;

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'Smart Parking Backend Online', version: '2.0' });
});

// Kendaraan masuk — dipanggil Arduino
app.post('/api/masuk', async (req, res) => {
    const plat_nomor = req.body?.plat_nomor || req.body;
    if (!plat_nomor) return res.status(400).json({ error: 'plat_nomor wajib' });

    const { data, error } = await supabase
        .from('parking_logs')
        .insert([{
            plat_nomor: String(plat_nomor).trim(),
            status: 'Masuk',
            waktu_masuk: new Date().toISOString()
        }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'OK', data });
});

// Ambil semua log — dipanggil React
app.get('/api/logs', async (req, res) => {
    const { data, error } = await supabase
        .from('parking_logs')
        .select('*')
        .order('waktu_masuk', { ascending: false })
        .limit(100);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// Buka gerbang keluar — dipanggil React
app.post('/api/keluar', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id wajib' });

    const { data, error } = await supabase
        .from('parking_logs')
        .update({ status: 'Keluar', waktu_keluar: new Date().toISOString() })
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    perintahBukaGerbang = true;
    res.status(200).json({ message: 'Perintah dikirim!', data });
});

// Cek perintah keluar — di-polling Arduino setiap 5 detik
app.get('/api/cek-keluar', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    if (perintahBukaGerbang) {
        perintahBukaGerbang = false;
        res.send('OPEN_GATE');
    } else {
        res.send('STANDBY');
    }
});

// Statistik ringkas — untuk dashboard
app.get('/api/stats', async (req, res) => {
    const { data, error } = await supabase
        .from('parking_logs')
        .select('status');

    if (error) return res.status(500).json({ error: error.message });

    const total = data.length;
    const didalam = data.filter(d => d.status === 'Masuk').length;
    const selesai = data.filter(d => d.status === 'Keluar').length;

    res.json({ total, didalam, selesai });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend aktif di http://localhost:${PORT}`));