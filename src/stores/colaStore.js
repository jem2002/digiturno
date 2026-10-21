import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { turnosApi } from '@/api/turnosApi'
import { EstadoTurno, TipoTurno } from '@/constants/turnos'

const MAX_ULTIMOS_LLAMADOS = 5

export const useColaStore = defineStore('cola', () => {
  const sedeId = ref(null)
  const turnos = ref([])
  const ultimosLlamados = ref([])
  const cargando = ref(false)
  const error = ref(null)

  const enEspera = computed(() =>
    turnos.value
      .filter((t) => t.estado === EstadoTurno.EN_ESPERA)
      .sort((a, b) => {
        const pa = a.tipo === TipoTurno.PREFERENCIAL ? 0 : 1
        const pb = b.tipo === TipoTurno.PREFERENCIAL ? 0 : 1
        return pa - pb || new Date(a.creadoEn) - new Date(b.creadoEn)
      }),
  )
  const turnoActual = computed(() => ultimosLlamados.value[0] ?? null)
  const totalEnEspera = computed(() => enEspera.value.length)

  async function cargarCola(id) {
    sedeId.value = id
    cargando.value = true
    error.value = null
    try {
      const data = await turnosApi.colaPorSede(id)
      turnos.value = data.turnos ?? data
      ultimosLlamados.value = data.ultimosLlamados ?? []
    } catch (e) {
      error.value = e
    } finally {
      cargando.value = false
    }
  }

  function upsertTurno(turno) {
    const i = turnos.value.findIndex((t) => t.id === turno.id)
    if (i === -1) turnos.value.push(turno)
    else turnos.value[i] = { ...turnos.value[i], ...turno }
  }

  function registrarLlamado(turno) {
    upsertTurno(turno)
    ultimosLlamados.value = [
      turno,
      ...ultimosLlamados.value.filter((t) => t.id !== turno.id),
    ].slice(0, MAX_ULTIMOS_LLAMADOS)
  }

  function reiniciar() {
    sedeId.value = null
    turnos.value = []
    ultimosLlamados.value = []
    error.value = null
  }

  return {
    sedeId,
    turnos,
    ultimosLlamados,
    cargando,
    error,
    enEspera,
    turnoActual,
    totalEnEspera,
    cargarCola,
    upsertTurno,
    registrarLlamado,
    reiniciar,
  }
})
