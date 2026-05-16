import { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState({ loading: true, data: null, error: null });
  const [dbStatus, setDbStatus] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    fetch('http://localhost:8000/api/health/')
      .then(res => res.json())
      .then(data => setHealth({ loading: false, data, error: null }))
      .catch(err => setHealth({ loading: false, data: null, error: err.message }));

    fetch('http://localhost:8000/api/db/')
      .then(res => res.json())
      .then(data => setDbStatus({ loading: false, data, error: null }))
      .catch(err => setDbStatus({ loading: false, data: null, error: err.message }));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Panel de Verificación de Contenedores</h1>
      <hr />

      <section>
        <h2>1. Estado del Backend (Health)</h2>
        {health.loading && <p>Cargando...</p>}
        {health.error && <p style={{ color: 'red' }}>Error: {health.error}</p>}
        {health.data && (
          <blockquote style={{ background: '#f0f0f0', padding: '10px' }}>
            <strong>Status:</strong> {health.data.status} <br />
            <strong>Mensaje:</strong> {health.data.message}
          </blockquote>
        )}
      </section>

      <section>
        <h2>2. Estado de la Base de Datos (MySQL)</h2>
        {dbStatus.loading && <p>Cargando...</p>}
        {dbStatus.error && <p style={{ color: 'red' }}>Error: {dbStatus.error}</p>}
        {dbStatus.data && (
          <blockquote style={{ background: dbStatus.data.status === 'OK' ? '#e6f4ea' : '#fce8e6', padding: '10px' }}>
            <strong>Status:</strong> {dbStatus.data.status} <br />
            <strong>Respuesta BD:</strong> {dbStatus.data.db_message || dbStatus.data.error}
          </blockquote>
        )}
      </section>
    </div>
  );
}

export default App;