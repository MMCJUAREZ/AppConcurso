import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LogoutButton from '../components/LogoutButton'

import findingService from '../services/findingService'

function formatDate(dateStr) {
  if (!dateStr) return 'Fecha aproximada'

  const d = new Date(dateStr + 'T00:00:00')

  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'

  const d = new Date(dateStr)

  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const ESTADO_LABELS = {
  draft: 'Borrador',
  active: 'Activo',
  in_review: 'En revisión',
  restricted: 'Restringido',
  closed: 'Cerrado',
  archived: 'Archivado',
}

const ESTADO_COLORS = {
  draft: { bg: '#f0f0ee', text: '#666' },
  active: { bg: '#eaf3de', text: '#3b6d11' },
  in_review: { bg: '#faeeda', text: '#854f0b' },
  restricted: { bg: '#faeeda', text: '#854f0b' },
  closed: { bg: '#fce8e8', text: '#993535' },
  archived: { bg: '#f0f0ee', text: '#666' },
}

function Badge({ valor, mapa, colores }) {
  const label = mapa?.[valor] || valor || '—'
  const color = colores?.[valor] || { bg: '#f0f0ee', text: '#666' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: '999px',
        background: color.bg,
        color: color.text,
        fontSize: '11px',
        fontWeight: '500',
      }}
    >
      {label}
    </span>
  )
}

function Campo({ label, valor }) {
  const vacio = valor === null || valor === undefined || valor === ''

  return (
    <div style={s.campo}>
      <span style={s.campoLabel}>{label}</span>
      <span style={s.campoValor}>{vacio ? '—' : valor}</span>
    </div>
  )
}

function Nota({ label, valor }) {
  const vacio = valor === null || valor === undefined || valor === ''

  if (vacio) return null

  return (
    <div style={s.nota}>
      <span style={s.notaLabel}>{label}</span>
      <p style={s.notaTexto}>{valor}</p>
    </div>
  )
}

function Seccion({ titulo, children }) {
  const [abierto, setAbierto] = useState(true)

  return (
    <section style={s.seccion}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        style={s.seccionHeader}
        aria-expanded={abierto}
      >
        <span style={s.seccionTitulo}>{titulo}</span>

        <i
          className={`ti ${abierto ? 'ti-chevron-up' : 'ti-chevron-down'}`}
          style={{ fontSize: '14px', color: '#aaa' }}
          aria-hidden="true"
        />
      </button>

      {abierto && <div style={s.seccionBody}>{children}</div>}
    </section>
  )
}

function Grilla({ children }) {
  return <div style={s.grilla}>{children}</div>
}

