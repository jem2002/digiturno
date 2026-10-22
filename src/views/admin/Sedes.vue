<script setup>
import { ref, onMounted } from 'vue'
import { sedesApi } from '@/api/sedesApi'
import { mensajeError } from '@/api/axiosUsuario'

const sedeVacia = () => ({ nombre: '', codigo: '', direccion: '', activa: true })

const sedes = ref([])
const cargando = ref(false)
const error = ref('')
const form = ref(null)
const editandoId = ref(null)
const guardando = ref(false)

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    sedes.value = await sedesApi.listar()
  } catch (e) {
    error.value = mensajeError(e, 'No se pudieron cargar las sedes')
  } finally {
    cargando.value = false
  }
}

function nueva() {
  editandoId.value = null
  form.value = sedeVacia()
}

function editar(sede) {
  editandoId.value = sede.id
  form.value = {
    nombre: sede.nombre,
    codigo: sede.codigo,
    direccion: sede.direccion,
    activa: sede.activa,
  }
}

async function guardar() {
  guardando.value = true
  error.value = ''
  try {
    if (editandoId.value) await sedesApi.actualizar(editandoId.value, form.value)
    else await sedesApi.crear(form.value)
    form.value = null
    await cargar()
  } catch (e) {
    error.value = mensajeError(e, 'No se pudo guardar la sede')
  } finally {
    guardando.value = false
  }
}

async function eliminar(sede) {
  if (!confirm(`¿Eliminar la sede "${sede.nombre}"? También se eliminan sus servicios.`)) return
  try {
    await sedesApi.eliminar(sede.id)
    await cargar()
  } catch (e) {
    error.value = mensajeError(e, 'No se pudo eliminar la sede')
  }
}

onMounted(cargar)
</script>

<template>
  <div>
    <header class="encabezado">
      <div>
        <h1>Sedes</h1>
        <p>Puntos de atención y sus pantallas</p>
      </div>
      <button type="button" class="btn btn-primario" @click="nueva">+ Nueva sede</button>
    </header>

    <p v-if="error" class="alerta-error">{{ error }}</p>

    <form v-if="form" class="tarjeta formulario" @submit.prevent="guardar">
      <h2>{{ editandoId ? 'Editar sede' : 'Nueva sede' }}</h2>
      <div class="fila">
        <label class="campo crece">
          Nombre
          <input v-model.trim="form.nombre" required />
        </label>
        <label class="campo">
          Código (URL)
          <input
            v-model.trim="form.codigo"
            pattern="[a-z0-9-]+"
            title="Solo minúsculas, números y guiones"
            placeholder="sede-centro"
            required
          />
        </label>
      </div>
      <label class="campo">
        Dirección
        <input v-model.trim="form.direccion" />
      </label>
      <label class="check">
        <input v-model="form.activa" type="checkbox" />
        Activa
      </label>
      <div class="fila">
        <button type="submit" class="btn btn-primario" :disabled="guardando">Guardar</button>
        <button type="button" class="btn" @click="form = null">Cancelar</button>
      </div>
    </form>

    <div class="tarjeta">
      <p v-if="cargando" class="vacio">Cargando…</p>
      <p v-else-if="!sedes.length" class="vacio">Aún no hay sedes</p>
      <table v-else class="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th>Pantallas</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="sede in sedes" :key="sede.id">
            <td>{{ sede.nombre }}</td>
            <td>
              <code>{{ sede.codigo }}</code>
            </td>
            <td>{{ sede.direccion }}</td>
            <td>
              <span :class="['etiqueta', { 'etiqueta-exito': sede.activa }]">
                {{ sede.activa ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td>
              <div class="pantallas">
                <RouterLink :to="`/sede/${sede.codigo}/kiosko`" target="_blank">Kiosko</RouterLink>
                <RouterLink :to="`/sede/${sede.codigo}/tv`" target="_blank">TV</RouterLink>
                <RouterLink :to="`/sede/${sede.codigo}/agendar`" target="_blank"
                  >Agendar</RouterLink
                >
              </div>
            </td>
            <td>
              <div class="acciones">
                <button type="button" class="btn btn-sm" @click="editar(sede)">Editar</button>
                <button type="button" class="btn btn-sm btn-peligro" @click="eliminar(sede)">
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
.pantallas {
  display: flex;
  gap: 0.75rem;
}
.alerta-error {
  margin-bottom: 1rem;
}
</style>
