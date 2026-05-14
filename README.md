# TrueDom

Alicorp Trusted Domain TrueDom es una plataforma DLP para cargar lotes mensuales, clasificar dominios y destinatarios externos, resolver inconsistencias y reportar trazabilidad.

## Estructura

```text
backend/              Spring Boot 3 + Java 21
frontend/             Angular 19 + Fuse UI
database/migrations/  Migraciones Flyway PostgreSQL
scripts/              Scripts de despliegue Azure
docs/                 Alcance funcional, tecnico, checklist
```

## Desarrollo local

Requisitos: Docker Desktop.

```powershell
# Levantar PostgreSQL + backend
docker compose up -d

# Frontend en otra terminal
cd frontend
npm install
npm start
```

- Backend: `http://localhost:8080/api`
- Frontend: `http://localhost:4200`
- PostgreSQL: `localhost:5499` (user: truedom, pass: truedom_local, db: truedom)

## Makefile

Requiere `make` (Git Bash, WSL, o GnuWin32).

| Comando | Descripcion |
|---|---|
| `make deploy` | Deploy completo a Azure (infra + backend + frontend + BD) |
| `make deploy-backend` | Solo rebuild + push + update Container App |
| `make deploy-frontend` | Solo build Angular + publish Static Web App |
| `make deploy-db` | Solo migraciones Flyway contra Azure PostgreSQL |
| `make github-secrets` | Configurar secretos para GitHub Actions |
| `make up` | Docker Compose completo (PostgreSQL + backend) |
| `make down` | Detener Docker Compose |
| `make local` | PostgreSQL Docker + backend con Maven |
| `make help` | Mostrar todos los comandos |

## Scripts PowerShell (sin make)

```powershell
.\scripts\deploy-dev.ps1        # Deploy completo a Azure
.\scripts\deploy-backend.ps1    # Solo backend
.\scripts\deploy-frontend.ps1   # Solo frontend
.\scripts\deploy-db.ps1         # Solo migraciones
.\scripts\azure-github-secrets.ps1  # Secretos GitHub
```

## Tests

```powershell
# Con Docker (sin Maven local)
docker run --rm -v "%cd%\backend":/src -w /src maven:3.9-eclipse-temurin-21 mvn -B test

# Con Maven local
cd backend
mvn test
```

18 tests cubriendo: carga de lotes, validacion CSV, procesamiento inteligente, dominios, destinatarios, inconsistencias.

## Probar carga de lote

```powershell
# Subir CSV
curl -X POST http://localhost:8080/api/lotes -F "archivo=@docs/sample-dlp.csv" -F "anio=2026" -F "mes=5" -F "usuario=admin"

# Procesar (clasifica dominios, crea pendientes)
curl -X POST "http://localhost:8080/api/lotes/1/procesar?usuario=admin"

# Ver resultados
curl http://localhost:8080/api/dominios/pendientes
curl "http://localhost:8080/api/destinatarios/mis-pendientes?correo=jperez@alicorp.com.pe"
curl http://localhost:8080/api/dashboard/resumen
```

## Despliegue DEV en Azure

Requisitos: Azure CLI, Docker Desktop, Node.js.

```powershell
az login
.\scripts\deploy-dev.ps1
```

El script crea: Resource Group, PostgreSQL Flexible Server, Blob Storage, Key Vault, Container Registry, Container Apps (backend), Static Web Apps (frontend).

## Despliegue automatico desde GitHub

El workflow `.github/workflows/azure-dev.yml` se ejecuta con cada push a `main`.

Primera vez:

```powershell
az login
.\scripts\deploy-dev.ps1
.\scripts\azure-github-secrets.ps1
```

Secretos requeridos en GitHub:

- `AZURE_CREDENTIALS`
- `AZURE_RESOURCE_GROUP`
- `AZURE_ACR_NAME`
- `AZURE_CONTAINER_APP_NAME`
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `POSTGRES_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

## Endpoints principales

| Endpoint | Descripcion |
|---|---|
| `POST /api/lotes` | Carga archivo CSV (multipart) |
| `POST /api/lotes/{id}/procesar` | Procesa lote (clasifica dominios/destinatarios) |
| `GET /api/dominios/pendientes` | Dominios sin clasificar |
| `POST /api/dominios/pendientes/{id}/validar` | Admin valida dominio |
| `GET /api/destinatarios/mis-pendientes?correo=` | Pendientes del usuario |
| `POST /api/destinatarios/pendientes/{id}/validar` | Usuario valida destinatario |
| `GET /api/inconsistencias` | Conflictos abiertos |
| `POST /api/inconsistencias/{id}/resolver` | Admin resuelve |
| `GET /api/dashboard/resumen` | KPIs del periodo |
| `GET /api/auditoria` | Trazabilidad |
