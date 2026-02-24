// Task Controller
// yeh controller task CRUD operations, search, filter, pagination aur dashboard stats handle karta hai

const { db } = require('../config/db');
const logger = require('../utils/logger');

// ==================== CREATE TASK ====================
const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, status, priority, due_date } = req.body;

    if (!title || title.trim().length < 3)
      return res.status(400).json({ success: false, message: 'Task title kam se kam 3 characters ka hona chahiye' });

    const { rows } = await db.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title.trim(), description?.trim() || null, status || 'pending', priority || 'medium', due_date || null, userId]
    );
    const newTask = rows[0];

    // Notification banao
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [userId, 'New Task Created', `"${newTask.title}" task successfully create ho gaya hai.`, 'info']
    );

    logger.info(`Task created: ${newTask.title} by user ${req.user.email}`);
    res.status(201).json({ success: true, message: 'Task successfully create ho gaya', task: newTask });
  } catch (error) {
    logger.error('Create task controller error: ' + error.message);
    next(error);
  }
};

// ==================== GET TASKS (with search / filter / pagination) ====================
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, status, priority, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Dynamic WHERE clause banao
    const conditions = ['user_id = $1'];
    const params = [userId];
    let idx = 2;

    if (search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status && status !== 'all') {
      conditions.push(`status = $${idx++}`);
      params.push(status);
    }
    if (priority && priority !== 'all') {
      conditions.push(`priority = $${idx++}`);
      params.push(priority);
    }

    const where = conditions.join(' AND ');
    const validSort = ['created_at', 'title', 'priority', 'due_date', 'status'];
    const sortCol  = validSort.includes(sortBy) ? sortBy : 'created_at';
    const sortDir  = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Count query
    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM tasks WHERE ${where}`, params);
    const total = parseInt(countRows[0].count);

    // Data query with pagination
    params.push(parseInt(limit), offset);
    const { rows: tasks } = await db.query(
      `SELECT * FROM tasks WHERE ${where} ORDER BY ${sortCol} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTasks: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Get tasks controller error: ' + error.message);
    next(error);
  }
};

// ==================== GET SINGLE TASK ====================
const getTask = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    const task = rows[0];
    if (!task) return res.status(404).json({ success: false, message: 'Task nahi mila' });
    res.status(200).json({ success: true, task });
  } catch (error) {
    logger.error('Get task controller error: ' + error.message);
    next(error);
  }
};

// ==================== UPDATE TASK ====================
const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, status, priority, due_date } = req.body;

    // Task exist karta hai aur user ka hai?
    const { rows: existRows } = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    const existingTask = existRows[0];
    if (!existingTask)
      return res.status(404).json({ success: false, message: 'Task nahi mila ya aapke paas permission nahi hai' });

    // Dynamic update
    const updates = [];
    const params = [];
    let idx = 1;
    if (title      !== undefined) { updates.push(`title = $${idx++}`);       params.push(title.trim()); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); params.push(description?.trim() || null); }
    if (status     !== undefined) { updates.push(`status = $${idx++}`);      params.push(status); }
    if (priority   !== undefined) { updates.push(`priority = $${idx++}`);    params.push(priority); }
    if (due_date   !== undefined) { updates.push(`due_date = $${idx++}`);    params.push(due_date); }

    if (updates.length === 0)
      return res.status(400).json({ success: false, message: 'Koi field update ke liye nahi di gayi' });

    params.push(id, userId);
    const { rows } = await db.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
      params
    );
    const updatedTask = rows[0];

    // Task complete hone ki notification
    if (status === 'completed' && existingTask.status !== 'completed') {
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [userId, 'Task Completed!', `"${updatedTask.title}" task complete ho gaya hai. Bahut badiya!`, 'info']
      );
    }

    logger.info(`Task updated: ${updatedTask.title} by user ${req.user.email}`);
    res.status(200).json({ success: true, message: 'Task successfully update ho gaya', task: updatedTask });
  } catch (error) {
    logger.error('Update task controller error: ' + error.message);
    next(error);
  }
};

// ==================== DELETE TASK ====================
const deleteTask = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT title FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Task nahi mila' });

    await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    logger.info(`Task deleted: ${rows[0].title} by user ${req.user.email}`);
    res.status(200).json({ success: true, message: 'Task successfully delete ho gaya' });
  } catch (error) {
    logger.error('Delete task controller error: ' + error.message);
    next(error);
  }
};

// ==================== DASHBOARD STATS ====================
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Parallel me saare stats ek saath fetch karo
    const [totalRes, completedRes, pendingRes, overdueRes, recentRes, weeklyRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM tasks WHERE user_id = $1', [userId]),
      db.query("SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status = 'completed'", [userId]),
      db.query("SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status = 'pending'", [userId]),
      db.query("SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status = 'pending' AND due_date < $2", [userId, today]),
      db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [userId]),
      db.query(
        `SELECT created_at, status FROM tasks WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
        [userId]
      ),
    ]);

    // Weekly data - din ke hisaab se count banao
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = dayNames.map((day) => ({ day, tasks: 0 }));
    weeklyRes.rows.forEach((task) => {
      const dayIndex = new Date(task.created_at).getDay();
      weeklyData[dayIndex].tasks += 1;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalTasks:          parseInt(totalRes.rows[0].count),
        completedTasks:      parseInt(completedRes.rows[0].count),
        pendingTasks:        parseInt(pendingRes.rows[0].count),
        overdueTasks:        parseInt(overdueRes.rows[0].count),
        recentTasks:         recentRes.rows,
        weeklyProductivity:  weeklyData,
      },
    });
  } catch (error) {
    logger.error('Dashboard stats error: ' + error.message);
    next(error);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getDashboardStats };
