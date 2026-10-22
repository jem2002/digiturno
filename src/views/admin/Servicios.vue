<script setup>
import { ref, watch } from 'vue'
import { serviciosApi } from '@/api/serviciosApi'
import { mensajeError } from '@/api/axiosUsuario'
import SelectorSede from '@/components/SelectorSede.vue'

const servicioVacio = () => ({ nombre: '', prefijo: '', descripcion: '', activo: true })

const sedeId = ref(null)
const servicios = ref([])
const cargando = ref(false)
const error = ref('')
const form = ref(null)
const editandoId = ref(null)
const guardando = ref(false)

async function cargar() {
  if (!sedeId.value) return
  cargando.value = true
  error.value = ''
  try {
    servicios.value = await serviciosApi.listarPorSede(sedeId.value)
  } catch (e) {
    error.value = mensajeError(e, 'No se pudieron cargar los servicios')
  } finally {
    cargando.value = false
  }
}

watch(sedeId, () => {
  form.value = null
  cargar()
})

function nuevo() {
  editandoId.value = null
  form.value = servicioVacio()
}

function editar(servicio) {
  editandoId.value = servicio.id
  form.value = {
    nombre: servicio.nombre,
    prefijo: servicio.prefijo,
    descripcion: servicio.descripcion,
    activo: servicio.activo,
  }
}

async function guardar() {
  guardando.value = true
  error.value = ''
  const datos = { ...form.value, prefijo: form.value.prefijo.toUpperCase() }
  try {
    if (editandoId.value) await serviciosApi.actualizar(editandoId.value, datos)
    else await serviciosApi.crear({ ...datos, sedeId: sedeId.value })
    form.value = null
    await cargar()
  } catch (e) {
    error.value = mensajeError(e, 'No se pudo guardar el servicio')
  } finally {
    guardando.value = false
  }
}

async function eliminar(servicio) {
  if (!confirm(`¿Eliminar el servicio "${servicio.nombre}"?`)) return
  try {
    await serviciosApi.eliminar(servicio.id)
    await cargar()
  } catch (e) {
    error.value = mensajeError(e, 'No se pudo eliminar el servicio')
  }
}
</script>

<template>
  <div>
    <header class="encabezado">
      <div>
        <h1>Servicios</h1>
        <p>Lo que el usuario puede elegir en el kiosko</p>
      </div>
      <div class="fila">
        <SelectorSede v-model="sedeId" />
        <button type="button" class="btn btn-primario" :disabled="!sedeId" @click="nuevo">
          + Nuevo servicio
        </button>
      </div>
    </header>

    <p v-if="error" class="alerta-error">{{ error }}</p>

    <form v-if="form" class="tarjeta formulario" @submit.prevent="guardar">
      <h2>{{ editandoId ? 'Editar servicio' : 'Nuevo servicio' }}</h2>
      <div class="fila">
        <label class="campo crece">
          Nombre
          <input v-model.trim="form.nombre" required />
        </label>
        <label class="campo">
          Prefijo del turno
          <input
            v-model.trim="form.prefijo"
            class="prefijo"
            maxlength="3"
            pattern="[A-Za-z]+"
            title="Solo letras"
            placeholder="A"
            required
          />
        </label>
      </div>
      <label class="campo">
        Descripción (se muestra en el kiosko)
        <input v-model.trim="form.descripcion" />
      </label>
      <label class="check">
        <input v-model="form.activo" type="checkbox" />
        Activo
      </label>
      <div class="fila">
        <button type="submit" class="btn btn-primario" :disabled="guardando">Guardar</button>
        <button type="button" class="btn" @click="form = null">Cancelar</button>
      </div>
    </form>

    <div class="tarjeta">
      <p v-if="cargando" class="vacio">Cargando…</p>
      <p v-else-if="!servicios.length" class="vacio">Esta sede aún no tiene servicios</p>
      <table v-else class="tabla">
        <thead>
          <tr>
            <th>Prefijo</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="servicio in servicios" :key="servicio.id">
            <td>
              <strong>{{ servicio.prefijo }}</strong>
            </td>
            <td>{{ servicio.nombre }}</td>
            <td>{{ servicio.descripcion }}</td>
            <td>
              <span :class="['etiqueta', { 'etiqueta-exito': servicio.activo }]">
                {{ servicio.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div class="acciones">
                <button type="button" class="btn btn-sm" @click="editar(servicio)">Editar</button>
                <button type="button" class="btn btn-sm btn-peligro" @click="eliminar(servicio)">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.formulario {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.crece {
  flex: 1;
}
.prefijo {
  width: 120px;
  text-transform: uppercase;
}
.alerta-error {
  margin-bottom: 1rem;
}
</style>
