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
    type: Object,   // stores the computed chart config (labels, data, colors etc)
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
}, { timestamps: true })

export default mongoose.model('ChartOutput', chartOutputSchema)