<script setup>
import { TipoTurno } from '@/constants/turnos'

defineProps({ tipo: { type: String, required: true } })
</script>

<template>
  <span v-if="tipo === TipoTurno.PREFERENCIAL" class="etiqueta etiqueta-alerta">Preferencial</span>
  <span v-else-if="tipo === TipoTurno.CITA" class="etiqueta etiqueta-info">Cita</span>
</template>
