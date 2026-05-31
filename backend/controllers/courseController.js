const Course   = require('../models/Course');
const Material = require('../models/Material');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

const getCourses = async (req, res) => {
  const { search, category, page = 1, limit = 12 } = req.query;
  const query = { isPublished: true };
  if (search)   query.$text = { $search: search };
  if (category) query.category = category;
  const skip = (Number(page) - 1) * Number(limit);
  const [courses, total] = await Promise.all([
    Course.find(query).populate('teacher','name avatar').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Course.countDocuments(query)
  ]);
  res.json({ courses, total, page: Number(page), pages: Math.ceil(total / limit) });
};

const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher','name email');
  if (!course) { res.status(404); throw new Error('Course not found.'); }
  let materials = [];
  if (req.user) {
    const isTeacher  = course.teacher._id.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.map(String).includes(String(req.user._id));
    const isAdmin    = req.user.role === 'admin';
    if (isTeacher || isEnrolled || isAdmin)
      materials = await Material.find({ course: course._id }).sort({ order: 1 });
  }
  res.json({ ...course.toObject(), enrolledCount: course.enrolledStudents.length, materials });
};

const createCourse = async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description || !category) { res.status(400); throw new Error('All fields required.'); }

  let thumbnail = '';
  let thumbnailPublicId = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'lms/thumbnails', 'image');
    thumbnail = result.secure_url;
    thumbnailPublicId = result.public_id;
  }

  const course = await Course.create({
    title, description, category, teacher: req.user._id,
    thumbnail, thumbnailPublicId, isPublished: true,
  });
  res.status(201).json({ message: 'Course created.', course });
};

const updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found.'); }
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorised.'); }
  const { title, description, category, isPublished } = req.body;
  if (title)       course.title       = title;
  if (description) course.description = description;
  if (category)    course.category    = category;
  if (isPublished !== undefined) course.isPublished = isPublished === true || isPublished === 'true';
  if (req.file) {
    if (course.thumbnailPublicId) await cloudinary.uploader.destroy(course.thumbnailPublicId, { resource_type: 'image' });
    const result = await uploadToCloudinary(req.file.buffer, 'lms/thumbnails', 'image');
    course.thumbnail = result.secure_url;
    course.thumbnailPublicId = result.public_id;
  }
  await course.save();
  res.json({ message: 'Course updated.', course });
};

const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found.'); }
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorised.'); }
  const materials = await Material.find({ course: course._id });
  for (const m of materials)
    await cloudinary.uploader.destroy(m.cloudinaryPublicId, { resource_type: m.type === 'video' ? 'video' : 'raw' });
  await Material.deleteMany({ course: course._id });
  if (course.thumbnailPublicId) await cloudinary.uploader.destroy(course.thumbnailPublicId, { resource_type: 'image' });
  await course.deleteOne();
  res.json({ message: 'Course deleted.' });
};

const enrollCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found.'); }
  if (!course.isPublished) { res.status(400); throw new Error('Course not published.'); }
  if (course.enrolledStudents.map(String).includes(String(req.user._id)))
    return res.status(400).json({ message: 'Already enrolled.' });
  course.enrolledStudents.push(req.user._id);
  await course.save();
  res.json({ message: 'Enrolled successfully.' });
};

const togglePublish = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found.'); }
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorised.');
  }
  course.isPublished = !course.isPublished;
  await course.save();
  res.json({ message: `Course ${course.isPublished ? 'published' : 'unpublished'}.`, course });
};

const getMyCourses       = async (req, res) => res.json(await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 }));
const getEnrolledCourses = async (req, res) => res.json(await Course.find({ enrolledStudents: req.user._id, isPublished: true }).populate('teacher','name').sort({ createdAt: -1 }));

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollCourse, getMyCourses, getEnrolledCourses, togglePublish };