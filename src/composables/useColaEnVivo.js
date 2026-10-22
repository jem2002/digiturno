import { watch } from 'vue'
import { useColaStore } from '@/stores/colaStore'
import { useSocket } from './useSocket'
import { EventosSocket } from '@/constants/turnos'

export function useColaEnVivo(sedeId, { alLlamar } = {}) {
  const cola = useColaStore()
  const { on, emit, conectado } = useSocket()
  const esDeLaSede = (turno) => turno.sedeId === sedeId.value

  function unirse(id) {
    emit(EventosSocket.UNIRSE_SEDE, id)
    cola.cargarCola(id)
  }

  on(EventosSocket.TURNO_CREADO, (turno) => esDeLaSede(turno) && cola.upsertTurno(turno))
  on(EventosSocket.TURNO_ACTUALIZADO, (turno) => esDeLaSede(turno) && cola.upsertTurno(turno))
  on(EventosSocket.TURNO_LLAMADO, (turno) => {
    if (!esDeLaSede(turno)) return
    cola.registrarLlamado(turno)
    alLlamar?.(turno)
  })
  on('connect', () => sedeId.value && unirse(sedeId.value))

  watch(
    sedeId,
    (nuevo, anterior) => {
      if (anterior) emit(EventosSocket.SALIR_SEDE, anterior)
      if (nuevo) unirse(nuevo)
      else cola.reiniciar()
    },
    { immediate: true },
  )

  return { cola, conectado }
}
