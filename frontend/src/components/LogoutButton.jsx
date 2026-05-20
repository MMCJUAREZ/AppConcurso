import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function LogoutButton() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    // Cierra la sesión demo limpiando localStorage y el usuario guardado en contexto.
    // Por ahora la autenticación es local/demo, pero esta función queda lista para
    // reemplazarse después por logout real contra backend.
    logout()

    // replace evita que el usuario pueda volver con el botón "atrás" a una ruta protegida.
    navigate('/login', { replace: true })
  }

  return (
    <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
      <i className="ti ti-logout" style={{ fontSize: '14px' }} aria-hidden="true" />
      Cerrar sesión
    </button>
  )
}

const styles = {
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '7px 10px',
    border: '0.5px solid #e0deda',
    borderRadius: '8px',
    background: 'transparent',
    fontSize: '12px',
    color: '#8a3a3a',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },
}