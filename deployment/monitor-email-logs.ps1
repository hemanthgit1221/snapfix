# Email Debug Monitor Script
Write-Host "Email Debug Monitor - Watching backend logs for email activity..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""

# Monitor logs in real-time
docker-compose logs -f backend | Select-String -Pattern "mail|email|smtp|EmailService|DEBUG|ERROR|INFO" -Context 1

