export function leerJson(clave) {
  try {
    const valor = localStorage.getItem(clave)
    return valor ? JSON.parse(valor) : null
  } catch {
    localStorage.removeItem(clave)
    return null
  }
}
