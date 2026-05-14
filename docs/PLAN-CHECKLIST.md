# TrueDom — Plan & Checklist

## Infraestructura

- [x] Azure Container Apps (backend desplegado)
- [x] Azure Static Web Apps (frontend desplegado)
- [x] Azure Container Registry
- [x] GitHub Actions CI/CD workflow
- [x] Docker build local con cache
- [x] deploy-dev.ps1 idempotente (PG, Blob, KV, ACR, CA, SWA)
- [x] deploy-backend.ps1 (solo backend)
- [x] deploy-frontend.ps1 (solo frontend)
- [x] deploy-db.ps1 (solo migraciones)
- [x] Makefile con targets separados
- [x] docker-compose.yml para desarrollo local
- [x] CORS configurado (localhost + azurestaticapps.net)
- [ ] Ejecutar deploy-dev.ps1 en Azure (crear PG, Blob, KV reales)
- [ ] Verificar backend en Azure conecta a PostgreSQL
- [ ] Application Insights + Log Analytics
- [ ] Managed Identity para Container App → Key Vault

## Base de Datos

- [x] Migración Flyway V1 (14 tablas + índices)
- [x] Flyway habilitado con baseline-on-migrate
- [x] PostgreSQL local funcionando (Docker Compose)
- [x] Datos persistidos y verificados
- [ ] PostgreSQL Flexible Server en Azure (script listo, falta ejecutar)
- [ ] Particionamiento mensual (REGISTRO_DLP, DETALLE_LOTE_DLP)

## Backend — Entidades y Repositorios

- [x] LoteCargaDlp + repository
- [x] ArchivoCargaDlp + repository
- [x] RegistroDlp + repository
- [x] DetalleLoteDlp + repository
- [x] CatalogoDominioBlanco + repository
- [x] CatalogoDominioNegro + repository
- [x] PendienteValidacionDominio + repository
- [x] CatalogoDestinatarioBlanco + repository
- [x] CatalogoDestinatarioNegro + repository
- [x] PendienteValidacionDestinatario + repository
- [x] ValidacionDestinatario + repository
- [x] InconsistenciaValidacion + repository
- [x] AuditoriaDlp + repository
- [x] ReporteDlp + repository

## Backend — Servicios

- [x] LoteService (cargar CSV, parsear, persistir)
- [x] Procesamiento inteligente (valida dominio contra catálogos, crea pendientes)
- [x] Crear PENDIENTE_VALIDACION_DOMINIO durante procesamiento
- [x] Crear PENDIENTE_VALIDACION_DESTINATARIO durante procesamiento
- [x] DominioService (listar pendientes, validar, CRUD listas, toggle)
- [x] DestinatarioService (mis pendientes, validar, detectar inconsistencia)
- [x] InconsistenciaService (listar, detalle, resolver)
- [x] AuditoriaService (registrar acciones)
- [x] DashboardService (resumen con KPIs reales desde BD)
- [x] GlobalExceptionHandler (@ControllerAdvice)
- [ ] Spring Batch Job formal (chunks, reintentos, checkpoints) — hoy es inline
- [ ] Integración Azure Blob Storage SDK (guardar archivo original)

## Backend — APIs REST

- [x] POST /api/lotes (upload multipart real)
- [x] GET /api/lotes (lista desde BD)
- [x] GET /api/lotes/{id}
- [x] POST /api/lotes/{id}/procesar (procesamiento inteligente)
- [x] GET /api/lotes/{id}/resumen
- [x] GET /api/dominios/pendientes
- [x] POST /api/dominios/pendientes/{id}/validar
- [x] GET /api/dominios/blancos
- [x] GET /api/dominios/negros
- [x] POST /api/dominios/blancos
- [x] POST /api/dominios/negros
- [x] PUT /api/dominios/{id}/toggle
- [x] GET /api/destinatarios/mis-pendientes
- [x] POST /api/destinatarios/pendientes/{id}/validar
- [x] GET /api/destinatarios/blancos
- [x] GET /api/destinatarios/negros
- [x] GET /api/inconsistencias
- [x] GET /api/inconsistencias/{id}
- [x] POST /api/inconsistencias/{id}/resolver
- [x] GET /api/dashboard/resumen (datos reales)
- [x] GET /api/dashboard/kpis (datos reales)
- [x] GET /api/auditoria
- [x] GET /api/auditoria/lotes/{loteId}
- [ ] GET /api/auth/me

