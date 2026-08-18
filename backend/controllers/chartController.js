import ChartOutput from '../models/ChartOutput.js'
import Dataset from '../models/Dataset.js'

// generate chart colors
const generateColors = (count) => {
  const palette = [
    '#095DE9', '#16a34a', '#dc2626', '#f59e0b',
    '#7c3aed', '#0d9488', '#db2777', '#ea580c',
    '#0369a1', '#65a30d', '#9333ea', '#0891b2',
  ]
  return Array.from({ length: count }, (_, i) => palette[i % palette.length])
}

// compute pie chart spec
const computePieSpec = (dataset) => {
  const total = dataset.total
  const labels = dataset.data.map(d => d.category)
  const values = dataset.data.map(d => d.value)
  const percentages = values.map(v => ((v / total) * 100).toFixed(2))
  const angles = values.map(v => ((v / total) * 360).toFixed(2))
  const colors = generateColors(labels.length)

  return {
    type: 'pie',
    title: dataset.title,
    labels,
    values,
    percentages,
    angles,
    colors,
    total,
  }
}

// compute bar chart spec
const computeBarSpec = (dataset) => {
  const labels = dataset.data.map(d => d.category)
  const values = dataset.data.map(d => d.value)
  const colors = generateColors(labels.length)
  const maxValue = Math.max(...values)

  return {
    type: 'bar',
    title: dataset.title,
    labels,
    values,
    colors,
    maxValue,
    total: dataset.total,
  }
}

// compute table spec
const computeTableSpec = (dataset) => {
  const total = dataset.total
  let cumulative = 0

  const rows = dataset.data.map(d => {
    const percentage = ((d.value / total) * 100).toFixed(2)
    cumulative += d.value
    const cumulativeFreq = ((cumulative / total) * 100).toFixed(2)
    return {
      category: d.category,
      value: d.value,
      percentage: `${percentage}%`,
      cumulativeFrequency: `${cumulativeFreq}%`,
    }
  })

  return {
    type: 'table',
    title: dataset.title,
    rows,
    total,
  }
}

// POST /api/charts/generate
export const generateChart = async (req, res) => {
  const { datasetId, chartType } = req.body
  try {
    if (!datasetId || !chartType) {
      return res.json({ success: false, message: 'Dataset ID and chart type are required' })
    }

    if (!['pie', 'bar', 'table'].includes(chartType)) {
      return res.json({ success: false, message: 'Chart type must be pie, bar or table' })
    }

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.userId })
    if (!dataset) return res.json({ success: false, message: 'Dataset not found' })

    // compute the chart spec based on type
    let chartSpec
    if (chartType === 'pie')   chartSpec = computePieSpec(dataset)
    if (chartType === 'bar')   chartSpec = computeBarSpec(dataset)
    if (chartType === 'table') chartSpec = computeTableSpec(dataset)

    // save to ChartOutput collection
    const chartOutput = await ChartOutput.create({
      datasetId,
      userId: req.userId,
      chartType,
      chartSpec,
      title: dataset.title,
    })

    res.json({ success: true, chartOutput })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// GET /api/charts
export const getUserCharts = async (req, res) => {
  try {
    const charts = await ChartOutput.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('datasetId', 'title')
    res.json({ success: true, charts })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// GET /api/charts/:id
export const getChart = async (req, res) => {
  try {
    const chart = await ChartOutput.findOne({ _id: req.params.id, userId: req.userId })
      .populate('datasetId')
    if (!chart) return res.json({ success: false, message: 'Chart not found' })
    res.json({ success: true, chart })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// DELETE /api/charts/:id
export const deleteChart = async (req, res) => {
  try {
    const chart = await ChartOutput.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!chart) return res.json({ success: false, message: 'Chart not found' })
    res.json({ success: true, message: 'Chart deleted' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}