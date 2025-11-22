# Script to update frontend API URL with ngrok backend URL

Write-Host "Updating frontend API URL with ngrok backend URL..." -ForegroundColor Cyan

# Get ngrok tunnels
try {
    $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels"
    $backendUrl = $null
    
    foreach ($tunnel in $tunnels.tunnels) {
        if ($tunnel.config.addr -match ":8080") {
            $backendUrl = $tunnel.public_url
            break
        }
    }
    
    if ($backendUrl) {
        Write-Host "Found backend ngrok URL: $backendUrl" -ForegroundColor Green
        
        # Update .env file
        if (Test-Path ".env") {
            $envContent = Get-Content ".env"
            $updated = $false
            
            $newEnvContent = $envContent | ForEach-Object {
                if ($_ -match "^REACT_APP_API_URL=") {
                    $updated = $true
                    "REACT_APP_API_URL=$backendUrl/api"
                } else {
                    $_
                }
            }
            
            if (-not $updated) {
                $newEnvContent += "REACT_APP_API_URL=$backendUrl/api"
            }
            
            $newEnvContent | Set-Content ".env"
            Write-Host "✓ Updated .env file" -ForegroundColor Green
            
            # Rebuild frontend
            Write-Host "Rebuilding frontend with new API URL..." -ForegroundColor Yellow
            docker-compose up -d --build frontend
            Write-Host "✓ Frontend rebuilt" -ForegroundColor Green
        } else {
            Write-Host "⚠ .env file not found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ Could not find backend ngrok URL" -ForegroundColor Yellow
        Write-Host "Make sure ngrok is running and backend is exposed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: Could not connect to ngrok API" -ForegroundColor Red
    Write-Host "Make sure ngrok is running: docker logs snapfix-ngrok" -ForegroundColor Yellow
}








