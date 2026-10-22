<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { sedesApi } from '@/api/sedesApi'
import { serviciosApi } from '@/api/serviciosApi'
import { citasApi } from '@/api/citasApi'
import { mensajeError } from '@/api/axiosUsuario'
import { fechaLocalIso, formatearFecha } from '@/utils/formato'

const HORA_INICIO = 8
const HORA_FIN = 17
const MINUTOS_INTERVALO = 30

const route = useRoute()
const sede = ref(null)
const servicios = ref([])
const errorCarga = ref('')

const formVacio = () => ({ nombre: '', documento: '', servicioId: '', fecha: '', hora: '' })
const form = ref(formVacio())
const enviando = ref(false)
const error = ref('')
const cita = ref(null)

const hoy = fechaLocalIso()
const serviciosActivos = computed(() => servicios.value.filter((s) => s.activo))
const horas = computed(() => {
  const lista = []
  for (let minutos = HORA_INICIO * 60; minutos < HORA_FIN * 60; minutos += MINUTOS_INTERVALO) {
    const h = String(Math.floor(minutos / 60)).padStart(2, '0')
    const m = String(minutos % 60).padStart(2, '0')
    lista.push(`${h}:${m}`)
  }
  return lista
})

onMounted(async () => {
  try {
    sede.value = await sedesApi.obtener(route.params.sede)
    servicios.value = await serviciosApi.listarPorSede(sede.value.id)
  } catch (e) {
    errorCarga.value = mensajeError(e, 'No se pudo cargar la sede')
  }
})

async function agendar() {
  error.value = ''
  enviando.value = true
  try {
    cita.value = await citasApi.crear({ ...form.value, sedeId: sede.value.id })
  } catch (e) {
    error.value = mensajeError(e, 'No se pudo agendar la cita')
  } finally {
    enviando.value = false
  }
}

function nuevaCita() {
  cita.value = null
  form.value = formVacio()
}
</script>

<template>
  <div class="agendamiento">
    <div class="tarjeta contenedor">
      <p v-if="errorCarga" class="alerta-error">{{ errorCarga }}</p>

      <template v-else-if="cita">
        <h1>¡Cita agendada!</h1>
        <p>Presenta este código en el kiosko de la sede el día de tu cita:</p>
        <p class="codigo">{{ cita.codigo }}</p>
        <dl class="resumen">
          <dt>Sede</dt>
          <dd>{{ cita.sedeNombre }}</dd>
          <dt>Servicio</dt>
          <dd>{{ cita.servicioNombre }}</dd>
          <dt>Fecha</dt>
          <dd>{{ formatearFecha(`${cita.fecha}T00:00`) }} · {{ cita.hora }}</dd>
          <dt>A nombre de</dt>
          <dd>{{ cita.nombre }}</dd>
        </dl>
        <button type="button" class="btn" @click="nuevaCita">Agendar otra cita</button>
      </template>

      <form v-else class="formulario" @submit.prevent="agendar">
        <div>
          <h1>Agendar cita</h1>
          <p class="subtitulo">{{ sede?.nombre }}</p>
        </div>
        <label class="campo">
          Nombre completo
          <input v-model.trim="form.nombre" required />
        </label>
        <label class="campo">
          Documento
          <input v-model.trim="form.documento" inputmode="numeric" required />
        </label>
        <label class="campo">
          Servicio
          <select v-model="form.servicioId" required>
            <option value="" disabled>Selecciona un servicio</option>
            <option v-for="servicio in serviciosActivos" :key="servicio.id" :value="servicio.id">
              {{ servicio.nombre }}
            </option>
          </select>
        </label>
        <div class="fila">
          <label class="campo crece">
            Fecha
            <input v-model="form.fecha" type="date" :min="hoy" required />
          </label>
          <label class="campo crece">
            Hora
            <select v-model="form.hora" required>
              <option value="" disabled>--:--</option>
              <option v-for="hora in horas" :key="hora" :value="hora">{{ hora }}</option>
            </select>
          </label>
        </div>
        <p v-if="error" class="alerta-error">{{ error }}</p>
        <button type="submit" class="btn btn-primario" :disabled="enviando || !sede">
          {{ enviando ? 'Agendando…' : 'Agendar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.agendamiento {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
}
.contenedor {
  width: 100%;
  max-width: 480px;
  padding: 2rem;
}
.formulario {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.subtitulo {
  margin: 0.25rem 0 0;
  color: var(--color-texto-suave);
}
.crece {
  flex: 1;
}
.codigo {
  margin: 1rem 0;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-align: center;
  color: var(--color-primario);
}
.resumen {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.4rem 1rem;
  margin: 0 0 1.5rem;
}
.resumen dt {
  color: var(--color-texto-suave);
}
.resumen dd {
  margin: 0;
}
</style>
