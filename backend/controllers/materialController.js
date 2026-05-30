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
    console.log('✅ Cloudinary URL:', result.secure_url);

    console.log('💾 Creating material in MongoDB...');
    const materialData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      course: courseId, // ObjectId reference
      uploadedBy: req.user._id,
      type: 'note',
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      fileSize: req.file.size || 0,
      order: parseInt(order) || 0,
    };
    
    console.log('Material data to save:', materialData);
    
    const material = await Material.create(materialData);
    
    console.log('✅ Material saved to MongoDB with ID:', material._id);

    res.status(201).json({ 
      message: 'Note uploaded successfully.', 
      material: material 
    });
  } catch (error) {
    console.error('❌ Error in uploadNote:', error.message);
    console.error('Stack:', error.stack);
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
    console.log('✅ Cloudinary URL:', result.secure_url);

    console.log('💾 Creating material in MongoDB...');
    const materialData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      course: courseId, // ObjectId reference
      uploadedBy: req.user._id,
      type: 'video',
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      fileSize: req.file.size || 0,
      order: parseInt(order) || 0,
    };
    
    console.log('Material data to save:', materialData);
    
    const material = await Material.create(materialData);
    
    console.log('✅ Material saved to MongoDB with ID:', material._id);

    res.status(201).json({ 
      message: 'Video uploaded successfully.', 
      material: material 
    });
  } catch (error) {
    console.error('❌ Error in uploadVideo:', error.message);
    console.error('Stack:', error.stack);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getCourseMaterials = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    console.log(`\n🔍 getCourseMaterials called for courseId: ${courseId}`);
    console.log(`👤 User ID: ${req.user._id}, Role: ${req.user.role}`);
    
    // Check if course exists
    const course = await Course.findById(courseId);
    console.log(`📖 Course found:`, course ? `Yes (${course.title})` : 'No');
    
    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check permissions
    const isTeacher = course.teacher.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.map(id => id.toString()).includes(req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    console.log(`✓ isTeacher: ${isTeacher}`);
    console.log(`✓ isEnrolled: ${isEnrolled}`);
    console.log(`✓ isAdmin: ${isAdmin}`);

    if (!isTeacher && !isEnrolled && !isAdmin) {
      console.log('❌ User not authorized to view materials');
      return res.status(403).json({ message: 'You are not enrolled in this course.' });
    }

    // Get materials
    console.log(`📚 Fetching materials for course: ${courseId}`);
    const materials = await Material.find({ course: courseId })
      .populate('uploadedBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    console.log(`✅ Found ${materials.length} materials`);
    materials.forEach((m, i) => {
      console.log(`   [${i+1}] ${m.title} (${m.type})`);
    });
    
    res.json(materials);
  } catch (error) {
    console.error('❌ Error in getCourseMaterials:', error.message);
    console.error('Stack:', error.stack);
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

    res.json({ message: 'Material updated successfully.', material: m });
  } catch (error) {
    console.error('❌ Error in updateMaterial:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadNote, uploadVideo, getCourseMaterials, deleteMaterial, updateMaterial };