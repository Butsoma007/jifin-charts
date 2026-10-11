import mongoose from 'mongoose'

const dataValueSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false })

const datasetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  data: [dataValueSchema],
  total: {
    type: Number,
    default: 0,
  },
}, { timestamps: true })

// ✅ UNIQUE dataset per user - userId + title combination must be unique
datasetSchema.index({ userId: 1, title: 1 }, { unique: true })

export default mongoose.model('Dataset', datasetSchema)