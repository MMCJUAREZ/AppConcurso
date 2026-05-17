import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || 'Correo o contraseña incorrectos.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Encabezado */}
        <div style={styles.header}>
          <div style={styles.logoMark} aria-hidden="true">RD</div>
          <h1 style={styles.title}>Registro Digno</h1>
          <p style={styles.subtitle}>Sistema privado de acceso restringido</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="tu@correo.com"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" style={styles.error}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p style={styles.note}>
          El acceso a este sistema es únicamente por invitación.
          Si no tienes cuenta, contacta a una administradora.
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
    background: '#f5f4f1',
    fontFamily: "'Georgia', serif",
    padding: '1rem',
  },
  card: {
    background: '#ffffff',
    border: '0.5px solid #dddbd5',
    borderRadius: '12px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '380px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    background: '#1a1a1a',
    color: '#f5f4f1',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '20px',
    fontWeight: '400',
    color: '#1a1a1a',
    margin: '0 0 6px',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
    fontFamily: "'system-ui', sans-serif",
    letterSpacing: '0.02em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#555',
    fontFamily: "'system-ui', sans-serif",
    letterSpacing: '0.01em',
  },
  input: {
    padding: '9px 12px',
    border: '0.5px solid #ccc',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'system-ui', sans-serif",
    color: '#1a1a1a',
    background: '#fafafa',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  error: {
    fontSize: '12px',
    color: '#b84040',
    background: '#fdf0f0',
    border: '0.5px solid #e8c4c4',
    borderRadius: '6px',
    padding: '8px 10px',
    fontFamily: "'system-ui', sans-serif",
    margin: 0,
  },
  button: {
    padding: '10px',
    background: '#1a1a1a',
    color: '#f5f4f1',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'system-ui', sans-serif",
    fontWeight: '500',
    marginTop: '4px',
    transition: 'background 0.15s',
  },
  note: {
    marginTop: '1.5rem',
    fontSize: '11px',
    color: '#aaa',
    textAlign: 'center',
    lineHeight: '1.6',
    fontFamily: "'system-ui', sans-serif",
    borderTop: '0.5px solid #eee',
    paddingTop: '1rem',
  },
}
