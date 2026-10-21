<template>
  <div class="no-encontrado">
    <h1>404</h1>
    <p>La página que buscas no existe.</p>
    <RouterLink to="/">Volver al inicio</RouterLink>
  </div>
</template>

<style scoped>
.no-encontrado {
  min-height: 100vh;
  display: grid;
  place-content: center;
  text-align: center;
}
</style>
