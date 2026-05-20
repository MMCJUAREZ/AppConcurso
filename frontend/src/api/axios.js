import api from './client'

// Alias temporal para componentes heredados.
// Algunos componentes todavía importan "../api/axios".
// Se mantiene este archivo para no romper la compilación mientras se unifica todo hacia api/client.js.
export default api