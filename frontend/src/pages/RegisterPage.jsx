import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../context/AppContext'

const RegisterPage = () => {
  const { setToken, setUser, API_URL } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })
      if (data.success) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('jifin_token', data.token)
        navigate('/dashboard')
      } else {
        setError(data.message)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* header */}
        <div style={styles.header}>
          <h1 style={styles.logo}>Jifin Charts</h1>
          <p style={styles.subtitle}>Create your account</p>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.group}>
            <label style={styles.label}>Full Name</label>
            <input
              type='text'
              name='fullName'
              value={form.fullName}
              onChange={handleChange}
              placeholder='Your full name'
              style={styles.input}
              required
            />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Email Address</label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder='your@email.com'
              style={styles.input}
              required
            />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input
              type='password'
              name='password'
              value={form.password}
              onChange={handleChange}
              placeholder='Minimum 6 characters'
              style={styles.input}
              required
            />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type='password'
              name='confirmPassword'
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder='Repeat your password'
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* footer */}
        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to='/login' style={styles.link}>Sign in here</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f5ff 0%, #e8f0fe 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(9,93,233,0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#095DE9',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#444',
  },
  input: {
    padding: '11px 14px',
    border: '1px solid #e2e2e2',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  btn: {
    padding: '13px',
    background: '#095DE9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
  error: {
    fontSize: '13px',
    color: '#dc2626',
    background: '#fee2e2',
    padding: '10px 14px',
    borderRadius: '8px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#095DE9',
    fontWeight: '500',
  },
}

export default RegisterPage