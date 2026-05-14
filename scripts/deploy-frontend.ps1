param(
    [string]$ResourceGroup = "rg-truedom-dev",
    [string]$NamePrefix = "truedom"
)

$ErrorActionPreference = "Stop"
$staticName = "$NamePrefix-web-dev"

az account show --only-show-errors 1>$null
if ($LASTEXITCODE -ne 0) { throw "Ejecuta 'az login' primero." }

Push-Location "$PSScriptRoot\..\frontend"

Write-Host ">> Compilando frontend..." -ForegroundColor Cyan
npm run build

if ((Test-Path ".\dist\fuse\browser\index.csr.html") -and -not (Test-Path ".\dist\fuse\browser\index.html")) {
    Copy-Item ".\dist\fuse\browser\index.csr.html" ".\dist\fuse\browser\index.html"
}

Write-Host ">> Publicando en Static Web App..." -ForegroundColor Cyan
$deployToken = az staticwebapp secrets list --name $staticName --resource-group $ResourceGroup --query "properties.apiKey" -o tsv
$swaClient = "$env:USERPROFILE\.swa\deploy\08e29138cd3dcda4ffda6d587aa580028110c1c7\StaticSitesClient.exe"
if (Test-Path $swaClient) {
    & $swaClient upload --app ".\dist\fuse\browser" --apiToken $deployToken --skipAppBuild true 2>$null
} else {
    npx -y @azure/static-web-apps-cli deploy ".\dist\fuse\browser" --deployment-token $deployToken --env production 2>$null
}

Pop-Location

$webUrl = az staticwebapp show --name $staticName --resource-group $ResourceGroup --query "defaultHostname" -o tsv
Write-Host "`nFrontend: https://$webUrl" -ForegroundColor Green
