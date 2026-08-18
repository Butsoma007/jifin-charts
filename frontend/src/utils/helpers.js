// format number with commas
export const formatNumber = (num) => {
  return Number(num).toLocaleString()
}

// generate consistent colors
export const generateColors = (count) => {
  const palette = [
    '#095DE9', '#16a34a', '#dc2626', '#f59e0b',
    '#7c3aed', '#0d9488', '#db2777', '#ea580c',
    '#0369a1', '#65a30d', '#9333ea', '#0891b2',
  ]
  return Array.from({ length: count }, (_, i) => palette[i % palette.length])
}

// format date
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// get axios config with token
export const authConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
})