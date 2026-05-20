import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

const DEMO_EMAIL = 'admin@registrodigno.local'
const DEMO_PASSWORD = 'Demo12345'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // Credenciales precargadas para presentación.
  // Esto evita perder tiempo escribiendo usuario y contraseña frente al público.
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)

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
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError('')
    setLoading(true)

    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD)
      navigate('/')
    } catch (err) {
      setError('No se pudo iniciar sesión con la cuenta demo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <header style={styles.header}>
          <div style={styles.logoMark}>RD</div>

          <h1 style={styles.title}>Registro Digno</h1>

          <p style={styles.subtitle}>
            Sistema privado de acceso restringido
          </p>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@registrodigno.local"
              autoComplete="username"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleDemoLogin}
            style={styles.demoButton}
          >
            Entrar con cuenta demo
          </button>
        </form>

        <p style={styles.demoBox}>
          Usuario demo: <strong>{DEMO_EMAIL}</strong>
          <br />
          Contraseña: <strong>{DEMO_PASSWORD}</strong>
        </p>

        <p style={styles.note}>
          El acceso actual es de demostración. La autenticación formal con
          backend queda pendiente para una siguiente etapa.
        </p>
      </section>
    </main>
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
    cursor: 'pointer',
  },

  demoButton: {
    padding: '9px',
    background: 'transparent',
    color: '#1a1a1a',
    border: '0.5px solid #1a1a1a',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: "'system-ui', sans-serif",
    fontWeight: '500',
    cursor: 'pointer',
  },

  demoBox: {
    marginTop: '1rem',
    padding: '10px',
    background: '#faf9f7',
    border: '0.5px solid #e8e6e0',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#666',
    lineHeight: '1.6',
    fontFamily: "'system-ui', sans-serif",
    textAlign: 'center',
  },

  note: {
    marginTop: '1rem',
    fontSize: '11px',
    color: '#aaa',
    textAlign: 'center',
    lineHeight: '1.6',
    fontFamily: "'system-ui', sans-serif",
    borderTop: '0.5px solid #eee',
    paddingTop: '1rem',
  },
}