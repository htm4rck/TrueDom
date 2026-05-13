# Inventario de Pantallas y Dashboard  
## Proyecto DLP - Validación de Dominios y Destinatarios

## 1. Inventario de Pantallas

| Pantalla | Descripción | Estado | Endpoints |
|---|---|---|---|
| Login / Acceso | Pantalla de autenticación corporativa mediante Microsoft Entra ID. Permite validar identidad y rol del usuario. | MVP | `GET /api/auth/me`<br>`GET /api/auth/roles` |
| Tablero / Dashboard | Vista principal con indicadores del periodo, estado de lotes, dominios, destinatarios, validaciones e inconsistencias. | MVP | `GET /api/dashboard/resumen`<br>`GET /api/dashboard/kpis`<br>`GET /api/dashboard/graficos` |
| Carga de Lote DLP | Permite cargar archivo mensual DLP, seleccionar periodo, validar estructura y registrar el lote. | MVP | `POST /api/lotes`<br>`POST /api/lotes/{id}/archivo`<br>`GET /api/lotes/{id}/validacion` |
| Consulta de Lotes | Lista los lotes cargados por periodo, estado, usuario de carga y fecha de procesamiento. | MVP | `GET /api/lotes`<br>`GET /api/lotes/{id}`<br>`GET /api/lotes/{id}/resumen` |
| Detalle de Lote | Muestra información del lote, archivo, registros cargados, registros procesados, errores, pendientes e inconsistencias. | MVP | `GET /api/lotes/{id}`<br>`GET /api/lotes/{id}/detalle`<br>`GET /api/lotes/{id}/errores` |
| Procesamiento de Lote | Permite ejecutar o reprocesar un lote cargado. Muestra avance y resultado del procesamiento. | MVP | `POST /api/lotes/{id}/procesar`<br>`POST /api/lotes/{id}/reprocesar`<br>`GET /api/lotes/{id}/estado-proceso` |
| Registros DLP Originales | Consulta los registros originales importados desde el archivo mensual. Solo lectura. | MVP | `GET /api/registros-dlp`<br>`GET /api/registros-dlp/{id}` |
| Detalle Procesado DLP | Consulta el resultado procesado por registro: dominio seguro, dominio no seguro, destinatario pendiente, inconsistente, etc. | MVP | `GET /api/detalle-lote`<br>`GET /api/detalle-lote/{id}` |
| Bandeja de Dominios Pendientes | Permite al administrador revisar dominios no clasificados y marcarlos como seguros o no seguros. | MVP | `GET /api/dominios/pendientes`<br>`POST /api/dominios/pendientes/{id}/validar` |
| Lista Blanca de Dominios | Permite consultar, registrar, editar, activar o desactivar dominios seguros. | MVP | `GET /api/dominios/blancos`<br>`POST /api/dominios/blancos`<br>`PUT /api/dominios/blancos/{id}` |
| Lista Negra de Dominios | Permite consultar, registrar, editar, activar o desactivar dominios no seguros. | MVP | `GET /api/dominios/negros`<br>`POST /api/dominios/negros`<br>`PUT /api/dominios/negros/{id}` |
| Bandeja de Destinatarios Pendientes | Permite al usuario Alicorp revisar destinatarios externos pendientes de validación y responder seguro/no seguro con justificación. | MVP | `GET /api/destinatarios/mis-pendientes`<br>`POST /api/destinatarios/pendientes/{id}/validar` |
| Lista Blanca de Destinatarios | Permite consultar destinatarios marcados como seguros. Puede visualizarse por administrador o por usuario. | MVP | `GET /api/destinatarios/blancos`<br>`GET /api/destinatarios/mis-listas`<br>`POST /api/destinatarios/blancos` |
| Lista Negra de Destinatarios | Permite consultar destinatarios marcados como no seguros. Puede visualizarse por administrador o por usuario. | MVP | `GET /api/destinatarios/negros`<br>`GET /api/destinatarios/mis-listas`<br>`POST /api/destinatarios/negros` |
| Validaciones de Destinatarios | Consulta histórica de respuestas de usuarios, decisión, justificación, fecha y estado. | MVP | `GET /api/validaciones/destinatarios`<br>`GET /api/validaciones/destinatarios/{id}` |
| Inconsistencias | Permite al administrador revisar destinatarios con decisiones contradictorias entre usuarios y resolver el conflicto. | MVP | `GET /api/inconsistencias`<br>`GET /api/inconsistencias/{id}`<br>`POST /api/inconsistencias/{id}/resolver` |
| Reporte Mensual | Reporte consolidado por periodo con totales de carga, dominios, destinatarios, validaciones e inconsistencias. | MVP | `GET /api/reportes/mensual`<br>`GET /api/reportes/exportar` |
| Reporte por Dominio | Reporte de dominios externos, frecuencia, estado, usuarios relacionados y clasificación. | MVP | `GET /api/reportes/dominios` |
| Reporte por Destinatario | Reporte de destinatarios externos, frecuencia, usuarios relacionados, decisiones y estado. | MVP | `GET /api/reportes/destinatarios` |
| Reporte por Usuario | Reporte de usuarios Alicorp con incidentes, pendientes, aprobaciones, rechazos e inconsistencias. | MVP | `GET /api/reportes/usuarios` |
| Reporte Organizacional | Reporte agrupado por vicepresidencia, dirección, gerencia y unidad organizativa. | Fase 2 | `GET /api/reportes/organizacion` |
| Auditoría | Consulta acciones relevantes: cargas, cambios en listas, validaciones, resoluciones e inicio de procesos. | MVP | `GET /api/auditoria`<br>`GET /api/auditoria/lotes/{loteId}` |
| Administración de Roles | Permite consultar usuarios y roles funcionales del sistema. La asignación puede venir desde Entra ID. | Fase 2 | `GET /api/admin/usuarios`<br>`GET /api/admin/roles` |
| Parámetros del Sistema | Configuración de plazos de validación, estados, límites, correos o parámetros operativos. | Fase 2 | `GET /api/parametros`<br>`PUT /api/parametros/{id}` |
| Exportaciones | Permite descargar reportes en Excel/CSV y registrar auditoría de descarga. | MVP | `GET /api/exportaciones`<br>`POST /api/reportes/exportar` |

