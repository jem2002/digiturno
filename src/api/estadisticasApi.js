import api from './axiosUsuario'

export const estadisticasApi = {
  delDia: (sedeId) => api.get('/estadisticas', { params: { sedeId } }).then((r) => r.data),
}
