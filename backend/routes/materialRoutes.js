const express = require('express');
const multer = require('multer');
const { uploadNote, uploadVideo, getCourseMaterials, deleteMaterial, updateMaterial } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/note', protect, authorize('teacher', 'admin'), upload.single('file'), uploadNote);
router.post('/video', protect, authorize('teacher', 'admin'), upload.single('file'), uploadVideo);
router.get('/course/:courseId', protect, getCourseMaterials);
router.put('/:id', protect, authorize('teacher', 'admin'), updateMaterial);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMaterial);

module.exports = router;