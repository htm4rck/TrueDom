param(
    [string]$ResourceGroup = "rg-truedom-dev",
    [string]$Location = "eastus2",
    [string]$StaticLocation = "eastus2",
    [string]$NamePrefix = "truedom"
)

$ErrorActionPreference = "Stop"

function Require-Command {
    param([string]$Name, [string]$InstallHint)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name no esta instalado o no esta en PATH. $InstallHint"
    }
}

Require-Command "az" "Instala Azure CLI: winget install --exact --id Microsoft.AzureCLI"
Require-Command "npm" "Instala Node.js 24 o superior para compilar el frontend."

$suffix = (Get-Random -Minimum 1000 -Maximum 9999)
$acrName = ($NamePrefix + "acr" + $suffix).ToLower()
$containerEnv = "$NamePrefix-cae-dev"
$apiName = "$NamePrefix-api-dev"
$staticName = "$NamePrefix-web-dev-$suffix"
$imageName = "truedom-api:dev"

Write-Host "Validando sesion de Azure..."
az account show --only-show-errors 1>$null

Write-Host "Preparando extensiones y proveedores..."
az extension add --name containerapp --upgrade --only-show-errors
az provider register --namespace Microsoft.App --only-show-errors
az provider register --namespace Microsoft.OperationalInsights --only-show-errors
az provider register --namespace Microsoft.ContainerRegistry --only-show-errors
az provider register --namespace Microsoft.Web --only-show-errors

Write-Host "Creando grupo de recursos $ResourceGroup..."
az group create --name $ResourceGroup --location $Location --only-show-errors 1>$null

Write-Host "Creando Azure Container Registry $acrName..."
az acr create `
    --resource-group $ResourceGroup `
    --name $acrName `
    --sku Basic `
    --admin-enabled true `
    --only-show-errors 1>$null

$acrLoginServer = az acr show --name $acrName --resource-group $ResourceGroup --query "loginServer" -o tsv
$acrUser = az acr credential show --name $acrName --query "username" -o tsv
$acrPassword = az acr credential show --name $acrName --query "passwords[0].value" -o tsv

Write-Host "Construyendo imagen backend en ACR..."
az acr build `
    --registry $acrName `
    --image $imageName `
    "$PSScriptRoot\..\backend" `
    --only-show-errors

Write-Host "Desplegando backend en Azure Container Apps..."
$apiFqdn = az containerapp up `
    --name $apiName `
    --resource-group $ResourceGroup `
    --location $Location `
    --environment $containerEnv `
    --image "$acrLoginServer/$imageName" `
    --registry-server $acrLoginServer `
    --registry-username $acrUser `
    --registry-password $acrPassword `
    --target-port 8080 `
    --ingress external `
    --query "properties.configuration.ingress.fqdn" `
    -o tsv

Write-Host "Creando Static Web App $staticName..."
az staticwebapp create `
    --name $staticName `
    --resource-group $ResourceGroup `
    --location $StaticLocation `
    --sku Free `
    --only-show-errors 1>$null

Write-Host "Compilando frontend..."
Push-Location "$PSScriptRoot\..\frontend"
npm install
npm run build

$deployToken = az staticwebapp secrets list `
    --name $staticName `
    --resource-group $ResourceGroup `
    --query "properties.apiKey" `
    -o tsv

Write-Host "Publicando frontend..."
npx -y @azure/static-web-apps-cli deploy ".\dist\fuse\browser" `
    --deployment-token $deployToken `
    --env production
Pop-Location

$webUrl = az staticwebapp show --name $staticName --resource-group $ResourceGroup --query "defaultHostname" -o tsv

Write-Host ""
Write-Host "Deploy completado."
Write-Host "Frontend: https://$webUrl"
Write-Host "Backend:  https://$apiFqdn"
Write-Host "Health:   https://$apiFqdn/actuator/health"
