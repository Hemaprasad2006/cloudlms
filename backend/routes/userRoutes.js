const express = require('express');
const router  = express.Router();
const { getAllUsers, toggleUserActive, getDashboardStats, promoteToTeacher } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',                  protect, authorize('admin'), getAllUsers);
router.get('/stats',             protect, authorize('admin'), getDashboardStats);
router.put('/:id/toggle-active', protect, authorize('admin'), toggleUserActive);
router.put('/:id/promote',       protect, authorize('admin'), promoteToTeacher);

module.exports = router;