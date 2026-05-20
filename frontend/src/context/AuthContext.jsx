import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Usuario demo para presentación.
// Este login NO representa seguridad real.
// Sirve para simular cómo se vería una usuaria ya aprobada dentro del sistema.
const USUARIOS_DEMO = [
  {
    email: 'admin@registrodigno.local',
    username: 'admin',
    password: 'Demo12345',
    name: 'Administradora Demo',

    // Rol demo visible en la interfaz.
    // En una versión real, este dato vendría del backend.
    role: 'admin',
    roleLabel: 'Administradora',

    // Estado de membresía demo.
    // Representa a una usuaria cuya invitación ya fue aceptada y aprobada.
    membershipStatus: 'approved',
    membershipStatusLabel: 'Miembro activa aprobada',

    // Permisos demo.
    // Esto solo controla qué mostramos en el frontend durante la presentación.
    canInvite: true,
    canCreateRecords: true,
    canViewRecords: true,
    canSearchRecords: true,
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('user') || 'null')
  )

  const login = async (emailOrUsername, password) => {
    // Busca el usuario demo por correo o nombre de usuario.
    const encontrado = USUARIOS_DEMO.find(
      (u) =>
        (u.email === emailOrUsername || u.username === emailOrUsername) &&
        u.password === password
    )

    if (!encontrado) {
      // Simula una pequeña espera para que el flujo se parezca a un login real.
      await new Promise((resolve) => setTimeout(resolve, 400))
      throw new Error('Credenciales incorrectas')
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    const userData = {
      email: encontrado.email,
      username: encontrado.username,
      name: encontrado.name,
      role: encontrado.role,
      roleLabel: encontrado.roleLabel,
      membershipStatus: encontrado.membershipStatus,
      membershipStatusLabel: encontrado.membershipStatusLabel,
      canInvite: encontrado.canInvite,
      canCreateRecords: encontrado.canCreateRecords,
      canViewRecords: encontrado.canViewRecords,
      canSearchRecords: encontrado.canSearchRecords,
      isDemoUser: true,
    }

    // Token ficticio para conservar la forma de una sesión.
    // El backend todavía no valida este token.
    localStorage.setItem('token', 'demo-token-' + Date.now())
    localStorage.setItem('user', JSON.stringify(userData))

    setUser(userData)
  }

  const logout = () => {
    // Limpia la sesión demo local.
    // Cuando exista autenticación real, aquí también se llamará al backend.
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)