import { PRIORIDAD_TIPO } from '@/constants/turnos'

export function compararTurnos(a, b) {
  const prioridad = (PRIORIDAD_TIPO[a.tipo] ?? 9) - (PRIORIDAD_TIPO[b.tipo] ?? 9)
  return prioridad || Date.parse(a.creadoEn) - Date.parse(b.creadoEn)
}
