import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import findingService from '../services/findingService'
import LogoutButton from '../components/LogoutButton'

// Valores especiales permitidos según la documentación
const ESTADO_LABELS = {
  draft: 'Borrador',
  active: 'Activo',
  in_review: 'En revisión',
  restricted: 'Restringido',
  closed: 'Cerrado',
  archived: 'Archivado',
}

const ESTADO_COLORS = {
  draft:       { bg: '#f0f0ee', text: '#666' },
  active:      { bg: '#eaf3de', text: '#3b6d11' },
  in_review:   { bg: '#faeeda', text: '#854f0b' },
  restricted:  { bg: '#faeeda', text: '#854f0b' },
  closed:      { bg: '#fce8e8', text: '#993535' },
  archived:    { bg: '#f0f0ee', text: '#666' },
}



function formatDate(dateStr) {
  if (!dateStr) return 'Fecha aproximada'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Badge({ estado }) {
  const label = ESTADO_LABELS[estado] || estado
  const color = ESTADO_COLORS[estado] || ESTADO_COLORS.draft
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: '500',
      background: color.bg,
      color: color.text,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

export default function FindingsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filtros
  const [filterEstado, setFilterEstado] = useState('all')
  const [search, setSearch] = useState('')

  const fetchFindings = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = {}

      // Filtro rápido por estado.
      // Backend espera record_status porque así lo dejamos compatible con el frontend.
      if (filterEstado !== 'all') {
        params.record_status = filterEstado
      }

      // Búsqueda textual general.
      if (search.trim()) {
        params.search = search.trim()
      }

      const data = await findingService.getAll(params)

      let results = data.results || data || []

      // Respaldo en frontend.
      // Si por alguna razón backend devuelve todos los registros, aquí se vuelve a filtrar.
      if (filterEstado !== 'all') {
        results = results.filter((item) => {
          const estado = item.status || item.record_status
          return estado === filterEstado
        })
      }

      setFindings(results)
    } catch (err) {
      setError('No se pudo cargar la lista de hallazgos.')
    } finally {
      setLoading(false)
    }
  }, [filterEstado, search])

  useEffect(() => {
    fetchFindings()
  }, [fetchFindings])

  const FILTER_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'draft', label: 'Borradores' },
    { value: 'in_review', label: 'En revisión' },
    { value: 'restricted', label: 'Restringidos' },
    { value: 'closed', label: 'Cerrados' },
    { value: 'archived', label: 'Archivados' },
  ]

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
          <NavItem
            icon="ti-list"
            label="Hallazgos"
            active
            onClick={() => navigate('/')}
          />

          <NavItem
            icon="ti-plus"
            label="Nuevo registro"
            onClick={() => navigate('/nuevo')}
          />

          {user?.canInvite && (
            <NavItem
              icon="ti-mail-plus"
              label="Invitaciones"
              onClick={() => navigate('/invitaciones')}
            />
          )}

          {/*
            Búsqueda avanzada y gestión de usuarias quedan pendientes.
            Se ocultan en la versión de presentación porque todavía no existen
            pantallas funcionales para /busqueda ni /usuarias.
          */}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={s.userInfo}>
            <div style={s.avatar}>{user?.name?.[0] || 'U'}</div>
            <div>
              <div style={s.userName}>{user?.name || 'Usuaria'}</div>
              <div style={s.userRole}>{user?.role || 'registrada'}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </nav>

      {/* Contenido principal */}
      <main style={s.main}>
        {/* Barra superior */}
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>Hallazgos registrados</h1>
            <p style={s.pageSubtitle}>
              {loading ? 'Cargando…' : `${findings.length} registro${findings.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => navigate('/nuevo')} style={s.btnNew}>
            + Nuevo registro
          </button>
        </div>

        {/* Filtros */}
        <div style={s.filterBar}>
          <div style={s.filterChips}>
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterEstado(opt.value)}
                style={{
                  ...s.chip,
                  ...(filterEstado === opt.value ? s.chipActive : {}),
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Buscar por ID, lugar o seña…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={s.searchInput}
            aria-label="Buscar hallazgos"
          />
        </div>

        {/* Tabla */}
        <div style={s.tableWrap}>
          {error && <p style={s.errorMsg}>{error}</p>}

          {loading ? (
            <div style={s.loadingMsg}>Cargando registros…</div>
          ) : findings.length === 0 ? (
            <div style={s.emptyMsg}>No se encontraron registros con los filtros actuales.</div>
          ) : (
            <table style={s.table} aria-label="Lista de hallazgos">
              <thead>
                <tr>
                  {['ID', 'Ubicación', 'Fecha', 'Tipo', 'Sexo est.', 'Edad est.', 'Señas destacadas', 'Estado', ''].map(col => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {findings.map((f) => (
                  <tr
                    key={f.id}
                    style={s.tr}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f8f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...s.td, ...s.idCell }}>{f.record_code || f.id}</td>
                    <td style={s.td}>{[f.state, f.municipality].filter(Boolean).join(', ') || '—'}</td>
                    <td style={{ ...s.td, whiteSpace: 'nowrap' }}>{formatDate(f.finding_date)}</td>
                    <td style={s.td}>{f.finding_type_display || f.finding_type || '—'}</td>
                    <td style={s.td}>{f.estimated_sex_display || f.estimated_sex || '—'}</td>
                    <td style={s.td}>{f.estimated_age || '—'}</td>
                    <td style={{ ...s.td, color: '#777', fontSize: '11px' }}>
                      {[f.tattoos, f.scars].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td style={s.td}><Badge estado={f.record_status} /></td>
                    <td style={s.td}>
                      <button
                        onClick={() => navigate(`/hallazgos/${f.id}`)}
                        style={s.btnVer}
                      >
                        Ver ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '7px 10px',
        border: 'none',
        borderRadius: '8px',
        background: active ? '#f0efeb' : 'transparent',
        color: active ? '#1a1a1a' : '#777',
        fontSize: '13px',
        fontFamily: 'system-ui, sans-serif',
        fontWeight: active ? '500' : '400',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: '16px' }} aria-hidden="true" />
      {label}
    </button>
  )
}

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f5f4f1',
    fontFamily: 'system-ui, sans-serif',
  },
  sidebar: {
    width: '210px',
    flexShrink: 0,
    background: '#fff',
    borderRight: '0.5px solid #e0deda',
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '1rem',
    marginBottom: '0.5rem',
    borderBottom: '0.5px solid #e8e6e0',
  },
  logoMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    background: '#1a1a1a',
    color: '#f5f4f1',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0,
  },
  logoText: { fontSize: '13px', fontWeight: '500', color: '#1a1a1a' },
  logoSub: { fontSize: '10px', color: '#aaa', marginTop: '1px' },
  navSection: { display: 'flex', flexDirection: 'column', gap: '2px' },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 6px',
    borderTop: '0.5px solid #e8e6e0',
    marginBottom: '6px',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#e8e6e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '500',
    color: '#555',
    flexShrink: 0,
    textTransform: 'uppercase',
  },
  userName: { fontSize: '12px', fontWeight: '500', color: '#1a1a1a' },
  userRole: { fontSize: '10px', color: '#aaa', textTransform: 'capitalize' },
  logoutBtn: {
    width: '100%',
    padding: '7px',
    background: 'transparent',
    border: '0.5px solid #e0deda',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#888',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topbar: {
    background: '#fff',
    borderBottom: '0.5px solid #e0deda',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1a1a1a',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  pageSubtitle: {
    fontSize: '11px',
    color: '#aaa',
    margin: '2px 0 0',
  },
  btnNew: {
    padding: '7px 14px',
    background: '#1a1a1a',
    color: '#f5f4f1',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'system-ui, sans-serif',
    fontWeight: '500',
    cursor: 'pointer',
  },
  filterBar: {
    background: '#fff',
    borderBottom: '0.5px solid #e0deda',
    padding: '0.6rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterChips: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  chip: {
    padding: '4px 12px',
    border: '0.5px solid #dddbd5',
    borderRadius: '20px',
    background: 'transparent',
    fontSize: '11px',
    color: '#666',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },
  chipActive: {
    background: '#1a1a1a',
    borderColor: '#1a1a1a',
    color: '#f5f4f1',
  },
  searchInput: {
    marginLeft: 'auto',
    padding: '5px 12px',
    border: '0.5px solid #dddbd5',
    borderRadius: '8px',
    fontSize: '12px',
    fontFamily: 'system-ui, sans-serif',
    color: '#1a1a1a',
    background: '#fafafa',
    outline: 'none',
    width: '220px',
  },
  tableWrap: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.25rem 1.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '0.5px solid #e0deda',
  },
  th: {
    padding: '9px 12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '500',
    color: '#aaa',
    borderBottom: '0.5px solid #e8e6e0',
    whiteSpace: 'nowrap',
    background: '#faf9f7',
  },
  tr: {
    transition: 'background 0.1s',
  },
  td: {
    padding: '10px 12px',
    fontSize: '12px',
    color: '#1a1a1a',
    borderBottom: '0.5px solid #f0efeb',
    verticalAlign: 'middle',
  },
  idCell: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#aaa',
    whiteSpace: 'nowrap',
  },
  btnVer: {
    padding: '4px 10px',
    border: '0.5px solid #dddbd5',
    borderRadius: '6px',
    background: 'transparent',
    fontSize: '11px',
    color: '#555',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
  },
  loadingMsg: {
    textAlign: 'center',
    padding: '3rem',
    color: '#aaa',
    fontSize: '13px',
  },
  emptyMsg: {
    textAlign: 'center',
    padding: '3rem',
    color: '#aaa',
    fontSize: '13px',
  },
  errorMsg: {
    background: '#fdf0f0',
    border: '0.5px solid #e8c4c4',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#b84040',
    fontSize: '13px',
    marginBottom: '1rem',
  },
}
