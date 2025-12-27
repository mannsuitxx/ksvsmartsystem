const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { setupCronJobs } = require('./utils/cronJobs');

const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();
setupCronJobs();

const app = express();

app.use(cors());
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
