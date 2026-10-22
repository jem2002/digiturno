<script setup>
import { ref, computed, watch } from 'vue'
import { estadisticasApi } from '@/api/estadisticasApi'
import { mensajeError } from '@/api/axiosUsuario'
import { formatearDuracion } from '@/utils/formato'
import SelectorSede from '@/components/SelectorSede.vue'

const sedeId = ref(null)
const datos = ref(null)
const cargando = ref(false)
const error = ref('')

const indicadores = computed(() => {
  if (!datos.value) return []
  return [
    { titulo: 'Turnos del día', valor: datos.value.total },
    { titulo: 'En espera', valor: datos.value.enEspera },
    { titulo: 'Atendidos', valor: datos.value.atendidos },
    { titulo: 'Ausentes', valor: datos.value.ausentes },
    { titulo: 'Espera promedio', valor: formatearDuracion(datos.value.esperaPromedioMs) },
    { titulo: 'Atención promedio', valor: formatearDuracion(datos.value.atencionPromedioMs) },
  ]
})

const tablas = computed(() => [
  { titulo: 'Por servicio', filas: datos.value?.porServicio ?? [] },
  { titulo: 'Por asesor', filas: datos.value?.porAsesor ?? [] },
])

async function cargar() {
  if (!sedeId.value) return
  cargando.value = true
  error.value = ''
  try {
    datos.value = await estadisticasApi.delDia(sedeId.value)
  } catch (e) {
    error.value = mensajeError(e, 'No se pudieron cargar las estadísticas')
  } finally {
    cargando.value = false
  }
}

watch(sedeId, cargar)
</script>

<template>
  <div>
    <header class="encabezado">
      <div>
        <h1>Estadísticas</h1>
        <p>Resumen de hoy</p>
      </div>
      <div class="fila">
        <SelectorSede v-model="sedeId" />
        <button type="button" class="btn" :disabled="cargando" @click="cargar">Actualizar</button>
      </div>
    </header>

    <p v-if="error" class="alerta-error">{{ error }}</p>

    <template v-if="datos">
      <div class="indicadores">
        <div v-for="indicador in indicadores" :key="indicador.titulo" class="tarjeta indicador">
          <span>{{ indicador.titulo }}</span>
          <strong>{{ indicador.valor }}</strong>
        </div>
      </div>

      <div class="tablas">
        <section v-for="tabla in tablas" :key="tabla.titulo" class="tarjeta">
          <h2>{{ tabla.titulo }}</h2>
          <p v-if="!tabla.filas.length" class="vacio">Sin datos todavía</p>
          <table v-else class="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Total</th>
                <th>Atendidos</th>
                <th>Ausentes</th>
                <th>Espera prom.</th>
                <th>Atención prom.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fila in tabla.filas" :key="fila.nombre">
                <td>{{ fila.nombre }}</td>
                <td>{{ fila.total }}</td>
                <td>{{ fila.atendidos }}</td>
                <td>{{ fila.ausentes }}</td>
                <td>{{ formatearDuracion(fila.esperaPromedioMs) }}</td>
                <td>{{ formatearDuracion(fila.atencionPromedioMs) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </template>
    <p v-else-if="cargando" class="vacio">Cargando…</p>
  </div>
</template>

<style scoped>
.indicadores {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.indicador {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.indicador span {
  font-size: 0.85rem;
  color: var(--color-texto-suave);
}
.indicador strong {
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
}
.tablas {
  display: grid;
  gap: 1.25rem;
}
.tablas h2 {
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}
.alerta-error {
  margin-bottom: 1rem;
}
</style>
