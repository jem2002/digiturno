export function formatearDuracion(ms) {
  if (!ms || ms < 0) return '0:00'
  const totalSegundos = Math.floor(ms / 1000)
  const horas = Math.floor(totalSegundos / 3600)
  const minutos = Math.floor((totalSegundos % 3600) / 60)
  const segundos = String(totalSegundos % 60).padStart(2, '0')
  return horas
    ? `${horas}:${String(minutos).padStart(2, '0')}:${segundos}`
    : `${minutos}:${segundos}`
}

export function formatearHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CO', { dateStyle: 'long' })
}

export function fechaLocalIso(fecha = new Date()) {
  return fecha.toLocaleDateString('en-CA')
}
