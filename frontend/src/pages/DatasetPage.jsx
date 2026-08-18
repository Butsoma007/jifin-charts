import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../context/AppContext'

const CHART_TYPES = [
  { value: 'pie', label: '🥧 Pie Chart', desc: 'Shows proportions of a whole' },
  { value: 'bar', label: '📊 Bar Chart', desc: 'Compares values across categories' },
  { value: 'table', label: '📋 Table', desc: 'Structured row and column display' },
]

const DatasetPage = () => {
  const { token, API_URL, fetchDatasets, fetchCharts } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const preselected = location.state?.selectedDataset || null

  const [title, setTitle] = useState('')
  const [rows, setRows] = useState([
    { category: '', value: '' },
    { category: '', value: '' },
    { category: '', value: '' },
  ])
  const [chartType, setChartType] = useState('pie')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedDataset, setSelectedDataset] = useState(preselected)

  useEffect(() => {
    if (preselected) {
      setSelectedDataset(preselected)
      setTitle(preselected.title)
      setRows(preselected.data.map(d => ({ category: d.category, value: String(d.value) })))
    }
  }, [])

  const handleRowChange = (index, field, value) => {
    const updated = [...rows]
    updated[index][field] = value
    setRows(updated)
    setError('')
  }

  const addRow = () => {
    setRows(prev => [...prev, { category: '', value: '' }])
  }

  const removeRow = (index) => {
    if (rows.length <= 2) return setError('Minimum 2 entries required')
    setRows(prev => prev.filter((_, i) => i !== index))
  }

  const validateRows = () => {
    for (const row of rows) {
      if (!row.category.trim()) return 'All category names are required'
      if (row.value === '' || isNaN(Number(row.value)) || Number(row.value) < 0) {
        return 'All values must be positive numbers'
      }
    }
    return null
  }

  const handleSaveAndGenerate = async () => {
    if (!title.trim()) return setError('Please enter a dataset title')
    const rowError = validateRows()
    if (rowError) return setError(rowError)

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const dataPayload = rows.map(r => ({
        category: r.category.trim(),
        value: Number(r.value),
      }))

      // create dataset
      const { data: dsData } = await axios.post(
        `${API_URL}/api/datasets`,
        { title: title.trim(), data: dataPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!dsData.success) return setError(dsData.message)

      // generate chart
      const { data: chartData } = await axios.post(
        `${API_URL}/api/charts/generate`,
        { datasetId: dsData.dataset._id, chartType },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!chartData.success) return setError(chartData.message)

      await fetchDatasets()
      await fetchCharts()

      setSuccess('Dataset saved and chart generated!')

      // navigate to chart view after short delay
      setTimeout(() => {
        navigate(`/charts/${chartData.chartOutput._id}`)
      }, 1000)

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFromExisting = async () => {
    if (!selectedDataset) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(
        `${API_URL}/api/charts/generate`,
        { datasetId: selectedDataset._id, chartType },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!data.success) return setError(data.message)
      await fetchCharts()
      setTimeout(() => navigate(`/charts/${data.chartOutput._id}`), 800)
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const total = rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0)

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* left — data entry */}
        <div style={styles.left}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.title}>Enter Statistical Data</h2>
            <p style={styles.sub}>Fill in your categories and values below</p>
          </div>

          {/* title input */}
          <div style={styles.group}>
            <label style={styles.label}>Dataset Title</label>
            <input
              type='text'
              value={title}
              onChange={e => { setTitle(e.target.value); setError('') }}
              placeholder='e.g. Student Survey Results 2026'
              style={styles.input}
            />
          </div>

          {/* data rows */}
          <div style={styles.group}>
            <div style={styles.rowHeader}>
              <label style={styles.label}>Data Entries</label>
              <span style={styles.totalBadge}>Total: {total}</span>
            </div>

            {/* column headers */}
            <div style={styles.colHeaders}>
              <span style={{ flex: 2 }}>Category</span>
              <span style={{ flex: 1 }}>Value</span>
              <span style={{ width: '30px' }}></span>
            </div>

            {rows.map((row, i) => (
              <div key={i} style={styles.row}>
                <input
                  type='text'
                  value={row.category}
                  onChange={e => handleRowChange(i, 'category', e.target.value)}
                  placeholder={`Category ${i + 1}`}
                  style={{ ...styles.input, flex: 2 }}
                />
                <input
                  type='number'
                  value={row.value}
                  onChange={e => handleRowChange(i, 'value', e.target.value)}
                  placeholder='0'
                  min='0'
                  style={{ ...styles.input, flex: 1 }}
                />
                <button
                  style={styles.removeBtn}
                  onClick={() => removeRow(i)}
                >
                  ✕
                </button>
              </div>
            ))}

            <button style={styles.addRowBtn} onClick={addRow}>
              + Add Row
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </div>

        {/* right — chart type selector */}
        <div style={styles.right}>
          <h3 style={styles.rightTitle}>Select Chart Type</h3>
          <p style={styles.rightSub}>Choose how to visualise your data</p>

          <div style={styles.chartTypes}>
            {CHART_TYPES.map(ct => (
              <div
                key={ct.value}
                style={{
                  ...styles.chartTypeCard,
                  border: chartType === ct.value
                    ? '2px solid #095DE9'
                    : '2px solid #e2e2e2',
                  background: chartType === ct.value ? '#f0f5ff' : 'white',
                }}
                onClick={() => setChartType(ct.value)}
              >
                <p style={{ fontSize: '22px', margin: '0 0 6px' }}>
                  {ct.label.split(' ')[0]}
                </p>
                <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 4px' }}>
                  {ct.label.split(' ').slice(1).join(' ')}
                </p>
                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                  {ct.desc}
                </p>
                {chartType === ct.value && (
                  <div style={styles.selectedDot} />
                )}
              </div>
            ))}
          </div>

          {/* preview of entries */}
          {total > 0 && (
            <div style={styles.preview}>
              <p style={styles.previewTitle}>Preview</p>
              {rows.filter(r => r.category && r.value).map((r, i) => (
                <div key={i} style={styles.previewRow}>
                  <span>{r.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: `${Math.round((Number(r.value) / total) * 100)}px`,
                      maxWidth: '100px',
                      height: '8px',
                      background: '#095DE9',
                      borderRadius: '4px',
                      minWidth: '4px',
                    }} />
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      {total > 0 ? ((Number(r.value) / total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* action buttons */}
          <button
            style={{ ...styles.generateBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handleSaveAndGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : '✨ Save & Generate Chart'}
          </button>

          <button
            style={styles.backBtn}
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: '30px 40px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '28px',
    alignItems: 'start',
  },
  left: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    border: '0.5px solid #e2e2e2',
  },
  right: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    border: '0.5px solid #e2e2e2',
    position: 'sticky',
    top: '20px',
  },
  sectionHeader: { marginBottom: '24px' },
  title: { fontSize: '20px', fontWeight: '700', marginBottom: '6px' },
  sub: { fontSize: '14px', color: '#888' },
  group: { marginBottom: '20px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#444', display: 'block', marginBottom: '8px' },
  input: {
    padding: '10px 12px',
    border: '1px solid #e2e2e2',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  totalBadge: {
    background: '#f0f5ff',
    color: '#095DE9',
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  colHeaders: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px',
    color: '#888',
    marginBottom: '6px',
    padding: '0 2px',
  },
  row: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    alignItems: 'center',
  },
  removeBtn: {
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontSize: '12px',
    flexShrink: 0,
  },
  addRowBtn: {
    width: '100%',
    padding: '10px',
    background: '#f9f9f9',
    border: '1px dashed #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#666',
    fontSize: '14px',
    marginTop: '4px',
  },
  error: {
    fontSize: '13px',
    color: '#dc2626',
    background: '#fee2e2',
    padding: '10px 14px',
    borderRadius: '8px',
  },
  success: {
    fontSize: '13px',
    color: '#16a34a',
    background: '#dcfce7',
    padding: '10px 14px',
    borderRadius: '8px',
  },
  rightTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '6px' },
  rightSub: { fontSize: '13px', color: '#888', marginBottom: '20px' },
  chartTypes: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  chartTypeCard: {
    padding: '14px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s',
  },
  selectedDot: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#095DE9',
  },
  preview: {
    background: '#f9f9f9',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '16px',
  },
  previewTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#888',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  previewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '13px',
  },
  generateBtn: {
    width: '100%',
    padding: '14px',
    background: '#095DE9',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  backBtn: {
    width: '100%',
    padding: '12px',
    background: 'white',
    color: '#666',
    border: '1px solid #e2e2e2',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
  },
}

export default DatasetPage