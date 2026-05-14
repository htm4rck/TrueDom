param(
    [string]$ResourceGroup = "rg-truedom-dev",
    [string]$NamePrefix = "truedom"
)

$ErrorActionPreference = "Stop"
$acrName  = "${NamePrefix}acr"
$apiName  = "$NamePrefix-api-dev"
$imageName = "truedom-api:dev"

az account show --only-show-errors 1>$null
if ($LASTEXITCODE -ne 0) { throw "Ejecuta 'az login' primero." }

$acrLoginServer = az acr show --name $acrName --resource-group $ResourceGroup --query "loginServer" -o tsv

Write-Host ">> Construyendo imagen backend..." -ForegroundColor Cyan
docker build -t "$acrLoginServer/$imageName" "$PSScriptRoot\..\backend"

Write-Host ">> Subiendo a ACR..." -ForegroundColor Cyan
az acr login --name $acrName --only-show-errors
docker push "$acrLoginServer/$imageName"

Write-Host ">> Actualizando Container App..." -ForegroundColor Cyan
az containerapp update --name $apiName --resource-group $ResourceGroup --image "$acrLoginServer/$imageName" --only-show-errors 1>$null

$fqdn = az containerapp show --name $apiName --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv
Write-Host "`nBackend: https://$fqdn" -ForegroundColor Green
