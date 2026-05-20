import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import LogoutButton from '../components/LogoutButton'

// Catálogos del backend
const RECORD_STATUS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'restricted', label: 'Restringido' },
  { value: 'closed', label: 'Cerrado' },
  { value: 'archived', label: 'Archivado' },
]

const FINDING_TYPE = [
  { value: 'body', label: 'Cuerpo' },
  { value: 'bone_remains', label: 'Restos óseos' },
  { value: 'human_fragment', label: 'Fragmento humano' },
  { value: 'other', label: 'Otro' },
  { value: 'unknown', label: 'Desconocido' },
]

const CONFIDENCE_LEVEL = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'probable', label: 'Probable' },
  { value: 'unconfirmed', label: 'No confirmado' },
]

const ESTIMATED_SEX = [
  { value: 'woman', label: 'Mujer' },
  { value: 'man', label: 'Hombre' },
  { value: 'undetermined', label: 'Indeterminado' },
  { value: 'unknown', label: 'Desconocido' },
]

// Componentes base
function Label({ children, required }) {
  return (
    <label style={s.label}>
      {children}
      {required && <span style={{ color: '#b84040', marginLeft: '3px' }}>*</span>}
    </label>
  )
}

function Input({ label, required, ...props }) {
  return (
    <div style={s.field}>
      <Label required={required}>{label}</Label>
      <input style={s.input} {...props} />
    </div>
  )
}

function Textarea({ label, ...props }) {
  return (
    <div style={s.field}>
      <Label>{label}</Label>
      <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }} {...props} />
    </div>
  )
}

function Select({ label, required, options, ...props }) {
  return (
    <div style={s.field}>
      <Label required={required}>{label}</Label>
      <select style={s.input} {...props}>
        <option value="">— Seleccionar —</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function Bloque({ numero, titulo, children }) {
  const [abierto, setAbierto] = useState(numero === 1)
  return (
    <div style={s.bloque}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        style={s.bloqueHeader}
      >
        <div style={s.bloqueHeaderLeft}>
          <span style={s.bloqueNumero}>{numero}</span>
          <span style={s.bloqueTitulo}>{titulo}</span>
        </div>
        <i
          className={`ti ${abierto ? 'ti-chevron-up' : 'ti-chevron-down'}`}
          style={{ fontSize: '14px', color: '#aaa' }}
          aria-hidden="true"
        />
      </button>
      {abierto && <div style={s.bloqueBody}>{children}</div>}
    </div>
  )
}

function Grilla({ children, cols = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '0 1rem',
    }}>
      {children}
    </div>
  )
}