export default function FindingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [finding, setFinding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFinding = async () => {
      setLoading(true)
      setError('')

      try {
        // Usa el servicio centralizado para mantener todas las llamadas a API en un solo lugar.
        const data = await findingService.getById(id)
        setFinding(data)
      } catch (err) {
        setError('No se pudo cargar la ficha. Verifica que el registro existe.')
      } finally {
        setLoading(false)
      }
    }

    fetchFinding()
  }, [id])

  if (loading) {
    return <div style={s.estado}>Cargando ficha…</div>
  }

  if (error) {
    return <div style={s.estadoError}>{error}</div>
  }

  if (!finding) {
    return null
  }

  const f = finding

  return (
    <div style={s.page}>
      {/* Sidebar mínimo */}
      <nav style={s.sidebar} aria-label="Navegación">
        <div style={s.logo}>
          <span style={s.logoMark}>RD</span>

          <div>
            <div style={s.logoText}>Registro Digno</div>
            <div style={s.logoSub}>Sistema privado</div>
          </div>
        </div>

        <button type="button" onClick={() => navigate('/')} style={s.backBtn}>
          <i className="ti ti-arrow-left" style={{ fontSize: '14px' }} aria-hidden="true" />
          Volver a lista
        </button>
        <button type="button" onClick={() => navigate('/invitaciones')} style={s.backBtn}>
          <i className="ti ti-mail-plus" style={{ fontSize: '14px' }} aria-hidden="true" />
          Invitaciones
        </button>
        <LogoutButton />
      </nav>

      {/* Contenido */}
      <main style={s.main}>
        {/* Encabezado de ficha */}
        <header style={s.fichaHeader}>
          <div>
            <div style={s.fichaId}>{f.record_code || `#${f.id}`}</div>

            <h1 style={s.fichaTitulo}>
              {f.finding_type_display || f.finding_type || 'Hallazgo'} —{' '}
              {[f.state, f.municipality].filter(Boolean).join(', ') || 'Ubicación no especificada'}
            </h1>

            <p style={s.fichaFecha}>
              {formatDate(f.finding_date)} · Registrado el {formatDateTime(f.created_at)}
              {f.created_by_name && ` por ${f.created_by_name}`}
            </p>
          </div>

          <div style={s.headerActions}>
            <Badge valor={f.status || f.record_status} mapa={ESTADO_LABELS} colores={ESTADO_COLORS} />

            {f.contact_email && (
              <a href={`mailto:${f.contact_email}`} style={s.btnContacto}>
                Contactar
              </a>
            )}
          </div>
        </header>

        <div style={s.contenido}>
          {/* Sección 1 — Datos internos */}
          <Seccion titulo="Datos internos del registro">
            <Grilla>
              <Campo label="Código" valor={f.record_code} />
              <Campo label="Estado" valor={f.status_display || ESTADO_LABELS[f.status] || f.status} />
              <Campo label="Tipo de hallazgo" valor={f.finding_type_display || f.finding_type} />
              <Campo label="Nivel de confianza" valor={f.confidence_level_display || f.confidence_level} />
              <Campo label="Fuente del dato" valor={f.source} />
              <Campo label="Correo de contacto" valor={f.contact_email} />
            </Grilla>

            <Nota label="Observaciones internas" valor={f.internal_notes} />
          </Seccion>

          {/* Sección 2 — Ubicación */}
          <Seccion titulo="Ubicación del hallazgo">
            <Grilla>
              <Campo label="País" valor={f.country} />
              <Campo label="Estado / Entidad" valor={f.state} />
              <Campo label="Municipio" valor={f.municipality} />
              <Campo label="Localidad o colonia" valor={f.locality} />
              <Campo label="Región o zona" valor={f.region} />
              <Campo label="Tipo de lugar" valor={f.place_type} />
              <Campo label="Ubicación exacta restringida" valor={f.exact_location_restricted} />
              <Campo label="Coordenadas restringidas" valor={f.coordinates_restricted} />
            </Grilla>

            <Nota label="Observaciones del lugar" valor={f.place_notes || f.location_notes} />
          </Seccion>

          {/* Sección 3 — Fecha y tiempo */}
          <Seccion titulo="Fecha y tiempo">
            <Grilla>
              <Campo label="Fecha del hallazgo" valor={formatDate(f.finding_date)} />
              <Campo label="Hora aproximada" valor={f.approximate_time} />
              <Campo label="Rango temporal" valor={f.temporal_range} />
            </Grilla>

            <Nota label="Notas sobre fecha" valor={f.date_notes} />
          </Seccion>

          {/* Sección 4 — Condición general */}
          <Seccion titulo="Condición general del hallazgo">
            <Grilla>
              <Campo label="Número estimado de individuos" valor={f.estimated_individuals} />
              <Campo label="Estado de conservación" valor={f.conservation_state || f.conservation_status} />
              <Campo label="Integridad" valor={f.integrity} />
              <Campo label="Exposición" valor={f.exposure} />
            </Grilla>

            <Nota label="Notas de condición general" valor={f.general_condition_notes} />
          </Seccion>

          {/* Sección 5 — Características físicas */}
          <Seccion titulo="Características físicas observables">
            <Grilla>
              <Campo label="Sexo estimado" valor={f.estimated_sex_display || f.estimated_sex} />
              <Campo label="Edad estimada" valor={f.estimated_age} />
              <Campo label="Estatura estimada" valor={f.estimated_height} />
              <Campo label="Peso estimado" valor={f.estimated_weight} />
              <Campo label="Complexión estimada" valor={f.estimated_build} />
              <Campo label="Color de piel" valor={f.skin_color} />
              <Campo label="Cabello" valor={f.hair} />
              <Campo label="Vello facial" valor={f.facial_hair} />
              <Campo label="Ojos" valor={f.eyes} />
            </Grilla>

            <Nota label="Notas físicas" valor={f.physical_notes} />
          </Seccion>

          {/* Sección 6 — Señas particulares */}
          <Seccion titulo="Señas particulares">
            <Grilla>
              <Campo label="Tatuajes" valor={f.tattoos} />
              <Campo label="Cicatrices" valor={f.scars} />
              <Campo label="Lunares o manchas" valor={f.moles} />
              <Campo label="Perforaciones" valor={f.piercings} />
              <Campo label="Prótesis" valor={f.prosthetics} />
              <Campo label="Marcas quirúrgicas" valor={f.surgical_marks} />
              <Campo label="Amputaciones" valor={f.amputations} />
            </Grilla>

            <Nota label="Notas de señas particulares" valor={f.distinctive_marks_notes} />
          </Seccion>

          {/* Sección 7 — Información dental */}
          <Seccion titulo="Información dental">
            <Grilla>
              <Campo label="Brackets visibles" valor={f.braces} />
              <Campo label="Prótesis dental" valor={f.dental_prosthetics} />
              <Campo label="Piezas faltantes visibles" valor={f.missing_teeth} />
              <Campo label="Coronas o restauraciones" valor={f.dental_restorations} />
            </Grilla>

            <Nota label="Notas dentales" valor={f.dental_notes} />
          </Seccion>

          {/* Sección 8 — Información médica */}
          <Seccion titulo="Información médica">
            <Nota label="Notas médicas" valor={f.medical_notes} />
          </Seccion>

          {/* Sección 9 — Información institucional */}
          <Seccion titulo="Información institucional">
            <Grilla>
              <Campo label="Autoridad notificada" valor={f.notified_authority} />
              <Campo label="Folio institucional" valor={f.institutional_folio} />
              <Campo label="Carpeta o referencia" valor={f.case_reference} />
              <Campo label="SEMEFO relacionado" valor={f.semefo} />
            </Grilla>

            <Nota label="Observaciones institucionales" valor={f.institutional_notes} />
          </Seccion>
        </div>
      </main>
    </div>
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
    gap: '1rem',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '1rem',
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

  logoText: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
  },

  logoSub: {
    fontSize: '10px',
    color: '#aaa',
    marginTop: '1px',
  },

  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    border: '0.5px solid #e0deda',
    borderRadius: '8px',
    background: 'transparent',
    fontSize: '12px',
    color: '#555',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
    width: '100%',
  },

  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  fichaHeader: {
    background: '#fff',
    borderBottom: '0.5px solid #e0deda',
    padding: '1.25rem 2rem',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
  },

  fichaId: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#aaa',
    marginBottom: '4px',
    letterSpacing: '0.05em',
  },

  fichaTitulo: {
    fontSize: '18px',
    fontWeight: '400',
    color: '#1a1a1a',
    margin: '0 0 4px',
    fontFamily: 'Georgia, serif',
    lineHeight: '1.4',
  },

  fichaFecha: {
    fontSize: '12px',
    color: '#aaa',
    margin: 0,
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },

  btnContacto: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    background: '#1a1a1a',
    color: '#f5f4f1',
    borderRadius: '8px',
    fontSize: '12px',
    textDecoration: 'none',
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
  },

  contenido: {
    padding: '1.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '900px',
  },

  seccion: {
    background: '#fff',
    border: '0.5px solid #e0deda',
    borderRadius: '10px',
    overflow: 'hidden',
  },

  seccionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },

  seccionTitulo: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
  },

  seccionBody: {
    padding: '4px 16px 16px',
    borderTop: '0.5px solid #f0efeb',
  },

  grilla: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0',
  },

  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '10px 8px',
    borderBottom: '0.5px solid #f5f4f1',
  },

  campoLabel: {
    fontSize: '10px',
    fontWeight: '500',
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  campoValor: {
    fontSize: '13px',
    color: '#1a1a1a',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap',
  },

  nota: {
    marginTop: '8px',
    padding: '10px 8px',
    background: '#faf9f7',
    borderRadius: '6px',
  },

  notaLabel: {
    fontSize: '10px',
    fontWeight: '500',
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: '4px',
  },

  notaTexto: {
    fontSize: '13px',
    color: '#555',
    margin: 0,
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },

  estado: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '14px',
    color: '#aaa',
    fontFamily: 'system-ui, sans-serif',
  },

  estadoError: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '14px',
    color: '#b84040',
    fontFamily: 'system-ui, sans-serif',
  },
}