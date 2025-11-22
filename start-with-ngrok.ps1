# PowerShell script to start SnapFix with ngrok

Write-Host "=== SnapFix Docker Setup with Ngrok ===" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠ Please update .env file with your configuration" -ForegroundColor Yellow
}

# Read ngrok token from .env
$envContent = Get-Content ".env" | Where-Object { $_ -match "^NGROK_AUTH_TOKEN=" }
if ($envContent) {
    $ngrokToken = ($envContent -split "=")[1].Trim()
} else {
    $ngrokToken = "YOUR_NGROK_AUTH_TOKEN_HERE"
}

# Update ngrok.yml with token if needed
if ($ngrokToken -and $ngrokToken -ne "YOUR_NGROK_AUTH_TOKEN_HERE" -and $ngrokToken -ne "") {
    Write-Host "Updating ngrok.yml with auth token..." -ForegroundColor Yellow
    $ngrokConfig = Get-Content "ngrok.yml"
    $ngrokConfig = $ngrokConfig -replace "YOUR_NGROK_AUTH_TOKEN_HERE", $ngrokToken
    $ngrokConfig | Set-Content "ngrok.yml"
    Write-Host "✓ Ngrok configuration updated" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: Ngrok auth token not set. Update it in .env file or ngrok.yml" -ForegroundColor Yellow
}

# Build and start containers
Write-Host "`nBuilding Docker images..." -ForegroundColor Cyan
docker-compose build

Write-Host "`nStarting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "`nWaiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Get ngrok URLs
Write-Host "`nFetching Ngrok public URLs..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

try {
    $ngrokApiResponse = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction SilentlyContinue
    if ($ngrokApiResponse.tunnels) {
        Write-Host "`n=== Public URLs via Ngrok ===" -ForegroundColor Green
        foreach ($tunnel in $ngrokApiResponse.tunnels) {
            $service = $tunnel.config.addr -replace ".*//.*:(\d+)", '$1'
            $url = $tunnel.public_url
            
            switch ($service) {
                "80" { 
                    Write-Host "Frontend:     $url" -ForegroundColor Cyan
                    Write-Host "  API URL:    $url/api" -ForegroundColor Gray
                }
                "8080" { 
                    Write-Host "Backend API:  $url" -ForegroundColor Cyan
                }
                "3001" { 
                    Write-Host "DB Dashboard: $url" -ForegroundColor Cyan
                }
            }
        }
    } else {
        Write-Host "⚠ Ngrok tunnels not available yet. Check http://localhost:4040" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not fetch ngrok URLs. Check http://localhost:4040/inspect" -ForegroundColor Yellow
}

Write-Host "`n=== Local URLs ===" -ForegroundColor Green
Write-Host "Frontend:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "Ngrok UI:     http://localhost:4040" -ForegroundColor Cyan
Write-Host "DB Dashboard: http://localhost:3001" -ForegroundColor Cyan

Write-Host "`n=== Useful Commands ===" -ForegroundColor Green
Write-Host "View logs:         docker-compose logs -f" -ForegroundColor Gray
Write-Host "Stop services:     docker-compose down" -ForegroundColor Gray
Write-Host "View ngrok UI:     http://localhost:4040" -ForegroundColor Gray
Write-Host "Rebuild:           docker-compose up -d --build" -ForegroundColor Gray

Write-Host "`n✓ Setup complete!" -ForegroundColor Green








