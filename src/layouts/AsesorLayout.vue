<script setup>
import { useAuth } from '@/composables/useAuth'

const { user, cerrarSesion } = useAuth()
</script>

<template>
  <div class="asesor-layout">
    <header class="barra">
      <strong>Digiturno · Asesor</strong>
      <div class="usuario">
        <span>{{ user?.nombre }}</span>
        <button type="button" @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </header>
    <main class="contenido">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.asesor-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.barra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: var(--color-superficie);
  border-bottom: 1px solid var(--color-borde);
}
.usuario {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.contenido {
  flex: 1;
  padding: 1.5rem;
}
</style>
