import api from '../api/client'

// Servicio central para operaciones de hallazgos.
// Este archivo evita que las páginas llamen a axios directamente.
// Si cambia la ruta base de la API, solo se ajusta api/client.js.
const findingService = {
  // Obtiene la lista paginada de hallazgos.
  // params permite enviar filtros como record_status, search, state o municipality.
  getAll: async (params = {}) => {
    const response = await api.get('/findings/', { params })
    return response.data
  },

  // Crea un nuevo registro de hallazgo.
  // El payload puede usar nombres actuales del frontend como record_status,
  // place_notes y conservation_state porque backend ya traduce esos alias.
  create: async (data) => {
    const response = await api.post('/findings/', data)
    return response.data
  },

  // Obtiene una ficha por ID.
  // Por ahora se usa ID numérico porque el ViewSet de Django resuelve por pk.
  getById: async (id) => {
    const response = await api.get(`/findings/${id}/`)
    return response.data
  },

  // Actualiza parcialmente una ficha.
  // PATCH permite enviar solo los campos modificados.
  update: async (id, data) => {
    const response = await api.patch(`/findings/${id}/`, data)
    return response.data
  },

  // Elimina una ficha.
  // Se deja centralizado aunque todavía no exista botón visible en la interfaz.
  remove: async (id) => {
    const response = await api.delete(`/findings/${id}/`)
    return response.data
  },

  // Obtiene catálogos desde backend.
  // Sirve para que el formulario use valores oficiales del backend.
  getCatalogs: async () => {
    const response = await api.get('/findings/catalogs/')
    return response.data
  },
}

export default findingService