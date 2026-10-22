import { Roles } from '@/constants/roles'

export const routes = [
  { path: '/', redirect: '/login' },

  {
    path: '/sede/:sede',
    component: () => import('@/layouts/KioskoLayout.vue'),
    children: [
      { path: '', redirect: { name: 'kiosko' } },
      {
        path: 'kiosko',
        name: 'kiosko',
        component: () => import('@/views/devices/VistaKiosko.vue'),
      },
      { path: 'tv', name: 'tv', component: () => import('@/views/devices/VistaTV.vue') },
      {
        path: 'agendar',
        name: 'agendar',
        component: () => import('@/views/devices/Agendamiento.vue'),
      },
    ],
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { soloInvitados: true },
  },

  {
    path: '/asesor',
    component: () => import('@/layouts/AsesorLayout.vue'),
    meta: { requiresAuth: true, roles: [Roles.ADMIN, Roles.ASESOR] },
    children: [
      { path: '', name: 'panel-asesor', component: () => import('@/views/asesor/PanelAsesor.vue') },
    ],
  },

  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: [Roles.ADMIN] },
    children: [
      { path: '', redirect: { name: 'admin-sedes' } },
      { path: 'sedes', name: 'admin-sedes', component: () => import('@/views/admin/Sedes.vue') },
      {
        path: 'servicios',
        name: 'admin-servicios',
        component: () => import('@/views/admin/Servicios.vue'),
      },
      {
        path: 'estadisticas',
        name: 'admin-estadisticas',
        component: () => import('@/views/admin/Estadisticas.vue'),
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'no-encontrado',
    component: () => import('@/views/errors/NoEncontrado.vue'),
  },
]
