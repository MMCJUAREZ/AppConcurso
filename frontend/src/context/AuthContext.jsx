import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Usuarios válidos para la demo
// Agrega aquí los usuarios que necesites para el hackathon
const USUARIOS_DEMO = [
  {
    username: 'cris',
    password: '123456',
    name: 'Cristian',
    role: 'admin',
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem('user') || 'null')
  )

  const login = async (email, password) => {
    // Busca el usuario en la lista de demo
    const encontrado = USUARIOS_DEMO.find(
      u => (u.username === email || u.email === email) && u.password === password
    )

    if (!encontrado) {
      // Simula latencia de red para que se vea real
      await new Promise(r => setTimeout(r, 400))
      throw new Error('Credenciales incorrectas')
    }

    await new Promise(r => setTimeout(r, 300))

    const userData = { name: encontrado.name, role: encontrado.role }
    localStorage.setItem('token', 'demo-token-' + Date.now())
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
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
