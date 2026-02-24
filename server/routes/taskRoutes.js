// Task Routes
// This file defines task CRUD and dashboard stats routes

const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// All task routes are protected
router.use(authMiddleware);

// Dashboard stats route - define this specific route first otherwise /:id will catch it
router.get('/dashboard/stats', getDashboardStats);

// Task CRUD routes
router.post('/', createTask);       // Naya task banao
router.get('/', getTasks);          // View all tasks (search/filter/pagination)
router.get('/:id', getTask);        // View single task
router.put('/:id', updateTask);     // Update task
router.delete('/:id', deleteTask);  // Delete task

module.exports = router;
