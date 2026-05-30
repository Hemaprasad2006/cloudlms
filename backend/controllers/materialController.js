const Material = require('../models/Material');
const Course = require('../models/Course');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

const verifyTeacher = async (courseId, userId, role) => {
  const course = await Course.findById(courseId);
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  if (course.teacher.toString() !== userId.toString() && role !== 'admin')
    throw Object.assign(new Error('Not authorised.'), { statusCode: 403 });
  return course;
};

const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    const { courseId, title, description, order } = req.body;
    
    if (!courseId || !title) {
      return res.status(400).json({ message: 'courseId and title are required.' });
    }

    // Verify teacher owns this course
    await verifyTeacher(courseId, req.user._id, req.user.role);

    console.log('📤 Uploading note to Cloudinary...');
    const result = await uploadToCloudinary(req.file.buffer, 'lms/notes', 'raw');
    console.log('✅ Cloudinary upload successful:', result.public_id);

    console.log('💾 Saving material to MongoDB...');
    const material = await Material.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      course: courseId,
      uploadedBy: req.user._id,
      type: 'note',
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      fileSize: req.file.size || 0,
      order: parseInt(order) || 0,
    });
    
    console.log('✅ Material saved to MongoDB:', material._id);

    // Populate and return
    const populatedMaterial = await material.populate('uploadedBy', 'name email');
    
    res.status(201).json({ 
      message: 'Note uploaded successfully.', 
      material: populatedMaterial 
    });
  } catch (error) {
    console.error('❌ Error in uploadNote:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    const { courseId, title, description, order } = req.body;
    
    if (!courseId || !title) {
      return res.status(400).json({ message: 'courseId and title are required.' });
    }

    // Verify teacher owns this course
    await verifyTeacher(courseId, req.user._id, req.user.role);

    console.log('📤 Uploading video to Cloudinary...');
    const result = await uploadToCloudinary(req.file.buffer, 'lms/videos', 'video');
    console.log('✅ Cloudinary upload successful:', result.public_id);

    console.log('💾 Saving material to MongoDB...');
    const material = await Material.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      course: courseId,
      uploadedBy: req.user._id,
      type: 'video',
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      fileSize: req.file.size || 0,
      order: parseInt(order) || 0,
    });
    
    console.log('✅ Material saved to MongoDB:', material._id);

    // Populate and return
    const populatedMaterial = await material.populate('uploadedBy', 'name email');
    
    res.status(201).json({ 
      message: 'Video uploaded successfully.', 
      material: populatedMaterial 
    });
  } catch (error) {
    console.error('❌ Error in uploadVideo:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log(`📖 Fetching materials for course ${courseId}...`);
    
    // First check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check if user has access to view materials
    const isTeacher = course.teacher.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.map(id => id.toString()).includes(req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    console.log(`User role: ${req.user.role}, isTeacher: ${isTeacher}, isEnrolled: ${isEnrolled}, isAdmin: ${isAdmin}`);

    if (!isTeacher && !isEnrolled && !isAdmin) {
      return res.status(403).json({ message: 'You are not enrolled in this course.' });
    }

    // Fetch materials from MongoDB
    const materials = await Material.find({ course: courseId })
      .populate('uploadedBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    console.log(`✅ Found ${materials.length} materials`);
    
    res.json(materials);
  } catch (error) {
    console.error('❌ Error in getCourseMaterials:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const m = await Material.findById(req.params.id).populate('course');
    
    if (!m) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    if (m.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised to delete this material.' });
    }

    console.log(`🗑️ Deleting material ${m._id} from Cloudinary...`);
    await cloudinary.uploader.destroy(m.cloudinaryPublicId, { 
      resource_type: m.type === 'video' ? 'video' : 'raw' 
    });
    console.log('✅ Deleted from Cloudinary');

    console.log(`🗑️ Deleting material record from MongoDB...`);
    await Material.findByIdAndDelete(m._id);
    console.log('✅ Deleted from MongoDB');

    res.json({ message: 'Material deleted successfully.' });
  } catch (error) {
    console.error('❌ Error in deleteMaterial:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const m = await Material.findById(req.params.id).populate('course');
    
    if (!m) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    if (m.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised to update this material.' });
    }

    if (req.body.title) m.title = req.body.title.trim();
    if (req.body.description !== undefined) m.description = req.body.description.trim();
    if (req.body.order !== undefined) m.order = parseInt(req.body.order);

    await m.save();
    const updated = await m.populate('uploadedBy', 'name email');

    res.json({ message: 'Material updated successfully.', material: updated });
  } catch (error) {
    console.error('❌ Error in updateMaterial:', error);
    res.status(500).json({ message: error.message });
  }
};
const debugMaterials = async (req, res) => {
  try {
    console.log('\n========== DEBUG: Getting ALL Materials ==========');
    
    const allMaterials = await Material.find({})
      .populate('course', 'title')
      .populate('uploadedBy', 'name email role');
    
    console.log(`Total materials in DB: ${allMaterials.length}`);
    allMaterials.forEach((m, i) => {
      console.log(`\n[${i+1}] ${m.title}`);
      console.log(`    Type: ${m.type}`);
      console.log(`    Course ID: ${m.course._id}`);
      console.log(`    Course Name: ${m.course.title}`);
      console.log(`    Uploaded By: ${m.uploadedBy.name}`);
    });
    
    res.json({ materialsCount: allMaterials.length, materials: allMaterials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { uploadNote, uploadVideo, getCourseMaterials, deleteMaterial, updateMaterial, debugMaterials };