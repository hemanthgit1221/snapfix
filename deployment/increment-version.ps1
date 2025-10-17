# SnapFix Version Increment Script
# This script increments the version number for each deployment

param(
    [string]$VersionFile = "version.txt"
)

# Check if version file exists
if (-not (Test-Path $VersionFile)) {
    Write-Host "Version file not found. Creating with version 500..." -ForegroundColor Yellow
    Set-Content -Path $VersionFile -Value "500"
}

# Read current version
$currentVersion = Get-Content -Path $VersionFile -Raw
$currentVersion = $currentVersion.Trim()

# Validate version is a number
if (-not ($currentVersion -match '^\d+$')) {
    Write-Host "Invalid version format. Setting to 500..." -ForegroundColor Yellow
    $currentVersion = "500"
}

# Increment version
$newVersion = [int]$currentVersion + 1

# Write new version
Set-Content -Path $VersionFile -Value $newVersion

Write-Host "SnapFix Deployment Version: $newVersion" -ForegroundColor Green
Write-Host "Previous version: $currentVersion -> New version: $newVersion" -ForegroundColor Cyan

return $newVersion