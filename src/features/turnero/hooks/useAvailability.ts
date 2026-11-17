import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '@/api/apiClient'
import { isBackendProfessionalId, parseAvailabilityResponse } from '../availability'
import type { AppointmentSlot } from '../types'

interface AvailabilityResult {
  slots: AppointmentSlot[]
  isLoading: boolean
  error: string | null
  canRetry: boolean
  retry: () => void
}

interface AvailabilityState {
  queryKey: string
  slots: AppointmentSlot[]
  error: string | null
}

export function useAvailability(professionalId: string, date: string, centerId?: string): AvailabilityResult {
  const [retryVersion, setRetryVersion] = useState(0)
  const [result, setResult] = useState<AvailabilityState | null>(null)
  const requestVersion = useRef(0)
  const queryKey = `${professionalId}:${date}:${centerId ?? ''}:${retryVersion}`
  const hasBackendProfessionalId = isBackendProfessionalId(professionalId)

  useEffect(() => {
    if (!hasBackendProfessionalId || !date) return

    const controller = new AbortController()
    const currentVersion = ++requestVersion.current
    const numericCenterId = centerId && /^\d+$/.test(String(centerId)) ? centerId : undefined
    apiClient.get<unknown>('/turnos/disponibles', {
      params: {
        profesionalId: professionalId,
        fecha: date,
        ...(numericCenterId ? { centroSaludId: numericCenterId } : {}),
      },
      signal: controller.signal,
    }).then(({ data }) => {
      if (requestVersion.current !== currentVersion) return
      setResult({ queryKey, slots: parseAvailabilityResponse(data), error: null })
    }).catch((error: unknown) => {
      if (controller.signal.aborted || requestVersion.current !== currentVersion) return
      const message = error instanceof Error && error.message.includes('formato de disponibilidad')
        ? error.message
        : 'No pudimos consultar los horarios. Revisá tu conexión e intentá nuevamente.'
      setResult({ queryKey, slots: [], error: message })
    })

    return () => {
      controller.abort()
      requestVersion.current += 1
    }
  }, [professionalId, date, centerId, queryKey, hasBackendProfessionalId])

  const retry = useCallback(() => setRetryVersion((version) => version + 1), [])
  const isCurrentResult = result?.queryKey === queryKey

  return {
    slots: isCurrentResult ? result.slots : [],
    isLoading: hasBackendProfessionalId && Boolean(date) && !isCurrentResult,
    error: isCurrentResult ? result.error : null,
    canRetry: hasBackendProfessionalId,
    retry,
  }
}
