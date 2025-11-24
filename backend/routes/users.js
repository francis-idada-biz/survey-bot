const express = require('express');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Power user creates admin
router.post('/create-admin', requireAuth, requireRole('power_user'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const ins = await pool.query(
      `INSERT INTO users (name, email, role) VALUES ($1,$2,'admin') RETURNING user_id, name, email, role`,
      [name, email]
    );
    res.json(ins.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin invites evaluator or student
router.post('/invite', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!['evaluator', 'student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role for invite' });
    }
    const ins = await pool.query(
      `INSERT INTO invitations (email, role, created_by) VALUES ($1,$2,$3)
       RETURNING invite_id, token, expires_at`,
      [email, role, req.user.user_id]
    );
    res.json(ins.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// FIXED: Generic search route that handles /api/users?role=student
router.get('/', requireAuth, requireRole('evaluator','admin'), async (req, res) => {
  try {
    const { role } = req.query;
    let text = `SELECT user_id, name, email, year_in_med_school FROM users`;
    const params = [];

    if (role) {
      text += ` WHERE role = $1`;
      params.push(role);
    }
    text += ` ORDER BY name ASC`;

    const q = await pool.query(text, params);
    
    // Return object format expected by frontend
    res.json({ students: q.rows, users: q.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;