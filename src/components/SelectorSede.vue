<script setup>
import { ref, onMounted } from 'vue'
import { sedesApi } from '@/api/sedesApi'

const sedeId = defineModel({ default: null })
const sedes = ref([])

onMounted(async () => {
  try {
    sedes.value = await sedesApi.listar()
    if (sedeId.value == null && sedes.value.length) sedeId.value = sedes.value[0].id
  } catch {
    sedes.value = []
  }
})
</script>

<template>
  <label class="campo">
    Sede
    <select v-model="sedeId">
      <option v-for="sede in sedes" :key="sede.id" :value="sede.id">{{ sede.nombre }}</option>
    </select>
  </label>
</template>
