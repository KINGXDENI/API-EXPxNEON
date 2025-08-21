const express = require('express');
const prisma = require('../lib/prisma'); // Perhatikan pathnya berubah menjadi '../'
const router = express.Router();

// === SEMUA RUTE API SEKARANG MENGGUNAKAN 'router' BUKAN 'app' ===

// GET /api/tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: {
                created_at: 'desc'
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

// GET /api/tasks/:id
router.get('/tasks/:id', async (req, res) => {
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

// POST /api/tasks
router.post('/tasks', async (req, res) => {
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
                title: title
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

// PUT /api/tasks/:id
router.put('/tasks/:id', async (req, res) => {
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
                is_completed
            },
        });
        res.json(updatedTask);
    } catch (err) {
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

// DELETE /api/tasks/:id
router.delete('/tasks/:id', async (req, res) => {
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

// Ekspor router agar bisa digunakan di file index.js utama
module.exports = router;