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

    // ✅ Check if chart of this type already exists for this dataset
    const existingChart = await ChartOutput.findOne({
      datasetId,
      userId: req.userId,
      chartType
    })
    if (existingChart) {
      return res.json({ 
        success: false, 
        message: `${chartType} chart already exists for this dataset. Use a different chart type or delete the existing one.` 
      })
    }

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

// Rest of chart controller remains the same...