<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { sedesApi } from '@/api/sedesApi'
import { serviciosApi } from '@/api/serviciosApi'
import { turnosApi } from '@/api/turnosApi'
import { citasApi } from '@/api/citasApi'
import { mensajeError } from '@/api/axiosUsuario'
import { TipoTurno } from '@/constants/turnos'
import { formatearFecha, formatearHora } from '@/utils/formato'

const SEGUNDOS_TICKET = 10

const route = useRoute()
const sede = ref(null)
const servicios = ref([])
const cargando = ref(true)
const errorCarga = ref('')

const paso = ref('servicio')
const servicioElegido = ref(null)
const codigoCita = ref('')
const turno = ref(null)
const procesando = ref(false)
const error = ref('')
const segundosRestantes = ref(0)
let cuentaRegresiva

const serviciosActivos = computed(() => servicios.value.filter((s) => s.activo))

onMounted(async () => {
  try {
    sede.value = await sedesApi.obtener(route.params.sede)
    servicios.value = await serviciosApi.listarPorSede(sede.value.id)
  } catch (e) {
    errorCarga.value = mensajeError(e, 'No se pudo cargar la sede')
  } finally {
    cargando.value = false
  }
})

onBeforeUnmount(() => clearInterval(cuentaRegresiva))

function elegirServicio(servicio) {
  servicioElegido.value = servicio
  paso.value = 'tipo'
}

async function solicitarTurno(tipo) {
  await procesar(() =>
    turnosApi.crear({ sedeId: sede.value.id, servicioId: servicioElegido.value.id, tipo }),
  )
}

async function registrarCita() {
  await procesar(() => citasApi.checkin(sede.value.id, codigoCita.value))
}

async function procesar(accion) {
  error.value = ''
  procesando.value = true
  try {
    turno.value = await accion()
    mostrarTicket()
  } catch (e) {
    error.value = mensajeError(e, 'No se pudo generar el turno')
  } finally {
    procesando.value = false
  }
}

function mostrarTicket() {
  paso.value = 'ticket'
  segundosRestantes.value = SEGUNDOS_TICKET
  cuentaRegresiva = setInterval(() => {
    segundosRestantes.value -= 1
    if (segundosRestantes.value <= 0) reiniciar()
  }, 1000)
}

function reiniciar() {
  clearInterval(cuentaRegresiva)
  paso.value = 'servicio'
  servicioElegido.value = null
  codigoCita.value = ''
  turno.value = null
  error.value = ''
}

function imprimir() {
  window.print()
}
</script>

