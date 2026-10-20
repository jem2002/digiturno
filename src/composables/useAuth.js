import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const authStore = useAuthStore()

  const puedeVer = (allowedRoles) => {
    return authStore.tieneRol(allowedRoles)
  }

  return {
    user: authStore.usuario,
    role: authStore.rolUsuario,
    sedeId: authStore.usuarioSedeId,
    puedeVer
  }
}
