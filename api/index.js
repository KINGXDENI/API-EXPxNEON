const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// (DIUBAH) GET /api/tasks - Sekarang diurutkan berdasarkan 'position' untuk mendukung drag-and-drop
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: {
                position: 'asc' // Urutkan berdasarkan posisi manual
            },
        });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/tasks/:id - Tidak ada perubahan
router.get('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({
            where: { id: parseInt(id) },
        });

        if (!task) {
            return res.status(404).json({ error: 'Task tidak ditemukan' });
        }
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// (DIUBAH) POST /api/tasks - Sekarang menangani title, priority, due_date, dan position
router.post('/tasks', async (req, res) => {
    try {
        const { title, priority, due_date } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title tidak boleh kosong' });
        }
        
        // (BARU) Logika untuk menentukan posisi tugas baru
        // Tugas baru akan selalu diletakkan di posisi paling akhir.
        const maxPositionTask = await prisma.task.findFirst({
            orderBy: { position: 'desc' },
        });
        const newPosition = maxPositionTask ? maxPositionTask.position + 1 : 0;

        const newTask = await prisma.task.create({
            data: {
                title: title,
                // Pastikan nilai priority diubah ke format ENUM (uppercase)
                priority: priority?.toUpperCase() || 'SEDANG', 
                // Ubah string tanggal menjadi objek Date, atau null jika tidak ada
                due_date: due_date ? new Date(due_date) : null,
                position: newPosition,
            },
        });
        res.status(201).json(newTask);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// (DIUBAH) PUT /api/tasks/:id - Lebih fleksibel, bisa update sebagian atau semua data
router.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, is_completed, priority, due_date } = req.body;

        // (BARU) Bangun objek data secara dinamis
        // Ini memungkinkan frontend mengirim hanya data yang berubah
        const dataToUpdate = {};
        if (title !== undefined) dataToUpdate.title = title;
        if (is_completed !== undefined) dataToUpdate.is_completed = is_completed;
        if (priority !== undefined) dataToUpdate.priority = priority.toUpperCase();
        if (due_date !== undefined) dataToUpdate.due_date = due_date ? new Date(due_date) : null;

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });
        res.json(updatedTask);
    } catch (err) {
        if (err.code === 'P2025') { // Error Prisma jika record tidak ditemukan
            return res.status(404).json({ error: 'Task tidak ditemukan' });
        }
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// DELETE /api/tasks/:id - Tidak ada perubahan
router.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await prisma.task.delete({
            where: { id: parseInt(id) },
        });
        res.json({ msg: 'Task berhasil dihapus', task: deletedTask });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Task tidak ditemukan' });
        }
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// (BARU) POST /api/tasks/reorder - Endpoint khusus untuk menyimpan urutan drag-and-drop
router.post('/tasks/reorder', async (req, res) => {
    try {
        const { orderedIds } = req.body; // Ekspektasi: { orderedIds: [3, 1, 2, 4] }

        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ error: 'orderedIds harus berupa array' });
        }

        // Gunakan transaksi Prisma untuk memastikan semua update berhasil atau semua gagal
        const updatePromises = orderedIds.map((id, index) => 
            prisma.task.update({
                where: { id: parseInt(id) },
                data: { position: index },
            })
        );
        
        await prisma.$transaction(updatePromises);
        
        res.json({ msg: 'Urutan tugas berhasil diperbarui' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});


module.exports = router;