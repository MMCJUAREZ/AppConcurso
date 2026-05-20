import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LogoutButton from '../components/LogoutButton'
import { useAuth } from '../context/AuthContext'
import invitationDemoService, {
  INVITATION_ROLES,
  INVITATION_STATUS,
} from '../services/invitationDemoService'

const STATUS_COLORS = {
  pending: { bg: '#faeeda', text: '#854f0b' },
  accepted: { bg: '#eaf3de', text: '#3b6d11' },
  rejected: { bg: '#fce8e8', text: '#993535' },
  suspended: { bg: '#f0f0ee', text: '#666' },
  expired: { bg: '#f0f0ee', text: '#666' },
}

const INITIAL_FORM = {
  fullName: '',
  email: '',
  collective: '',
  requestedRole: 'registered_user',
  reason: '',
}

function formatDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)

  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function Badge({ status }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.pending

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
      {INVITATION_STATUS[status] || status}
    </span>
  )
}

function Field({ label, children }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div style={s.infoItem}>
      <span style={s.infoLabel}>{label}</span>
      <span style={s.infoValue}>{value || '—'}</span>
    </div>
  )
}

export default function InvitationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [invitations, setInvitations] = useState(() =>
    invitationDemoService.getAll()
  )

  const [form, setForm] = useState(INITIAL_FORM)
  const [selectedInvitation, setSelectedInvitation] = useState(
    invitations[0] || null
  )
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const emailPreview = useMemo(
    () => invitationDemoService.buildEmailPreview(selectedInvitation),
    [selectedInvitation]
  )

  const stats = useMemo(() => {
    return invitations.reduce(
      (acc, invitation) => {
        acc.total += 1
        acc[invitation.status] = (acc[invitation.status] || 0) + 1
        return acc
      },
      {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        suspended: 0,
        expired: 0,
      }
    )
  }, [invitations])

  const set = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const refreshInvitations = () => {
    const data = invitationDemoService.getAll()
    setInvitations(data)
    setSelectedInvitation(data[0] || null)
  }

  const handleCreate = (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!user?.canInvite) {
      setError('La usuaria actual no tiene permiso demo para crear invitaciones.')
      return
    }

    if (!form.fullName.trim()) {
      setError('El nombre de la persona invitada es requerido.')
      return
    }

    if (!form.email.trim()) {
      setError('El correo de la persona invitada es requerido.')
      return
    }

    // Crea una invitación demo en localStorage.
    // No envía correo real ni crea usuarios en backend.
    const invitation = invitationDemoService.create(form, user)

    const updated = invitationDemoService.getAll()
    setInvitations(updated)
    setSelectedInvitation(invitation)
    setForm(INITIAL_FORM)
    setSuccess(`Invitación demo ${invitation.invitationCode} creada.`)
  }

  const handleStatusChange = (invitationId, nextStatus) => {
    // Cambia el estado local de la invitación.
    // En la versión real esto será una acción protegida en backend.
    const updatedInvitation = invitationDemoService.updateStatus(
      invitationId,
      nextStatus,
      `Estado actualizado a ${INVITATION_STATUS[nextStatus]} dentro del flujo demo.`
    )

    const updated = invitationDemoService.getAll()
    setInvitations(updated)
    setSelectedInvitation(updatedInvitation)
    setSuccess(`Invitación ${updatedInvitation.invitationCode} actualizada.`)
    setError('')
  }

  const handleReset = () => {
    const data = invitationDemoService.reset()
    setInvitations(data)
    setSelectedInvitation(data[0] || null)
    setSuccess('Invitaciones demo reiniciadas.')
    setError('')
  }

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <span style={s.logoMark}>RD</span>

          <div>
            <div style={s.logoText}>Registro Digno</div>
            <div style={s.logoSub}>Sistema privado</div>
          </div>
        </div>

        <button type="button" onClick={() => navigate('/')} style={s.navBtn}>
          <i className="ti ti-list" style={{ fontSize: '14px' }} aria-hidden="true" />
          Registros
        </button>

        <button type="button" onClick={() => navigate('/nuevo')} style={s.navBtn}>
          <i className="ti ti-plus" style={{ fontSize: '14px' }} aria-hidden="true" />
          Nuevo registro
        </button>

        <button type="button" style={{ ...s.navBtn, ...s.navBtnActive }}>
          <i className="ti ti-mail-plus" style={{ fontSize: '14px' }} aria-hidden="true" />
          Invitaciones
        </button>

        <LogoutButton />

        <div style={s.userBox}>
          <div style={s.userName}>{user?.name || 'Usuaria demo'}</div>
          <div style={s.userMeta}>{user?.roleLabel || 'Rol demo'}</div>
          <div style={s.userMeta}>{user?.membershipStatusLabel || 'Miembro demo'}</div>

          <div style={s.permissionLine}>
            Permiso para invitar:{' '}
            <strong>{user?.canInvite ? 'Sí' : 'No'}</strong>
          </div>
        </div>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.title}>Invitaciones</h1>
            <p style={s.subtitle}>
              Prototipo demo del flujo de acceso por invitación. No envía correos reales
              ni controla permisos reales todavía.
            </p>
          </div>

          <button type="button" onClick={handleReset} style={s.resetBtn}>
            Reiniciar demo
          </button>
        </header>

        <section style={s.notice}>
          <strong>Modo demo.</strong> Esta pantalla muestra cómo se vería el flujo
          de invitaciones para una usuaria aprobada. Las invitaciones se guardan
          localmente en el navegador.
        </section>

        <section style={s.statsGrid}>
          <div style={s.statCard}>
            <span style={s.statValue}>{stats.total}</span>
            <span style={s.statLabel}>Total</span>
          </div>

          <div style={s.statCard}>
            <span style={s.statValue}>{stats.pending}</span>
            <span style={s.statLabel}>Pendientes</span>
          </div>

          <div style={s.statCard}>
            <span style={s.statValue}>{stats.accepted}</span>
            <span style={s.statLabel}>Aceptadas</span>
          </div>

          <div style={s.statCard}>
            <span style={s.statValue}>{stats.rejected}</span>
            <span style={s.statLabel}>Rechazadas</span>
          </div>

          <div style={s.statCard}>
            <span style={s.statValue}>{stats.suspended}</span>
            <span style={s.statLabel}>Suspendidas</span>
          </div>
        </section>

        <div style={s.grid}>
          <section style={s.card}>
            <h2 style={s.sectionTitle}>Crear invitación demo</h2>

            {error && <div style={s.errorMsg}>{error}</div>}
            {success && <div style={s.successMsg}>{success}</div>}

            <form onSubmit={handleCreate} style={s.form}>
              <Field label="Nombre de la persona invitada">
                <input
                  style={s.input}
                  value={form.fullName}
                  onChange={set('fullName')}
                  placeholder="Ej: Integrante Demo"
                />
              </Field>

              <Field label="Correo electrónico">
                <input
                  style={s.input}
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="integrante.demo@example.com"
                />
              </Field>

              <Field label="Colectivo o grupo">
                <input
                  style={s.input}
                  value={form.collective}
                  onChange={set('collective')}
                  placeholder="Colectivo demo"
                />
              </Field>

              <Field label="Rol sugerido">
                <select
                  style={s.input}
                  value={form.requestedRole}
                  onChange={set('requestedRole')}
                >
                  {INVITATION_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Motivo de ingreso">
                <textarea
                  style={{ ...s.input, minHeight: '82px', resize: 'vertical' }}
                  value={form.reason}
                  onChange={set('reason')}
                  placeholder="Motivo breve de la invitación..."
                />
              </Field>

              <button type="submit" style={s.primaryBtn}>
                Crear invitación demo
              </button>
            </form>
          </section>

          <section style={s.card}>
            <h2 style={s.sectionTitle}>Invitaciones creadas</h2>

            <div style={s.invitationList}>
              {invitations.map((invitation) => (
                <button
                  type="button"
                  key={invitation.id}
                  onClick={() => setSelectedInvitation(invitation)}
                  style={{
                    ...s.invitationItem,
                    ...(selectedInvitation?.id === invitation.id
                      ? s.invitationItemActive
                      : {}),
                  }}
                >
                  <div style={s.invitationTop}>
                    <span style={s.invitationCode}>{invitation.invitationCode}</span>
                    <Badge status={invitation.status} />
                  </div>

                  <div style={s.invitationName}>{invitation.fullName}</div>
                  <div style={s.invitationEmail}>{invitation.email}</div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {selectedInvitation && (
          <section style={s.detailGrid}>
            <div style={s.card}>
              <h2 style={s.sectionTitle}>Detalle de invitación</h2>

              <div style={s.infoGrid}>
                <InfoItem label="Código" value={selectedInvitation.invitationCode} />
                <InfoItem label="Estado" value={INVITATION_STATUS[selectedInvitation.status]} />
                <InfoItem label="Nombre" value={selectedInvitation.fullName} />
                <InfoItem label="Correo" value={selectedInvitation.email} />
                <InfoItem label="Colectivo" value={selectedInvitation.collective} />
                <InfoItem label="Rol solicitado" value={selectedInvitation.requestedRoleLabel} />
                <InfoItem label="Invitada por" value={selectedInvitation.invitedByName} />
                <InfoItem label="Fecha de creación" value={formatDateTime(selectedInvitation.createdAt)} />
                <InfoItem label="Fecha de revisión" value={formatDateTime(selectedInvitation.reviewedAt)} />
              </div>

              <div style={s.noteBox}>
                <span style={s.noteLabel}>Motivo de ingreso</span>
                <p style={s.noteText}>{selectedInvitation.reason || '—'}</p>
              </div>

              {selectedInvitation.reviewNotes && (
                <div style={s.noteBox}>
                  <span style={s.noteLabel}>Notas de revisión</span>
                  <p style={s.noteText}>{selectedInvitation.reviewNotes}</p>
                </div>
              )}

              <div style={s.statusActions}>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedInvitation.id, 'accepted')}
                  style={s.secondaryBtn}
                >
                  Marcar aceptada
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedInvitation.id, 'rejected')}
                  style={s.secondaryBtn}
                >
                  Marcar rechazada
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedInvitation.id, 'suspended')}
                  style={s.secondaryBtn}
                >
                  Marcar suspendida
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedInvitation.id, 'pending')}
                  style={s.secondaryBtn}
                >
                  Volver a pendiente
                </button>
              </div>
            </div>

            <div style={s.card}>
              <h2 style={s.sectionTitle}>Vista previa del correo</h2>

              <div style={s.emailPreview}>
                <span style={s.emailLabel}>Asunto</span>
                <div style={s.emailSubject}>{emailPreview.subject}</div>

                <span style={s.emailLabel}>Cuerpo</span>
                <pre style={s.emailBody}>{emailPreview.body}</pre>
              </div>
            </div>
          </section>
        )}
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
    width: '220px',
    flexShrink: 0,
    background: '#fff',
    borderRight: '0.5px solid #e0deda',
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
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

  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    padding: '7px 10px',
    border: '0.5px solid #e0deda',
    borderRadius: '8px',
    background: 'transparent',
    fontSize: '12px',
    color: '#555',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },

  navBtnActive: {
    background: '#1a1a1a',
    color: '#f5f4f1',
    borderColor: '#1a1a1a',
  },

  userBox: {
    marginTop: 'auto',
    padding: '10px',
    background: '#faf9f7',
    border: '0.5px solid #e8e6e0',
    borderRadius: '8px',
  },

  userName: {
    fontSize: '12px',
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: '4px',
  },

  userMeta: {
    fontSize: '11px',
    color: '#777',
    lineHeight: '1.5',
  },

  permissionLine: {
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '0.5px solid #e8e6e0',
    fontSize: '11px',
    color: '#555',
  },

  main: {
    flex: 1,
    minWidth: 0,
    padding: '2rem',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '1rem',
  },

  title: {
    fontSize: '22px',
    fontWeight: '400',
    color: '#1a1a1a',
    margin: '0 0 6px',
    fontFamily: 'Georgia, serif',
  },

  subtitle: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
    maxWidth: '720px',
    lineHeight: '1.5',
  },

  resetBtn: {
    padding: '8px 12px',
    border: '0.5px solid #dddbd5',
    borderRadius: '8px',
    background: '#fff',
    color: '#666',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
  },

  notice: {
    background: '#fff',
    border: '0.5px solid #e0deda',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#666',
    fontSize: '13px',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
    marginBottom: '1rem',
  },

  statCard: {
    background: '#fff',
    border: '0.5px solid #e0deda',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  statValue: {
    fontSize: '20px',
    color: '#1a1a1a',
    fontWeight: '600',
  },

  statLabel: {
    fontSize: '11px',
    color: '#888',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 420px) 1fr',
    gap: '1rem',
    alignItems: 'start',
  },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1rem',
    alignItems: 'start',
  },

  card: {
    background: '#fff',
    border: '0.5px solid #e0deda',
    borderRadius: '10px',
    padding: '1rem',
  },

  sectionTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a1a',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  label: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#777',
  },

  input: {
    padding: '8px 10px',
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

  primaryBtn: {
    padding: '9px 14px',
    border: 'none',
    borderRadius: '8px',
    background: '#1a1a1a',
    color: '#f5f4f1',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },

  secondaryBtn: {
    padding: '7px 10px',
    border: '0.5px solid #dddbd5',
    borderRadius: '8px',
    background: '#fff',
    color: '#555',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },

  errorMsg: {
    background: '#fdf0f0',
    border: '0.5px solid #e8c4c4',
    borderRadius: '8px',
    padding: '9px 10px',
    color: '#b84040',
    fontSize: '12px',
    marginBottom: '10px',
  },

  successMsg: {
    background: '#eaf3de',
    border: '0.5px solid #b8d98a',
    borderRadius: '8px',
    padding: '9px 10px',
    color: '#3b6d11',
    fontSize: '12px',
    marginBottom: '10px',
  },

  invitationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '420px',
    overflow: 'auto',
  },

  invitationItem: {
    textAlign: 'left',
    border: '0.5px solid #e8e6e0',
    borderRadius: '8px',
    background: '#fafafa',
    padding: '10px',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  },

  invitationItemActive: {
    borderColor: '#1a1a1a',
    background: '#fff',
  },

  invitationTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '6px',
  },

  invitationCode: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#777',
  },

  invitationName: {
    fontSize: '13px',
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: '2px',
  },

  invitationEmail: {
    fontSize: '11px',
    color: '#888',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '8px',
  },

  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px',
    background: '#fafafa',
    borderRadius: '7px',
    border: '0.5px solid #f0efeb',
  },

  infoLabel: {
    fontSize: '10px',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  infoValue: {
    fontSize: '13px',
    color: '#1a1a1a',
    lineHeight: '1.4',
  },

  noteBox: {
    marginTop: '10px',
    padding: '10px',
    background: '#faf9f7',
    borderRadius: '8px',
    border: '0.5px solid #f0efeb',
  },

  noteLabel: {
    fontSize: '10px',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    display: 'block',
    marginBottom: '4px',
  },

  noteText: {
    fontSize: '13px',
    color: '#555',
    lineHeight: '1.5',
    margin: 0,
  },

  statusActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '1rem',
  },

  emailPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  emailLabel: {
    fontSize: '10px',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  emailSubject: {
    padding: '9px 10px',
    borderRadius: '8px',
    background: '#fafafa',
    border: '0.5px solid #f0efeb',
    fontSize: '13px',
    color: '#1a1a1a',
  },

  emailBody: {
    padding: '12px',
    borderRadius: '8px',
    background: '#fafafa',
    border: '0.5px solid #f0efeb',
    fontSize: '12px',
    color: '#444',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    fontFamily: 'system-ui, sans-serif',
    margin: 0,
    minHeight: '260px',
  },
}