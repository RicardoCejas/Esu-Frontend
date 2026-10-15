export interface CreateTurnoRequest {
  fechaHora: string
  pacienteId: number
  profesionalId: number
  motivoTurno?: string
}

export interface CreatedTurnoResponse {
  id: number
  fechaHora: string
  estado: string
  paciente: { id: number }
  profesional: { id: number }
}

type PostTurno = (path: string, body: CreateTurnoRequest) => Promise<{ data: unknown }>

function isBackendId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0
}

function hasId(value: unknown, expected: number): value is { id: number } {
  return typeof value === 'object' && value !== null && 'id' in value && value.id === expected
}

function normalizeLocalDateTime(value: string): string | null {
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?$/.exec(value)
  if (!match) return null
  const [, minute, seconds = '00', fraction = ''] = match
  return `${minute}:${seconds}.${fraction.replace(/0+$/, '')}`
}

export async function createPersistedTurno(post: PostTurno, request: CreateTurnoRequest): Promise<CreatedTurnoResponse> {
  if (!isBackendId(request.pacienteId) || !isBackendId(request.profesionalId)) {
    throw new Error('A booking requires valid backend identifiers.')
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(request.fechaHora)) {
    throw new Error('A booking requires a valid local date-time.')
  }

  const { data } = await post('/turnos/crear', request)
  if (
    typeof data !== 'object' || data === null ||
    !('id' in data) || typeof data.id !== 'number' || !isBackendId(data.id) ||
    !('fechaHora' in data) || typeof data.fechaHora !== 'string' ||
    normalizeLocalDateTime(data.fechaHora) !== normalizeLocalDateTime(request.fechaHora) ||
    !('estado' in data) || typeof data.estado !== 'string' || !data.estado ||
    !('paciente' in data) || !hasId(data.paciente, request.pacienteId) ||
    !('profesional' in data) || !hasId(data.profesional, request.profesionalId)
  ) {
    throw new Error('The backend did not return a valid persisted appointment.')
  }

  return data as CreatedTurnoResponse
}
