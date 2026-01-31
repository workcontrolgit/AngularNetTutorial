# PowerShell script to set up Git submodules for CAT Pattern Tutorial

Write-Host "Setting up Git submodules for CAT Pattern Tutorial..." -ForegroundColor Green

# Remove existing folders
Write-Host "`nRemoving existing folders..." -ForegroundColor Yellow
Remove-Item -Path "Clients\TalentManagement-Angular-Material" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "ApiResources\TalentManagement-API" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "TokenService\Duende-IdentityServer" -Recurse -Force -ErrorAction SilentlyContinue

# Add submodules
Write-Host "`nAdding Angular client submodule..." -ForegroundColor Cyan
git submodule add https://github.com/workcontrolgit/TalentManagement-Angular-Material.git Clients/TalentManagement-Angular-Material

Write-Host "Adding API submodule..." -ForegroundColor Cyan
git submodule add https://github.com/workcontrolgit/TalentManagement-API.git ApiResources/TalentManagement-API

Write-Host "Adding IdentityServer submodule..." -ForegroundColor Cyan
git submodule add https://github.com/workcontrolgit/Duende-IdentityServer.git TokenService/Duende-IdentityServer

# Initialize
Write-Host "`nInitializing submodules..." -ForegroundColor Cyan
git submodule update --init --recursive

Write-Host "`nDone!" -ForegroundColor Green
Write-Host "`nDon't forget to commit the changes:" -ForegroundColor Yellow
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'Add submodules for Angular client, API, and IdentityServer'" -ForegroundColor White
