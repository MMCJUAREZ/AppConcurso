import axios from 'axios';

// La URL base apunta al servicio definido en tu docker-compose
const API_URL = 'http://localhost:8000/api/findings/';

const findingService = {
  // 1. Obtener todos los hallazgos (para la Vista de Lista)
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // 2. Crear un nuevo registro (con todos los campos de tu modelo)
  create: async (data) => {
    // Aquí puedes agregar lógica de IA para limpiar el texto antes de enviar
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  // 3. Obtener un hallazgo por su ID o record_code
  getById: async (id) => {
    const response = await axios.get(`${API_URL}${id}/`);
    return response.data;
  }
};

export default findingService;
