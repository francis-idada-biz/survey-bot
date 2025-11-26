const express = require('express');
const pool = require('../db');
const nodemailer = require('nodemailer');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Power user creates admin
router.post('/create-admin', requireAuth, requireRole('power_user'), async (req, res) => {
  const capitalizeName = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  try {
    const { name, email } = req.body;
    const capitalizedName = capitalizeName(name);
    const ins = await pool.query(
      `INSERT INTO users (name, email, role) VALUES ($1,$2,'admin') RETURNING user_id, name, email, role`,
      [capitalizedName, email]
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
    if (!['evaluator', 'student'].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Admins can only invite 'evaluator' or 'student'." });
    }
    const ins = await pool.query(
      `INSERT INTO invitations (email, role, created_by) VALUES ($1,$2,$3)
       RETURNING invite_id, token, expires_at`,
      [email, role, req.user.user_id]
    );

    const { token } = ins.rows[0];
    const registerLink = `http://localhost:5173/register?token=${token}`;

    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"Survey Bot" <no-reply@surveybot.com>',
      to: email,
      subject: 'You have been invited to Survey Bot',
      html: `
        <p>You have been invited to join Survey Bot.</p>
        <p>Click <a href="${registerLink}">here</a> to register.</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.json(ins.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', requireAuth, requireRole('admin', 'power_user'), async (req, res) => {
  try {
    const { id } = req.params;
    const q = await pool.query('SELECT user_id, name, email, role, created_at, last_accessed_at, department, year_in_med_school, picture_url FROM users WHERE user_id=$1', [id]);
    if (q.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(q.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// FIXED: Generic search route that handles /api/users?role=student
router.get('/', requireAuth, requireRole('evaluator', 'admin', 'power_user'), async (req, res) => {
  try {
    const { role } = req.query;
    let text = `SELECT user_id, name, email, role, year_in_med_school FROM users`;
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

// Power user deletes a user
router.delete('/:id', requireAuth, requireRole('power_user'), async (req, res) => {
    try {
        const { id } = req.params;

        const userCheck = await pool.query('SELECT * FROM users WHERE user_id=$1', [id]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await pool.query('DELETE FROM users WHERE user_id=$1', [id]);

        res.status(204).send();
    } catch (e) {
        console.error("Delete user error:", e);
        res.status(500).json({ error: "Failed to delete user. There may be related records that need to be removed first." });
    }
});

module.exports = router;