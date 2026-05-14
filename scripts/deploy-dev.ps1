param(
    [string]$ResourceGroup = "rg-truedom-dev",
    [string]$Location = "eastus2",
    [string]$NamePrefix = "truedom"
)

$ErrorActionPreference = "Stop"

# --- Helpers ---
function Require-Command {
    param([string]$Name, [string]$Hint)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name no esta instalado. $Hint"
    }
}

function Write-Step { param([string]$Msg) Write-Host "`n>> $Msg" -ForegroundColor Cyan }

# --- Prerequisites ---
Require-Command "az" "Instala Azure CLI: winget install --exact --id Microsoft.AzureCLI"
Require-Command "docker" "Instala Docker Desktop: https://docs.docker.com/desktop/install/windows-install/"
Require-Command "npm" "Instala Node.js: https://nodejs.org"

# --- Fixed resource names (idempotent) ---
$acrName        = "${NamePrefix}acr"
$containerEnv   = "$NamePrefix-cae-dev"
$apiName        = "$NamePrefix-api-dev"
$staticName     = "$NamePrefix-web-dev"
$pgServerName   = "$NamePrefix-pg-dev"
$storageName    = "${NamePrefix}stdev"
$kvName         = "$NamePrefix-kv-dev"
$imageName      = "truedom-api:dev"
$pgDatabase     = "truedom"
$pgUser         = "truedomadmin"
$pgPassword     = "Tr#D0m_$(Get-Random -Minimum 1000 -Maximum 9999)!"

# --- Validate Azure session ---
Write-Step "Validando sesion de Azure"
az account show --only-show-errors 1>$null
if ($LASTEXITCODE -ne 0) { throw "No hay sesion activa. Ejecuta 'az login' primero." }

# --- Extensions & providers ---
Write-Step "Preparando extensiones y proveedores"
az extension add --name containerapp --upgrade --only-show-errors 2>$null
az provider register --namespace Microsoft.App --only-show-errors
az provider register --namespace Microsoft.OperationalInsights --only-show-errors
az provider register --namespace Microsoft.ContainerRegistry --only-show-errors
az provider register --namespace Microsoft.Web --only-show-errors
az provider register --namespace Microsoft.DBforPostgreSQL --only-show-errors
az provider register --namespace Microsoft.Storage --only-show-errors
az provider register --namespace Microsoft.KeyVault --only-show-errors

# --- Resource Group ---
Write-Step "Grupo de recursos: $ResourceGroup"
az group create --name $ResourceGroup --location $Location --only-show-errors 1>$null

# --- Container Registry ---
Write-Step "Azure Container Registry: $acrName"
$acrExists = $null
try { $acrExists = az acr show --name $acrName --resource-group $ResourceGroup --query "name" -o tsv 2>$null } catch {}
if (-not $acrExists) {
    az acr create --resource-group $ResourceGroup --name $acrName --sku Basic --admin-enabled true --only-show-errors 1>$null
}
$acrLoginServer = az acr show --name $acrName --resource-group $ResourceGroup --query "loginServer" -o tsv
$acrUser = az acr credential show --name $acrName --query "username" -o tsv
$acrPassword = az acr credential show --name $acrName --query "passwords[0].value" -o tsv

