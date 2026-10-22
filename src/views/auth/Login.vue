<template>
  <div class="login-wrapper">
    <div class="background-frame">
      <form class="glass-card" @submit.prevent="ingresar">
        <div class="tab-header">
          <span class="tab-title">Digiturno</span>
        </div>

        <div class="form-content">
          <div class="input-group">
            <label for="usuario" class="floating-badge">Usuario</label>
            <input
              id="usuario"
              v-model.trim="form.usuario"
              class="glass-input"
              autocomplete="username"
              required
            />
            <svg
              class="input-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </div>

          <div class="input-group">
            <label for="password" class="floating-badge">Contraseña</label>
            <input
              id="password"
              v-model="form.password"
              class="glass-input"
              :type="verPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="input-icon icon-button"
              :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="verPassword = !verPassword"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                <line v-if="verPassword" x1="3" y1="3" x2="21" y2="21" />
              </svg>
            </button>
          </div>

          <p v-if="error" class="error-message" role="alert">{{ error }}</p>

          <button type="submit" class="btn-submit" :disabled="cargando">
            {{ cargando ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

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
const recordar = ref(true)
const verPassword = ref(false)
const cargando = ref(false)
const error = ref('')

async function ingresar() {
  error.value = ''
  cargando.value = true
  try {
    const { token, usuario } = await authApi.login(form.value)
    authStore.login(usuario, token, recordar.value)

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

<style scoped>
.login-wrapper {
  min-height: 100vh;
  width: 100%;
  background-color: #0b2a5b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.background-frame {
  width: 100%;
  max-width: 1100px;
  min-height: 650px;
  padding: 1.5rem;
  border-radius: 28px;
  background:
    url('@/assets/img/fondo digiturno.png') center/cover no-repeat,
    #eef4fb;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card {
  width: 100%;
  max-width: 380px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.499);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(246, 245, 245, 0.8);
  box-shadow: 0 20px 40px rgba(11, 42, 91, 0.25);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-header {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 48px;
  background: #1d4ed8;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  border: 1.5px solid #1d4ed8;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.form-content {
  padding: 4.5rem 2rem 2.5rem 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.input-group {
  position: relative;
  margin-bottom: 1.75rem;
}

.floating-badge {
  position: absolute;
  top: -10px;
  left: 18px;
  background: #ffffff;
  font-size: 0.72rem;
  font-weight: 600;
  color: #0f172a;
  padding: 1px 10px;
  border-radius: 9999px;
  pointer-events: none;
  z-index: 10;
}

.glass-input {
  width: 100%;
  height: 48px;
  background: transparent;
  border: 1.5px solid rgba(29, 78, 216, 0.3);
  border-radius: 9999px;
  padding: 0 45px 0 20px;
  color: #0f172a;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.glass-input:focus {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.15);
}

.glass-input:-webkit-autofill {
  -webkit-text-fill-color: #0f172a;
  transition: background-color 9999s ease-in-out 0s;
}

.input-icon {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #1d4ed8;
}

.icon-button {
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.icon-button svg {
  width: 100%;
  height: 100%;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #1e293b;
  margin-bottom: 1.75rem;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox {
  accent-color: #1d4ed8;
  cursor: pointer;
}

.error-message {
  margin: 0 0 1.25rem;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  background: rgba(254, 226, 226, 0.9);
  border: 1px solid #fca5a5;
  color: #991b1b;
  font-size: 0.85rem;
  text-align: center;
}

.btn-submit {
  width: 100%;
  height: 46px;
  background-color: #1d4ed8;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(29, 78, 216, 0.35);
}

.btn-submit:hover:not(:disabled) {
  background-color: #1e40af;
  transform: translateY(-1px);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

@media (max-width: 480px) {
  .login-wrapper {
    padding: 0;
  }

  .background-frame {
    min-height: 100vh;
    border-radius: 0;
  }
}
</style>
