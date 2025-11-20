// routes/evaluations.js
const express = require("express");
const pool = require("../db");
const Anthropic = require("@anthropic-ai/sdk");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


// ------------------------------------------------------------
// GET LAST PREVIOUS EVALUATION (SAME STUDENT + SAME DEPARTMENT)
// ------------------------------------------------------------
async function getPreviousEvalSummary(student_id, dept) {
  const q = await pool.query(
    `SELECT es.summary
     FROM evaluation_summaries es
     JOIN evaluations e ON es.evaluation_id = e.evaluation_id
     JOIN users u ON u.user_id = e.evaluator_id
     WHERE e.student_id = $1 AND u.department = $2
     ORDER BY es.created_at DESC
     LIMIT 1`,
    [student_id, dept]
  );

  if (q.rowCount === 0) return null;
  return q.rows[0].summary;
}


// ------------------------------------------------------------
// BUILD SYSTEM PROMPT
// ------------------------------------------------------------
function buildSystemPrompt(student_info, evaluation_criteria, previous_eval) {
  const prevBlock = previous_eval
    ? `<previous_evaluation>\n${previous_eval}\n</previous_evaluation>`
    : `<previous_evaluation>\n(no previous evaluation available)\n</previous_evaluation>`;

  return `
You are a survey bot designed to help teachers evaluate their students. 
You will be provided with information about a student, specific evaluation criteria, and (if available) a previous evaluation summary. 
You will conduct an interactive survey with the teacher to gather their current assessment.

Here is the student information:
<student_info>
${student_info}
</student_info>

Here are the evaluation criteria and detailed rubrics you should focus on:
<evaluation_criteria>
${evaluation_criteria}

RUBRICS (concise performance levels):
A1: Insufficient/extraneous info; exam misses key findings  
A2: Adequate but cannot distinguish key vs extraneous  
A3: Appropriate, tailored, thorough; may include excess detail  
A4: Exceptionally focused; identifies urgent issues; distinguishes key vs extraneous  

B1: Limited filtering/prioritization; basic differential  
B2: Basic differential; begins prioritizing with data  
B3: Synthesizes data into complete, prioritized differential  
B4: Exceptional; prioritizes life/limb threats using all info  

C1: Struggles to form plans or offers none  
C2: Forms plans with gaps/errors  
C3: Reliable, complete, appropriate, patient-tailored plans  
C4: Exceptional planning, patient-centered, comprehensive  

D1: Poor re-evaluation/follow-up  
D2: Re-evaluates with prompting; begins integrating new data  
D3: Reliable, timely re-eval; integrates data; completes tasks  
D4: Exceptional; proactive; manages multiple patients; anticipates needs  

E1: Misses deterioration; delays seeking help; cannot stabilize  
E2: Recognizes abnormalities; seeks help; initiates basic stabilization  
E3: Recognizes all trends; initiates basic + some advanced measures  
E4: Exceptional vigilance; advanced stabilization; excellent judgment  

F1: One-way/untailored communication; misses emotions  
F2: Usually tailored; generally effective; works with team  
F3: Consistently tailored; highly emotionally aware; collaborative  
F4: Exceptional communicator; handles conflict; highly regarded  
</evaluation_criteria>

${prevBlock}

Begin by greeting the teacher and asking your first question about the student based on the evaluation criteria provided.
Your output should consist ONLY of your visible message to the teacher; do not include internal reasoning or mention of the previous evaluation.
`;
}


