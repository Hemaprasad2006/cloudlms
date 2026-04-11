const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) { res.status(400); throw new Error('All fields required.'); }
  if (await User.findOne({ email })) { res.status(400); throw new Error('Email already registered.'); }
  const assignedRole = role === 'admin' ? 'student' : (role || 'student');
  const user = await User.create({ name, email, password, role: assignedRole });
  res.status(201).json({ token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('Email and password required.'); }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) { res.status(401); throw new Error('Invalid credentials.'); }
  if (!user.isActive) { res.status(403); throw new Error('Account deactivated.'); }
  res.json({ token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  if (req.body.password) user.password = req.body.password;
  await user.save();
  res.json({ message: 'Profile updated.' });
};

module.exports = { register, login, getMe, updateProfile };