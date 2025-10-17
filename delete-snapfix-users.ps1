# Script to delete all users with @snapfix.com email addresses
Write-Host "Deleting users with @snapfix.com email addresses..." -ForegroundColor Yellow

# First, let's get a token by logging in as admin
$loginData = @{
    email = "admin@snapfix.com"
    password = "123456"
} | ConvertTo-Json

Write-Host "Logging in as admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"

if ($loginResponse.token) {
    Write-Host "Login successful!" -ForegroundColor Green
    $token = $loginResponse.token
    
    # Get all users first to see what we're deleting
    Write-Host "Fetching all users..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
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
            Write-Host "`nFound $($snapfixUsers.Count) users with @snapfix.com email addresses:" -ForegroundColor Yellow
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
            
            # Show remaining users
            Write-Host "`nRemaining users:" -ForegroundColor Cyan
            $remainingUsersResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method GET -Headers $headers
            $remainingUsersResponse | ForEach-Object {
                Write-Host "  ID: $($_.id), Name: $($_.name), Email: $($_.email), Role: $($_.role)" -ForegroundColor White
            }
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



