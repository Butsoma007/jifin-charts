export const loginForgotButtonStyles = {
  // Container for the forgot password link
  container: {
    marginTop: '16px',
    textAlign: 'center',
  },

  // The button/link style
  button: {
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },

  // Hover state
  buttonHover: {
    color: '#93c5fd',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    transform: 'translateX(2px)',
  },

  // Active/Click state
  buttonActive: {
    color: '#1d4ed8',
    transform: 'translateX(0)',
  },

  // Focus state (accessibility)
  buttonFocus: {
    outline: '2px solid #60a5fa',
    outlineOffset: '2px',
  },

  // With icon variant
  buttonWithIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },

  // Icon style
  icon: {
    fontSize: '16px',
  },
}