export default function FindingFormPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    // Bloque 1 — Datos internos
    record_status: 'draft',
    confidence_level: 'unconfirmed',
    source: '',
    internal_notes: '',

    // Bloque 2 — Ubicación
    state: '',
    municipality: '',
    locality: '',
    region: '',
    place_type: '',
    place_notes: '',

    // Bloque 3 — Fecha
    finding_date: '',
    approximate_time: '',
    temporal_range: '',

    // Bloque 4 — Condición general
    finding_type: '',
    estimated_individuals: '',
    conservation_state: '',
    integrity: '',
    exposure: '',

    // Bloque 5 — Características físicas
    estimated_sex: '',
    estimated_age: '',
    estimated_height: '',
    estimated_weight: '',
    estimated_build: '',
    skin_color: '',
    hair: '',
    facial_hair: '',
    eyes: '',

    // Bloque 6 — Señas particulares
    tattoos: '',
    scars: '',
    moles: '',
    piercings: '',
    surgical_marks: '',
    amputations: '',

    // Bloque 7 — Dental
    braces: '',
    dental_prosthetics: '',
    missing_teeth: '',
    dental_restorations: '',

    // Bloque 8 — Institucional
    notified_authority: '',
    institutional_folio: '',
    case_reference: '',
    semefo: '',
    institutional_notes: '',
  })

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.state) {
      setError('El campo Estado / Entidad federativa es requerido.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)
    try {
      // Limpia campos vacíos antes de enviar
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== '')
      )
      const { data } = await api.post('/findings/', payload)
      setSuccess(`Registro ${data.record_code || '#' + data.id} creado correctamente.`)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      const errData = err.response?.data
      if (errData && typeof errData === 'object') {
        const msgs = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
        setError(msgs)
      } else {
        setError('No se pudo guardar el registro. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Sidebar */}
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

        <div style={s.sidebarInfo}>
          <p style={s.sidebarInfoText}>
            Los campos marcados con <span style={{ color: '#b84040' }}>*</span> son requeridos.
            El resto puede marcarse como desconocido o dejarse vacío.
          </p>
        </div>
      </nav>

      {/* Formulario */}
      <main style={s.main}>
        <div style={s.header}>
          <h1 style={s.titulo}>Nuevo registro de hallazgo</h1>
          <p style={s.subtitulo}>
            Completa la información disponible. Puedes guardar como borrador y continuar después.
          </p>
        </div>

        {error && <div style={s.errorMsg} role="alert">{error}</div>}
        {success && <div style={s.successMsg} role="status">{success}</div>}

        <form onSubmit={handleSubmit} style={s.form} noValidate>
          {/* Bloque 1 */}
          <Bloque numero={1} titulo="Datos internos del registro">
            <Grilla>
              <Select
                label="Estado del registro"
                options={RECORD_STATUS}
                value={form.record_status}
                onChange={set('record_status')}
              />
              <Select
                label="Nivel de confianza"
                options={CONFIDENCE_LEVEL}
                value={form.confidence_level}
                onChange={set('confidence_level')}
              />
              <Input
                label="Fuente del dato"
                placeholder="Observación directa, documento, autoridad…"
                value={form.source}
                onChange={set('source')}
              />
            </Grilla>
            <Textarea
              label="Observaciones internas"
              placeholder="Notas generales del registro…"
              value={form.internal_notes}
              onChange={set('internal_notes')}
            />
          </Bloque>

          {/* Bloque 2 */}
          <Bloque numero={2} titulo="Ubicación del hallazgo">
            <Grilla>
              <Input
                label="Estado / Entidad federativa"
                required
                placeholder="Ej: Jalisco"
                value={form.state}
                onChange={set('state')}
              />
              <Input
                label="Municipio"
                placeholder="Ej: Zapopan"
                value={form.municipality}
                onChange={set('municipality')}
              />
              <Input
                label="Localidad o colonia"
                placeholder="Si se conoce"
                value={form.locality}
                onChange={set('locality')}
              />
              <Input
                label="Región o zona"
                placeholder="Campo, carretera, barranca…"
                value={form.region}
                onChange={set('region')}
              />
              <Input
                label="Tipo de lugar"
                placeholder="Superficie, fosa, predio…"
                value={form.place_type}
                onChange={set('place_type')}
              />
            </Grilla>
            <Textarea
              label="Observaciones del lugar"
              placeholder="Descripción general del contexto…"
              value={form.place_notes}
              onChange={set('place_notes')}
            />
          </Bloque>

          {/* Bloque 3 */}
          <Bloque numero={3} titulo="Fecha y tiempo">
            <Grilla>
              <Input
                label="Fecha del hallazgo"
                type="date"
                value={form.finding_date}
                onChange={set('finding_date')}
              />
              <Input
                label="Hora aproximada"
                type="time"
                value={form.approximate_time}
                onChange={set('approximate_time')}
              />
              <Input
                label="Rango temporal"
                placeholder="Ej: Entre enero y marzo de 2023"
                value={form.temporal_range}
                onChange={set('temporal_range')}
              />
            </Grilla>
          </Bloque>

          {/* Bloque 4 */}
          <Bloque numero={4} titulo="Condición general del hallazgo">
            <Grilla>
              <Select
                label="Tipo de hallazgo"
                options={FINDING_TYPE}
                value={form.finding_type}
                onChange={set('finding_type')}
              />
              <Input
                label="Número estimado de individuos"
                placeholder="Uno, varios, indeterminado"
                value={form.estimated_individuals}
                onChange={set('estimated_individuals')}
              />
              <Input
                label="Estado de conservación"
                placeholder="Reciente, esqueletizado, fragmentado…"
                value={form.conservation_state}
                onChange={set('conservation_state')}
              />
              <Input
                label="Integridad"
                placeholder="Completo, parcial, fragmentario…"
                value={form.integrity}
                onChange={set('integrity')}
              />
              <Input
                label="Exposición"
                placeholder="Superficial, enterrado, sumergido…"
                value={form.exposure}
                onChange={set('exposure')}
              />
            </Grilla>
          </Bloque>

          {/* Bloque 5 */}
          <Bloque numero={5} titulo="Características físicas observables">
            <Grilla>
              <Select
                label="Sexo estimado"
                options={ESTIMATED_SEX}
                value={form.estimated_sex}
                onChange={set('estimated_sex')}
              />
              <Input
                label="Edad estimada"
                placeholder="Ej: 30–40 años"
                value={form.estimated_age}
                onChange={set('estimated_age')}
              />
              <Input
                label="Estatura estimada"
                placeholder="Ej: 1.60–1.65 m"
                value={form.estimated_height}
                onChange={set('estimated_height')}
              />
              <Input
                label="Peso estimado"
                placeholder="Ej: 60–70 kg"
                value={form.estimated_weight}
                onChange={set('estimated_weight')}
              />
              <Input
                label="Complexión estimada"
                placeholder="Delgada, media, robusta…"
                value={form.estimated_build}
                onChange={set('estimated_build')}
              />
              <Input
                label="Color de piel"
                placeholder="Solo si es observable"
                value={form.skin_color}
                onChange={set('skin_color')}
              />
              <Input
                label="Cabello"
                placeholder="Color, largo, textura…"
                value={form.hair}
                onChange={set('hair')}
              />
              <Input
                label="Vello facial"
                placeholder="Barba, bigote, no observable…"
                value={form.facial_hair}
                onChange={set('facial_hair')}
              />
              <Input
                label="Ojos"
                placeholder="Solo si aplica"
                value={form.eyes}
                onChange={set('eyes')}
              />
            </Grilla>
          </Bloque>

          {/* Bloque 6 */}
          <Bloque numero={6} titulo="Señas particulares">
            <Grilla>
              <Input
                label="Tatuajes"
                placeholder="Descripción, zona, texto, figura…"
                value={form.tattoos}
                onChange={set('tattoos')}
              />
              <Input
                label="Cicatrices"
                placeholder="Ubicación y descripción…"
                value={form.scars}
                onChange={set('scars')}
              />
              <Input
                label="Lunares o manchas"
                placeholder="Ubicación…"
                value={form.moles}
                onChange={set('moles')}
              />
              <Input
                label="Perforaciones"
                placeholder="Orejas, nariz, labio…"
                value={form.piercings}
                onChange={set('piercings')}
              />
              <Input
                label="Marcas quirúrgicas"
                placeholder="Cicatrices de cirugía…"
                value={form.surgical_marks}
                onChange={set('surgical_marks')}
              />
              <Input
                label="Amputaciones"
                placeholder="Si aplica…"
                value={form.amputations}
                onChange={set('amputations')}
              />
            </Grilla>
          </Bloque>

          {/* Bloque 7 */}
          <Bloque numero={7} titulo="Información dental">
            <Grilla>
              <Input
                label="Brackets visibles"
                placeholder="Sí, no, no observable"
                value={form.braces}
                onChange={set('braces')}
              />
              <Input
                label="Prótesis dental"
                placeholder="Sí, no, no observable"
                value={form.dental_prosthetics}
                onChange={set('dental_prosthetics')}
              />
              <Input
                label="Piezas faltantes visibles"
                placeholder="Sí, no, no observable"
                value={form.missing_teeth}
                onChange={set('missing_teeth')}
              />
              <Input
                label="Coronas o restauraciones"
                placeholder="Sí, no, no observable"
                value={form.dental_restorations}
                onChange={set('dental_restorations')}
              />
            </Grilla>
          </Bloque>

          {/* Bloque 8 */}
          <Bloque numero={8} titulo="Información institucional">
            <Grilla>
              <Input
                label="Autoridad notificada"
                placeholder="Fiscalía, policía, comisión…"
                value={form.notified_authority}
                onChange={set('notified_authority')}
              />
              <Input
                label="Folio institucional"
                placeholder="Si existe"
                value={form.institutional_folio}
                onChange={set('institutional_folio')}
              />
              <Input
                label="Carpeta o referencia"
                placeholder="Si existe"
                value={form.case_reference}
                onChange={set('case_reference')}
              />
              <Input
                label="SEMEFO relacionado"
                placeholder="Si se conoce"
                value={form.semefo}
                onChange={set('semefo')}
              />
            </Grilla>
            <Textarea
              label="Observaciones institucionales"
              placeholder="Notas sobre el proceso institucional…"
              value={form.institutional_notes}
              onChange={set('institutional_notes')}
            />
          </Bloque>

          {/* Acciones */}
          <div style={s.acciones}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={s.btnCancelar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              name="status_override"
              value="draft"
              disabled={loading}
              style={{ ...s.btnGuardar, ...s.btnSecundario }}
              onClick={() => setForm(p => ({ ...p, record_status: 'draft' }))}
            >
              Guardar como borrador
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...s.btnGuardar,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onClick={() => setForm(p => ({ ...p, record_status: 'active' }))}
            >
              {loading ? 'Guardando…' : 'Guardar registro'}
            </button>
          </div>
        </form>
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
  logoText: { fontSize: '13px', fontWeight: '500', color: '#1a1a1a' },
  logoSub: { fontSize: '10px', color: '#aaa', marginTop: '1px' },
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
  sidebarInfo: {
    marginTop: 'auto',
    padding: '10px',
    background: '#faf9f7',
    borderRadius: '8px',
    border: '0.5px solid #e8e6e0',
  },
  sidebarInfoText: {
    fontSize: '11px',
    color: '#999',
    lineHeight: '1.6',
    margin: 0,
  },
  main: {
    flex: 1,
    minWidth: 0,
    padding: '2rem',
    maxWidth: '860px',
  },
  header: {
    marginBottom: '1.5rem',
  },
  titulo: {
    fontSize: '20px',
    fontWeight: '400',
    color: '#1a1a1a',
    margin: '0 0 6px',
    fontFamily: 'Georgia, serif',
  },
  subtitulo: {
    fontSize: '13px',
    color: '#aaa',
    margin: 0,
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
  successMsg: {
    background: '#eaf3de',
    border: '0.5px solid #b8d98a',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#3b6d11',
    fontSize: '13px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  bloque: {
    background: '#fff',
    border: '0.5px solid #e0deda',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  bloqueHeader: {
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
  bloqueHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  bloqueNumero: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    background: '#1a1a1a',
    color: '#f5f4f1',
    borderRadius: '50%',
    fontSize: '11px',
    fontWeight: '600',
    flexShrink: 0,
  },
  bloqueTitulo: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
  },
  bloqueBody: {
    padding: '4px 16px 16px',
    borderTop: '0.5px solid #f0efeb',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '6px 0',
  },
  label: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#777',
    letterSpacing: '0.01em',
  },
  input: {
    padding: '7px 10px',
    border: '0.5px solid #dddbd5',
    borderRadius: '7px',
    fontSize: '13px',
    fontFamily: 'system-ui, sans-serif',
    color: '#1a1a1a',
    background: '#fafafa',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  acciones: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    padding: '1rem 0',
  },
  btnCancelar: {
    padding: '8px 16px',
    border: '0.5px solid #dddbd5',
    borderRadius: '8px',
    background: 'transparent',
    fontSize: '13px',
    color: '#888',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },
  btnGuardar: {
    padding: '8px 18px',
    border: 'none',
    borderRadius: '8px',
    background: '#1a1a1a',
    color: '#f5f4f1',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },
  btnSecundario: {
    background: 'transparent',
    border: '0.5px solid #1a1a1a',
    color: '#1a1a1a',
  },
}
