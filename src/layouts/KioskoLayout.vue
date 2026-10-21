<template>
  <main class="kiosko-layout">
    <RouterView />
  </main>
</template>

<style scoped>
.kiosko-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  user-select: none;
}
</style>
