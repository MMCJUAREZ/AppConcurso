import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

function formatDate(dateStr) {
  if (!dateStr) return 'Fecha aproximada'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Badge({ estado }) {
  const mapa = {
    draft: { label: 'Borrador', bg: '#f0f0ee', text: '#666' },
    active: { label: 'Activo', bg: '#eaf3de', text: '#3b6d11' },
    in_review: { label: 'En revisión', bg: '#faeeda', text: '#854f0b' },
    restricted: { label: 'Restringido', bg: '#faeeda', text: '#854f0b' },
    closed: { label: 'Cerrado', bg: '#fce8e8', text: '#993535' },
    archived: { label: 'Archivado', bg: '#f0f0ee', text: '#666' },
  }
  const c = mapa[estado] || { label: estado, bg: '#f0f0ee', text: '#666' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '10px',
      fontSize: '11px', fontWeight: '500', background: c.bg, color: c.text,
    }}>{c.label}</span>
  )
}

function FiltroSelect({ label, name, value, onChange, options }) {
  return (
    <div style={s.filtroField}>
      <label style={s.filtroLabel}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={s.filtroInput}>
        <option value="">Todos</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function FiltroInput({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={s.filtroField}>
      <label style={s.filtroLabel}>{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} style={s.filtroInput}
      />
    </div>
  )
}

const FINDING_TYPE = [
  { value: 'body', label: 'Cuerpo' },
  { value: 'bone_remains', label: 'Restos óseos' },
  { value: 'human_fragment', label: 'Fragmento humano' },
  { value: 'other', label: 'Otro' },
  { value: 'unknown', label: 'Desconocido' },
]

const ESTIMATED_SEX = [
  { value: 'woman', label: 'Mujer' },
  { value: 'man', label: 'Hombre' },
  { value: 'undetermined', label: 'Indeterminado' },
  { value: 'unknown', label: 'Desconocido' },
]

const RECORD_STATUS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'restricted', label: 'Restringido' },
  { value: 'closed', label: 'Cerrado' },
]

const CONFIDENCE_LEVEL = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'probable', label: 'Probable' },
  { value: 'unconfirmed', label: 'No confirmado' },
]

const FILTROS_INIT = {
  // Texto libre
  search: '',
  // Ubicación
  state: '',
  municipality: '',
  // Fecha
  finding_date_after: '',
  finding_date_before: '',
  // Condición
  finding_type: '',
  estimated_sex: '',
  // Estado
  record_status: '',
  confidence_level: '',
  // Señas
  tattoos: '',
  scars: '',
}

