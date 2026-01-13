const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// Middleware agar bisa membaca data dari form Azizah
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// 1. KONFIGURASI DATABASE (Sesuai Tabel Kelompok 3)
const db = mysql.createConnection({
    host: 'db_service',        // Nama container di docker-compose
    user: 'kelasf',            // Sesuai tabel
    password: 'TekserF-2025',  // Sesuai tabel
    database: 'mood_tracker_db'
});

db.connect((err) => {
    if (err) {
        console.error('Gagal konek ke MySQL: ' + err.stack);
        return;
    }
    console.log('Berhasil terhubung ke database MySQL.');
});

// 2. TAMPILKAN HALAMAN UTAMA & RIWAYAT
app.get('/', (req, res) => {
    const query = 'SELECT * FROM mood_history ORDER BY id DESC LIMIT 5';
    db.query(query, (err, results) => {
        if (err) throw err;
        // Variabel 'history' dikirim ke index.ejs
        res.render('index', { history: results || [] });
    });
});

// 3. SIMPAN DATA DARI FORM AZIZAH
app.post('/simpan', (req, res) => {
    const { mood, catatan } = req.body;
    const query = 'INSERT INTO mood_history (mood, catatan) VALUES (?, ?)';
    
    db.query(query, [mood, catatan], (err) => {
        if (err) {
            console.error(err);
            return res.send("Gagal menyimpan data.");
        }
        console.log("Data Berhasil Disimpan: ", mood);
        res.redirect('/'); // Refresh halaman agar data muncul di riwayat
    });
});

app.listen(3000, () => {
    console.log('Server Backend berjalan di port 3000');
});
