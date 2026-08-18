import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Navbar from './components/Navbar/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DatasetPage from './pages/DatasetPage'
import ChartPage from './pages/ChartPage'

const ProtectedRoute = ({ children }) => {
  const { token } = useApp()
  return token ? children : <Navigate to='/login' />
}

const App = () => {
  const { token } = useApp()

  return (
    <div onClick={() => {}}>
      <Navbar />
      <Routes>
        <Route path='/' element={
          token ? <Navigate to='/dashboard' /> : <Navigate to='/login' />
        } />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/dashboard' element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path='/datasets' element={
          <ProtectedRoute><DatasetPage /></ProtectedRoute>
        } />
        <Route path='/charts/:id' element={
          <ProtectedRoute><ChartPage /></ProtectedRoute>
        } />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </div>
  )
}

export default App