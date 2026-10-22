import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RUTA_INICIO_POR_ROL } from '@/constants/roles'
import { tokenExpirado } from '@/utils/jwt'
import { leerJson, leerTexto, borrar } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(leerTexto('token'))
  const usuario = ref(leerJson('user'))

  const isAuthenticated = computed(() => !!token.value && !tokenExpirado(token.value))
  const rolUsuario = computed(() => usuario.value?.rol ?? null)
  const usuarioSedeId = computed(() => usuario.value?.sede_id ?? null)
  const rutaInicio = computed(() => RUTA_INICIO_POR_ROL[rolUsuario.value] ?? null)

  function login(userData, jwtToken, recordar = true) {
    salida()
    usuario.value = userData
    token.value = jwtToken
    const almacen = recordar ? localStorage : sessionStorage
    almacen.setItem('token', jwtToken)
    almacen.setItem('user', JSON.stringify(userData))
  }

  function salida() {
    usuario.value = null
    token.value = null
    borrar('token')
    borrar('user')
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
