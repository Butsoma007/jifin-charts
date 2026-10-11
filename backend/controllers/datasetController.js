import Dataset from '../models/Dataset.js'
import ChartOutput from '../models/ChartOutput.js'  // ✅ Import

// POST /api/datasets
export const createDataset = async (req, res) => {
  const { title, data } = req.body
  try {
    if (!title || !data || data.length < 2) {
      return res.json({
        success: false,
        message: 'Title and at least 2 data entries are required'
      })
    }

    // Validate each entry
    for (const item of data) {
      if (!item.category || item.category.trim() === '') {
        return res.json({ success: false, message: 'Each entry must have a category name' })
      }
      if (typeof item.value !== 'number' || item.value < 0) {
        return res.json({ success: false, message: 'Each value must be a positive number' })
      }
    }

    // ✅ Check if dataset with same title already exists for this user
    const existingDataset = await Dataset.findOne({ userId: req.userId, title })
    if (existingDataset) {
      return res.json({ success: false, message: 'Dataset with this title already exists' })
    }

    // ✅ Calculate total HERE
    const total = data.reduce((sum, item) => sum + item.value, 0)

    const dataset = await Dataset.create({
      userId: req.userId,
      title,
      data,
      total,  // ✅ Pass total explicitly
    })

    res.json({ success: true, dataset })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// GET /api/datasets
export const getUserDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ success: true, datasets })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// GET /api/datasets/:id
export const getDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.userId })
    if (!dataset) return res.json({ success: false, message: 'Dataset not found' })
    res.json({ success: true, dataset })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// PUT /api/datasets/:id
// PUT /api/datasets/:id
export const updateDataset = async (req, res) => {
  const { title, data } = req.body
  try {
    if (!title || !data || data.length < 2) {
      return res.json({
        success: false,
        message: 'Title and at least 2 data entries are required'
      })
    }

    // Validate each entry
    for (const item of data) {
      if (!item.category || item.category.trim() === '') {
        return res.json({ success: false, message: 'Each entry must have a category name' })
      }
      if (typeof item.value !== 'number' || item.value < 0) {
        return res.json({ success: false, message: 'Each value must be a positive number' })
      }
    }

    // ✅ Calculate new total
    const total = data.reduce((sum, item) => sum + item.value, 0)

    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.userId })
    if (!dataset) return res.json({ success: false, message: 'Dataset not found' })

    // Update fields
    dataset.title = title
    dataset.data = data
    dataset.total = total
    await dataset.save()

    res.json({ success: true, dataset })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// DELETE /api/datasets/:id - ✅ CASCADE DELETE CHARTS
export const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!dataset) return res.json({ success: false, message: 'Dataset not found' })

    // ✅ Delete all charts related to this dataset
    await ChartOutput.deleteMany({ datasetId: req.params.id })

    res.json({ success: true, message: 'Dataset and related charts deleted' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}