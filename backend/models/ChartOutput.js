import mongoose from 'mongoose'

const chartOutputSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chartType: {
    type: String,
    enum: ['pie', 'bar', 'table'],
    required: true,
  },
  chartSpec: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
}, { timestamps: true })

// ✅ Prevent creating the same chart type from same dataset twice
chartOutputSchema.index({ datasetId: 1, userId: 1, chartType: 1 }, { unique: true })

export default mongoose.model('ChartOutput', chartOutputSchema)