// ------------------------------------------------------------
// START EVALUATION
// ------------------------------------------------------------
router.post(
  "/start",
  requireAuth,
  requireRole("evaluator", "admin"),
  async (req, res) => {
    try {
      const evaluator_id = req.user.user_id;
      const student_id = parseInt(req.body.student_id, 10);

      if (!Number.isInteger(student_id)) {
        return res.status(400).json({ error: "Invalid student_id" });
      }

      const stu = await pool.query(
        "SELECT user_id, role, name, department FROM users WHERE user_id=$1",
        [student_id]
      );
      if (stu.rowCount === 0) return res.status(400).json({ error: "Student not found" });
      if (stu.rows[0].role !== "student")
        return res.status(400).json({ error: "Selected user is not a student" });

      const ins = await pool.query(
        `INSERT INTO evaluations (evaluator_id, student_id, started_at)
         VALUES ($1,$2,now())
         RETURNING evaluation_id, evaluator_id, student_id, started_at`,
        [evaluator_id, student_id]
      );

      res.json(ins.rows[0]);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);


// ------------------------------------------------------------
// CHAT WITH CLAUDE
// ------------------------------------------------------------
router.post("/chat", requireAuth, requireRole("evaluator", "admin"), async (req, res) => {
  const { evaluation_id, message, history } = req.body;

  try {
    // fetch evaluation + student + evaluator dept
    const ev = await pool.query(
      `SELECT e.*, u.name AS student_name, u.department AS student_dept
       FROM evaluations e
       JOIN users u ON e.student_id = u.user_id
       WHERE evaluation_id=$1`,
      [evaluation_id]
    );
    if (ev.rowCount === 0) return res.status(400).json({ error: "Eval not found" });

    const student_info = `Name: ${ev.rows[0].student_name}\nDepartment: ${ev.rows[0].student_dept}`;
    const evaluation_criteria = `A. H&P\nB. Differential\nC. Plan\nD. Follow-up\nE. Emergency\nF. Communication`;

    const previous_eval = await getPreviousEvalSummary(
      ev.rows[0].student_id,
      ev.rows[0].student_dept
    );

    const SYSTEM_PROMPT = buildSystemPrompt(
      student_info,
      evaluation_criteria,
      previous_eval
    );

    // special case: __system_init
    if (message === "__system_init") {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        system: SYSTEM_PROMPT,
        max_tokens: 600,
        messages: [],
      });

      const text = response?.content?.[0]?.text ?? "";

      await pool.query(
        `INSERT INTO chat_messages (evaluation_id, sender, content)
         VALUES ($1,'assistant',$2)`,
        [evaluation_id, text]
      );

      return res.json({ response: text });
    }

    // normal user message
    await pool.query(
      `INSERT INTO chat_messages (evaluation_id, sender, content)
       VALUES ($1,'user',$2)`,
      [evaluation_id, message]
    );

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      system: SYSTEM_PROMPT,
      max_tokens: 600,
      temperature: 0.3,
      messages: history.concat({ role: "user", content: message }),
    });

    const text = response?.content?.[0]?.text ?? "";

    await pool.query(
      `INSERT INTO chat_messages (evaluation_id, sender, content)
       VALUES ($1,'assistant',$2)`,
      [evaluation_id, text]
    );

    res.json({ response: text });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ------------------------------------------------------------
// GENERATE SUMMARY
// ------------------------------------------------------------
router.post("/summary", requireAuth, requireRole("evaluator", "admin"), async (req, res) => {
  const { evaluation_id } = req.body;

  try {
    const msgs = await pool.query(
      `SELECT sender, content FROM chat_messages
       WHERE evaluation_id=$1 ORDER BY created_at ASC`,
      [evaluation_id]
    );

    const convo = msgs.rows.map(
      (r) => `${r.sender.toUpperCase()}: ${r.content}`
    ).join("\n");

    const claude = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      temperature: 0.2,
      system: "You are a medical education assistant.",
      messages: [
        {
          role: "user",
          content:
            `Conversation:\n${convo}\n\nSummarize with ratings A–F, strengths, concerns, suggestions, overall rating (1–4).`
        }
      ]
    });

    const summary = claude?.content?.[0]?.text ?? "Summary not generated.";

    const ins = await pool.query(
      `INSERT INTO evaluation_summaries (evaluation_id, summary)
       VALUES ($1,$2)
       RETURNING id AS summary_id, summary`,
      [evaluation_id, summary]
    );

    await pool.query(
      `UPDATE evaluations SET completed_at = now() WHERE evaluation_id=$1`,
      [evaluation_id]
    );

    res.json(ins.rows[0]);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
