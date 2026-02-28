#!/bin/bash

# Script to sync master/main branch to develop branch in all submodules
# Usage: bash sync-master-to-develop.sh

set -e  # Exit on error

echo "========================================="
echo "Syncing master/main to develop in all submodules"
echo "========================================="
echo ""

# Get list of submodules
submodules=$(git submodule --quiet foreach --recursive 'echo $sm_path')

# Process each submodule
for submodule in $submodules; do
    echo "----------------------------------------"
    echo "Processing: $submodule"
    echo "----------------------------------------"

    cd "$submodule"

    # Determine if repo uses 'main' or 'master'
    if git show-ref --verify --quiet refs/heads/main; then
        MAIN_BRANCH="main"
    else
        MAIN_BRANCH="master"
    fi

    echo "Main branch: $MAIN_BRANCH"

    # Check if develop branch exists
    if ! git show-ref --verify --quiet refs/heads/develop; then
        echo "⚠️  No develop branch found in $submodule, skipping..."
        cd - > /dev/null
        continue
    fi

    # Fetch latest changes
    echo "Fetching latest changes..."
    git fetch origin

    # Checkout and update main/master
    echo "Updating $MAIN_BRANCH..."
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH"

    # Checkout and update develop
    echo "Updating develop..."
    git checkout develop
    git pull origin develop

    # Merge main/master into develop
    echo "Merging $MAIN_BRANCH into develop..."
    if git merge "$MAIN_BRANCH" --no-edit; then
        echo "✅ Merge successful"

        # Push to remote
        read -p "Push to origin/develop? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push origin develop
            echo "✅ Pushed to origin/develop"
        else
            echo "⏭️  Skipped push (you can push manually later)"
        fi
    else
        echo "❌ Merge conflict detected!"
        echo "Please resolve conflicts manually in: $submodule"
        echo "Then run: git add . && git commit && git push origin develop"
        cd - > /dev/null
        exit 1
    fi

    # Return to parent directory
    cd - > /dev/null
    echo ""
done

echo "========================================="
echo "✅ All submodules processed successfully"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update parent repo to reference new commits:"
echo "   git add ."
echo "   git commit -m 'Update submodules after syncing master to develop'"
echo "   git push"
