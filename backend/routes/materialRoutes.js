const express = require('express');
const router  = express.Router();
const { uploadNote, uploadVideo, getCourseMaterials, deleteMaterial, updateMaterial } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadNote: noteUpload, uploadVideo: videoUpload } = require('../config/cloudinary');

router.post('/note',             protect, authorize('teacher','admin'), noteUpload.single('file'),  uploadNote);
router.post('/video',            protect, authorize('teacher','admin'), videoUpload.single('file'), uploadVideo);
router.get('/course/:courseId',  protect, getCourseMaterials);
router.put('/:id',               protect, authorize('teacher','admin'), updateMaterial);
router.delete('/:id',            protect, authorize('teacher','admin'), deleteMaterial);

module.exports = router;