<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { Roles } from '@/constants/roles'
import { EstadoTurno, ETIQUETA_ESTADO } from '@/constants/turnos'
import { sedesApi } from '@/api/sedesApi'
import { serviciosApi } from '@/api/serviciosApi'
import { turnosApi } from '@/api/turnosApi'
import { mensajeError } from '@/api/axiosUsuario'
import { useColaEnVivo } from '@/composables/useColaEnVivo'
import { useAhora } from '@/composables/useAhora'
import { formatearDuracion, formatearHora } from '@/utils/formato'
import SelectorSede from '@/components/SelectorSede.vue'
import EtiquetaTipo from '@/components/EtiquetaTipo.vue'

const CLAVE_MODULO = 'asesor-modulo'

const authStore = useAuthStore()
const esAdmin = computed(() => authStore.rolUsuario === Roles.ADMIN)
const sedeId = ref(authStore.usuarioSedeId)
const modulos = ref([])
const servicios = ref([])
const moduloId = ref(null)
const servicioIds = ref([])
const turno = ref(null)
const servicioTransferencia = ref('')
const procesando = ref(false)
const error = ref('')

const { cola } = useColaEnVivo(sedeId)
const ahora = useAhora()

const colaFiltrada = computed(() =>
  cola.enEspera.filter(
    (t) => !servicioIds.value.length || servicioIds.value.includes(t.servicioId),
  ),
)
const tiempoTurno = computed(() => {
  if (!turno.value) return ''
  const desde = turno.value.iniciadoEn ?? turno.value.llamadoEn
  return formatearDuracion(ahora.value - Date.parse(desde))
})
const otrosServicios = computed(() =>
  servicios.value.filter((s) => s.activo && s.id !== turno.value?.servicioId),
)

watch(
  sedeId,
  async (id) => {
    modulos.value = []
    servicios.value = []
    servicioIds.value = []
    moduloId.value = null
    if (!id) return
    try {
      const [listaModulos, listaServicios] = await Promise.all([
        sedesApi.modulos(id),
        serviciosApi.listarPorSede(id),
      ])
      modulos.value = listaModulos
      servicios.value = listaServicios
      const guardado = Number(localStorage.getItem(CLAVE_MODULO))
      moduloId.value = listaModulos.some((m) => m.id === guardado) ? guardado : null
    } catch (e) {
      error.value = mensajeError(e)
    }
  },
  { immediate: true },
)

watch(moduloId, async (id) => {
  turno.value = null
  if (!id) return
  localStorage.setItem(CLAVE_MODULO, id)
  try {
    turno.value = await turnosApi.activo(sedeId.value, id)
  } catch (e) {
    error.value = mensajeError(e)
  }
})

async function ejecutar(accion, { terminaTurno = false } = {}) {
  error.value = ''
  procesando.value = true
  try {
    const resultado = await accion()
    turno.value = terminaTurno ? null : resultado
    servicioTransferencia.value = ''
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    procesando.value = false
  }
}

const llamarSiguiente = () =>
  ejecutar(() =>
    turnosApi.llamarSiguiente({
      sedeId: sedeId.value,
      moduloId: moduloId.value,
      servicioIds: servicioIds.value,
    }),
  )
const rellamar = () => ejecutar(() => turnosApi.rellamar(turno.value.id))
const iniciarAtencion = () => ejecutar(() => turnosApi.iniciarAtencion(turno.value.id))
const marcarAusente = () =>
  ejecutar(() => turnosApi.marcarAusente(turno.value.id), { terminaTurno: true })
const finalizar = () => ejecutar(() => turnosApi.finalizar(turno.value.id), { terminaTurno: true })
const transferir = () =>
  ejecutar(() => turnosApi.transferir(turno.value.id, servicioTransferencia.value), {
    terminaTurno: true,
  })
</script>

