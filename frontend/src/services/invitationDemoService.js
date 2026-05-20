// Servicio demo de invitaciones.
//
// Este archivo simula el flujo de invitaciones usando localStorage.
// No representa seguridad real, no envía correos y no crea usuarias en backend.
//
// Objetivo actual:
// - Mostrar en la presentación cómo se vería una usuaria aprobada con permiso para invitar.
// - Permitir crear invitaciones de ejemplo.
// - Mostrar invitaciones en distintos estados.
// - Preparar la interfaz para una futura conexión con backend Django.

const STORAGE_KEY = 'registro_digno_demo_invitations'

// Estados disponibles para invitaciones demo.
// En una versión real, estos valores deberían venir desde backend.
export const INVITATION_STATUS = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  suspended: 'Suspendida',
  expired: 'Expirada',
}

// Roles sugeridos para la persona invitada.
// Por ahora solo afectan la visualización de la invitación demo.
export const INVITATION_ROLES = [
  { value: 'registered_user', label: 'Usuaria registrada' },
  { value: 'validator', label: 'Usuaria validadora' },
  { value: 'admin', label: 'Administradora' },
]

// Invitaciones iniciales para presentación.
// Todos los datos son ficticios y están redactados como ejemplos neutrales.
const INITIAL_INVITATIONS = [
  {
    id: 'demo-1',
    invitationCode: 'INV-DEMO-001',
    fullName: 'Integrante Demo Pendiente',
    email: 'integrante.pendiente@example.com',
    collective: 'Colectivo demo',
    requestedRole: 'registered_user',
    requestedRoleLabel: 'Usuaria registrada',
    reason: 'Ejemplo de solicitud pendiente para mostrar el flujo de aprobación.',
    status: 'pending',
    invitedByName: 'Administradora Demo',
    invitedByEmail: 'admin@registrodigno.local',
    createdAt: '2026-05-20T10:00:00',
    reviewedAt: '',
    reviewNotes: '',
  },
  {
    id: 'demo-2',
    invitationCode: 'INV-DEMO-002',
    fullName: 'Integrante Demo Aprobada',
    email: 'integrante.aprobada@example.com',
    collective: 'Colectivo demo',
    requestedRole: 'registered_user',
    requestedRoleLabel: 'Usuaria registrada',
    reason: 'Ejemplo de invitación aceptada para mostrar una integrante aprobada.',
    status: 'accepted',
    invitedByName: 'Administradora Demo',
    invitedByEmail: 'admin@registrodigno.local',
    createdAt: '2026-05-19T12:30:00',
    reviewedAt: '2026-05-19T15:00:00',
    reviewNotes: 'Aprobada para demostración del flujo.',
  },
  {
    id: 'demo-3',
    invitationCode: 'INV-DEMO-003',
    fullName: 'Integrante Demo Rechazada',
    email: 'integrante.rechazada@example.com',
    collective: 'Colectivo demo',
    requestedRole: 'registered_user',
    requestedRoleLabel: 'Usuaria registrada',
    reason: 'Ejemplo de invitación rechazada para mostrar trazabilidad del estado.',
    status: 'rejected',
    invitedByName: 'Administradora Demo',
    invitedByEmail: 'admin@registrodigno.local',
    createdAt: '2026-05-18T09:10:00',
    reviewedAt: '2026-05-18T11:20:00',
    reviewNotes: 'Rechazada dentro del flujo demo.',
  },
  {
    id: 'demo-4',
    invitationCode: 'INV-DEMO-004',
    fullName: 'Integrante Demo Suspendida',
    email: 'integrante.suspendida@example.com',
    collective: 'Colectivo demo',
    requestedRole: 'validator',
    requestedRoleLabel: 'Usuaria validadora',
    reason: 'Ejemplo de cuenta suspendida para mostrar estados administrativos.',
    status: 'suspended',
    invitedByName: 'Administradora Demo',
    invitedByEmail: 'admin@registrodigno.local',
    createdAt: '2026-05-17T16:40:00',
    reviewedAt: '2026-05-17T18:00:00',
    reviewNotes: 'Suspendida dentro del flujo demo.',
  },
]

function readStorage() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVITATIONS))
    return INITIAL_INVITATIONS
  }

  try {
    return JSON.parse(stored)
  } catch (error) {
    // Si localStorage queda corrupto, se reinicia con datos demo limpios.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVITATIONS))
    return INITIAL_INVITATIONS
  }
}

function writeStorage(invitations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invitations))
}

function createInvitationCode(nextNumber) {
  return `INV-DEMO-${String(nextNumber).padStart(3, '0')}`
}

function getRoleLabel(roleValue) {
  const role = INVITATION_ROLES.find((item) => item.value === roleValue)
  return role?.label || 'Usuaria registrada'
}

const invitationDemoService = {
  // Obtiene todas las invitaciones guardadas en localStorage.
  getAll() {
    return readStorage()
  },

  // Crea una nueva invitación demo.
  // La invitación no se envía por correo real; solo se guarda para visualización.
  create(data, currentUser) {
    const invitations = readStorage()
    const nextNumber = invitations.length + 1

    const invitation = {
      id: `demo-${Date.now()}`,
      invitationCode: createInvitationCode(nextNumber),
      fullName: data.fullName,
      email: data.email,
      collective: data.collective,
      requestedRole: data.requestedRole || 'registered_user',
      requestedRoleLabel: getRoleLabel(data.requestedRole || 'registered_user'),
      reason: data.reason,
      status: 'pending',
      invitedByName: currentUser?.name || 'Usuaria demo',
      invitedByEmail: currentUser?.email || 'admin@registrodigno.local',
      createdAt: new Date().toISOString(),
      reviewedAt: '',
      reviewNotes: '',
    }

    const updated = [invitation, ...invitations]
    writeStorage(updated)

    return invitation
  },

  // Cambia el estado de una invitación demo.
  // Esto permite simular aprobación, rechazo o suspensión durante la presentación.
  updateStatus(invitationId, nextStatus, reviewNotes = '') {
    const invitations = readStorage()

    const updated = invitations.map((invitation) => {
      if (invitation.id !== invitationId) {
        return invitation
      }

      return {
        ...invitation,
        status: nextStatus,
        reviewedAt: new Date().toISOString(),
        reviewNotes,
      }
    })

    writeStorage(updated)

    return updated.find((invitation) => invitation.id === invitationId)
  },

  // Reinicia las invitaciones demo.
  // Es útil antes de una presentación para recuperar el estado inicial.
  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVITATIONS))
    return INITIAL_INVITATIONS
  },

  // Genera una vista previa del correo de invitación.
  // No envía correo real.
  buildEmailPreview(invitation) {
    if (!invitation) {
      return {
        subject: '',
        body: '',
      }
    }

    return {
      subject: `Invitación a Registro Digno - ${invitation.invitationCode}`,
      body:
        `Hola, ${invitation.fullName}.\n\n` +
        `Has recibido una invitación para acceder a Registro Digno como ${invitation.requestedRoleLabel}.\n\n` +
        `Esta invitación forma parte del flujo privado de acceso al sistema. ` +
        `Para continuar, deberás completar tu solicitud y esperar la aprobación de una administradora o validadora.\n\n` +
        `Código de invitación: ${invitation.invitationCode}\n` +
        `Colectivo o grupo: ${invitation.collective || 'No especificado'}\n` +
        `Invitada por: ${invitation.invitedByName}\n\n` +
        `Nota: este correo es una vista previa de demostración. En esta versión todavía no se envían correos reales desde la aplicación.`,
    }
  },
}

export default invitationDemoService