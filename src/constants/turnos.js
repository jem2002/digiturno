export const EstadoTurno = {
  EN_ESPERA: 'EN_ESPERA',
  LLAMADO: 'LLAMADO',
  EN_ATENCION: 'EN_ATENCION',
  ATENDIDO: 'ATENDIDO',
  AUSENTE: 'AUSENTE',
  CANCELADO: 'CANCELADO',
}

export const TipoTurno = {
  GENERAL: 'GENERAL',
  PREFERENCIAL: 'PREFERENCIAL',
  CITA: 'CITA',
}

export const EventosSocket = {
  UNIRSE_SEDE: 'sede:unirse',
  SALIR_SEDE: 'sede:salir',
  TURNO_CREADO: 'turno:creado',
  TURNO_LLAMADO: 'turno:llamado',
  TURNO_ACTUALIZADO: 'turno:actualizado',
  COLA_ACTUALIZADA: 'cola:actualizada',
}
