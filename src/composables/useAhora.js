import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useAhora(intervaloMs = 1000) {
  const ahora = ref(Date.now())
  let intervalo

  onMounted(() => {
    intervalo = setInterval(() => (ahora.value = Date.now()), intervaloMs)
  })
  onBeforeUnmount(() => clearInterval(intervalo))

  return ahora
}
