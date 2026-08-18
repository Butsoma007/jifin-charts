import Dataset from '../models/Dataset.js'

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

    // validate each entry has category and positive value
    for (const item of data) {
      if (!item.category || item.category.trim() === '') {
        return res.json({ success: false, message: 'Each entry must have a category name' })
      }
      if (typeof item.value !== 'number' || item.value < 0) {
        return res.json({ success: false, message: 'Each value must be a positive number' })
      }
    }

    const dataset = await Dataset.create({
      userId: req.userId,
      title,
      data,
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
export const updateDataset = async (req, res) => {
  const { title, data } = req.body
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.userId })
    if (!dataset) return res.json({ success: false, message: 'Dataset not found' })

    if (title) dataset.title = title
    if (data) dataset.data = data
    await dataset.save()

    res.json({ success: true, dataset })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// DELETE /api/datasets/:id
export const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!dataset) return res.json({ success: false, message: 'Dataset not found' })
    res.json({ success: true, message: 'Dataset deleted' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}