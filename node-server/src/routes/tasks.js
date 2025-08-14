const express = require('express');
const router = express.Router();
const { Task, Priority, taskManager } = require('../models/task');

// Middleware to validate task input
const validateTask = (req, res, next) => {
    const { text, priority, category } = req.body;
    
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    if (priority && !Priority.values().includes(priority)) {
        return res.status(400).json({ error: `Priority must be one of: ${Priority.values().join(', ')}` });
    }

    if (category && typeof category !== 'string') {
        return res.status(400).json({ error: 'Category must be a string' });
    }

    next();
};

// Get tasks with filtering
router.get('/', (req, res) => {
    try {
        let filteredTasks = [...taskManager.getAllTasks()];
        const { priority, category, completed, search } = req.query;

        if (priority) {
            filteredTasks = filteredTasks.filter(t => t.priority === priority);
        }

        if (category) {
            filteredTasks = filteredTasks.filter(t => t.category === category);
        }

        if (completed !== undefined) {
            const isCompleted = completed === 'true';
            filteredTasks = filteredTasks.filter(t => t.completed === isCompleted);
        }

        if (search && search.length >= 3) {
            filteredTasks = filteredTasks.filter(t => 
                t.text.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(filteredTasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new task
router.post('/', validateTask, (req, res) => {
    try {
        const task = taskManager.addTask(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update task
router.put('/:taskId', validateTask, (req, res) => {
    try {
        const taskId = parseInt(req.params.taskId);
        const updatedTask = taskManager.updateTask(taskId, req.body);
        
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete task
router.delete('/:taskId', (req, res) => {
    try {
        const taskId = parseInt(req.params.taskId);
        const deleted = taskManager.deleteTask(taskId);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle task completion
router.patch('/:taskId/toggle', (req, res) => {
    try {
        const taskId = parseInt(req.params.taskId);
        const task = taskManager.toggleTask(taskId);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
