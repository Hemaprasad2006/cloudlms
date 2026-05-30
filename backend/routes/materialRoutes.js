const express = require('express');
const { uploadNote, uploadVideo, getCourseMaterials, deleteMaterial, updateMaterial } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

const router = express.Router();

// Upload routes (teacher only)
router.post('/note', protect, authorize('teacher', 'admin'), upload.single('file'), uploadNote);
router.post('/video', protect, authorize('teacher', 'admin'), upload.single('file'), uploadVideo);

// Get materials by course (any authenticated user)
router.get('/course/:courseId', protect, getCourseMaterials);

// Update and delete (teacher/admin only)
router.put('/:id', protect, authorize('teacher', 'admin'), updateMaterial);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMaterial);

module.exports = router;