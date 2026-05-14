param(
    [string]$ResourceGroup = "rg-truedom-dev",
    [string]$NamePrefix = "truedom"
)

$ErrorActionPreference = "Stop"
$pgServerName = "$NamePrefix-pg-dev"
$kvName = "$NamePrefix-kv-dev"

az account show --only-show-errors 1>$null
if ($LASTEXITCODE -ne 0) { throw "Ejecuta 'az login' primero." }

$pgHost = az keyvault secret show --vault-name $kvName --name "POSTGRES-HOST" --query "value" -o tsv
$pgUser = az keyvault secret show --vault-name $kvName --name "POSTGRES-USER" --query "value" -o tsv
$pgPass = az keyvault secret show --vault-name $kvName --name "POSTGRES-PASSWORD" --query "value" -o tsv
$pgDb   = az keyvault secret show --vault-name $kvName --name "POSTGRES-DATABASE" --query "value" -o tsv

Write-Host ">> Ejecutando migraciones Flyway contra $pgHost..." -ForegroundColor Cyan

Push-Location "$PSScriptRoot\..\backend"
mvn flyway:migrate `
    "-Dflyway.url=jdbc:postgresql://${pgHost}:5432/${pgDb}?sslmode=require" `
    "-Dflyway.user=$pgUser" `
    "-Dflyway.password=$pgPass" `
    "-Dflyway.locations=filesystem:../database/migrations"
Pop-Location

Write-Host "`nMigraciones aplicadas." -ForegroundColor Green
