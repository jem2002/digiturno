import api from './axiosUsuario'

export const turnosApi = {
  crear: (datos) => api.post('/turnos', datos).then((r) => r.data),
  colaPorSede: (sedeId) => api.get(`/sedes/${sedeId}/cola`).then((r) => r.data),

  llamarSiguiente: (moduloId) => api.post('/turnos/siguiente', { moduloId }).then((r) => r.data),
  rellamar: (turnoId) => api.post(`/turnos/${turnoId}/rellamar`).then((r) => r.data),
  iniciarAtencion: (turnoId) => api.post(`/turnos/${turnoId}/iniciar`).then((r) => r.data),
  finalizar: (turnoId) => api.post(`/turnos/${turnoId}/finalizar`).then((r) => r.data),
  marcarAusente: (turnoId) => api.post(`/turnos/${turnoId}/ausente`).then((r) => r.data),
  transferir: (turnoId, servicioId) =>
    api.post(`/turnos/${turnoId}/transferir`, { servicioId }).then((r) => r.data),
}
