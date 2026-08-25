const dns = require('dns');
const path = require('path');

dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { getFileStream } = require('./services/googleDriveService');

const authRoutes = require('./routes/authRoutes');
const placeRoutes = require('./routes/placeRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const placeSuggestionRoutes = require('./routes/placeSuggestionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const PORT = process.env.PORT || 5000;

// =========================
// DATABASE
// =========================
connectDB();

// =========================
// SECURITY
// =========================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// =========================
// CORS
// =========================
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// =========================
// BODY PARSER
// =========================
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// =========================
// STATIC FILES
// =========================
// Example:
// http://localhost:5000/uploads/kashichak-cover.png
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// =========================
// SECURITY AGAINST
// MONGODB INJECTION
// =========================
app.use(mongoSanitize());

// =========================
// LOGGING
// =========================
app.use(
  morgan(
    process.env.NODE_ENV === 'production'
      ? 'combined'
      : 'dev'
  )
);

// =========================
// RATE LIMIT
// =========================
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
  })
);

// =========================
// AUTH RATE LIMIT
// =========================
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
      success: false,
      message: 'Too many login attempts. Please try again later.',
    },
  })
);

// =========================
// HEALTH CHECK
// =========================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Apna Kashichak API is running.',
  });
});

// =========================
// API ROUTES
// =========================// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/places', require('./routes/placeRoutes'));
app.use('/api/memories', require('./routes/memoryRoutes'));


app.use('/api/place-suggestions', placeSuggestionRoutes);
app.use('/api/admin/suggestions', suggestionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));

// =========================
// MEDIA PROXY
// =========================
// Streams files from Google Drive through this server.
// Solves cross-origin / auth-cookie blocking issues with direct Drive URLs.
app.get('/api/media/:fileId', async (req, res) => {
  try {
    const stream = await getFileStream(req.params.fileId);
    stream.pipe(res);
  } catch (err) {
    res.status(404).json({ success: false, message: 'Media not found.' });
  }
});

// =========================
// ERROR HANDLING
// =========================
app.use(notFound);
app.use(errorHandler);

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Apna Kashichak API running on port ${PORT}`);
});