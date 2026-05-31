const express = require('express');
const router  = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollCourse, getMyCourses, getEnrolledCourses, togglePublish } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadImage } = require('../config/cloudinary');

router.get('/',            getCourses);
router.get('/enrolled',    protect, authorize('student'), getEnrolledCourses);
router.get('/my-courses',  protect, authorize('teacher','admin'), getMyCourses);
router.post('/',           protect, authorize('teacher','admin'), uploadImage.single('thumbnail'), createCourse);
router.get('/:id',         getCourseById);
router.put('/:id/toggle-publish', protect, authorize('teacher','admin'), togglePublish);
router.put('/:id',         protect, authorize('teacher','admin'), uploadImage.single('thumbnail'), updateCourse);
router.delete('/:id',      protect, authorize('teacher','admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);

module.exports = router;