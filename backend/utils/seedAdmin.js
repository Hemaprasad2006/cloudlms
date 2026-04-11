require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true },
  password: String, role: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  const password = await bcrypt.hash('demo123', 10);
  const users = [
    { name: 'Admin User',   email: 'admin@demo.com',   password, role: 'admin'   },
    { name: 'Demo Teacher', email: 'teacher@demo.com', password, role: 'teacher' },
    { name: 'Demo Student', email: 'student@demo.com', password, role: 'student' },
  ];
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) console.log(`Already exists: ${u.email}`);
    else { await User.create(u); console.log(`Created: ${u.email}`); }
  }
  console.log('\nDone! Login with: demo123');
  await mongoose.disconnect();
  process.exit(0);
};
seed();