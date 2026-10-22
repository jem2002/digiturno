export function leerTexto(clave) {
  return localStorage.getItem(clave) ?? sessionStorage.getItem(clave)
}

export function leerJson(clave) {
  try {
    const valor = leerTexto(clave)
    return valor ? JSON.parse(valor) : null
  } catch {
    borrar(clave)
    return null
  }
}

export function borrar(clave) {
  localStorage.removeItem(clave)
  sessionStorage.removeItem(clave)
}
