const express = require('express');
const path = require('path');
const apiRoutes = require('./api'); // (DIUBAH) Impor router dari folder api

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Sajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// (DIUBAH) Gunakan router API untuk semua request yang diawali dengan /api
// Express akan secara otomatis meneruskan request seperti /api/tasks ke file router kita
app.use('/api', apiRoutes);


// (DIHAPUS) SEMUA BLOK app.get('/api/tasks'), app.post, dll. SUDAH PINDAH


// Catch-all route untuk mengirim index.html untuk single page application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Menjalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});