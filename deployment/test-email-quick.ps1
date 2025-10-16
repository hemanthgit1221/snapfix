# Quick Email Test Script
Write-Host "=== SnapFix Email System Quick Test ===" -ForegroundColor Green
Write-Host ""

# Check if services are running
Write-Host "1. Checking services..." -ForegroundColor Yellow
docker-compose ps

Write-Host "`n2. Checking email environment variables..." -ForegroundColor Yellow
docker-compose exec backend printenv | findstr MAIL

Write-Host "`n3. Checking recent email logs..." -ForegroundColor Yellow
docker-compose logs backend --tail=20 | Select-String -Pattern "mail|email|smtp|EmailService|Failed|ERROR|Successfully sent" -Context 1

Write-Host "`n4. Application URLs:" -ForegroundColor Cyan
Write-Host "   Main App: http://localhost" -ForegroundColor White
Write-Host "   Direct Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8080/api" -ForegroundColor White

Write-Host "`n5. Test Credentials:" -ForegroundColor Cyan
Write-Host "   Student: student@snapfixindia.space / student123" -ForegroundColor White
Write-Host "   Admin: admin@snapfixindia.space / admin123" -ForegroundColor White
Write-Host "   Staff: staff@snapfixindia.space / staff123" -ForegroundColor White

Write-Host "`n6. Real-time email monitoring (Ctrl+C to stop):" -ForegroundColor Yellow
Write-Host "   Run: docker-compose logs -f backend | Select-String -Pattern 'mail|email|smtp'" -ForegroundColor White

Write-Host "`n=== Ready to test! Create a ticket and watch for email logs ===" -ForegroundColor Green

