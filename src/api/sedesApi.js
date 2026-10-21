import api from './axiosUsuario'

export const sedesApi = {
  listar: () => api.get('/sedes').then((r) => r.data),
  obtener: (id) => api.get(`/sedes/${id}`).then((r) => r.data),
  crear: (sede) => api.post('/sedes', sede).then((r) => r.data),
  actualizar: (id, sede) => api.put(`/sedes/${id}`, sede).then((r) => r.data),
  eliminar: (id) => api.delete(`/sedes/${id}`).then((r) => r.data),
}
