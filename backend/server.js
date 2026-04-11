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

app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',      authRoutes);
app.use('/api/courses',   courseRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/users',     userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
// Seed route - creates demo users
app.get('/api/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const password = await bcrypt.hash('demo123', 10);
    const users = [
      { name: 'Admin User',   email: 'admin@demo.com',   password, role: 'admin'   },
      { name: 'Demo Teacher', email: 'teacher@demo.com', password, role: 'teacher' },
      { name: 'Demo Student', email: 'student@demo.com', password, role: 'student' },
    ];
    const results = [];
    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        results.push(`Already exists: ${u.email}`);
      } else {
        await User.create(u);
        results.push(`Created: ${u.email}`);
      }
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));