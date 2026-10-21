import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated && !authStore.rutaInicio) {
    authStore.salida()
  }

  if (to.meta.soloInvitados && authStore.isAuthenticated) {
    return authStore.rutaInicio
  }

  if (!to.meta.requiresAuth) return true

  if (!authStore.isAuthenticated) {
    authStore.salida()
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const allowedRoles = to.meta.roles
  if (allowedRoles && !authStore.tieneRol(allowedRoles)) {
    return authStore.rutaInicio
  }

  return true
})

export default router