---

## 2. Detalle de Pantalla: Tablero / Dashboard

## 2.1 Objetivo del Dashboard

El Dashboard debe entregar una vista ejecutiva y operativa del estado de los lotes DLP, permitiendo identificar rápidamente:

- Volumen de registros cargados.
- Nivel de procesamiento.
- Dominios seguros, no seguros y pendientes.
- Destinatarios seguros, no seguros y pendientes.
- Validaciones realizadas por usuarios.
- Inconsistencias abiertas.
- Riesgos por usuario, dominio, destinatario y unidad organizativa.
- Evolución mensual de los incidentes DLP.

---

## 2.2 Filtros Globales del Dashboard

| Filtro | Descripción | Tipo |
|---|---|---|
| Periodo | Mes y año del lote DLP. | Obligatorio |
| Lote | Permite seleccionar uno o varios lotes del periodo. | Opcional |
| Estado del lote | CARGADO, PROCESANDO, PROCESADO, CON_OBSERVACIONES, CERRADO, ERROR. | Opcional |
| Vicepresidencia | Filtra datos por vicepresidencia del usuario. | Opcional |
| Dirección / Gerencia | Filtra por dirección o gerencia. | Opcional |
| Unidad Organizativa | Filtra por unidad organizativa. | Opcional |
| Usuario Alicorp | Filtra por usuario responsable. | Opcional |
| Dominio externo | Filtra por dominio externo. | Opcional |
| Estado de validación | Pendiente, aprobado, rechazado, inconsistente, cerrado. | Opcional |
| Política DLP | Filtra por política DLP. | Opcional |

Endpoint sugerido:

```http
GET /api/dashboard/filtros
```

---

## 2.3 Inventario de KPIs

