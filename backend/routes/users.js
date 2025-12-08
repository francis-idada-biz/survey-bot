const express = require('express');
const pool = require('../db');
const nodemailer = require('nodemailer'); // Import nodemailer
const { requireAuth, requireRole } = require('../middleware/auth');
const emailService = require('../utils/emailService');

const router = express.Router();

// Configure Email Transporter
const getTransporter = async () => {
  // OPTION A: Production (Real Email)
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // OPTION B: Development (Ethereal Fake Email)
  // This creates a fake account automatically if you haven't set one up
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

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
    
    const { token } = ins.rows[0];
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${clientUrl}/register?token=${token}`;

    // Use the unified email service
    await emailService.sendEmail({
      to: email,
      subject: 'You have been invited to the Evaluation System',
      html: `
        <h3>Welcome!</h3>
        <p>You have been invited to join as a <b>${role}</b>.</p>
        <p>Click the link below to set up your account:</p>
        <a href="${inviteLink}">${inviteLink}</a>
        <br/>
        <p>This link expires in 7 days.</p>
      `,
    });

    res.json({ message: "Invitation sent successfully", invite_id: ins.rows[0].invite_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});


// Generic search route
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
    res.json({ students: q.rows, users: q.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;  