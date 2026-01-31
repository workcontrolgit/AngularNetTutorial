# Template Initialization Script
# This script helps you quickly customize the Angular template for your new project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Angular Enterprise Template Initializer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get project details from user
$projectName = Read-Host "Enter your project name (lowercase, hyphen-separated, e.g., 'my-company-hr')"
$projectDisplayName = Read-Host "Enter your project display name (e.g., 'My Company HR')"
$apiUrl = Read-Host "Enter your API URL (e.g., 'https://api.mycompany.com/api/v1')"
$identityServerUrl = Read-Host "Enter your IdentityServer URL (e.g., 'https://identity.mycompany.com')"
$clientId = Read-Host "Enter your OIDC Client ID (e.g., 'MyCompanyHR')"
$apiScope = Read-Host "Enter your API scope (e.g., 'app.api.mycompany.read')"

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Configuration Summary:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Project Name: $projectName"
Write-Host "Display Name: $projectDisplayName"
Write-Host "API URL: $apiUrl"
Write-Host "IdentityServer: $identityServerUrl"
Write-Host "Client ID: $clientId"
Write-Host "API Scope: $apiScope"
Write-Host ""

$confirm = Read-Host "Is this correct? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Initialization cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Initializing template..." -ForegroundColor Green

# Update package.json
Write-Host "Updating package.json..." -ForegroundColor Cyan
$packageJsonPath = "talent-management\package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    $packageJson.name = $projectName
    $packageJson | ConvertTo-Json -Depth 100 | Set-Content $packageJsonPath
    Write-Host "✓ package.json updated" -ForegroundColor Green
}

# Update angular.json
Write-Host "Updating angular.json..." -ForegroundColor Cyan
$angularJsonPath = "talent-management\angular.json"
if (Test-Path $angularJsonPath) {
    $content = Get-Content $angularJsonPath -Raw
    $content = $content -replace '"talent-management":', "`"$projectName`":"
    $content = $content -replace '"talent-management"', "`"$projectName`""
    Set-Content $angularJsonPath $content
    Write-Host "✓ angular.json updated" -ForegroundColor Green
}

# Update environment.ts
Write-Host "Updating environment.ts..." -ForegroundColor Cyan
$envPath = "talent-management\src\environments\environment.ts"
if (Test-Path $envPath) {
    $content = Get-Content $envPath -Raw
    $content = $content -replace "apiUrl: '.*'", "apiUrl: '$apiUrl'"
    $content = $content -replace "identityServerUrl: '.*'", "identityServerUrl: '$identityServerUrl'"
    $content = $content -replace "clientId: '.*'", "clientId: '$clientId'"
    $content = $content -replace "scope: '.*'", "scope: 'openid profile email $apiScope'"
    Set-Content $envPath $content
    Write-Host "✓ environment.ts updated" -ForegroundColor Green
}

# Update environment.prod.ts
Write-Host "Updating environment.prod.ts..." -ForegroundColor Cyan
$envProdPath = "talent-management\src\environments\environment.prod.ts"
if (Test-Path $envProdPath) {
    $content = Get-Content $envProdPath -Raw
    $content = $content -replace "apiUrl: '.*'", "apiUrl: '$apiUrl'"
    $content = $content -replace "identityServerUrl: '.*'", "identityServerUrl: '$identityServerUrl'"
    $content = $content -replace "clientId: '.*'", "clientId: '$clientId'"
    $content = $content -replace "scope: '.*'", "scope: 'openid profile email $apiScope'"
    Set-Content $envProdPath $content
    Write-Host "✓ environment.prod.ts updated" -ForegroundColor Green
}

# Rename project folder
Write-Host ""
Write-Host "Do you want to rename the 'talent-management' folder to '$projectName'? (y/n)" -ForegroundColor Yellow
$renameFolder = Read-Host
if ($renameFolder -eq "y") {
    if (Test-Path "talent-management") {
        Rename-Item "talent-management" $projectName
        Write-Host "✓ Folder renamed to $projectName" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Template initialization complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review and update public/data/menu.json with your menu structure"
Write-Host "2. Update public/i18n/en-US.json with your translations"
Write-Host "3. Customize roles and permissions in src/app/core/bootstrap/startup.service.ts"
Write-Host "4. Update CLAUDE.md with your project-specific documentation"
Write-Host "5. Replace public/favicon.ico with your application icon"
Write-Host ""
Write-Host "To start development:"
Write-Host "  cd $projectName" -ForegroundColor Yellow
Write-Host "  npm install" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "For detailed instructions, see TEMPLATE_SETUP_GUIDE.md" -ForegroundColor Cyan