export default function SearchPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [filtros, setFiltros] = useState(FILTROS_INIT)
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [buscado, setBuscado] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleBuscar = useCallback(async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    setBuscado(true)
    try {
      // Limpia parámetros vacíos
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== '')
      )
      const { data } = await api.get('/findings/', { params })
      setResultados(data.results || [])
    } catch (err) {
      setError('No se pudo realizar la búsqueda.')
    } finally {
      setLoading(false)
    }
  }, [filtros])

  const handleLimpiar = () => {
    setFiltros(FILTROS_INIT)
    setResultados([])
    setBuscado(false)
    setError('')
  }

  const filtrosActivos = Object.values(filtros).filter(v => v !== '').length

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <nav style={s.sidebar} aria-label="Navegación principal">
        <div style={s.logo}>
          <span style={s.logoMark}>RD</span>
          <div>
            <div style={s.logoText}>Registro Digno</div>
            <div style={s.logoSub}>Sistema privado</div>
          </div>
        </div>
        <div style={s.navSection}>
          <NavItem icon="ti-list" label="Hallazgos" onClick={() => navigate('/')} />
          <NavItem icon="ti-search" label="Búsqueda avanzada" active onClick={() => navigate('/busqueda')} />
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={s.userInfo}>
            <div style={s.avatar}>{user?.name?.[0] || 'U'}</div>
            <div>
              <div style={s.userName}>{user?.name || 'Usuaria'}</div>
              <div style={s.userRole}>{user?.role || 'registrada'}</div>
            </div>
          </div>
          <button onClick={logout} style={s.logoutBtn}>Cerrar sesión</button>
        </div>
      </nav>

      {/* Contenido */}
      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>Búsqueda avanzada</h1>
            <p style={s.pageSubtitle}>Filtra registros por ubicación, fecha, características físicas y más</p>
          </div>
        </div>

        <div style={s.contenido}>
          {/* Panel de filtros */}
          <form onSubmit={handleBuscar} style={s.filtrosPanel}>
            <div style={s.filtrosPanelHeader}>
              <span style={s.filtrosPanelTitulo}>Filtros</span>
              {filtrosActivos > 0 && (
                <span style={s.filtrosBadge}>{filtrosActivos} activo{filtrosActivos !== 1 ? 's' : ''}</span>
              )}
            </div>

            {/* Búsqueda de texto */}
            <div style={s.filtroGrupo}>
              <div style={s.filtroGrupoTitulo}>Búsqueda general</div>
              <FiltroInput
                label="Texto libre"
                name="search"
                value={filtros.search}
                onChange={handleChange}
                placeholder="ID, tatuaje, cicatriz…"
              />
            </div>

            {/* Ubicación */}
            <div style={s.filtroGrupo}>
              <div style={s.filtroGrupoTitulo}>Ubicación</div>
              <FiltroInput
                label="Estado"
                name="state"
                value={filtros.state}
                onChange={handleChange}
                placeholder="Ej: Jalisco"
              />
              <FiltroInput
                label="Municipio"
                name="municipality"
                value={filtros.municipality}
                onChange={handleChange}
                placeholder="Ej: Zapopan"
              />
            </div>

            {/* Fecha */}
            <div style={s.filtroGrupo}>
              <div style={s.filtroGrupoTitulo}>Fecha del hallazgo</div>
              <FiltroInput
                label="Desde"
                name="finding_date_after"
                value={filtros.finding_date_after}
                onChange={handleChange}
                type="date"
              />
              <FiltroInput
                label="Hasta"
                name="finding_date_before"
                value={filtros.finding_date_before}
                onChange={handleChange}
                type="date"
              />
            </div>

            {/* Condición */}
            <div style={s.filtroGrupo}>
              <div style={s.filtroGrupoTitulo}>Características</div>
              <FiltroSelect
                label="Tipo de hallazgo"
                name="finding_type"
                value={filtros.finding_type}
                onChange={handleChange}
                options={FINDING_TYPE}
              />
              <FiltroSelect
                label="Sexo estimado"
                name="estimated_sex"
                value={filtros.estimated_sex}
                onChange={handleChange}
                options={ESTIMATED_SEX}
              />
            </div>

            {/* Señas */}
            <div style={s.filtroGrupo}>
              <div style={s.filtroGrupoTitulo}>Señas particulares</div>
              <FiltroInput
                label="Tatuajes"
                name="tattoos"
                value={filtros.tattoos}
                onChange={handleChange}
                placeholder="Descripción…"
              />
              <FiltroInput
                label="Cicatrices"
                name="scars"
                value={filtros.scars}
                onChange={handleChange}
                placeholder="Descripción…"
              />
            </div>

            {/* Estado del registro */}
            <div style={s.filtroGrupo}>
              <div style={s.filtroGrupoTitulo}>Estado del registro</div>
              <FiltroSelect
                label="Estado"
                name="record_status"
                value={filtros.record_status}
                onChange={handleChange}
                options={RECORD_STATUS}
              />
              <FiltroSelect
                label="Nivel de confianza"
                name="confidence_level"
                value={filtros.confidence_level}
                onChange={handleChange}
                options={CONFIDENCE_LEVEL}
              />
            </div>

            {/* Botones */}
            <div style={s.filtrosBotones}>
              <button type="button" onClick={handleLimpiar} style={s.btnLimpiar}>
                Limpiar
              </button>
              <button type="submit" style={s.btnBuscar} disabled={loading}>
                {loading ? 'Buscando…' : 'Buscar'}
              </button>
            </div>
          </form>

          {/* Resultados */}
          <div style={s.resultados}>
            {!buscado && (
              <div style={s.estadoMsg}>
                <i className="ti ti-search" style={{ fontSize: '32px', color: '#ddd', marginBottom: '10px', display: 'block' }} />
                Aplica filtros y presiona Buscar para ver resultados.
              </div>
            )}

            {buscado && loading && (
              <div style={s.estadoMsg}>Buscando registros…</div>
            )}

            {buscado && !loading && error && (
              <div style={{ ...s.estadoMsg, color: '#b84040' }}>{error}</div>
            )}

            {buscado && !loading && !error && resultados.length === 0 && (
              <div style={s.estadoMsg}>No se encontraron registros con los filtros aplicados.</div>
            )}

            {buscado && !loading && !error && resultados.length > 0 && (
              <>
                <div style={s.resultadosHeader}>
                  {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
                </div>
                <table style={s.table} aria-label="Resultados de búsqueda">
                  <thead>
                    <tr>
                      {['ID', 'Ubicación', 'Fecha', 'Tipo', 'Sexo est.', 'Señas', 'Estado', ''].map(col => (
                        <th key={col} style={s.th}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map(f => (
                      <tr
                        key={f.id}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9f8f6'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '11px', color: '#aaa' }}>
                          {f.record_code || f.id}
                        </td>
                        <td style={s.td}>{[f.state, f.municipality].filter(Boolean).join(', ') || '—'}</td>
                        <td style={{ ...s.td, whiteSpace: 'nowrap' }}>{formatDate(f.finding_date)}</td>
                        <td style={s.td}>{f.finding_type_display || f.finding_type || '—'}</td>
                        <td style={s.td}>{f.estimated_sex_display || f.estimated_sex || '—'}</td>
                        <td style={{ ...s.td, fontSize: '11px', color: '#777' }}>
                          {[f.tattoos, f.scars].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td style={s.td}><Badge estado={f.record_status} /></td>
                        <td style={s.td}>
                          <button onClick={() => navigate(`/hallazgos/${f.id}`)} style={s.btnVer}>
                            Ver ficha
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
      padding: '7px 10px', border: 'none', borderRadius: '8px',
      background: active ? '#f0efeb' : 'transparent',
      color: active ? '#1a1a1a' : '#777', fontSize: '13px',
      fontFamily: 'system-ui, sans-serif', fontWeight: active ? '500' : '400',
      cursor: 'pointer', textAlign: 'left',
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: '16px' }} aria-hidden="true" />
      {label}
    </button>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#f5f4f1', fontFamily: 'system-ui, sans-serif' },
  sidebar: {
    width: '210px', flexShrink: 0, background: '#fff', borderRight: '0.5px solid #e0deda',
    padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '4px',
    position: 'sticky', top: 0, height: '100vh',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '1rem', marginBottom: '0.5rem', borderBottom: '0.5px solid #e8e6e0' },
  logoMark: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', background: '#1a1a1a', color: '#f5f4f1', borderRadius: '8px', fontSize: '12px', fontWeight: '600', flexShrink: 0 },
  logoText: { fontSize: '13px', fontWeight: '500', color: '#1a1a1a' },
  logoSub: { fontSize: '10px', color: '#aaa', marginTop: '1px' },
  navSection: { display: 'flex', flexDirection: 'column', gap: '2px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 6px', borderTop: '0.5px solid #e8e6e0', marginBottom: '6px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: '#e8e6e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500', color: '#555', flexShrink: 0, textTransform: 'uppercase' },
  userName: { fontSize: '12px', fontWeight: '500', color: '#1a1a1a' },
  userRole: { fontSize: '10px', color: '#aaa', textTransform: 'capitalize' },
  logoutBtn: { width: '100%', padding: '7px', background: 'transparent', border: '0.5px solid #e0deda', borderRadius: '8px', fontSize: '12px', color: '#888', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: { background: '#fff', borderBottom: '0.5px solid #e0deda', padding: '1rem 1.5rem' },
  pageTitle: { fontSize: '16px', fontWeight: '500', color: '#1a1a1a', margin: 0, fontFamily: 'Georgia, serif' },
  pageSubtitle: { fontSize: '11px', color: '#aaa', margin: '2px 0 0' },
  contenido: { flex: 1, display: 'flex', gap: '0', overflow: 'hidden' },
  filtrosPanel: {
    width: '240px', flexShrink: 0, background: '#fff', borderRight: '0.5px solid #e0deda',
    padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0',
  },
  filtrosPanelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  filtrosPanelTitulo: { fontSize: '13px', fontWeight: '500', color: '#1a1a1a' },
  filtrosBadge: { fontSize: '10px', background: '#1a1a1a', color: '#f5f4f1', padding: '2px 7px', borderRadius: '10px' },
  filtroGrupo: { marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '0.5px solid #f0efeb' },
  filtroGrupoTitulo: { fontSize: '10px', fontWeight: '600', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' },
  filtroField: { display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px' },
  filtroLabel: { fontSize: '11px', color: '#888' },
  filtroInput: { padding: '5px 8px', border: '0.5px solid #dddbd5', borderRadius: '6px', fontSize: '12px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a', background: '#fafafa', outline: 'none', width: '100%', boxSizing: 'border-box' },
  filtrosBotones: { display: 'flex', gap: '6px', marginTop: '4px' },
  btnLimpiar: { flex: 1, padding: '7px', border: '0.5px solid #dddbd5', borderRadius: '7px', background: 'transparent', fontSize: '12px', color: '#888', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' },
  btnBuscar: { flex: 2, padding: '7px', border: 'none', borderRadius: '7px', background: '#1a1a1a', color: '#f5f4f1', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' },
  resultados: { flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' },
  resultadosHeader: { fontSize: '12px', color: '#aaa', marginBottom: '0.75rem' },
  estadoMsg: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', fontSize: '13px', color: '#bbb', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '0.5px solid #e0deda' },
  th: { padding: '9px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#aaa', borderBottom: '0.5px solid #e8e6e0', whiteSpace: 'nowrap', background: '#faf9f7' },
  td: { padding: '10px 12px', fontSize: '12px', color: '#1a1a1a', borderBottom: '0.5px solid #f0efeb', verticalAlign: 'middle' },
  btnVer: { padding: '4px 10px', border: '0.5px solid #dddbd5', borderRadius: '6px', background: 'transparent', fontSize: '11px', color: '#555', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', whiteSpace: 'nowrap' },
}
