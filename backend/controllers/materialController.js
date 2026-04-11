const Material = require('../models/Material');
const Course   = require('../models/Course');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

const verifyTeacher = async (courseId, userId, role) => {
  const course = await Course.findById(courseId);
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  if (course.teacher.toString() !== userId.toString() && role !== 'admin')
    throw Object.assign(new Error('Not authorised.'), { statusCode: 403 });
  return course;
};

const uploadNote = async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded.'); }
  const { courseId, title, description, order } = req.body;
  if (!courseId || !title) { res.status(400); throw new Error('courseId and title required.'); }
  await verifyTeacher(courseId, req.user._id, req.user.role);

  const result = await uploadToCloudinary(req.file.buffer, 'lms/notes', 'raw');

  const material = await Material.create({
    title, description: description || '', course: courseId, uploadedBy: req.user._id,
    type: 'note', cloudinaryUrl: result.secure_url, cloudinaryPublicId: result.public_id,
    fileSize: req.file.size || 0, order: order || 0,
  });
  res.status(201).json({ message: 'Note uploaded.', material });
};

const uploadVideo = async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded.'); }
  const { courseId, title, description, order } = req.body;
  if (!courseId || !title) { res.status(400); throw new Error('courseId and title required.'); }
  await verifyTeacher(courseId, req.user._id, req.user.role);

  const result = await uploadToCloudinary(req.file.buffer, 'lms/videos', 'video');

  const material = await Material.create({
    title, description: description || '', course: courseId, uploadedBy: req.user._id,
    type: 'video', cloudinaryUrl: result.secure_url, cloudinaryPublicId: result.public_id,
    fileSize: req.file.size || 0, order: order || 0,
  });
  res.status(201).json({ message: 'Video uploaded.', material });
};

const getCourseMaterials = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found.'); }
  const isTeacher  = course.teacher.toString() === req.user._id.toString();
  const isEnrolled = course.enrolledStudents.map(String).includes(String(req.user._id));
  if (!isTeacher && !isEnrolled && req.user.role !== 'admin') { res.status(403); throw new Error('Not enrolled.'); }
  res.json(await Material.find({ course: req.params.courseId }).sort({ order: 1 }));
};

const deleteMaterial = async (req, res) => {
  const m = await Material.findById(req.params.id).populate('course');
  if (!m) { res.status(404); throw new Error('Material not found.'); }
  if (m.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorised.'); }
  await cloudinary.uploader.destroy(m.cloudinaryPublicId, { resource_type: m.type === 'video' ? 'video' : 'raw' });
  await m.deleteOne();
  res.json({ message: 'Material deleted.' });
};

const updateMaterial = async (req, res) => {
  const m = await Material.findById(req.params.id).populate('course');
  if (!m) { res.status(404); throw new Error('Material not found.'); }
  if (m.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorised.'); }
  if (req.body.title)                     m.title       = req.body.title;
  if (req.body.description !== undefined) m.description = req.body.description;
  if (req.body.order !== undefined)       m.order       = req.body.order;
  await m.save();
  res.json({ message: 'Material updated.', material: m });
};

module.exports = { uploadNote, uploadVideo, getCourseMaterials, deleteMaterial, updateMaterial };