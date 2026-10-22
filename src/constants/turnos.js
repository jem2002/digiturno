export const EstadoTurno = {
  EN_ESPERA: 'EN_ESPERA',
  LLAMADO: 'LLAMADO',
  EN_ATENCION: 'EN_ATENCION',
  ATENDIDO: 'ATENDIDO',
  AUSENTE: 'AUSENTE',
  CANCELADO: 'CANCELADO',
}

export const ETIQUETA_ESTADO = {
  EN_ESPERA: 'En espera',
  LLAMADO: 'Llamado',
  EN_ATENCION: 'En atención',
  ATENDIDO: 'Atendido',
  AUSENTE: 'Ausente',
  CANCELADO: 'Cancelado',
}

export const TipoTurno = {
  GENERAL: 'GENERAL',
  PREFERENCIAL: 'PREFERENCIAL',
  CITA: 'CITA',
}

export const PRIORIDAD_TIPO = {
  PREFERENCIAL: 0,
  CITA: 1,
  GENERAL: 2,
}

export const EventosSocket = {
  UNIRSE_SEDE: 'sede:unirse',
  SALIR_SEDE: 'sede:salir',
  TURNO_CREADO: 'turno:creado',
  TURNO_LLAMADO: 'turno:llamado',
  TURNO_ACTUALIZADO: 'turno:actualizado',
  COLA_ACTUALIZADA: 'cola:actualizada',
}
