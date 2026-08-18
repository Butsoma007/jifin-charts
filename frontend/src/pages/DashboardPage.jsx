import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatDate } from '../utils/helpers'

const DashboardPage = () => {
  const { user, datasets, charts, fetchDatasets, fetchCharts, token, API_URL } = useApp()
  const navigate = useNavigate()

  const handleDeleteDataset = async (id) => {
    if (!window.confirm('Delete this dataset and all its charts?')) return
    try {
      const res = await fetch(`${API_URL}/api/datasets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) fetchDatasets()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteChart = async (id) => {
    if (!window.confirm('Delete this chart?')) return
    try {
      const res = await fetch(`${API_URL}/api/charts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) fetchCharts()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={styles.page}>

      {/* welcome banner */}
      <div style={styles.banner}>
        <div>
          <h2 style={styles.bannerTitle}>
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h2>
          <p style={styles.bannerSub}>
            Create datasets and generate pie charts, bar charts and tables.
          </p>
        </div>
        <button
          style={styles.newBtn}
          onClick={() => navigate('/datasets')}
        >
          + New Dataset
        </button>
      </div>

      {/* stats row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statNum}>{datasets.length}</p>
          <p style={styles.statLabel}>Total Datasets</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNum}>{charts.length}</p>
          <p style={styles.statLabel}>Charts Generated</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNum}>
            {charts.filter(c => c.chartType === 'pie').length}
          </p>
          <p style={styles.statLabel}>Pie Charts</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNum}>
            {charts.filter(c => c.chartType === 'bar').length}
          </p>
          <p style={styles.statLabel}>Bar Charts</p>
        </div>
      </div>

      <div style={styles.columns}>

        {/* datasets list */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>My Datasets</h3>
            <button
              style={styles.addBtn}
              onClick={() => navigate('/datasets')}
            >
              + Add
            </button>
          </div>

          {datasets.length === 0
            ? <div style={styles.empty}>
                <p>No datasets yet.</p>
                <button
                  style={styles.emptyBtn}
                  onClick={() => navigate('/datasets')}
                >
                  Create your first dataset
                </button>
              </div>
            : datasets.map(ds => (
              <div key={ds._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <p style={styles.cardTitle}>{ds.title}</p>
                    <p style={styles.cardMeta}>
                      {ds.data.length} categories · Total: {ds.total} · {formatDate(ds.createdAt)}
                    </p>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDeleteDataset(ds._id)}
                  >
                    ✕
                  </button>
                </div>
                <div style={styles.categoryTags}>
                  {ds.data.slice(0, 3).map((d, i) => (
                    <span key={i} style={styles.tag}>{d.category}: {d.value}</span>
                  ))}
                  {ds.data.length > 3 && (
                    <span style={styles.tag}>+{ds.data.length - 3} more</span>
                  )}
                </div>
                <button
                  style={styles.generateBtn}
                  onClick={() => navigate('/datasets', { state: { selectedDataset: ds } })}
                >
                  Generate Chart →
                </button>
              </div>
            ))
          }
        </div>

        {/* charts list */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Generated Charts</h3>
          </div>

          {charts.length === 0
            ? <div style={styles.empty}>
                <p>No charts generated yet.</p>
                <p style={{ fontSize: '13px', color: '#aaa', marginTop: '6px' }}>
                  Create a dataset first then generate a chart.
                </p>
              </div>
            : charts.map(chart => (
              <div key={chart._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        ...styles.chartBadge,
                        background: chart.chartType === 'pie' ? '#e0f2fe'
                          : chart.chartType === 'bar' ? '#dcfce7' : '#fef3c7',
                        color: chart.chartType === 'pie' ? '#0369a1'
                          : chart.chartType === 'bar' ? '#16a34a' : '#b45309',
                      }}>
                        {chart.chartType.toUpperCase()}
                      </span>
                      <p style={styles.cardTitle}>{chart.title}</p>
                    </div>
                    <p style={styles.cardMeta}>{formatDate(chart.createdAt)}</p>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDeleteChart(chart._id)}
                  >
                    ✕
                  </button>
                </div>
                <button
                  style={styles.generateBtn}
                  onClick={() => navigate(`/charts/${chart._id}`)}
                >
                  View Chart →
                </button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: '30px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  banner: {
    background: 'linear-gradient(135deg, #095DE9, #0d9488)',
    borderRadius: '16px',
    padding: '28px 32px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  bannerTitle: {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '6px',
  },
  bannerSub: {
    fontSize: '14px',
    opacity: 0.85,
  },
  newBtn: {
    padding: '12px 24px',
    background: 'white',
    color: '#095DE9',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: '0.5px solid #e2e2e2',
  },
  statNum: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#095DE9',
    margin: '0 0 4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  section: {
    background: 'white',
    borderRadius: '14px',
    padding: '20px',
    border: '0.5px solid #e2e2e2',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
  },
  addBtn: {
    padding: '6px 14px',
    background: '#095DE9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#888',
    fontSize: '14px',
  },
  emptyBtn: {
    marginTop: '12px',
    padding: '10px 20px',
    background: '#095DE9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  card: {
    border: '0.5px solid #e2e2e2',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '12px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: '14px',
    margin: '0 0 4px',
  },
  cardMeta: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
  },
  deleteBtn: {
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    flexShrink: 0,
  },
  categoryTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '10px',
  },
  tag: {
    background: '#f0f5ff',
    color: '#095DE9',
    fontSize: '12px',
    padding: '3px 8px',
    borderRadius: '20px',
  },
  generateBtn: {
    width: '100%',
    padding: '8px',
    background: '#f0f5ff',
    color: '#095DE9',
    border: '1px solid #095DE9',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  chartBadge: {
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
  },
}

export default DashboardPage