<template>
  <div class="kiosko">
    <header class="cabecera">
      <h1>{{ sede?.nombre ?? 'Digiturno' }}</h1>
    </header>

    <main class="cuerpo">
      <p v-if="cargando" class="mensaje">Cargando…</p>
      <p v-else-if="errorCarga" class="mensaje alerta-error">{{ errorCarga }}</p>

      <section v-else-if="paso === 'servicio'" class="paso">
        <h2>Bienvenido, ¿qué necesitas hoy?</h2>
        <div class="opciones">
          <button
            v-for="servicio in serviciosActivos"
            :key="servicio.id"
            type="button"
            class="opcion"
            @click="elegirServicio(servicio)"
          >
            <strong>{{ servicio.nombre }}</strong>
            <span>{{ servicio.descripcion }}</span>
          </button>
        </div>
        <p v-if="!serviciosActivos.length" class="mensaje">No hay servicios disponibles.</p>
        <button type="button" class="enlace" @click="paso = 'cita'">Tengo una cita</button>
      </section>

      <section v-else-if="paso === 'tipo'" class="paso">
        <h2>{{ servicioElegido.nombre }}</h2>
        <p class="subtitulo">Selecciona el tipo de turno</p>
        <div class="opciones">
          <button
            type="button"
            class="opcion"
            :disabled="procesando"
            @click="solicitarTurno(TipoTurno.GENERAL)"
          >
            <strong>General</strong>
          </button>
          <button
            type="button"
            class="opcion preferencial"
            :disabled="procesando"
            @click="solicitarTurno(TipoTurno.PREFERENCIAL)"
          >
            <strong>Preferencial</strong>
            <span>Adultos mayores, embarazadas, personas con discapacidad</span>
          </button>
        </div>
        <p v-if="error" class="alerta-error">{{ error }}</p>
        <button type="button" class="enlace" @click="reiniciar">← Volver</button>
      </section>

      <section v-else-if="paso === 'cita'" class="paso">
        <h2>Registrar mi cita</h2>
        <p class="subtitulo">Escribe el código que recibiste al agendar</p>
        <form class="form-cita" @submit.prevent="registrarCita">
          <input
            v-model.trim="codigoCita"
            class="input-cita"
            maxlength="6"
            placeholder="ABC123"
            autocomplete="off"
            required
          />
          <button type="submit" class="btn btn-primario boton-grande" :disabled="procesando">
            Confirmar
          </button>
        </form>
        <p v-if="error" class="alerta-error">{{ error }}</p>
        <button type="button" class="enlace" @click="reiniciar">← Volver</button>
      </section>

      <section v-else-if="paso === 'ticket'" class="paso">
        <div class="ticket">
          <p class="ticket-sede">{{ sede.nombre }}</p>
          <p>Tu turno es</p>
          <p class="ticket-codigo">{{ turno.codigo }}</p>
          <p class="ticket-servicio">{{ turno.servicioNombre }}</p>
          <p v-if="turno.tipo !== TipoTurno.GENERAL" class="ticket-tipo">
            {{ turno.tipo === TipoTurno.PREFERENCIAL ? 'Preferencial' : 'Cita' }}
          </p>
          <p>
            Personas antes de ti: <strong>{{ turno.personasAdelante ?? '—' }}</strong>
          </p>
          <p class="ticket-fecha">
            {{ formatearFecha(turno.creadoEn) }} · {{ formatearHora(turno.creadoEn) }}
          </p>
        </div>
        <p class="subtitulo">Espera a ser llamado en la pantalla</p>
        <div class="fila centrado">
          <button type="button" class="btn boton-grande" @click="imprimir">Imprimir</button>
          <button type="button" class="btn btn-primario boton-grande" @click="reiniciar">
            Listo ({{ segundosRestantes }})
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.kiosko {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.cabecera {
  padding: 1.25rem 2rem;
  background: var(--color-primario);
  color: #fff;
  text-align: center;
}
.cuerpo {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 2rem;
}
.paso {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}
.paso h2 {
  font-size: 2rem;
}
.subtitulo,
.mensaje {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-texto-suave);
}
.opciones {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
.opcion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
  min-height: 140px;
  padding: 1.5rem;
  border: 2px solid var(--color-borde);
  border-radius: 16px;
  background: var(--color-superficie);
  font-size: 1rem;
  color: var(--color-texto-suave);
  transition:
    border-color 0.15s,
    transform 0.1s;
}
.opcion strong {
  font-size: 1.6rem;
  color: var(--color-texto);
}
.opcion:hover:not(:disabled) {
  border-color: var(--color-primario);
}
.opcion:active:not(:disabled) {
  transform: scale(0.98);
}
.opcion.preferencial {
  border-color: #fbbf24;
}
.enlace {
  border: none;
  background: none;
  color: var(--color-primario);
  font-size: 1.1rem;
}
.form-cita {
  display: flex;
  gap: 0.75rem;
}
.input-cita {
  width: 240px;
  padding: 0.75rem;
  border: 2px solid var(--color-borde);
  border-radius: var(--radio);
  font-size: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}
.boton-grande {
  padding: 0.9rem 1.75rem;
  font-size: 1.2rem;
}
.centrado {
  justify-content: center;
}
.ticket {
  min-width: 320px;
  padding: 2rem;
  border: 2px dashed var(--color-borde);
  border-radius: 16px;
  background: var(--color-superficie);
}
.ticket p {
  margin: 0.35rem 0;
}
.ticket-sede {
  font-weight: 600;
}
.ticket-codigo {
  font-size: 4.5rem;
  font-weight: 800;
  color: var(--color-primario);
  line-height: 1.1;
}
.ticket-servicio {
  font-size: 1.4rem;
}
.ticket-tipo {
  font-weight: 700;
  color: #b45309;
}
.ticket-fecha {
  font-size: 0.85rem;
  color: var(--color-texto-suave);
}

@media print {
  .cabecera,
  .subtitulo,
  .fila {
    display: none;
  }
  .ticket {
    border: none;
  }
}
</style>
