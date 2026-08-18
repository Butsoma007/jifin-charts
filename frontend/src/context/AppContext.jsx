import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AppContext = createContext(null)
export const API_URL = import.meta.env.VITE_API_URL

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('jifin_token') || '')
  const [datasets, setDatasets] = useState([])
  const [charts, setCharts] = useState([])
  const [loading, setLoading] = useState(false)

  // fetch user profile when token changes
  useEffect(() => {
    if (token) {
      fetchProfile()
      fetchDatasets()
      fetchCharts()
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) setUser(data.user)
    } catch {
      logout()
    }
  }

  const fetchDatasets = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/datasets`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) setDatasets(data.datasets)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCharts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/charts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) setCharts(data.charts)
    } catch (err) {
      console.error(err)
    }
  }

  const logout = () => {
    setToken('')
    setUser(null)
    setDatasets([])
    setCharts([])
    localStorage.removeItem('jifin_token')
  }

  const contextValue = {
    user, setUser,
    token, setToken,
    datasets, setDatasets, fetchDatasets,
    charts, setCharts, fetchCharts,
    loading, setLoading,
    logout,
    API_URL,
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
export default AppContextProvider