<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { sedesApi } from '@/api/sedesApi'
import { mensajeError } from '@/api/axiosUsuario'
import { useColaEnVivo } from '@/composables/useColaEnVivo'
import { useAhora } from '@/composables/useAhora'
import EtiquetaTipo from '@/components/EtiquetaTipo.vue'

const route = useRoute()
const sede = ref(null)
const error = ref('')
const sedeId = computed(() => sede.value?.id ?? null)
const sonidoActivo = ref(false)
const ahora = useAhora()

const { cola, conectado } = useColaEnVivo(sedeId, { alLlamar: anunciar })

const anteriores = computed(() => cola.ultimosLlamados.slice(1))
const hora = computed(() =>
  new Date(ahora.value).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
)

onMounted(async () => {
  try {
    sede.value = await sedesApi.obtener(route.params.sede)
  } catch (e) {
    error.value = mensajeError(e, 'No se pudo cargar la sede')
  }
})

let audio
function activarSonido() {
  audio ??= new AudioContext()
  audio.resume()
  sonidoActivo.value = true
}

function campana() {
  const tonos = [880, 660]
  tonos.forEach((frecuencia, i) => {
    const oscilador = audio.createOscillator()
    const volumen = audio.createGain()
    const inicio = audio.currentTime + i * 0.35
    oscilador.frequency.value = frecuencia
    oscilador.connect(volumen)
    volumen.connect(audio.destination)
    volumen.gain.setValueAtTime(0.3, inicio)
    volumen.gain.exponentialRampToValueAtTime(0.001, inicio + 0.6)
    oscilador.start(inicio)
    oscilador.stop(inicio + 0.6)
  })
}

function textoParaVoz(turno) {
  const [letras, numero] = turno.codigo.split('-')
  return `Turno ${letras.split('').join(' ')} ${Number(numero)}, ${turno.moduloNombre}`
}

function anunciar(turno) {
  if (!sonidoActivo.value) return
  campana()
  if (!('speechSynthesis' in window)) return
  const voz = new SpeechSynthesisUtterance(textoParaVoz(turno))
  voz.lang = 'es-ES'
  voz.rate = 0.9
  setTimeout(() => {
    speechSynthesis.cancel()
    speechSynthesis.speak(voz)
  }, 800)
}
</script>

<template>
  <div class="tv">
    <header class="cabecera">
      <h1>{{ sede?.nombre ?? 'Digiturno' }}</h1>
      <div class="estado">
        <span :class="['punto', { desconectado: !conectado }]" />
        <span class="hora">{{ hora }}</span>
      </div>
    </header>

    <p v-if="error" class="alerta-error mensaje">{{ error }}</p>

    <main v-else class="contenido">
      <section class="actual">
        <p class="rotulo">Turno</p>
        <template v-if="cola.turnoActual">
          <div :key="`${cola.turnoActual.id}-${cola.turnoActual.llamadas}`" class="llamado">
            <p class="codigo">{{ cola.turnoActual.codigo }}</p>
            <p class="modulo">{{ cola.turnoActual.moduloNombre }}</p>
            <EtiquetaTipo :tipo="cola.turnoActual.tipo" />
          </div>
        </template>
        <p v-else class="sin-turnos">Esperando turnos…</p>
      </section>

      <aside class="historial">
        <h2>Últimos llamados</h2>
        <ul>
          <li v-for="turno in anteriores" :key="turno.id">
            <span class="codigo-pequeno">{{ turno.codigo }}</span>
            <span>{{ turno.moduloNombre }}</span>
          </li>
        </ul>
        <p v-if="!anteriores.length" class="sin-turnos">—</p>
      </aside>
    </main>

    <footer class="pie">
      Turnos en espera: <strong>{{ cola.totalEnEspera }}</strong>
    </footer>

    <button v-if="!sonidoActivo" type="button" class="activar-sonido" @click="activarSonido">
      Toca la pantalla para activar el sonido
    </button>
  </div>
</template>

<style scoped>
.tv {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  color: #f8fafc;
}
.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2.5rem;
  background: #1e293b;
}
.cabecera h1 {
  font-size: 2rem;
}
.estado {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.hora {
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
}
.punto {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
}
.punto.desconectado {
  background: #ef4444;
}
.mensaje {
  margin: 2rem;
}
.contenido {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  padding: 2rem 2.5rem;
}
.actual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: #1e293b;
  text-align: center;
}
.rotulo {
  margin: 0;
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #94a3b8;
}
.llamado {
  animation: destello 1s ease-in-out 3;
}
.codigo {
  margin: 0;
  font-size: clamp(6rem, 14vw, 12rem);
  font-weight: 800;
  line-height: 1;
  color: #facc15;
}
.modulo {
  margin: 1rem 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 600;
}
.historial {
  padding: 1.5rem;
  border-radius: 24px;
  background: #1e293b;
}
.historial h2 {
  margin-bottom: 1rem;
  font-size: 1.4rem;
  color: #94a3b8;
}
.historial ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.historial li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #334155;
  font-size: 1.6rem;
}
.codigo-pequeno {
  font-size: 2.2rem;
  font-weight: 700;
}
.sin-turnos {
  font-size: 1.8rem;
  color: #64748b;
}
.pie {
  padding: 1rem 2.5rem;
  background: #1e293b;
  font-size: 1.4rem;
}
.activar-sonido {
  position: fixed;
  inset: 0;
  border: none;
  background: rgb(15 23 42 / 0.85);
  color: #fff;
  font-size: 2rem;
}

@keyframes destello {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}
</style>
