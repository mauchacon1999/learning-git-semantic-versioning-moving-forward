#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class HuskySetup {
    constructor() {
        this.huskyDir = path.join(process.cwd(), '.husky');
        this.scriptsDir = path.join(process.cwd(), 'scripts');
    }

    createHuskyDir() {
        if (!fs.existsSync(this.huskyDir)) {
            fs.mkdirSync(this.huskyDir, { recursive: true });
        }
    }

    createHook(hookName, content) {
        const hookPath = path.join(this.huskyDir, hookName);
        fs.writeFileSync(hookPath, content, { mode: 0o755 });
        console.log(`✅ Created hook: ${hookName}`);
    }

    setupHooks() {
        console.log('🚀 Setting up Husky hooks for GitFlow automation...');
        
        this.createHuskyDir();

        // Post-merge hook for development and master
        const postMergeContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔄 Post-merge hook triggered"
echo "📍 Current branch: $(git branch --show-current)"

# Run GitFlow automation based on branch
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "development" ]; then
    echo "🔄 Development branch - running merge automation"
    yarn gitflow:merge
elif [ "$CURRENT_BRANCH" = "master" ]; then
    echo "🔄 Master branch - running merge automation"
    yarn gitflow:merge
fi
`;

        // Pre-push hook for feature branches
        const prePushContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Pre-push hook triggered"
echo "📍 Current branch: $(git branch --show-current)"

# Run GitFlow automation based on branch type
CURRENT_BRANCH=$(git branch --show-current)

if [[ "$CURRENT_BRANCH" == add/* ]] || [[ "$CURRENT_BRANCH" == fix/* ]] || [[ "$CURRENT_BRANCH" == update/* ]]; then
    echo "🔄 Feature branch - running feature automation"
    yarn gitflow:feature
elif [[ "$CURRENT_BRANCH" == release/* ]]; then
    echo "🔄 Release branch - running release automation"
    yarn gitflow:release
elif [[ "$CURRENT_BRANCH" == hotfix/* ]]; then
    echo "🔄 Hotfix branch - running hotfix automation"
    yarn gitflow:hotfix
fi
`;

        // Post-commit hook for immediate tagging
        const postCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "💾 Post-commit hook triggered"
echo "📍 Current branch: $(git branch --show-current)"

# Only run for specific branch types
CURRENT_BRANCH=$(git branch --show-current)

if [[ "$CURRENT_BRANCH" == release/* ]]; then
    echo "🔄 Release branch commit - running release automation"
    yarn gitflow:release
elif [[ "$CURRENT_BRANCH" == hotfix/* ]]; then
    echo "🔄 Hotfix branch commit - running hotfix automation"
    yarn gitflow:hotfix
fi
`;

        this.createHook('post-merge', postMergeContent);
        this.createHook('pre-push', prePushContent);
        this.createHook('post-commit', postCommitContent);

        console.log('✅ All Husky hooks created successfully!');
    }
}

// Run the setup
const setup = new HuskySetup();
setup.setupHooks();
