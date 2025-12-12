require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

process.on('uncaughtException', err => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on('unhandledRejection', err => {
  console.error("UNHANDLED PROMISE REJECTION:", err);
});


const app = express();

// 1. Trust Proxy: Required for rate limiting to work behind Railway/Vercel load balancers
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// 2. CORS: specific origin in production, wildcard in dev
const allowedOrigins = [
  'https://survey-bot-flame.vercel.app',
  /https:\/\/.*\.vercel\.app$/  // Allow all Vercel preview deployments
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed origins or pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Rate limiting
app.use(rateLimit({ 
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/evaluations', require('./routes/evaluations'));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/test-db', async (_req, res) => {
  try {
    const result = await require('./db').query('SELECT NOW(), COUNT(*) as user_count FROM users');
    res.json({ 
      success: true, 
      timestamp: result.rows[0].now,
      userCount: result.rows[0].user_count 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
const PORT = parseInt(process.env.PORT, 10) || 4000;

console.log("DEBUG → process.env.PORT:", process.env.PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started successfully on port ${PORT}`);
});
