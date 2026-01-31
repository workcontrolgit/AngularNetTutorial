#!/bin/bash

# Template Initialization Script
# This script helps you quickly customize the Angular template for your new project

echo "========================================"
echo "Angular Enterprise Template Initializer"
echo "========================================"
echo ""

# Get project details from user
read -p "Enter your project name (lowercase, hyphen-separated, e.g., 'my-company-hr'): " projectName
read -p "Enter your project display name (e.g., 'My Company HR'): " projectDisplayName
read -p "Enter your API URL (e.g., 'https://api.mycompany.com/api/v1'): " apiUrl
read -p "Enter your IdentityServer URL (e.g., 'https://identity.mycompany.com'): " identityServerUrl
read -p "Enter your OIDC Client ID (e.g., 'MyCompanyHR'): " clientId
read -p "Enter your API scope (e.g., 'app.api.mycompany.read'): " apiScope

echo ""
echo "========================================"
echo "Configuration Summary:"
echo "========================================"
echo "Project Name: $projectName"
echo "Display Name: $projectDisplayName"
echo "API URL: $apiUrl"
echo "IdentityServer: $identityServerUrl"
echo "Client ID: $clientId"
echo "API Scope: $apiScope"
echo ""

read -p "Is this correct? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Initialization cancelled."
    exit 1
fi

echo ""
echo "Initializing template..."

# Update package.json
echo "Updating package.json..."
packageJsonPath="talent-management/package.json"
if [ -f "$packageJsonPath" ]; then
    # Use sed for in-place replacement (macOS and Linux compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"name\": \".*\"/\"name\": \"$projectName\"/" "$packageJsonPath"
    else
        # Linux
        sed -i "s/\"name\": \".*\"/\"name\": \"$projectName\"/" "$packageJsonPath"
    fi
    echo "✓ package.json updated"
fi

# Update angular.json
echo "Updating angular.json..."
angularJsonPath="talent-management/angular.json"
if [ -f "$angularJsonPath" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"talent-management\"/\"$projectName\"/g" "$angularJsonPath"
    else
        sed -i "s/\"talent-management\"/\"$projectName\"/g" "$angularJsonPath"
    fi
    echo "✓ angular.json updated"
fi

# Update environment.ts
echo "Updating environment.ts..."
envPath="talent-management/src/environments/environment.ts"
if [ -f "$envPath" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|apiUrl: '.*'|apiUrl: '$apiUrl'|" "$envPath"
        sed -i '' "s|identityServerUrl: '.*'|identityServerUrl: '$identityServerUrl'|" "$envPath"
        sed -i '' "s|clientId: '.*'|clientId: '$clientId'|" "$envPath"
        sed -i '' "s|scope: '.*'|scope: 'openid profile email $apiScope'|" "$envPath"
    else
        sed -i "s|apiUrl: '.*'|apiUrl: '$apiUrl'|" "$envPath"
        sed -i "s|identityServerUrl: '.*'|identityServerUrl: '$identityServerUrl'|" "$envPath"
        sed -i "s|clientId: '.*'|clientId: '$clientId'|" "$envPath"
        sed -i "s|scope: '.*'|scope: 'openid profile email $apiScope'|" "$envPath"
    fi
    echo "✓ environment.ts updated"
fi

# Update environment.prod.ts
echo "Updating environment.prod.ts..."
envProdPath="talent-management/src/environments/environment.prod.ts"
if [ -f "$envProdPath" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|apiUrl: '.*'|apiUrl: '$apiUrl'|" "$envProdPath"
        sed -i '' "s|identityServerUrl: '.*'|identityServerUrl: '$identityServerUrl'|" "$envProdPath"
        sed -i '' "s|clientId: '.*'|clientId: '$clientId'|" "$envProdPath"
        sed -i '' "s|scope: '.*'|scope: 'openid profile email $apiScope'|" "$envProdPath"
    else
        sed -i "s|apiUrl: '.*'|apiUrl: '$apiUrl'|" "$envProdPath"
        sed -i "s|identityServerUrl: '.*'|identityServerUrl: '$identityServerUrl'|" "$envProdPath"
        sed -i "s|clientId: '.*'|clientId: '$clientId'|" "$envProdPath"
        sed -i "s|scope: '.*'|scope: 'openid profile email $apiScope'|" "$envProdPath"
    fi
    echo "✓ environment.prod.ts updated"
fi

# Rename project folder
echo ""
read -p "Do you want to rename the 'talent-management' folder to '$projectName'? (y/n): " renameFolder
if [ "$renameFolder" = "y" ]; then
    if [ -d "talent-management" ]; then
        mv talent-management "$projectName"
        echo "✓ Folder renamed to $projectName"
    fi
fi

echo ""
echo "========================================"
echo "Template initialization complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Review and update public/data/menu.json with your menu structure"
echo "2. Update public/i18n/en-US.json with your translations"
echo "3. Customize roles and permissions in src/app/core/bootstrap/startup.service.ts"
echo "4. Update CLAUDE.md with your project-specific documentation"
echo "5. Replace public/favicon.ico with your application icon"
echo ""
echo "To start development:"
echo "  cd $projectName"
echo "  npm install"
echo "  npm start"
echo ""
echo "For detailed instructions, see TEMPLATE_SETUP_GUIDE.md"