| KPI | Descripción | Fórmula / Criterio | Endpoint |
|---|---|---|---|
| Total de registros cargados | Cantidad total de registros importados desde el archivo mensual. | `COUNT(REGISTRO_DLP)` por lote/periodo | `GET /api/dashboard/kpis` |
| Total de registros procesados | Cantidad de registros evaluados por el motor batch. | `COUNT(DETALLE_LOTE_DLP WHERE estado <> PENDIENTE_PROCESO)` | `GET /api/dashboard/kpis` |
| Porcentaje de avance del procesamiento | Avance del procesamiento del lote. | `procesados / cargados * 100` | `GET /api/dashboard/kpis` |
| Dominios únicos detectados | Cantidad de dominios externos únicos del lote. | `COUNT DISTINCT dominio_ext` | `GET /api/dashboard/kpis` |
| Dominios seguros | Dominios del lote clasificados como seguros. | Dominios en lista blanca o validados seguros | `GET /api/dashboard/kpis` |
| Dominios no seguros | Dominios del lote clasificados como no seguros. | Dominios en lista negra o validados no seguros | `GET /api/dashboard/kpis` |
| Dominios pendientes | Dominios no clasificados pendientes de validación por administrador. | `COUNT(PENDIENTE_VALIDACION_DOMINIO WHERE estado=PENDIENTE)` | `GET /api/dashboard/kpis` |
| Destinatarios únicos detectados | Cantidad de destinatarios externos únicos del lote. | `COUNT DISTINCT destinatario_ext` | `GET /api/dashboard/kpis` |
| Destinatarios seguros | Destinatarios clasificados como seguros. | Lista blanca o validación segura | `GET /api/dashboard/kpis` |
| Destinatarios no seguros | Destinatarios clasificados como no seguros. | Lista negra o validación no segura | `GET /api/dashboard/kpis` |
| Destinatarios pendientes | Destinatarios pendientes de validación por usuarios. | `COUNT(PENDIENTE_VALIDACION_DESTINATARIO WHERE estado=PENDIENTE)` | `GET /api/dashboard/kpis` |
| Validaciones aprobadas | Cantidad de respuestas de usuario marcadas como seguras. | `COUNT(VALIDACION_DESTINATARIO WHERE decision=SEGURO)` | `GET /api/dashboard/kpis` |
| Validaciones rechazadas | Cantidad de respuestas de usuario marcadas como no seguras. | `COUNT(VALIDACION_DESTINATARIO WHERE decision=NO_SEGURO)` | `GET /api/dashboard/kpis` |
| Inconsistencias abiertas | Conflictos pendientes de resolución por administrador. | `COUNT(INCONSISTENCIA_VALIDACION WHERE estado=ABIERTA)` | `GET /api/dashboard/kpis` |
| Inconsistencias cerradas | Conflictos resueltos por administrador. | `COUNT(INCONSISTENCIA_VALIDACION WHERE estado=CERRADA)` | `GET /api/dashboard/kpis` |
| Usuarios con pendientes | Cantidad de usuarios que tienen validaciones pendientes. | `COUNT DISTINCT correo_usuario_alicorp` en pendientes | `GET /api/dashboard/kpis` |
| Tasa de respuesta de usuarios | Porcentaje de validaciones respondidas por usuarios. | `respondidas / total_pendientes_generadas * 100` | `GET /api/dashboard/kpis` |
| Casos vencidos | Validaciones que superaron el plazo definido. | Pendientes con fecha límite vencida | `GET /api/dashboard/kpis` |
| Tiempo promedio de validación | Tiempo promedio entre creación del pendiente y validación. | `AVG(fecha_validacion - fecha_creacion)` | `GET /api/dashboard/kpis` |

---

## 2.4 Inventario de Gráficos

