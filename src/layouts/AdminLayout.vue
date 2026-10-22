<script setup>
import { useAuth } from '@/composables/useAuth'

const { user, cerrarSesion } = useAuth()

const menu = [
  { to: { name: 'admin-sedes' }, texto: 'Sedes' },
  { to: { name: 'admin-servicios' }, texto: 'Servicios' },
  { to: { name: 'admin-estadisticas' }, texto: 'Estadísticas' },
  { to: { name: 'panel-asesor' }, texto: 'Panel de asesor' },
]
</script>

<template>
  <div class="admin-layout">
    <aside class="menu">
      <strong class="marca">Digiturno</strong>
      <nav>
        <RouterLink v-for="item in menu" :key="item.texto" :to="item.to">
          {{ item.texto }}
        </RouterLink>
      </nav>
      <div class="usuario">
        <span>{{ user?.nombre }}</span>
        <button type="button" class="btn btn-sm" @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </aside>
    <main class="contenido">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 220px 1fr;
}
.menu {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 1rem;
  background: var(--color-superficie);
  border-right: 1px solid var(--color-borde);
}
nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}
nav a {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radio);
  color: inherit;
  text-decoration: none;
}
nav a.router-link-active {
  background: var(--color-primario);
  color: #fff;
}
.usuario {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.contenido {
  padding: 1.5rem;
}
</style>
