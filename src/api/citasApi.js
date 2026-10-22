import api from './axiosUsuario'

export const citasApi = {
  crear: (cita) => api.post('/citas', cita).then((r) => r.data),
  checkin: (sedeId, codigo) => api.post('/citas/checkin', { sedeId, codigo }).then((r) => r.data),
}
