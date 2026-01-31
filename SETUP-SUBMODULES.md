# Setting Up Git Submodules

This guide will help you convert the existing repositories into proper Git submodules.

**Tutorial Repository**: https://github.com/workcontrolgit/AngularNetTutotial.git

## Current Situation

You have:
- A parent Git repository initialized at `c:\apps\medium`
- Three component folders with their own Git repositories (or content)

## Steps to Set Up Submodules

### Important: Close VS Code First

Before running these commands, **close VS Code** or any other applications that might have the folders open. This prevents file locking issues.

### 1. Remove Existing Content

Open PowerShell or Git Bash and navigate to your project:

```bash
cd c:\apps\medium
```

Remove the existing folders (they have their .git directories removed already):

```bash
# Remove existing folders
rm -rf Clients/TalentManagement-Angular-Material
rm -rf ApiResources/TalentManagement-API
rm -rf TokenService/Duende-IdentityServer
```

### 2. Add Submodules

Add the Angular client as a submodule:

```bash
git submodule add https://github.com/workcontrolgit/TalentManagement-Angular-Material.git Clients/TalentManagement-Angular-Material
```

Add the API as a submodule:

```bash
git submodule add https://github.com/workcontrolgit/TalentManagement-API.git ApiResources/TalentManagement-API
```

Add IdentityServer as a submodule:

```bash
git submodule add https://github.com/workcontrolgit/Duende-IdentityServer.git TokenService/Duende-IdentityServer
```

### 3. Initialize and Update Submodules

```bash
git submodule update --init --recursive
```

### 4. Commit the Parent Repository

```bash
git add .gitmodules Clients/ ApiResources/ TokenService/ README.md .gitignore
git commit -m "Add submodules for Angular client, API, and IdentityServer"
```

### 5. Push to GitHub Repository

Push your changes to the tutorial repository:

```bash
git remote add origin https://github.com/workcontrolgit/AngularNetTutotial.git
git branch -M main
git push -u origin main
```

**Note**: If the remote already exists, just push:
```bash
git push
```

## Verifying Setup

Check submodule status:

```bash
git submodule status
```

You should see something like:
```
 <commit-hash> Clients/TalentManagement-Angular-Material (heads/main)
 <commit-hash> ApiResources/TalentManagement-API (heads/main)
 <commit-hash> TokenService/Duende-IdentityServer (heads/main)
```

## Working with Submodules

### Cloning the Repository

Anyone cloning your tutorial should use:

```bash
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutotial.git
```

### Updating Submodules

To get latest changes from all submodules:

```bash
git submodule update --remote --merge
```

### Making Changes in a Submodule

1. Navigate to the submodule:
   ```bash
   cd ApiResources/TalentManagement-API
   ```

2. Create a branch and make changes:
   ```bash
   git checkout -b feature/my-feature
   # Make your changes
   git add .
   git commit -m "Add feature"
   git push origin feature/my-feature
   ```

3. Update parent repository to reference new commit:
   ```bash
   cd ../..
   git add ApiResources/TalentManagement-API
   git commit -m "Update API submodule to latest"
   git push
   ```

## All Components as Submodules

All three components (Angular client, API, and IdentityServer) are set up as Git submodules. This means:

- Each component maintains its own Git history
- Changes to each component are tracked in their respective repositories
- The parent repository only tracks which commit of each submodule to use
- Students can work on individual components independently

## Troubleshooting

### "fatal: destination path exists and is not an empty directory"

The folder still has content. Remove it completely:
```bash
rm -rf ApiResources/TalentManagement-API
```

### Submodule shows modified but you didn't change anything

The submodule might be on a different commit. Navigate to it and check:
```bash
cd ApiResources/TalentManagement-API
git status
git log
```

Either commit the changes or reset to the desired commit.

### Need to change submodule URL

Edit `.gitmodules` file and update the URL, then:
```bash
git submodule sync
git submodule update --init --recursive
```

## Alternative: Manual Setup Script

Create a file `setup-submodules.sh`:

```bash
#!/bin/bash

echo "Setting up Git submodules for CAT Pattern Tutorial..."

# Remove existing folders
echo "Removing existing folders..."
rm -rf Clients/TalentManagement-Angular-Material
rm -rf ApiResources/TalentManagement-API
rm -rf TokenService/Duende-IdentityServer

# Add submodules
echo "Adding Angular client submodule..."
git submodule add https://github.com/workcontrolgit/TalentManagement-Angular-Material.git Clients/TalentManagement-Angular-Material

echo "Adding API submodule..."
git submodule add https://github.com/workcontrolgit/TalentManagement-API.git ApiResources/TalentManagement-API

echo "Adding IdentityServer submodule..."
git submodule add https://github.com/workcontrolgit/Duende-IdentityServer.git TokenService/Duende-IdentityServer

# Initialize
echo "Initializing submodules..."
git submodule update --init --recursive

echo "Done! Don't forget to commit the changes:"
echo "git add ."
echo "git commit -m 'Add submodules for Angular client, API, and IdentityServer'"
```

Make it executable and run:
```bash
chmod +x setup-submodules.sh
./setup-submodules.sh
```
