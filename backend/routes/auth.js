// routes/auth.js
const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const q = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (q.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = q.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, role: user.role, name: user.name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// invited self-registration (public, uses invite token you created earlier)
router.post('/register', async (req, res) => {
  const { token, name, dob, year_in_med_school, department, password } = req.body;
  try {
    const inv = await pool.query(
      'SELECT * FROM invitations WHERE token=$1 AND accepted=false AND expires_at>now()',
      [token]
    );
    if (inv.rowCount === 0) return res.status(400).json({ error: 'Invalid/expired invite' });

    const { email, role } = inv.rows[0];
    const hash = await bcrypt.hash(password, 10);

    const ins = await pool.query(
      `INSERT INTO users (name, email, dob, year_in_med_school, department, role, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING user_id, name, email, role`,
      [name, email, dob, year_in_med_school, department, role, hash]
    );

    await pool.query('UPDATE invitations SET accepted=true WHERE token=$1', [token]);
    res.json(ins.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// verify current session/token
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id; // this is fine, token carries "id"
    
    const result = await pool.query(
      `SELECT 
        user_id AS id,
        name,
        email,
        role,
        department,
        dob,
        year_in_med_school,
        picture_url,
        created_at,
        updated_at
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: result.rows[0] });

  } catch (err) {
    console.error("Auth me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