| Gráfico | Descripción | Tipo sugerido | Endpoint |
|---|---|---|---|
| Distribución de registros por estado | Muestra registros por estado del procesamiento: seguro, no seguro, pendiente, inconsistente. | Dona / Pie | `GET /api/dashboard/graficos/estados-registro` |
| Evolución mensual de registros DLP | Muestra tendencia de registros cargados por mes. | Línea | `GET /api/dashboard/graficos/evolucion-mensual` |
| Dominios por clasificación | Compara dominios seguros, no seguros y pendientes. | Barra vertical | `GET /api/dashboard/graficos/dominios-clasificacion` |
| Destinatarios por clasificación | Compara destinatarios seguros, no seguros y pendientes. | Barra vertical | `GET /api/dashboard/graficos/destinatarios-clasificacion` |
| Top 10 dominios externos | Lista dominios con mayor recurrencia en el lote. | Barra horizontal | `GET /api/dashboard/graficos/top-dominios` |
| Top 10 destinatarios externos | Lista destinatarios con mayor recurrencia. | Barra horizontal | `GET /api/dashboard/graficos/top-destinatarios` |
| Top 10 usuarios con incidentes | Usuarios Alicorp con más eventos DLP. | Barra horizontal | `GET /api/dashboard/graficos/top-usuarios` |
| Validaciones por decisión | Cantidad de validaciones seguras vs no seguras. | Dona / Barra | `GET /api/dashboard/graficos/validaciones-decision` |
| Validaciones por estado | Pendientes, respondidas, vencidas, escaladas y cerradas. | Barra apilada | `GET /api/dashboard/graficos/validaciones-estado` |
| Inconsistencias por estado | Abiertas, en revisión, resueltas como seguro, resueltas como no seguro. | Barra | `GET /api/dashboard/graficos/inconsistencias` |
| Incidentes por política DLP | Distribución de registros por política DLP. | Barra | `GET /api/dashboard/graficos/politicas` |
| Incidentes por vicepresidencia | Eventos agrupados por vicepresidencia. | Barra horizontal | `GET /api/dashboard/graficos/vicepresidencias` |
| Incidentes por gerencia | Eventos agrupados por dirección o gerencia. | Barra horizontal | `GET /api/dashboard/graficos/gerencias` |
| Mapa de calor usuario vs dominio | Muestra recurrencia entre usuarios Alicorp y dominios externos. | Heatmap | `GET /api/dashboard/graficos/heatmap-usuario-dominio` |
| Cumplimiento de validaciones | Porcentaje de validaciones cerradas dentro del plazo. | Gauge / Indicador | `GET /api/dashboard/graficos/cumplimiento-validaciones` |

---

## 2.5 Inventario de Tablas del Dashboard

| Tabla | Descripción | Columnas sugeridas | Endpoint |
|---|---|---|---|
| Últimos lotes cargados | Muestra los últimos lotes DLP cargados. | Periodo, lote, archivo, estado, registros, fecha carga, usuario carga | `GET /api/dashboard/tablas/ultimos-lotes` |
| Dominios pendientes críticos | Dominios pendientes con mayor cantidad de registros asociados. | Dominio, total registros, usuarios afectados, destinatarios, primera detección | `GET /api/dashboard/tablas/dominios-pendientes` |
| Destinatarios pendientes críticos | Destinatarios con mayor recurrencia pendientes de validación. | Destinatario, dominio, usuario, total eventos, fecha última detección | `GET /api/dashboard/tablas/destinatarios-pendientes` |
| Usuarios con más pendientes | Usuarios con mayor cantidad de destinatarios pendientes. | Usuario, VP, gerencia, pendientes, vencidos, última actividad | `GET /api/dashboard/tablas/usuarios-pendientes` |
| Inconsistencias abiertas | Conflictos pendientes de decisión del administrador. | Destinatario, dominio, usuarios seguro, usuarios no seguro, estado | `GET /api/dashboard/tablas/inconsistencias-abiertas` |
| Dominios no seguros recurrentes | Dominios en lista negra con mayor aparición. | Dominio, total registros, usuarios afectados, fecha última aparición | `GET /api/dashboard/tablas/dominios-no-seguros` |
| Destinatarios no seguros recurrentes | Destinatarios en lista negra con mayor aparición. | Destinatario, dominio, total eventos, usuarios relacionados | `GET /api/dashboard/tablas/destinatarios-no-seguros` |
| Validaciones recientes | Últimas validaciones realizadas por usuarios. | Fecha, usuario, destinatario, decisión, justificación, estado | `GET /api/dashboard/tablas/validaciones-recientes` |

---

## 2.6 Acciones Disponibles desde el Dashboard

| Acción | Descripción | Rol |
|---|---|---|
| Ver detalle del lote | Abre la pantalla de detalle del lote seleccionado. | DLP_ADMIN, DLP_SECURITY, DLP_AUDITOR |
| Procesar lote | Ejecuta el procesamiento del lote cargado. | DLP_ADMIN |
| Reprocesar lote | Permite reprocesar dominios o destinatarios. | DLP_ADMIN |
| Ir a dominios pendientes | Redirige a la bandeja de dominios pendientes. | DLP_ADMIN |
| Ir a destinatarios pendientes | Redirige a la bandeja del usuario o vista administrativa. | DLP_ADMIN, DLP_USER |
| Resolver inconsistencia | Redirige al detalle de inconsistencia. | DLP_ADMIN |
| Exportar resumen | Descarga resumen del dashboard en Excel/CSV. | DLP_ADMIN, DLP_SECURITY, DLP_AUDITOR |
| Ver auditoría | Consulta acciones realizadas sobre el lote. | DLP_ADMIN, DLP_SECURITY, DLP_AUDITOR |

