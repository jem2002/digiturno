import {defineStore} from 'pinia';
import {ref, computed} from 'vue';

export const useAuthstore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const usuario = ref(JSON.parse(localStorage.getItem('user') || null));

  const isAuthenticated = computed(() => !!token.value);
  const rolUsuario = computed(() => usuario.value?.rol || null); // rol de donde viene la base de datos
  const usuarioSedeId = computed(() => usuario.value?.sede_id || null); // lo mismo aca

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

  function tieneRol(allowedRoles){
    if (!usuario.value) return false
    return allowedRoles.includes(usuario.value?.rol)
  }

  return {
    token,
    usuario,
    isAuthenticated,
    rolUsuario,
    usuarioSedeId,
    login,
    salida,
    tieneRol
  }


})
