param(
    [string]$ResourceGroup = "rg-truedom-dev",
    [string]$AcrName,
    [string]$ContainerAppName = "truedom-api-dev",
    [string]$StaticWebAppName
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    throw "Azure CLI no esta instalado. Ejecuta .\scripts\azure-prereqs.ps1 y vuelve a abrir PowerShell."
}

az account show --only-show-errors 1>$null

$subscriptionId = az account show --query id -o tsv

if (-not $AcrName) {
    $AcrName = az acr list --resource-group $ResourceGroup --query "[0].name" -o tsv
}

if (-not $StaticWebAppName) {
    $StaticWebAppName = az staticwebapp list --resource-group $ResourceGroup --query "[0].name" -o tsv
}

if (-not $AcrName) {
    throw "No encontre Azure Container Registry en $ResourceGroup. Pasa -AcrName o ejecuta primero .\scripts\deploy-dev.ps1."
}

if (-not $StaticWebAppName) {
    throw "No encontre Static Web App en $ResourceGroup. Pasa -StaticWebAppName o ejecuta primero .\scripts\deploy-dev.ps1."
}

$spName = "sp-truedom-github-dev"
$scope = "/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup"

Write-Host "Creando service principal para GitHub Actions..."
$azureCredentials = az ad sp create-for-rbac `
    --name $spName `
    --role contributor `
    --scopes $scope `
    --sdk-auth

$swaToken = az staticwebapp secrets list `
    --name $StaticWebAppName `
    --resource-group $ResourceGroup `
    --query "properties.apiKey" `
    -o tsv

Write-Host ""
Write-Host "Crea estos secretos en GitHub:"
Write-Host "Repo > Settings > Secrets and variables > Actions > New repository secret"
Write-Host ""
Write-Host "AZURE_RESOURCE_GROUP=$ResourceGroup"
Write-Host "AZURE_ACR_NAME=$AcrName"
Write-Host "AZURE_CONTAINER_APP_NAME=$ContainerAppName"
Write-Host "AZURE_STATIC_WEB_APPS_API_TOKEN=$swaToken"
Write-Host ""
Write-Host "AZURE_CREDENTIALS="
Write-Host $azureCredentials
