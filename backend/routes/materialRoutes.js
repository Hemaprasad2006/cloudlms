const express = require('express');
const { uploadNote, uploadVideo, getCourseMaterials, deleteMaterial, updateMaterial } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary').multer;
 
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