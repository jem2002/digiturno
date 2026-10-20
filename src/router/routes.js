import AsesorLayout from "@/layouts/AsesorLayout.vue"
import kioskoLayout from "@/layouts/KioskoLayout.vue"
import AdminLayout from "@/layouts/AdminLayout.vue"

export const Roles = {
ADMIN: 'SUPER-ADMIN',
ASESOR: 'ASESOR',
}

export const routes = [
  {
    path: '/:sede/Kiosko',
    component: () => import ('@/views/devices/VistaKiosko.vue'),
    meta: {layout: 'KioskoLayout'}
  },
  {
    path: '/:sede/TV',
    component: () => import ('@/views/devices/VistaTV.vue'),
    meta: {layout: 'KioskoLayout'}
  },
  {
    path: '/agendar',
    component: () => import ('@/views/devices/Agendamiento.vue'),
    meta: {layout: 'KioskoLayout'}
  },

  {
    path: '/login',
    component: () => import ('@/views/auth/Login.vue'),
    meta: {layout: 'KioskoLayout'}
  },
  {
    path: '/asesor',
    component: () => import ('@/views/asesor/PanelAsesor.vue'),
    meta: {
      requiresAuth: true,
      roles: [Roles.ADMIN, Roles.ASESOR],
      layout: 'AsesorLayout'
    }
  },
  {
    path: '/admin',
    component: () => import ('@/views/admin/Sedes.vue'),
    meta: {
      requiresAuth: true,
      roles: [Roles.ADMIN],
      layout: 'AdminLayout'
    }
  },
]
