import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { resetPasswordStyles as styles } from '../styles/resetPasswordStyles'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [buttonHover, setButtonHover] = useState(false)
  const [inputFocus, setInputFocus] = useState({ newPassword: false, confirmPassword: false })

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const API_URL = import.meta.env.VITE_API_URI

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. No token provided.')
      setValidating(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/api/auth/verify-reset-token`,
          { token }
        )

        if (response.data.success) {
          setTokenValid(true)
          setUserEmail(response.data.email)
        } else {
          setError('❌ ' + response.data.message)
        }
      } catch (err) {
        setError('❌ Error verifying reset token.')
      } finally {
        setValidating(false)
      }
    }

    verifyToken()
  }, [token, API_URL])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { newPassword, confirmPassword } = formData

      if (!newPassword || !confirmPassword) {
        setError('All fields are required')
        setLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      const response = await axios.post(
        `${API_URL}/api/auth/reset-password`,
        { token, newPassword, confirmPassword }
      )

      if (response.data.success) {
        setMessage('✅ ' + response.data.message)
        setFormData({ newPassword: '', confirmPassword: '' })
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setError('❌ ' + response.data.message)
      }
    } catch (err) {
      setError('❌ Error resetting password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return <div style={styles.loadingContainer}>Verifying reset link...</div>
  }

  if (!tokenValid) {
    return (
      <div style={styles.invalidContainer}>
        <div style={styles.invalidCard}>
          <h1 style={styles.invalidTitle}>Invalid Reset Link</h1>
          <p style={styles.invalidError}>{error}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            style={styles.button}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>
          Account: <span style={styles.subtitleBold}>{userEmail}</span>
        </p>
        <p style={styles.description}>Enter your new password below.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              onFocus={() => setInputFocus({ ...inputFocus, newPassword: true })}
              onBlur={() => setInputFocus({ ...inputFocus, newPassword: false })}
              placeholder="Enter new password"
              style={{
                ...styles.input,
                ...(inputFocus.newPassword ? styles.inputFocus : {}),
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setInputFocus({ ...inputFocus, confirmPassword: true })}
              onBlur={() => setInputFocus({ ...inputFocus, confirmPassword: false })}
              placeholder="Confirm password"
              style={{
                ...styles.input,
                ...(inputFocus.confirmPassword ? styles.inputFocus : {}),
              }}
            />
          </div>

          {message && <div style={styles.messageSuccess}>{message}</div>}
          {error && <div style={styles.messageError}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
              ...(buttonHover && !loading ? styles.buttonHover : {}),
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div style={styles.footer}>
          <button
            onClick={() => navigate('/login')}
            style={styles.footerLink}
            onMouseEnter={(e) => e.target.style.color = '#93c5fd'}
            onMouseLeave={(e) => e.target.style.color = '#60a5fa'}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword