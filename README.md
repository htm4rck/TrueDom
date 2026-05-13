# TrueDom

Alicorp Trusted Domain TrueDom es una plataforma DLP para cargar lotes mensuales, clasificar dominios y destinatarios externos, resolver inconsistencias y reportar trazabilidad.

## Estructura

```text
backend/              Spring Boot 3 + Java 21
frontend/             Angular/Fuse UI
database/migrations/  Migraciones Flyway PostgreSQL
docs/                 Alcance funcional, tecnico e inventario
```

## Ejecucion local

Frontend:

```bash
cd frontend
npm install
npm start
```

Backend:

```bash
cd backend
mvn spring-boot:run
```

API local: `http://localhost:8080/api`.

## Despliegue DEV en Azure

Requisitos:

- Azure CLI.
- Sesion iniciada con `az login`.
- Node.js para compilar el frontend.

```powershell
.\scripts\deploy-dev.ps1
```

El script crea un grupo de recursos DEV, Azure Container Registry, Azure Container Apps para el backend y Azure Static Web Apps para el frontend.

## Despliegue automatico desde GitHub

El workflow esta en `.github/workflows/azure-dev.yml` y se ejecuta con cada push a `main`.

Primera vez:

```powershell
az login
.\scripts\deploy-dev.ps1
.\scripts\azure-github-secrets.ps1
```

Copia los valores impresos como secretos del repositorio en GitHub:

- `AZURE_CREDENTIALS`
- `AZURE_RESOURCE_GROUP`
- `AZURE_ACR_NAME`
- `AZURE_CONTAINER_APP_NAME`
- `AZURE_STATIC_WEB_APPS_API_TOKEN`

Luego cada push a `main` despliega frontend y backend en Azure.
