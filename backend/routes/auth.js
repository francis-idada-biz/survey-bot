const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Ensure JWT_SECRET is set in production
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error("FATAL: JWT_SECRET is not defined.");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const q = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (q.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = q.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    await pool.query('UPDATE users SET last_accessed_at = now() WHERE user_id = $1', [user.user_id]);

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

router.get('/verify-invite/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const q = await pool.query(
            'SELECT email, role FROM invitations WHERE token=$1 AND accepted=false AND expires_at>now()',
            [token]
        );
        if (q.rowCount === 0) {
            return res.status(400).json({ error: 'Invalid or expired invitation token.' });
        }
        res.json(q.rows[0]);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/register', async (req, res) => {
  const { token, name, year_in_med_school, department, password } = req.body;
  
  const capitalizeName = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  try {
    const passwordPolicy = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordPolicy.test(password)) {
      return res.status(400).json({ error: 'Password does not meet the policy requirements.' });
    }

    const inv = await pool.query(
      'SELECT * FROM invitations WHERE token=$1 AND accepted=false AND expires_at>now()',
      [token]
    );
    if (inv.rowCount === 0) return res.status(400).json({ error: 'Invalid/expired invite' });

    const { email, role } = inv.rows[0];
    const hash = await bcrypt.hash(password, 10);
    const capitalizedName = capitalizeName(name);

    const ins = await pool.query(
      `INSERT INTO users (name, email, year_in_med_school, department, role, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING user_id, name, email, role`,
      [capitalizedName, email, year_in_med_school || null, department || null, role, hash]
    );

    await pool.query('UPDATE invitations SET accepted=true WHERE token=$1', [token]);
    res.json(ins.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  try {
    const q = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (q.rowCount > 0) {
      const user = q.rows[0];
      const resetToken = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

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
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset.</p>
          <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
          <p>This link will expire in 1 hour.</p>
        `,
      });
      
      console.log("Password reset email sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    // Always send a success response
    res.json({ message: "If an account with this email exists, a password reset link has been sent." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const passwordPolicy = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordPolicy.test(password)) {
      return res.status(400).json({ error: 'Password does not meet the policy requirements.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { user_id } = decoded;

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password_hash=$1 WHERE user_id=$2',
      [hash, user_id]
    );

    res.json({ message: "Password has been reset successfully." });
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT user_id AS id, name, email, role, department, year_in_med_school, picture_url, created_at, last_accessed_at
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Auth me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;