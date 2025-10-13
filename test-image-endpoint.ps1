# Test script to verify image serving endpoint works
Write-Host "Testing image serving endpoint..."

# Test the endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/uploads/test-image.txt" -Method GET
    Write-Host "✅ Image endpoint is working!"
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Content: $($response.Content)"
} catch {
    Write-Host "❌ Image endpoint failed:"
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
}

# Test a non-existent image
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/uploads/non-existent-image.png" -Method GET
    Write-Host "❌ Should have returned 404 for non-existent image"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "✅ Correctly returned 404 for non-existent image"
    } else {
        Write-Host "❌ Unexpected error for non-existent image: $($_.Exception.Message)"
    }
}
