import api from './axiosUsuario'

export const serviciosApi = {
  listarPorSede: (sedeId) => api.get(`/sedes/${sedeId}/servicios`).then((r) => r.data),
  crear: (servicio) => api.post('/servicios', servicio).then((r) => r.data),
  actualizar: (id, servicio) => api.put(`/servicios/${id}`, servicio).then((r) => r.data),
  eliminar: (id) => api.delete(`/servicios/${id}`).then((r) => r.data),
}
