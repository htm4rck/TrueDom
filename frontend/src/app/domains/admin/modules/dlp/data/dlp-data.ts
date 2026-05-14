export const kpis = [
  { label: 'Registros cargados', value: '180,426', icon: 'database', tone: 'text-blue-600' },
  { label: 'Avance proceso', value: '87.4%', icon: 'activity', tone: 'text-emerald-600' },
  { label: 'Dominios pendientes', value: '18', icon: 'globe-lock', tone: 'text-amber-600' },
  { label: 'Destinatarios pendientes', value: '4,218', icon: 'mail-question-mark', tone: 'text-sky-600' },
  { label: 'Inconsistencias abiertas', value: '7', icon: 'badge-alert', tone: 'text-red-600' },
  { label: 'Casos vencidos', value: '126', icon: 'alarm-clock', tone: 'text-orange-600' },
];

export const lots = [
  ['2026-04', 'DLP_ABR_2026.xlsx', 'CON_OBSERVACIONES', '180,426', '157,694', 'admin.dlp@alicorp.com.pe'],
  ['2026-03', 'DLP_MAR_2026.xlsx', 'CERRADO', '176,801', '176,801', 'admin.dlp@alicorp.com.pe'],
  ['2026-02', 'DLP_FEB_2026.xlsx', 'CERRADO', '169,332', '169,332', 'seguridad@alicorp.com.pe'],
  ['2026-01', 'DLP_ENE_2026.xlsx', 'PROCESADO', '172,980', '172,980', 'admin.dlp@alicorp.com.pe'],
];

export const pendingDomains = [
  ['dropbox-transfer.com', '1,248', '84', '311', 'Alta recurrencia en VP Supply'],
  ['freemail-share.net', '982', '61', '144', 'Usuarios de multiples gerencias'],
  ['vendor-docs.io', '753', '38', '97', 'Nuevo proveedor sin clasificacion'],
  ['temporary-mail.org', '421', '22', '58', 'Patron riesgoso detectado'],
];

export const pendingRecipients = [
  ['proveedor.qa@gmail.com', 'gmail.com', 'INC-90812', 'Proteccion de datos personales', 'Pendiente'],
  ['logistica.externos@vendor-docs.io', 'vendor-docs.io', 'INC-90844', 'Envio externo masivo', 'Pendiente'],
  ['auditoria@partner.pe', 'partner.pe', 'INC-90901', 'Informacion financiera', 'Vencido'],
  ['contacto@dropbox-transfer.com', 'dropbox-transfer.com', 'INC-90928', 'Adjuntos sensibles', 'Pendiente'],
];

export const inconsistencies = [
  ['proveedor.qa@gmail.com', 'gmail.com', '8', '3', 'ABIERTA'],
  ['contacto@partner.pe', 'partner.pe', '4', '4', 'EN_REVISION'],
  ['soporte@vendor-docs.io', 'vendor-docs.io', '11', '2', 'ABIERTA'],
];

export const audit = [
  ['2026-05-12 18:48', 'admin.dlp@alicorp.com.pe', 'LOTE_CARGA_DLP', 'Carga de archivo mensual'],
  ['2026-05-12 19:03', 'batch:true-dom', 'DETALLE_LOTE_DLP', 'Procesamiento inicial lote 2026-04'],
  ['2026-05-12 19:17', 'usuario1@alicorp.com.pe', 'VALIDACION_DESTINATARIO', 'Decision: SEGURO'],
  ['2026-05-12 19:25', 'admin.dlp@alicorp.com.pe', 'INCONSISTENCIA_VALIDACION', 'Solicitud de mayor sustento'],
];

export const reports = [
  ['Resumen mensual', 'Totales de carga, procesamiento, pendientes e inconsistencias', 'Excel / CSV'],
  ['Reporte por dominio', 'Frecuencia, estado, usuarios afectados y clasificacion', 'Excel'],
  ['Reporte por destinatario', 'Decisiones por usuario, justificaciones y estado final', 'Excel'],
  ['Reporte por usuario', 'Incidentes, pendientes, aprobaciones y rechazos', 'CSV'],
];
