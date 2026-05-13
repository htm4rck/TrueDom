Write-Host "Instalando Azure CLI con winget..."
winget install --exact --id Microsoft.AzureCLI

Write-Host ""
Write-Host "Cierra y vuelve a abrir PowerShell. Luego ejecuta:"
Write-Host "az login"
Write-Host "cd C:\proyects\alcrp-github\TRUEDOM"
Write-Host ".\scripts\deploy-dev.ps1"
