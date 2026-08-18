import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const Navbar = () => {
  const { token, user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      {/* logo */}
      <div style={styles.logo} onClick={() => navigate(token ? '/dashboard' : '/')}>
        <span style={styles.logoIcon}>📊</span>
        <span style={styles.logoText}>Jifin Charts</span>
      </div>

      {/* links — only when logged in */}
      {token && (
        <div style={styles.links}>
          <button
            style={{
              ...styles.link,
              color: isActive('/dashboard') ? '#095DE9' : '#555',
              borderBottom: isActive('/dashboard') ? '2px solid #095DE9' : '2px solid transparent',
            }}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button
            style={{
              ...styles.link,
              color: isActive('/datasets') ? '#095DE9' : '#555',
              borderBottom: isActive('/datasets') ? '2px solid #095DE9' : '2px solid transparent',
            }}
            onClick={() => navigate('/datasets')}
          >
            New Chart
          </button>
        </div>
      )}

      {/* right side */}
      <div style={styles.right}>
        {token ? (
          <div style={styles.profileWrap}>
            <div
              style={styles.profileChip}
              onClick={() => setShowMenu(prev => !prev)}
            >
              <div style={styles.avatar}>
                {user?.fullName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={styles.userName}>
                {user?.fullName?.split(' ')[0]}
              </span>
              <span style={{ fontSize: '12px', color: '#888' }}>▾</span>
            </div>

            {/* dropdown */}
            {showMenu && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <p style={styles.dropdownName}>{user?.fullName}</p>
                  <p style={styles.dropdownEmail}>{user?.email}</p>
                </div>
                <div
                  style={styles.dropdownItem}
                  onClick={() => { navigate('/dashboard'); setShowMenu(false) }}
                >
                  📊 Dashboard
                </div>
                <div
                  style={styles.dropdownItem}
                  onClick={() => { navigate('/datasets'); setShowMenu(false) }}
                >
                  ➕ New Chart
                </div>
                <div
                  style={{ ...styles.dropdownItem, ...styles.dropdownLogout }}
                  onClick={() => { logout(); setShowMenu(false); navigate('/login') }}
                >
                  🚪 Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.authBtns}>
            <button
              style={styles.loginBtn}
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
            <button
              style={styles.registerBtn}
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 40px',
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  logoIcon: { fontSize: '22px' },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#095DE9',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  link: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '6px 12px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  right: { position: 'relative' },
  profileWrap: { position: 'relative' },
  profileChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px 6px 6px',
    background: '#f0f5ff',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#095DE9',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#262626',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    width: '220px',
    background: 'white',
    border: '0.5px solid #e2e2e2',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    zIndex: 999,
  },
  dropdownHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  dropdownName: {
    fontWeight: '600',
    fontSize: '14px',
    margin: '0 0 2px',
  },
  dropdownEmail: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
  },
  dropdownItem: {
    padding: '12px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  dropdownLogout: {
    color: '#dc2626',
    borderTop: '1px solid #f0f0f0',
  },
  authBtns: {
    display: 'flex',
    gap: '10px',
  },
  loginBtn: {
    padding: '8px 18px',
    background: 'white',
    color: '#095DE9',
    border: '1px solid #095DE9',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  registerBtn: {
    padding: '8px 18px',
    background: '#095DE9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
  },
}

export default Navbar