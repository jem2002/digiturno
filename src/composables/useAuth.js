import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const { usuario, rolUsuario, usuarioSedeId, isAuthenticated } = storeToRefs(authStore)

  const puedeVer = (allowedRoles) => authStore.tieneRol(allowedRoles)

  async function cerrarSesion() {
    authStore.salida()
    await router.push('/login')
  }

  return {
    user: usuario,
    role: rolUsuario,
    sedeId: usuarioSedeId,
    isAuthenticated,
    puedeVer,
    cerrarSesion,
  }
}
