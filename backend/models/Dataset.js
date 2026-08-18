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
}, { _id: false })  // embedded — no separate _id per entry

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
  data: [dataValueSchema],   // embedded array of category/value pairs
  total: {
    type: Number,
    default: 0,
  },
}, { timestamps: true })

// auto-compute total before saving
datasetSchema.pre('save', function (next) {
  this.total = this.data.reduce((sum, item) => sum + item.value, 0)
})

export default mongoose.model('Dataset', datasetSchema)