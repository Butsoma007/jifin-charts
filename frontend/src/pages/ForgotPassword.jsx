import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { forgotPasswordStyles as styles } from '../styles/forgotPasswordStyles'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [buttonHover, setButtonHover] = useState(false)
  const [inputFocus, setInputFocus] = useState(false)

  const API_URL = import.meta.env.VITE_API_URI

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      if (!email) {
        setError('Email is required')
        setLoading(false)
        return
      }

      const response = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        { email }
      )

      if (response.data.success) {
        setMessage('✅ ' + response.data.message)
        setEmail('')
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setError('❌ ' + response.data.message)
      }
    } catch (err) {
      setError('❌ Error sending reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot Password?</h1>
        <p style={styles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              placeholder="you@example.com"
              style={{
                ...styles.input,
                ...(inputFocus ? styles.inputFocus : {}),
              }}
            />
          </div>

          {message && (
            <div style={styles.messageSuccess}>{message}</div>
          )}

          {error && (
            <div style={styles.messageError}>{error}</div>
          )}

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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              style={styles.footerLink}
              onMouseEnter={(e) => e.target.style.color = styles.footerLinkHover.color}
              onMouseLeave={(e) => e.target.style.color = styles.footerLink.color}
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword