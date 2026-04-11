const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title:              { type: String, required: true, trim: true },
  course:             { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  uploadedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  type:               { type: String, enum: ['note','video'], required: true },
  cloudinaryUrl:      { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  fileSize:           { type: Number, default: 0 },
  description:        { type: String, default: '' },
  order:              { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);