<template>
  <div class="panel">
    <aside class="tarjeta configuracion">
      <h2>Mi puesto</h2>
      <SelectorSede v-if="esAdmin" v-model="sedeId" />
      <label class="campo">
        Módulo
        <select v-model="moduloId" :disabled="!!turno">
          <option :value="null" disabled>Selecciona tu módulo</option>
          <option v-for="modulo in modulos" :key="modulo.id" :value="modulo.id">
            {{ modulo.nombre }}
          </option>
        </select>
      </label>
      <fieldset class="servicios">
        <legend>Servicios que atiendo</legend>
        <label v-for="servicio in servicios" :key="servicio.id" class="check">
          <input v-model="servicioIds" type="checkbox" :value="servicio.id" />
          {{ servicio.nombre }}
        </label>
        <small>Sin selección = todos</small>
      </fieldset>
    </aside>

    <section class="tarjeta atencion">
      <p v-if="error" class="alerta-error">{{ error }}</p>

      <div v-if="!moduloId" class="vacio">Selecciona tu módulo para empezar a atender.</div>

      <template v-else-if="turno">
        <div class="turno-actual">
          <span class="etiqueta etiqueta-info">{{ ETIQUETA_ESTADO[turno.estado] }}</span>
          <p class="codigo">{{ turno.codigo }}</p>
          <p class="servicio">{{ turno.servicioNombre }} <EtiquetaTipo :tipo="turno.tipo" /></p>
          <p class="tiempo">{{ tiempoTurno }}</p>
        </div>

        <div v-if="turno.estado === EstadoTurno.LLAMADO" class="acciones">
          <button type="button" class="btn" :disabled="procesando" @click="rellamar">
            Volver a llamar
          </button>
          <button
            type="button"
            class="btn btn-peligro"
            :disabled="procesando"
            @click="marcarAusente"
          >
            No se presentó
          </button>
          <button
            type="button"
            class="btn btn-primario"
            :disabled="procesando"
            @click="iniciarAtencion"
          >
            Iniciar atención
          </button>
        </div>

        <template v-else-if="turno.estado === EstadoTurno.EN_ATENCION">
          <div class="acciones">
            <button type="button" class="btn btn-exito" :disabled="procesando" @click="finalizar">
              Finalizar atención
            </button>
          </div>
          <div class="fila transferir">
            <label class="campo">
              Transferir a
              <select v-model="servicioTransferencia">
                <option value="" disabled>Servicio</option>
                <option v-for="servicio in otrosServicios" :key="servicio.id" :value="servicio.id">
                  {{ servicio.nombre }}
                </option>
              </select>
            </label>
            <button
              type="button"
              class="btn"
              :disabled="procesando || !servicioTransferencia"
              @click="transferir"
            >
              Transferir
            </button>
          </div>
        </template>
      </template>

      <div v-else class="sin-turno">
        <p>No tienes un turno en curso.</p>
        <button
          type="button"
          class="btn btn-primario llamar"
          :disabled="procesando || !colaFiltrada.length"
          @click="llamarSiguiente"
        >
          Llamar siguiente
        </button>
      </div>
    </section>

    <aside class="tarjeta cola">
      <h2>En espera ({{ colaFiltrada.length }})</h2>
      <ul>
        <li v-for="t in colaFiltrada" :key="t.id">
          <strong>{{ t.codigo }}</strong>
          <span>{{ t.servicioNombre }}</span>
          <EtiquetaTipo :tipo="t.tipo" />
          <small>{{ formatearHora(t.creadoEn) }}</small>
        </li>
      </ul>
      <p v-if="!colaFiltrada.length" class="vacio">No hay turnos en espera</p>
    </aside>
  </div>
</template>

<style scoped>
.panel {
  display: grid;
  grid-template-columns: 260px 1fr 300px;
  gap: 1.25rem;
  align-items: start;
}
.configuracion,
.cola {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.servicios {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0.75rem;
  border: 1px solid var(--color-borde);
  border-radius: var(--radio);
}
.servicios legend {
  font-size: 0.9rem;
  color: var(--color-texto-suave);
}
.servicios small {
  color: var(--color-texto-suave);
}
.atencion {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 420px;
  justify-content: center;
}
.turno-actual {
  text-align: center;
}
.turno-actual p {
  margin: 0.4rem 0;
}
.codigo {
  font-size: 5rem;
  font-weight: 800;
  color: var(--color-primario);
  line-height: 1.1;
}
.servicio {
  font-size: 1.3rem;
}
.tiempo {
  font-size: 1.5rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-texto-suave);
}
.acciones {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.transferir {
  justify-content: center;
}
.sin-turno {
  text-align: center;
  color: var(--color-texto-suave);
}
.llamar {
  padding: 1rem 2.5rem;
  font-size: 1.3rem;
}
.cola ul {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 60vh;
  overflow-y: auto;
}
.cola li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.25rem 0.5rem;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-borde);
}
.cola li small {
  grid-column: 1 / -1;
  color: var(--color-texto-suave);
}
</style>
