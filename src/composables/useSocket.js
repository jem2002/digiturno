import { ref, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/stores/authStore'

let socket = null
const conectado = ref(false)

function obtenerSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 2000,
      auth: (cb) => cb({ token: useAuthStore().token }),
    })
    socket.on('connect', () => (conectado.value = true))
    socket.on('disconnect', () => (conectado.value = false))
  }
  if (!socket.connected) socket.connect()
  return socket
}

export function useSocket() {
  const s = obtenerSocket()
  const suscripciones = []

  function on(evento, handler) {
    s.on(evento, handler)
    suscripciones.push([evento, handler])
  }

  function emit(evento, ...args) {
    s.emit(evento, ...args)
  }

  onBeforeUnmount(() => {
    suscripciones.forEach(([evento, handler]) => s.off(evento, handler))
  })

  return { socket: s, conectado, on, emit }
}
