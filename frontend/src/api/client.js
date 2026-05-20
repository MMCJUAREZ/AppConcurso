import axios from 'axios'

// Cliente HTTP único de la aplicación.
// Toda llamada al backend debe pasar por esta instancia para mantener una sola configuración.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

// Interceptor de request.
// Si existe token en localStorage, se agrega al header Authorization.
// Por ahora el login es demo, pero se deja preparado para cuando backend tenga autenticación real.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  return config
})

// Interceptor de response.
// Si backend responde 401, se limpia sesión local y se redirige al login.
// Esto evita que frontend se quede en una sesión inválida.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