---

## 2.7 Layout Sugerido del Dashboard

```text
+--------------------------------------------------------------+
| Filtros: Periodo | Lote | VP | Gerencia | Estado             |
+--------------------------------------------------------------+

+----------------+----------------+----------------+----------+
| Registros      | Dominios Pend. | Destinatarios  | Inconsist|
| Cargados       |                | Pendientes     | Abiertas |
+----------------+----------------+----------------+----------+

+----------------+----------------+----------------+----------+
| Dominios Seg.  | Dominios NoSeg | Dest. Seguros  | Dest. NoS|
+----------------+----------------+----------------+----------+

+-------------------------------+------------------------------+
| Evolución mensual DLP         | Registros por estado         |
+-------------------------------+------------------------------+

+-------------------------------+------------------------------+
| Top dominios externos         | Top usuarios con incidentes  |
+-------------------------------+------------------------------+

+--------------------------------------------------------------+
| Tabla: Inconsistencias abiertas                              |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
| Tabla: Usuarios con validaciones pendientes                  |
+--------------------------------------------------------------+
```

---

## 2.8 Endpoints Consolidados del Dashboard

```http
GET /api/dashboard/resumen
GET /api/dashboard/kpis
GET /api/dashboard/filtros
GET /api/dashboard/graficos
GET /api/dashboard/graficos/estados-registro
GET /api/dashboard/graficos/evolucion-mensual
GET /api/dashboard/graficos/dominios-clasificacion
GET /api/dashboard/graficos/destinatarios-clasificacion
GET /api/dashboard/graficos/top-dominios
GET /api/dashboard/graficos/top-destinatarios
GET /api/dashboard/graficos/top-usuarios
GET /api/dashboard/graficos/validaciones-decision
GET /api/dashboard/graficos/validaciones-estado
GET /api/dashboard/graficos/inconsistencias
GET /api/dashboard/graficos/politicas
GET /api/dashboard/graficos/vicepresidencias
GET /api/dashboard/graficos/gerencias
GET /api/dashboard/graficos/heatmap-usuario-dominio
GET /api/dashboard/graficos/cumplimiento-validaciones
GET /api/dashboard/tablas/ultimos-lotes
GET /api/dashboard/tablas/dominios-pendientes
GET /api/dashboard/tablas/destinatarios-pendientes
GET /api/dashboard/tablas/usuarios-pendientes
GET /api/dashboard/tablas/inconsistencias-abiertas
GET /api/dashboard/tablas/dominios-no-seguros
GET /api/dashboard/tablas/destinatarios-no-seguros
GET /api/dashboard/tablas/validaciones-recientes
```

---

## 3. Estados Sugeridos para Gestión de Pantallas

| Estado | Descripción |
|---|---|
| MVP | Pantalla requerida para la primera versión operativa. |
| Fase 2 | Pantalla recomendada para una segunda etapa. |
| Opcional | Pantalla no crítica, puede implementarse si hay tiempo o presupuesto. |
| Administrativo | Pantalla restringida para administración o configuración. |

---

## 4. Priorización Recomendada

## 4.1 MVP

Pantallas mínimas para salir a producción:

- Login / Acceso.
- Tablero / Dashboard.
- Carga de Lote DLP.
- Consulta de Lotes.
- Detalle de Lote.
- Procesamiento de Lote.
- Bandeja de Dominios Pendientes.
- Bandeja de Destinatarios Pendientes.
- Lista Blanca de Dominios.
- Lista Negra de Dominios.
- Lista Blanca de Destinatarios.
- Lista Negra de Destinatarios.
- Inconsistencias.
- Reporte Mensual.
- Auditoría.

## 4.2 Fase 2

Pantallas para evolución:

- Reporte Organizacional.
- Administración de Roles.
- Parámetros del Sistema.
- Dashboards avanzados.
- Exportaciones avanzadas.
- Integración Power BI.
