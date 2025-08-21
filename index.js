const express = require('express');
const prisma = require('./lib/prisma'); // Mengimpor instance Prisma Client

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk bisa membaca body JSON dari request
// dan untuk mengizinkan request dari frontend (CORS)
app.use(express.json());

// Middleware sederhana untuk CORS
app.use((req, res, next) => {
    // Mengizinkan akses dari semua origin. Untuk produksi, ganti '*' dengan domain frontend Anda.
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});


// === ROUTES / ENDPOINTS DENGAN PRISMA ===

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 1. GET (Read): Mendapatkan semua tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: 'Server Error'
        });
    }
});

// 2. GET (Read): Mendapatkan satu task berdasarkan ID
app.get('/tasks/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const task = await prisma.task.findUnique({
            where: {
                id: parseInt(id)
            },
        });

        if (!task) {
            return res.status(404).json({
                error: 'Task tidak ditemukan'
            });
        }
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: 'Server Error'
        });
    }
});

// 3. POST (Create): Membuat task baru
app.post('/tasks', async (req, res) => {
    try {
        const {
            title
        } = req.body;
        if (!title) {
            return res.status(400).json({
                error: 'Title tidak boleh kosong'
            });
        }
        const newTask = await prisma.task.create({
            data: {
                title: title,
            },
        });
        res.status(201).json(newTask);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: 'Server Error'
        });
    }
});

// 4. PUT (Update): Memperbarui task berdasarkan ID
app.put('/tasks/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            title,
            is_completed
        } = req.body;

        const updatedTask = await prisma.task.update({
            where: {
                id: parseInt(id)
            },
            data: {
                title,
                is_completed,
            },
        });
        res.json(updatedTask);
    } catch (err) {
        // Tangani error jika task dengan ID tersebut tidak ada (P2025 adalah kode error Prisma untuk record not found)
        if (err.code === 'P2025') {
            return res.status(404).json({
                error: 'Task tidak ditemukan'
            });
        }
        console.error(err.message);
        res.status(500).json({
            error: 'Server Error'
        });
    }
});

// 5. DELETE (Delete): Menghapus task berdasarkan ID
app.delete('/tasks/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const deletedTask = await prisma.task.delete({
            where: {
                id: parseInt(id)
            },
        });
        res.json({
            msg: 'Task berhasil dihapus',
            task: deletedTask
        });
    } catch (err) {
        // Tangani error jika task dengan ID tersebut tidak ada
        if (err.code === 'P2025') {
            return res.status(404).json({
                error: 'Task tidak ditemukan'
            });
        }
        console.error(err.message);
        res.status(500).json({
            error: 'Server Error'
        });
    }
});


// Menjalankan server
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});