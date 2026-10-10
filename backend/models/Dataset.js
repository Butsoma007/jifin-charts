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

// ✅ Prevent duplicate datasets with same title per user
datasetSchema.index({ userId: 1, title: 1 }, { unique: true })

// auto-compute total before saving
datasetSchema.pre('save', function (next) {
  this.total = this.data.reduce((sum, item) => sum + item.value, 0)
  next()
})

export default mongoose.model('Dataset', datasetSchema)