# --- PostgreSQL Flexible Server ---
Write-Step "PostgreSQL Flexible Server: $pgServerName"
$pgExists = $null
try { $pgExists = az postgres flexible-server show --name $pgServerName --resource-group $ResourceGroup --query "name" -o tsv 2>$null } catch {}
if (-not $pgExists) {
    $pgCreated = $false
    # Intentar en la ubicacion principal
    try {
        az postgres flexible-server create `
            --resource-group $ResourceGroup `
            --name $pgServerName `
            --location $Location `
            --admin-user $pgUser `
            --admin-password $pgPassword `
            --sku-name Standard_B1ms `
            --tier Burstable `
            --storage-size 32 `
            --version 16 `
            --public-access 0.0.0.0 `
            --only-show-errors 1>$null 2>$null
        $pgCreated = ($LASTEXITCODE -eq 0)
    } catch { $pgCreated = $false }

    if (-not $pgCreated) {
        Write-Host "  Reintentando en eastus..." -ForegroundColor Yellow
        try {
            az postgres flexible-server create `
                --resource-group $ResourceGroup `
                --name $pgServerName `
                --location "eastus" `
                --admin-user $pgUser `
                --admin-password $pgPassword `
                --sku-name Standard_B1ms `
                --tier Burstable `
                --storage-size 32 `
                --version 16 `
                --public-access 0.0.0.0 `
                --only-show-errors 1>$null 2>$null
            $pgCreated = ($LASTEXITCODE -eq 0)
        } catch { $pgCreated = $false }
    }

    if ($pgCreated) {
        try {
            az postgres flexible-server db create `
                --resource-group $ResourceGroup `
                --server-name $pgServerName `
                --database-name $pgDatabase `
                --only-show-errors 1>$null 2>$null
        } catch {}
        Write-Host "  Password generada: $pgPassword" -ForegroundColor Yellow
    } else {
        Write-Host "  ADVERTENCIA: No se pudo crear PostgreSQL (restriccion de suscripcion)." -ForegroundColor Yellow
    }
} else {
    Write-Host "  Ya existe, reutilizando."
}
$pgHost = $null
try { $pgHost = az postgres flexible-server show --name $pgServerName --resource-group $ResourceGroup --query "fullyQualifiedDomainName" -o tsv 2>$null } catch {}
if (-not $pgHost) {
    Write-Host "  ADVERTENCIA: PostgreSQL no disponible. El backend usara H2 en memoria." -ForegroundColor Yellow
    $pgHost = "localhost"
}

