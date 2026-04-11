const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title:             { type: String, required: true, trim: true },
  description:       { type: String, required: true },
  teacher:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:          { type: String, required: true, enum: ['Mathematics','Science','Physics','Chemistry','Biology','Computer Science','English','History','Geography','Other'] },
  thumbnail:         { type: String, default: '' },
  thumbnailPublicId: { type: String, default: '' },
  enrolledStudents:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished:       { type: Boolean, default: false },
}, { timestamps: true });

courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);