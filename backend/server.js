const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('mongo-sanitize');
const connectDB = require('./config/db');
const { setupCronJobs } = require('./utils/cronJobs');

const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();
setupCronJobs();

const app = express();

// Security Middlewares
app.use(helmet());

// Prevent NoSQL Injection
app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
});

// Configure CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// General API Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100000 : 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Strict rate limit for auth login route
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'development' ? 100000 : 10, // Limit each IP to 10 login requests per windowMs
  message: {
    message: 'Too many login attempts. Please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

app.use(express.json());

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Request Logging Middleware
app.use((req, res, next) => {
  // Collapse multiple slashes (e.g., //api/auth/login -> /api/auth/login)
  req.url = req.url.replace(/\/+/g, '/');
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/students', require('./routes/studentManagementRoutes'));
app.use('/api/mentor', require('./routes/mentorRoutes'));
app.use('/api/hod', require('./routes/hodRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/achievements', require('./routes/achievementRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/leaves', require('./routes/medicalLeaveRoutes'));
app.use('/api/class-updates', require('./routes/classUpdateRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

app.post('*', (req, res, next) => {
  console.log(`[UNMATCHED POST] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('KSV Smart Academic System API is running...');
});

app.post('/api/test-direct', (req, res) => {
  res.json({ message: 'Direct POST works' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
