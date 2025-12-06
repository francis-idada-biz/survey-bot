require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. Trust Proxy: Required for rate limiting to work behind Railway/Vercel load balancers
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// 2. CORS: specific origin in production, wildcard in dev
const clientOrigin = process.env.CLIENT_URL || '*';
app.use(cors({ origin: clientOrigin }));

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

// Start server
const PORT = parseInt(process.env.PORT, 10) || 4000;

console.log("DEBUG → process.env.PORT:", process.env.PORT);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server started successfully on port ${PORT}`);
});