## Backend — Seguridad

- [ ] Spring Security + Microsoft Entra ID (OAuth2/OIDC)
- [ ] Roles: DLP_ADMIN, DLP_SECURITY, DLP_USER, DLP_AUDITOR
- [ ] @PreAuthorize en endpoints
- [ ] Extraer usuario del token (quitar parámetro `usuario` de requests)

## Frontend — Infraestructura

- [x] environment.ts con apiUrl
- [x] environment.prod.ts apuntando a Azure
- [x] DlpApiService (servicio centralizado)
- [x] HttpClient configurado (provideHttpClient withFetch)
- [ ] MSAL (@azure/msal-angular) para login Entra ID
- [ ] Interceptor HTTP con token Bearer
- [ ] Guards de ruta por rol

## Frontend — Pantallas

- [x] Dashboard conectado a API real (/api/dashboard/resumen + /api/lotes)
- [x] Carga de lote (drag & drop, upload real, procesar)
- [x] Consulta de lotes (lista conectada a API)
- [x] Bandeja dominios pendientes (acciones + dialog justificación)
- [x] Bandeja destinatarios pendientes (por correo + validación)
- [x] Listas dominios (tabs blanco/negro, CRUD, toggle)
- [x] Listas destinatarios (consulta blanco/negro)
- [x] Inconsistencias (lista + resolución con dialog)
- [x] Reportes (resumen + exportación CSV)
- [x] Auditoría conectada a API real
- [x] Logo corporativo en sidebar
- [x] Detalle de lote (ver registros individuales con paginación)

## Calidad

- [x] Validación estructura CSV (columnas obligatorias, error descriptivo)
- [x] Paginación en endpoints de listado (registros, auditoría)
- [x] @ControllerAdvice manejo de errores global
- [x] Tests unitarios — 18 tests (LoteService, DominioService, DestinatarioService, InconsistenciaService)
- [x] Tests de integración (SpringBootTest + H2)

---

## Resumen

| Área | Progreso |
|---|---|
| Infraestructura | 85% — falta ejecutar deploy en Azure |
| Base de datos | 90% — falta PG en Azure |
| Backend APIs | 100% — todos los endpoints funcionales |
| Backend Servicios | 95% — falta Batch formal y Blob Storage |
| Backend Seguridad | 0% — bloqueante para producción |
| Frontend pantallas | 100% — todas las pantallas conectadas |
| Frontend seguridad | 0% — bloqueante para producción |
| Calidad/Tests | 100% — 18 tests passing |

## Pendiente para producción

1. **Seguridad Entra ID** (backend + frontend) — sin esto cualquiera accede
2. **Deploy a Azure** — ejecutar `.\scripts\deploy-dev.ps1`
3. **Blob Storage** — evidencia del archivo original
4. **Tests** — unitarios e integración

## Comandos rápidos

```powershell
# Local
docker compose up -d          # Levanta PostgreSQL + backend
cd frontend && npm start      # Angular en localhost:4200

# Probar carga
curl -X POST http://localhost:8080/api/lotes -F "archivo=@docs/sample-dlp.csv" -F "anio=2026" -F "mes=5" -F "usuario=admin"

# Procesar
curl -X POST http://localhost:8080/api/lotes/1/procesar?usuario=admin

# Deploy Azure
.\scripts\deploy-dev.ps1      # Full (infra + backend + frontend)
.\scripts\deploy-backend.ps1  # Solo backend
.\scripts\deploy-frontend.ps1 # Solo frontend
```
