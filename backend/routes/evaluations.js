// routes/evaluations.js
const express = require('express');
const pool = require('../db');
const Anthropic = require('@anthropic-ai/sdk');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `
You are a formal, empathetic evaluation bot for medical students.
[... your full domains + rubrics + instructions exactly as you want ...]
`;

router.post('/start', requireAuth, requireRole('evaluator','admin'), async (req, res) => {
  const { evaluator_id, student_id } = req.body;
  try {
    const ins = await pool.query(
      `INSERT INTO evaluations (evaluator_id, student_id, started_at)
       VALUES ($1,$2,now()) RETURNING evaluation_id, evaluator_id, student_id, started_at`,
      [evaluator_id, student_id]
    );
    res.json(ins.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/chat', requireAuth, requireRole('evaluator','admin'), async (req, res) => {
  const { evaluation_id, message, history } = req.body;
  try {
    await pool.query(
      `INSERT INTO chat_messages (evaluation_id, sender, content) VALUES ($1,'user',$2)`,
      [evaluation_id, message]
    );

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: history.concat({ role: 'user', content: message })
    });

    const text = response?.content?.[0]?.text ?? 'No response';
    await pool.query(
      `INSERT INTO chat_messages (evaluation_id, sender, content) VALUES ($1,'assistant',$2)`,
      [evaluation_id, text]
    );

    res.json({ response: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/summary', requireAuth, requireRole('evaluator','admin'), async (req, res) => {
  const { evaluation_id } = req.body;
  try {
    const msgs = await pool.query(
      `SELECT sender, content FROM chat_messages WHERE evaluation_id=$1 ORDER BY created_at ASC`,
      [evaluation_id]
    );
    const convo = msgs.rows.map(r => `${r.sender.toUpperCase()}: ${r.content}`).join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      temperature: 0.2,
      system: 'You are a medical education assistant. Summarize the evaluation clearly.',
      messages: [
        { role: 'user', content: `Conversation:\n${convo}\n\nSummarize with ratings A–F, strengths, concerns, suggestions, overall rating (1–4).` }
      ]
    });

    const summary = response?.content?.[0]?.text ?? 'Summary not generated.';
    const ins = await pool.query(
      `INSERT INTO evaluation_summaries (evaluation_id, summary) VALUES ($1,$2) RETURNING summary_id, summary`,
      [evaluation_id, summary]
    );
    await pool.query(`UPDATE evaluations SET completed_at=now() WHERE evaluation_id=$1`, [evaluation_id]);

    res.json(ins.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
