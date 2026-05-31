require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes     = require('./routes/authRoutes');
const courseRoutes   = require('./routes/courseRoutes');
const materialRoutes = require('./routes/materialRoutes');
const userRoutes     = require('./routes/userRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
connectDB();

// ─── CORS — allow all origins ───────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',      authRoutes);
app.use('/api/courses',   courseRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/users',     userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Backend is running!' }));

// Reset demo users with fresh passwords
app.get('/api/seed-reset', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User   = require('./models/User');
    const Course = require('./models/Course');

    // Delete existing demo users
    await User.deleteMany({ 
      email: { $in: ['admin@demo.com', 'teacher@demo.com', 'student@demo.com'] } 
    });

    // Create fresh ones
    const password = await bcrypt.hash('demo123', 10);
    const users = [
      { name: 'Admin User',   email: 'admin@demo.com',   password, role: 'admin',   isActive: true },
      { name: 'Demo Teacher', email: 'teacher@demo.com', password, role: 'teacher', isActive: true },
      { name: 'Demo Student', email: 'student@demo.com', password, role: 'student', isActive: true },
    ];
    const created = await User.insertMany(users);
    const newTeacher = created.find(u => u.email === 'teacher@demo.com');

    // Re-assign all orphaned courses to the new teacher
    await Course.updateMany({}, { $set: { teacher: newTeacher._id, enrolledStudents: [] } });

    res.json({ 
      success: true, 
      message: 'Demo users reset and courses re-linked!',
      accounts: [
        'admin@demo.com / demo123',
        'teacher@demo.com / demo123',
        'student@demo.com / demo123'
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// One-time data repair: re-link courses to current teacher user
app.get('/api/fix-data', async (req, res) => {
  try {
    const User   = require('./models/User');
    const Course = require('./models/Course');
    const teacher = await User.findOne({ email: 'teacher@demo.com' });
    if (!teacher) return res.status(404).json({ error: 'teacher@demo.com not found. Run /api/seed-reset first.' });
    const result = await Course.updateMany({}, { $set: { teacher: teacher._id, enrolledStudents: [] } });
    res.json({ success: true, message: `Fixed ${result.modifiedCount} courses → teacher: ${teacher._id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));