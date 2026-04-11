const User     = require('../models/User');
const Course   = require('../models/Course');
const Material = require('../models/Material');

const getAllUsers = async (req, res) => {
  const { role } = req.query;
  const query = role ? { role } : {};
  res.json({ users: await User.find(query).select('-password').sort({ createdAt: -1 }) });
};

const toggleUserActive = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found.'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot deactivate admin.'); }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
};

const getDashboardStats = async (req, res) => {
  const [totalUsers, totalCourses, totalMaterials, teacherCount, studentCount] = await Promise.all([
    User.countDocuments(), Course.countDocuments(), Material.countDocuments(),
    User.countDocuments({ role: 'teacher' }), User.countDocuments({ role: 'student' }),
  ]);
  res.json({ totalUsers, totalCourses, totalMaterials, teacherCount, studentCount });
};

const promoteToTeacher = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found.'); }
  user.role = 'teacher';
  await user.save();
  res.json({ message: `${user.name} is now a teacher.` });
};

module.exports = { getAllUsers, toggleUserActive, getDashboardStats, promoteToTeacher };