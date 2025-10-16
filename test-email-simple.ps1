# SnapFix Email System Test Script
Write-Host "SnapFix Email System Test" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Check email configuration
Write-Host "`nChecking email configuration..." -ForegroundColor Yellow

$mailHost = $env:MAIL_HOST
$mailPort = $env:MAIL_PORT
$mailUsername = $env:MAIL_USERNAME
$mailPassword = $env:MAIL_PASSWORD

if (-not $mailHost) {
    Write-Host "MAIL_HOST not set. Using default: smtp.gmail.com" -ForegroundColor Yellow
    $mailHost = "smtp.gmail.com"
}

if (-not $mailPort) {
    Write-Host "MAIL_PORT not set. Using default: 587" -ForegroundColor Yellow
    $mailPort = "587"
}

if (-not $mailUsername) {
    Write-Host "ERROR: MAIL_USERNAME not set!" -ForegroundColor Red
    Write-Host "Please set MAIL_USERNAME environment variable" -ForegroundColor Red
    exit 1
}

if (-not $mailPassword) {
    Write-Host "ERROR: MAIL_PASSWORD not set!" -ForegroundColor Red
    Write-Host "Please set MAIL_PASSWORD environment variable" -ForegroundColor Red
    exit 1
}

Write-Host "Email configuration found:" -ForegroundColor Green
Write-Host "  Host: $mailHost" -ForegroundColor White
Write-Host "  Port: $mailPort" -ForegroundColor White
Write-Host "  Username: $mailUsername" -ForegroundColor White
Write-Host "  Password: [HIDDEN]" -ForegroundColor White

# Test server connection
Write-Host "`nTesting server connection..." -ForegroundColor Yellow
$baseUrl = "http://localhost:8080/api"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
    Write-Host "Server is running" -ForegroundColor Green
} catch {
    Write-Host "Server is not running. Please start the backend server first." -ForegroundColor Red
    Write-Host "Run: cd backend; mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nEmail system test completed!" -ForegroundColor Green
Write-Host "`nTo test the email system:" -ForegroundColor Yellow
Write-Host "1. Start the backend server: cd backend; mvn spring-boot:run" -ForegroundColor White
Write-Host "2. Start the frontend: cd frontend; npm start" -ForegroundColor White
Write-Host "3. Create a test ticket through the web interface" -ForegroundColor White
Write-Host "4. Check your email for notifications" -ForegroundColor White

