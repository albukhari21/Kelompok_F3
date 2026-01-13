const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// Middleware agar bisa membaca data dari form Azizah
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// 1. KONFIGURASI DATABASE (Sesuai Tabel Kelompok 3)
// Gunakan createPool agar koneksi tidak gampang putus
const db = mysql.createPool({
    host: 'db_service',
    user: 'kelasf',
    password: 'TekserF-2025',
    database: 'mood_tracker_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tes koneksi sekali saja saat start
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database tidak bisa dijangkau: ', err);
    } else {
        console.log('Database terhubung!');
        connection.release();
    }
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
