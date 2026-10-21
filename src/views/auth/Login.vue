<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api/authApi'
import { mensajeError } from '@/api/axiosUsuario'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = ref({ usuario: '', password: '' })
const cargando = ref(false)
const error = ref('')

async function ingresar() {
  error.value = ''
  cargando.value = true
  try {
    const { token, usuario } = await authApi.login(form.value)
    authStore.login(usuario, token)

    if (!authStore.rutaInicio) {
      authStore.salida()
      error.value = 'Tu usuario no tiene un rol con acceso a esta aplicación'
      return
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    await router.replace(redirect || authStore.rutaInicio)
  } catch (e) {
    error.value = mensajeError(e, 'Usuario o contraseña incorrectos')
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login">
    <form class="tarjeta" @submit.prevent="ingresar">
      <h1>Digiturno</h1>
      <label>
        Usuario
        <input v-model.trim="form.usuario" autocomplete="username" required />
      </label>
      <label>
        Contraseña
        <input v-model="form.password" type="password" autocomplete="current-password" required />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="cargando">
        {{ cargando ? 'Ingresando…' : 'Ingresar' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
}
.tarjeta {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: var(--color-superficie);
  border-radius: var(--radio);
  box-shadow: 0 4px 20px rgb(0 0 0 / 0.08);
}
h1 {
  margin: 0;
  text-align: center;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
input {
  padding: 0.6rem;
  border: 1px solid var(--color-borde);
  border-radius: var(--radio);
}
button {
  padding: 0.7rem;
  border: none;
  border-radius: var(--radio);
  background: var(--color-primario);
  color: #fff;
}
button:disabled {
  opacity: 0.6;
}
.error {
  margin: 0;
  color: var(--color-error);
}
</style>
