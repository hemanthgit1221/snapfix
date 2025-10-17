# Script to delete remaining users with @snapfix.com email addresses
Write-Host "Deleting remaining users with @snapfix.com email addresses..." -ForegroundColor Yellow

# Login with the remaining admin account
$loginData = @{
    email = "admin@snapfixindia.space"
    password = "123456"
} | ConvertTo-Json

Write-Host "Logging in as admin@snapfixindia.space..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"

if ($loginResponse.token) {
    Write-Host "Login successful!" -ForegroundColor Green
    $token = $loginResponse.token
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        # Get all users first to see what we're deleting
        Write-Host "Fetching all users..." -ForegroundColor Yellow
        $allUsersResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method GET -Headers $headers
        Write-Host "Current users:" -ForegroundColor Cyan
        $allUsersResponse | ForEach-Object {
            Write-Host "  ID: $($_.id), Name: $($_.name), Email: $($_.email), Role: $($_.role)" -ForegroundColor White
        }
        
        # Filter users with @snapfix.com email
        $snapfixUsers = $allUsersResponse | Where-Object { $_.email -like "*@snapfix.com" }
        
        if ($snapfixUsers.Count -eq 0) {
            Write-Host "No users found with @snapfix.com email addresses." -ForegroundColor Green
        } else {
            Write-Host "`nFound $($snapfixUsers.Count) remaining users with @snapfix.com email addresses:" -ForegroundColor Yellow
            $snapfixUsers | ForEach-Object {
                Write-Host "  ID: $($_.id), Name: $($_.name), Email: $($_.email), Role: $($_.role)" -ForegroundColor Red
            }
            
            Write-Host "`nDeleting these users..." -ForegroundColor Yellow
            $deletedCount = 0
            $snapfixUsers | ForEach-Object {
                try {
                    Write-Host "Deleting user: $($_.name) ($($_.email))..." -ForegroundColor Yellow
                    $deleteResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/users/$($_.id)" -Method DELETE -Headers $headers
                    Write-Host "  ✅ Successfully deleted: $($_.name)" -ForegroundColor Green
                    $deletedCount++
                } catch {
                    Write-Host "  ❌ Failed to delete $($_.name): $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            
            Write-Host "`nDeletion completed! Deleted $deletedCount out of $($snapfixUsers.Count) users." -ForegroundColor Green
        }
        
        # Show final list of users
        Write-Host "`nFinal list of users:" -ForegroundColor Cyan
        $finalUsersResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method GET -Headers $headers
        $finalUsersResponse | ForEach-Object {
            Write-Host "  ID: $($_.id), Name: $($_.name), Email: $($_.email), Role: $($_.role)" -ForegroundColor White
        }
        
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    }
}
else {
    Write-Host "Login failed!" -ForegroundColor Red
}
