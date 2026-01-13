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
    // Ambil semua data untuk menghitung poin dan menampilkan riwayat
    const sql = 'SELECT * FROM mood_history ORDER BY id DESC';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.render('index', { history: [], totalPoints: 0, progress: 0 });
        }
        
        // LOGIKA POIN: 1 jurnal = 10 poin
        const totalPoints = results.length * 10;
        // LOGIKA PROGRESS: Misal tiap 100 poin naik level
        const progress = totalPoints % 100; 
        
        res.render('index', { 
            history: results, 
            totalPoints: totalPoints, 
            progress: progress 
        });
    });
});

// Rute untuk Hapus Jurnal (DELETE)
app.post('/hapus/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM mood_history WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Gagal menghapus data');
        }
        res.redirect('/');
    });
});

// Rute untuk Update Jurnal (UPDATE)
app.post('/edit/:id', (req, res) => {
    const id = req.params.id;
    const { mood, catatan } = req.body;
    const sql = 'UPDATE mood_history SET mood = ?, catatan = ? WHERE id = ?';
    
    db.query(sql, [mood, catatan, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Gagal mengupdate data');
        }
        res.redirect('/');
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
