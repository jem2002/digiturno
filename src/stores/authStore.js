import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RUTA_INICIO_POR_ROL } from '@/constants/roles'
import { tokenExpirado } from '@/utils/jwt'
import { leerJson } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const usuario = ref(leerJson('user'))

  const isAuthenticated = computed(() => !!token.value && !tokenExpirado(token.value))
  const rolUsuario = computed(() => usuario.value?.rol ?? null)
  const usuarioSedeId = computed(() => usuario.value?.sede_id ?? null)
  const rutaInicio = computed(() => RUTA_INICIO_POR_ROL[rolUsuario.value] ?? null)

  function login(userData, jwtToken) {
    usuario.value = userData
    token.value = jwtToken
    localStorage.setItem('token', jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function salida() {
    usuario.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function tieneRol(allowedRoles) {
    if (!usuario.value) return false
    return allowedRoles.includes(usuario.value.rol)
  }

  return {
    token,
    usuario,
    isAuthenticated,
    rolUsuario,
    usuarioSedeId,
    rutaInicio,
    login,
    salida,
    tieneRol,
  }
})
