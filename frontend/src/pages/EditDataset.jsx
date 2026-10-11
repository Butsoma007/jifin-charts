import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../context/AppContext'

const EditDataset = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, API_URL, fetchDatasets } = useApp()

  const [title, setTitle] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDataset()
  }, [id])

  const fetchDataset = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/datasets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setTitle(data.dataset.title)
        setRows(data.dataset.data.map(d => ({ category: d.category, value: String(d.value) })))
      } else {
        setError(data.message)
      }
    } catch {
      setError('Failed to load dataset')
    } finally {
      setLoading(false)
    }
  }

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

  const handleSave = async () => {
    if (!title.trim()) return setError('Please enter a dataset title')
    const rowError = validateRows()
    if (rowError) return setError(rowError)

    setLoading(true)
    setError('')

    try {
      const dataPayload = rows.map(r => ({
        category: r.category.trim(),
        value: Number(r.value),
      }))

      const { data } = await axios.put(
        `${API_URL}/api/datasets/${id}`,
        { title: title.trim(), data: dataPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!data.success) return setError(data.message)

      await fetchDatasets()
      setSuccess('Dataset updated successfully! Charts will reflect the new data.')
      
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch {
      setError('Failed to update dataset')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  const total = rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0)

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Edit Dataset</h2>

        {/* title input */}
        <div style={styles.group}>
          <label style={styles.label}>Dataset Title</label>
          <input
            type='text'
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* data rows */}
        <div style={styles.group}>
          <div style={styles.rowHeader}>
            <label style={styles.label}>Data Entries</label>
            <span style={styles.totalBadge}>Total: {total}</span>
          </div>

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
                style={{ ...styles.input, flex: 2 }}
              />
              <input
                type='number'
                value={row.value}
                onChange={e => handleRowChange(i, 'value', e.target.value)}
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

        <div style={styles.actions}>
          <button
            style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button style={styles.cancelBtn} onClick={() => navigate('/dashboard')}>
            ← Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '30px 40px', maxWidth: '700px', margin: '0 auto' },
  container: { background: 'white', borderRadius: '16px', padding: '28px', border: '0.5px solid #e2e2e2' },
  title: { fontSize: '22px', fontWeight: '700', marginBottom: '24px' },
  group: { marginBottom: '20px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#444', display: 'block', marginBottom: '8px' },
  input: { padding: '10px 12px', border: '1px solid #e2e2e2', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%' },
  rowHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  totalBadge: { background: '#f0f5ff', color: '#095DE9', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  colHeaders: { display: 'flex', gap: '8px', fontSize: '12px', color: '#888', marginBottom: '6px', padding: '0 2px' },
  row: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' },
  removeBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '8px 10px', cursor: 'pointer', fontSize: '12px' },
  addRowBtn: { width: '100%', padding: '10px', background: '#f9f9f9', border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer', color: '#666', fontSize: '14px', marginTop: '4px' },
  error: { fontSize: '13px', color: '#dc2626', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' },
  success: { fontSize: '13px', color: '#16a34a', background: '#dcfce7', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' },
  actions: { display: 'flex', gap: '10px', marginTop: '24px' },
  saveBtn: { flex: 1, padding: '12px', background: '#095DE9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', background: 'white', color: '#666', border: '1px solid #e2e2e2', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
}

export default EditDataset