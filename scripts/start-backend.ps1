Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$backendPath = Join-Path $PSScriptRoot "..\web-extractor-pro\backend"
Push-Location $backendPath
try {
  npm run dev
}
finally {
  Pop-Location
}