# --- Storage Account ---
Write-Step "Storage Account: $storageName"
$storageExists = $null
try { $storageExists = az storage account show --name $storageName --resource-group $ResourceGroup --query "name" -o tsv 2>$null } catch {}
if (-not $storageExists) {
    az storage account create `
        --resource-group $ResourceGroup `
        --name $storageName `
        --location $Location `
        --sku Standard_LRS `
        --only-show-errors 1>$null
}
$storageConnStr = az storage account show-connection-string --name $storageName --resource-group $ResourceGroup --query "connectionString" -o tsv
# Create blob containers
@("dlp-input-files", "dlp-processed-files", "dlp-error-files") | ForEach-Object {
    az storage container create --name $_ --connection-string $storageConnStr --only-show-errors 2>$null 1>$null
}

# --- Key Vault ---
Write-Step "Key Vault: $kvName"
$kvExists = $null
try { $kvExists = az keyvault show --name $kvName --resource-group $ResourceGroup --query "name" -o tsv 2>$null } catch {}
if (-not $kvExists) {
    az keyvault create --resource-group $ResourceGroup --name $kvName --location $Location --only-show-errors 1>$null
}
# Store secrets (non-fatal if permissions missing)
$ErrorActionPreference = "Continue"
az keyvault secret set --vault-name $kvName --name "POSTGRES-HOST" --value $pgHost --only-show-errors 1>$null 2>$null
az keyvault secret set --vault-name $kvName --name "POSTGRES-DATABASE" --value $pgDatabase --only-show-errors 1>$null 2>$null
az keyvault secret set --vault-name $kvName --name "POSTGRES-USER" --value $pgUser --only-show-errors 1>$null 2>$null
if ($pgPassword) {
    az keyvault secret set --vault-name $kvName --name "POSTGRES-PASSWORD" --value $pgPassword --only-show-errors 1>$null 2>$null
}
az keyvault secret set --vault-name $kvName --name "STORAGE-CONNECTION-STRING" --value $storageConnStr --only-show-errors 1>$null 2>$null
$ErrorActionPreference = "Stop"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ADVERTENCIA: No se pudieron guardar secretos en Key Vault (permisos)." -ForegroundColor Yellow
}

# --- Build & Push Backend ---
Write-Step "Construyendo imagen backend"
docker build -t "$acrLoginServer/$imageName" "$PSScriptRoot\..\backend"

Write-Step "Subiendo imagen a ACR"
az acr login --name $acrName --only-show-errors
docker push "$acrLoginServer/$imageName"

# --- Container App ---
Write-Step "Desplegando backend en Container Apps: $apiName"
$caExists = $null
try { $caExists = az containerapp show --name $apiName --resource-group $ResourceGroup --query "name" -o tsv 2>$null } catch {}
if (-not $caExists) {
    az containerapp up `
        --name $apiName `
        --resource-group $ResourceGroup `
        --location $Location `
        --environment $containerEnv `
        --image "$acrLoginServer/$imageName" `
        --registry-server $acrLoginServer `
        --registry-username $acrUser `
        --registry-password $acrPassword `
        --target-port 8080 `
        --ingress external
} else {
    az containerapp update `
        --name $apiName `
        --resource-group $ResourceGroup `
        --image "$acrLoginServer/$imageName" `
        --only-show-errors 1>$null
}

# Set environment variables for backend
az containerapp update `
    --name $apiName `
    --resource-group $ResourceGroup `
    --set-env-vars `
        "POSTGRES_URL=jdbc:postgresql://${pgHost}:5432/${pgDatabase}?sslmode=require" `
        "POSTGRES_USER=$pgUser" `
        "POSTGRES_PASSWORD=$pgPassword" `
        "SPRING_FLYWAY_ENABLED=true" `
        "AZURE_STORAGE_CONNECTION_STRING=$storageConnStr" `
    --only-show-errors 1>$null

$apiFqdn = az containerapp show --name $apiName --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv

# --- Static Web App ---
Write-Step "Static Web App: $staticName"
$swaExists = $null
try { $swaExists = az staticwebapp show --name $staticName --resource-group $ResourceGroup --query "name" -o tsv 2>$null } catch {}
if (-not $swaExists) {
    az staticwebapp create --name $staticName --resource-group $ResourceGroup --location $Location --sku Free --only-show-errors 1>$null
}

# --- Build Frontend ---
Write-Step "Compilando frontend"
Push-Location "$PSScriptRoot\..\frontend"
$ErrorActionPreference = "Continue"
npm install --prefer-offline --no-audit 2>$null
npm run build 2>$null
$ErrorActionPreference = "Stop"

# Angular 19+ SSR fix
if ((Test-Path ".\dist\fuse\browser\index.csr.html") -and -not (Test-Path ".\dist\fuse\browser\index.html")) {
    Copy-Item ".\dist\fuse\browser\index.csr.html" ".\dist\fuse\browser\index.html"
}

# --- Deploy Frontend ---
Write-Step "Publicando frontend"
$deployToken = az staticwebapp secrets list --name $staticName --resource-group $ResourceGroup --query "properties.apiKey" -o tsv
$swaClient = "$env:USERPROFILE\.swa\deploy\08e29138cd3dcda4ffda6d587aa580028110c1c7\StaticSitesClient.exe"
if (Test-Path $swaClient) {
    & $swaClient upload --app ".\dist\fuse\browser" --apiToken $deployToken --skipAppBuild true 2>$null
} else {
    npx -y @azure/static-web-apps-cli deploy ".\dist\fuse\browser" --deployment-token $deployToken --env production 2>$null
}
Pop-Location

$webUrl = az staticwebapp show --name $staticName --resource-group $ResourceGroup --query "defaultHostname" -o tsv

# --- Summary ---
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " DEPLOY COMPLETADO" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:   https://$webUrl"
Write-Host "Backend:    https://$apiFqdn"
Write-Host "Health:     https://$apiFqdn/actuator/health"
Write-Host "PostgreSQL: $pgHost"
Write-Host "Storage:    $storageName"
Write-Host "Key Vault:  $kvName"
Write-Host ""
