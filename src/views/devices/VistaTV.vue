<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section>
    <h1>Turnos</h1>
    <p>
      Sede: <strong>{{ route.params.sede }}</strong>
    </p>
  </section>
</template>
