import api from './axiosUsuario'

export const authApi = {
  login: (credenciales) => api.post('/auth/login', credenciales).then((r) => r.data),
  perfil: () => api.get('/auth/me').then((r) => r.data),
}
