import { createRouter, createWebHistory } from 'vue-router'
import { routes, Roles } from './routes'
import { useAuthStore } from '@/stores/authStore'

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const allowedRoles = to.meta.roles

  if (!requiresAuth) {
    return next()
  }

  if (!authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (allowedRoles && !authStore.tieneRol(allowedRoles)) {
    if (authStore.rolUsuario === Roles.ASESOR) {
      return next('/atencion')
    }
   else {
      return next('/login')
    }
  }

  next()
})
