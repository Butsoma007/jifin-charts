import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pie, Bar } from 'react-chartjs-2'
import axios from 'axios'
import { useApp } from '../context/AppContext'
import { formatDate, formatNumber } from '../utils/helpers'

const ChartPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { token, API_URL } = useApp()
    const chartRef = useRef(null)

    const [chart, setChart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('chart')

    useEffect(() => {
        fetchChart()
    }, [id])

    const fetchChart = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/charts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setChart(data.chart)
            } else {
                setError(data.message)
            }
        } catch {
            setError('Failed to load chart')
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) return (
        <div style={styles.centered}>
            <p style={{ color: '#888' }}>Loading chart...</p>
        </div>
    )

    if (error) return (
        <div style={styles.centered}>
            <p style={{ color: '#dc2626' }}>{error}</p>
            <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
                Back to Dashboard
            </button>
        </div>
    )

    const spec = chart?.chartSpec || {}
    const safeLabels = spec.labels || []
    const safeValues = spec.values || []
    const safeColors = spec.colors || []
    const safePercentages = spec.percentages || []
    const safeAngles = spec.angles || []
    const safeRows = spec.rows || []
    const safeTitle = spec.title || []

    // pie chart data
    const pieData = {
        labels: safeLabels,
        datasets: [{
            data: safeValues,
            backgroundColor: safeColors,
            borderColor: safeColors.map(c => c + 'cc'),
            borderWidth: 2,
            hoverOffset: 8,
        }]
    }

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: { size: 13 },
                    usePointStyle: true,
                }
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const pct = safePercentages[ctx.dataIndex]
                        return ` ${ctx.label}: ${formatNumber(ctx.parsed)} (${pct}%)`
                    }
                }
            }
        }
    }

    // bar chart data
    const barData = {
        labels: safeLabels,
        datasets: [{
            label: safeTitle,
            data: safeValues,
            backgroundColor: safeColors,
            borderColor: safeColors.map(c => c + 'cc'),
            borderWidth: 1,
            borderRadius: 6,
        }]
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` Value: ${formatNumber(ctx.parsed.y)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f0f0f0' },
                ticks: { font: { size: 12 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 12 } }
            }
        }
    }

    const generateInterpretation = (spec, chartType) => {
        if (!spec.labels || spec.labels.length === 0) return null

        const maxIndex = spec.values.indexOf(Math.max(...spec.values))
        const minIndex = spec.values.indexOf(Math.min(...spec.values))
        const avg = (spec.total / spec.values.length).toFixed(2)
        const maxPct = spec.percentages[maxIndex]
        const minPct = spec.percentages[minIndex]

        return {
            dominant: `${spec.labels[maxIndex]} has the highest value of ${formatNumber(spec.values[maxIndex])}, representing ${maxPct}% of the total.`,
            least: `${spec.labels[minIndex]} has the lowest value of ${formatNumber(spec.values[minIndex])}, accounting for only ${minPct}% of the total.`,
            average: `The average value across all ${spec.labels.length} categories is ${formatNumber(avg)}.`,
            spread: spec.values.length > 2
                ? `The difference between the highest and lowest values is ${formatNumber(Math.max(...spec.values) - Math.min(...spec.values))}.`
                : null,
            chartNote: chartType === 'pie'
                ? `The pie chart shows proportional distribution. Categories above ${(100 / spec.labels.length).toFixed(1)}% are above average share.`
                : chartType === 'bar'
                    ? `The bar chart allows direct comparison of absolute values across categories.`
                    : `The table presents exact values, percentages and cumulative frequencies for precise reference.`,
        }
    }

    return (
        <div style={styles.page}>

            {/* header */}
            <div style={styles.header}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{
                            ...styles.badge,
                            background: chart.chartType === 'pie' ? '#e0f2fe'
                                : chart.chartType === 'bar' ? '#dcfce7' : '#fef3c7',
                            color: chart.chartType === 'pie' ? '#0369a1'
                                : chart.chartType === 'bar' ? '#16a34a' : '#b45309',
                        }}>
                            {chart.chartType.toUpperCase()} CHART
                        </span>
                        <p style={styles.date}>{formatDate(chart.createdAt)}</p>
                    </div>
                    <h2 style={styles.chartTitle}>{chart.title}</h2>
                </div>
                <div style={styles.actions}>
                    <button style={styles.printBtn} onClick={handlePrint}>
                        🖨️ Print
                    </button>
                    <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
                        ← Dashboard
                    </button>
                </div>
            </div>

            {/* tabs */}
            <div style={styles.tabs}>
                {['chart', 'data', 'summary', 'interpretation'].map(tab => (
                    <button
                        key={tab}
                        style={{
                            ...styles.tab,
                            borderBottom: activeTab === tab ? '2px solid #095DE9' : '2px solid transparent',
                            color: activeTab === tab ? '#095DE9' : '#888',
                            fontWeight: activeTab === tab ? '600' : '400',
                        }}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* tab content */}
            <div style={styles.content} id='printable-chart'>

                {/* CHART TAB */}
                {activeTab === 'chart' && (
                    <div style={styles.chartWrap}>
                        <h3 style={styles.chartHeading}>{spec.title}</h3>

                        {chart.chartType === 'pie' && (
                            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                                <Pie ref={chartRef} data={pieData} options={pieOptions} />
                            </div>
                        )}

                        {chart.chartType === 'bar' && (
                            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                                <Bar ref={chartRef} data={barData} options={barOptions} />
                            </div>
                        )}

                        {chart.chartType === 'table' && (
                            <div style={styles.tableWrap}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Category</th>
                                            <th style={styles.th}>Value</th>
                                            <th style={styles.th}>Percentage</th>
                                            <th style={styles.th}>Cumulative Frequency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {spec.rows.map((row, i) => (
                                            <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                                                <td style={styles.td}>{row.category}</td>
                                                <td style={styles.td}>{formatNumber(row.value)}</td>
                                                <td style={styles.td}>{row.percentage}</td>
                                                <td style={styles.td}>{row.cumulativeFrequency}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ background: '#f0f5ff', fontWeight: '600' }}>
                                            <td style={styles.td}>Total</td>
                                            <td style={styles.td}>{formatNumber(spec.total)}</td>
                                            <td style={styles.td}>100%</td>
                                            <td style={styles.td}>100%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* DATA TAB */}
                {activeTab === 'data' && (
                    <div style={styles.dataWrap}>
                        <h3 style={styles.chartHeading}>Raw Data</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>Category</th>
                                    <th style={styles.th}>Value</th>
                                    {spec.percentages && <th style={styles.th}>Percentage</th>}
                                    {spec.angles && <th style={styles.th}>Arc Angle (°)</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {spec.labels
                                    ? spec.labels.map((label, i) => (
                                        <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                                            <td style={styles.td}>{i + 1}</td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {spec.colors && (
                                                        <span style={{
                                                            width: '12px', height: '12px',
                                                            borderRadius: '3px',
                                                            background: spec.colors[i],
                                                            display: 'inline-block',
                                                            flexShrink: 0,
                                                        }} />
                                                    )}
                                                    {label}
                                                </div>
                                            </td>
                                            <td style={styles.td}>{formatNumber(spec.values[i])}</td>
                                            {spec.percentages && <td style={styles.td}>{spec.percentages[i]}%</td>}
                                            {spec.angles && <td style={styles.td}>{spec.angles[i]}°</td>}
                                        </tr>
                                    ))
                                    : spec.rows?.map((row, i) => (
                                        <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                                            <td style={styles.td}>{i + 1}</td>
                                            <td style={styles.td}>{row.category}</td>
                                            <td style={styles.td}>{formatNumber(row.value)}</td>
                                            <td style={styles.td}>{row.percentage}</td>
                                            <td style={styles.td}>{row.cumulativeFrequency}</td>
                                        </tr>
                                    ))
                                }
                                <tr style={{ background: '#f0f5ff', fontWeight: '600' }}>
                                    <td style={styles.td} colSpan={2}>Total</td>
                                    <td style={styles.td}>{formatNumber(spec.total)}</td>
                                    {spec.percentages && <td style={styles.td}>100%</td>}
                                    {spec.angles && <td style={styles.td}>360°</td>}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* SUMMARY TAB */}
                {activeTab === 'summary' && (
                    <div style={styles.summaryWrap}>
                        <h3 style={styles.chartHeading}>Chart Summary</h3>
                        <div style={styles.summaryGrid}>
                            <div style={styles.summaryCard}>
                                <p style={styles.summaryLabel}>Chart Type</p>
                                <p style={styles.summaryValue}>{chart.chartType.toUpperCase()}</p>
                            </div>
                            <div style={styles.summaryCard}>
                                <p style={styles.summaryLabel}>Total Value</p>
                                <p style={styles.summaryValue}>{formatNumber(spec.total)}</p>
                            </div>
                            <div style={styles.summaryCard}>
                                <p style={styles.summaryLabel}>Categories</p>
                                <p style={styles.summaryValue}>{spec.labels?.length || spec.rows?.length}</p>
                            </div>
                            <div style={styles.summaryCard}>
                                <p style={styles.summaryLabel}>Generated</p>
                                <p style={styles.summaryValue}>{formatDate(chart.createdAt)}</p>
                            </div>
                        </div>

                        {/* highest and lowest */}
                        {spec.labels && (
                            <div style={styles.highlights}>
                                <div style={styles.highlightCard}>
                                    <p style={styles.highlightLabel}>Highest Category</p>
                                    <p style={styles.highlightValue}>
                                        {spec.labels[spec.values.indexOf(Math.max(...spec.values))]}
                                    </p>
                                    <p style={styles.highlightSub}>
                                        {formatNumber(Math.max(...spec.values))} —{' '}
                                        {spec.percentages[spec.values.indexOf(Math.max(...spec.values))]}%
                                    </p>
                                </div>
                                <div style={styles.highlightCard}>
                                    <p style={styles.highlightLabel}>Lowest Category</p>
                                    <p style={styles.highlightValue}>
                                        {spec.labels[spec.values.indexOf(Math.min(...spec.values))]}
                                    </p>
                                    <p style={styles.highlightSub}>
                                        {formatNumber(Math.min(...spec.values))} —{' '}
                                        {spec.percentages[spec.values.indexOf(Math.min(...spec.values))]}%
                                    </p>
                                </div>
                                <div style={styles.highlightCard}>
                                    <p style={styles.highlightLabel}>Average Value</p>
                                    <p style={styles.highlightValue}>
                                        {formatNumber((spec.total / spec.values.length).toFixed(2))}
                                    </p>
                                    <p style={styles.highlightSub}>per category</p>
                                </div>
                            </div>
                        )}

                        {/* category breakdown */}
                        <div style={styles.breakdown}>
                            <p style={styles.breakdownTitle}>Category Breakdown</p>
                            {(spec.labels || spec.rows?.map(r => r.category)).map((label, i) => {
                                const val = spec.values?.[i] || spec.rows?.[i]?.value || 0
                                const pct = spec.percentages?.[i] || spec.rows?.[i]?.percentage?.replace('%', '') || 0
                                const color = spec.colors?.[i] || '#095DE9'
                                return (
                                    <div key={i} style={styles.breakdownRow}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }}>
                                            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: color, flexShrink: 0 }} />
                                            <span style={{ fontSize: '14px' }}>{label}</span>
                                        </div>
                                        <div style={styles.barOuter}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                background: color,
                                                borderRadius: '4px',
                                                transition: 'width 0.5s ease',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#555', minWidth: '60px', textAlign: 'right' }}>
                                            {formatNumber(val)} ({pct}%)
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
                {/* INTERPRETATION TAB */}
                {activeTab === 'interpretation' && (
                    <div style={styles.summaryWrap}>
                        <h3 style={styles.chartHeading}>Data Interpretation</h3>
                        <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginBottom: '24px' }}>
                            Auto-generated interpretation of your statistical data
                        </p>

                        {(() => {
                            const interp = generateInterpretation(spec, chart.chartType)
                            if (!interp) return <p style={{ color: '#888', textAlign: 'center' }}>No interpretation available for this chart type.</p>

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                                    {/* key findings */}
                                    <div style={interpStyles.section}>
                                        <p style={interpStyles.sectionTitle}>📌 Key Findings</p>
                                        <div style={interpStyles.finding}>
                                            <span style={interpStyles.findingIcon}>▲</span>
                                            <p style={interpStyles.findingText}>{interp.dominant}</p>
                                        </div>
                                        <div style={interpStyles.finding}>
                                            <span style={{ ...interpStyles.findingIcon, color: '#dc2626' }}>▼</span>
                                            <p style={interpStyles.findingText}>{interp.least}</p>
                                        </div>
                                        <div style={interpStyles.finding}>
                                            <span style={{ ...interpStyles.findingIcon, color: '#f59e0b' }}>≈</span>
                                            <p style={interpStyles.findingText}>{interp.average}</p>
                                        </div>
                                        {interp.spread && (
                                            <div style={interpStyles.finding}>
                                                <span style={{ ...interpStyles.findingIcon, color: '#7c3aed' }}>↕</span>
                                                <p style={interpStyles.findingText}>{interp.spread}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* chart note */}
                                    <div style={interpStyles.section}>
                                        <p style={interpStyles.sectionTitle}>📊 Chart Type Note</p>
                                        <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
                                            {interp.chartNote}
                                        </p>
                                    </div>

                                    {/* distribution analysis */}
                                    <div style={interpStyles.section}>
                                        <p style={interpStyles.sectionTitle}>📈 Distribution Analysis</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {safeLabels.map((label, i) => {
                                                const pct = Number(safePercentages[i]) || 0
                                                const avgPct = 100 / safeLabels.length
                                                const status = pct > avgPct ? 'above' : pct < avgPct ? 'below' : 'at'
                                                const statusColor = pct > avgPct ? '#16a34a' : pct < avgPct ? '#dc2626' : '#888'

                                                return (
                                                    <div key={i} style={interpStyles.distRow}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
                                                            <span style={{
                                                                width: '10px', height: '10px',
                                                                borderRadius: '3px',
                                                                background: safeColors[i] || '#095DE9',
                                                                flexShrink: 0,
                                                            }} />
                                                            <span style={{ fontSize: '13px' }}>{label}</span>
                                                        </div>
                                                        <div style={styles.barOuter}>
                                                            <div style={{
                                                                width: `${pct}%`,
                                                                height: '100%',
                                                                background: safeColors[i] || '#095DE9',
                                                                borderRadius: '4px',
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: statusColor, minWidth: '110px', textAlign: 'right' }}>
                                                            {pct}% — {status} average
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#aaa', marginTop: '10px' }}>
                                            Average share per category: {(100 / safeLabels.length).toFixed(1)}%
                                        </p>
                                    </div>

                                </div>
                            )
                        })()}
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = {
    page: {
        padding: '30px 40px',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    centered: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.5px',
    },
    date: { fontSize: '13px', color: '#888', margin: 0 },
    chartTitle: { fontSize: '22px', fontWeight: '700', margin: 0 },
    actions: { display: 'flex', gap: '10px', alignItems: 'center' },
    printBtn: {
        padding: '10px 18px',
        background: '#f0f5ff',
        color: '#095DE9',
        border: '1px solid #095DE9',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    backBtn: {
        padding: '10px 18px',
        background: 'white',
        color: '#666',
        border: '1px solid #e2e2e2',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    tabs: {
        display: 'flex',
        gap: '0',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '24px',
    },
    tab: {
        padding: '12px 24px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s',
    },
    content: {
        background: 'white',
        borderRadius: '16px',
        padding: '28px',
        border: '0.5px solid #e2e2e2',
    },
    chartWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    chartHeading: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '24px',
        textAlign: 'center',
    },
    tableWrap: { overflowX: 'auto' },
    dataWrap: { overflowX: 'auto' },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
    },
    th: {
        padding: '12px 16px',
        textAlign: 'left',
        background: '#f9f9f9',
        fontWeight: '600',
        color: '#555',
        borderBottom: '2px solid #f0f0f0',
        fontSize: '13px',
    },
    td: {
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        fontSize: '14px',
    },
    summaryWrap: {},
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        marginBottom: '24px',
    },
    summaryCard: {
        background: '#f9f9f9',
        borderRadius: '10px',
        padding: '16px',
        textAlign: 'center',
        border: '0.5px solid #e2e2e2',
    },
    summaryLabel: { fontSize: '12px', color: '#888', margin: '0 0 6px' },
    summaryValue: { fontSize: '18px', fontWeight: '700', color: '#095DE9', margin: 0 },
    highlights: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
        marginBottom: '24px',
    },
    highlightCard: {
        background: '#f0f5ff',
        borderRadius: '10px',
        padding: '16px',
        border: '0.5px solid #095DE920',
    },
    highlightLabel: { fontSize: '11px', color: '#888', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    highlightValue: { fontSize: '16px', fontWeight: '700', margin: '0 0 4px', color: '#262626' },
    highlightSub: { fontSize: '12px', color: '#095DE9', margin: 0 },
    breakdown: {
        background: '#f9f9f9',
        borderRadius: '10px',
        padding: '20px',
    },
    breakdownTitle: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '16px',
    },
    breakdownRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
    },
    barOuter: {
        flex: 1,
        height: '10px',
        background: '#e2e2e2',
        borderRadius: '5px',
        overflow: 'hidden',
    },
}

const interpStyles = {
  section: {
    background: '#f9f9f9',
    borderRadius: '10px',
    padding: '18px 20px',
    border: '0.5px solid #e2e2e2',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '14px',
  },
  finding: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '10px',
    padding: '10px 12px',
    background: 'white',
    borderRadius: '8px',
    border: '0.5px solid #e2e2e2',
  },
  findingIcon: {
    fontSize: '16px',
    color: '#16a34a',
    flexShrink: 0,
    marginTop: '1px',
  },
  findingText: {
    fontSize: '14px',
    color: '#444',
    lineHeight: 1.6,
    margin: 0,
  },
  distRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
}

export default ChartPage