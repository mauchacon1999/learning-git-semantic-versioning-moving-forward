#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitFlowAutomation {
    constructor() {
        this.currentBranch = this.getCurrentBranch();
        this.packageJson = this.readPackageJson();
        this.currentVersion = this.packageJson.version;
    }

    // Utility methods
    getCurrentBranch() {
        try {
            return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        } catch (error) {
            console.error('❌ Error getting current branch:', error.message);
            process.exit(1);
        }
    }

    readPackageJson() {
        try {
            const packagePath = path.join(process.cwd(), 'package.json');
            return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        } catch (error) {
            console.error('❌ Error reading package.json:', error.message);
            process.exit(1);
        }
    }

    executeCommand(command, options = {}) {
        try {
            console.log(`🔄 Executing: ${command}`);
            return execSync(command, {
                encoding: 'utf8',
                stdio: 'inherit',
                ...options
            });
        } catch (error) {
            console.error(`❌ Command failed: ${command}`);
            console.error(error.message);
            if (!options.continueOnError) {
                process.exit(1);
            }
        }
    }

    getLatestTag() {
        try {
            return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'v0.0.0';
        }
    }

    // 🛡️ NUEVO: Verificar si un tag ya existe
    tagExists(tagName) {
        try {
            execSync(`git rev-parse v${tagName}`, {
                encoding: 'utf8',
                stdio: 'pipe'
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    // 🛡️ NUEVO: Generar tag único con timestamp
    generateUniqueTag(baseVersion, type) {
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        return `${baseVersion}-${type}.${timestamp}.${randomSuffix}`;
    }

    // 🛡️ NUEVO: Verificar y crear tag único
    createUniqueTag(baseVersion, type, description) {
        let attempt = 1;
        let tagName;
        
        do {
            if (attempt === 1) {
                tagName = `${baseVersion}-${type}.${Date.now()}`;
            } else {
                tagName = this.generateUniqueTag(baseVersion, type);
            }
            
            console.log(`🏷️  Attempt ${attempt}: Creating tag v${tagName}`);
            
            if (!this.tagExists(tagName)) {
                console.log(`✅ Tag v${tagName} is unique - proceeding`);
                // Usar standard-version directamente sin --release-as para evitar el problema de vnull
                this.executeCommand(`yarn release:${type}`);
                return tagName;
            } else {
                console.log(`⚠️  Tag v${tagName} already exists - trying again`);
                attempt++;
            }
        } while (attempt <= 3);
        
        console.error(`❌ Failed to create unique tag after ${attempt} attempts`);
        process.exit(1);
    }

    getNextVersion(type, currentVersion = this.currentVersion) {
        const [major, minor, patch] = currentVersion.split('.').map(Number);

        switch (type) {
            case 'major':
                return `${major + 1}.0.0`;
            case 'minor':
                return `${major}.${minor + 1}.0`;
            case 'patch':
                return `${major}.${minor}.${patch + 1}`;
            default:
                return currentVersion;
        }
    }

    // Feature branch automation
    async handleFeature() {
        console.log('🚀 GitFlow Feature Automation');
        console.log(`📍 Current branch: ${this.currentBranch}`);

        if (!this.currentBranch.startsWith('add/') &&
            !this.currentBranch.startsWith('fix/') &&
            !this.currentBranch.startsWith('update/')) {
            console.log('⚠️  Not a feature branch. Skipping feature automation.');
            return;
        }

        // Check if we're merging to development
        const mergeBase = this.executeCommand('git merge-base HEAD development', {
            encoding: 'utf8',
            stdio: 'pipe'
        });

        if (mergeBase) {
            console.log('🔄 Feature merged to development - creating alpha tag');
            this.createAlphaTag();
        }
    }

    // Release branch automation
    async handleRelease() {
        console.log('🚀 GitFlow Release Automation');
        console.log(`📍 Current branch: ${this.currentBranch}`);

        if (!this.currentBranch.startsWith('release/')) {
            console.log('⚠️  Not a release branch. Skipping release automation.');
            return;
        }

        // Extract version from branch name
        const versionMatch = this.currentBranch.match(/release\/(\d+\.\d+\.\d+)/);
        if (!versionMatch) {
            console.error('❌ Invalid release branch format. Expected: release/X.Y.Z');
            process.exit(1);
        }

        const targetVersion = versionMatch[1];
        console.log(`🎯 Target version: ${targetVersion}`);

        // Create beta tag for QA
        this.createBetaTag(targetVersion);
    }

    // Hotfix automation
    async handleHotfix() {
        console.log('🚀 GitFlow Hotfix Automation');
        console.log(`📍 Current branch: ${this.currentBranch}`);

        if (!this.currentBranch.startsWith('hotfix/')) {
            console.log('⚠️  Not a hotfix branch. Skipping hotfix automation.');
            return;
        }

        // Determine if we're in release or master
        const isInRelease = this.currentBranch.includes('release');

        if (isInRelease) {
            console.log('🔥 Hotfix in release branch - creating RC tag');
            this.createRCTag();
        } else {
            console.log('🔥 Hotfix in master - creating patch tag');
            this.createPatchTag();
        }
    }

    // Merge automation
    async handleMerge() {
        console.log('🚀 GitFlow Merge Automation');
        console.log(`📍 Current branch: ${this.currentBranch}`);

        if (this.currentBranch === 'development') {
            console.log('🔄 Development branch - checking for feature merges');
            this.handleDevelopmentMerge();
        } else if (this.currentBranch === 'master') {
            console.log('🔄 Master branch - creating final release tag');
            this.createFinalTag();
        }
    }

    // Tag creation methods con prevención de duplicados
    createAlphaTag() {
        const nextMinor = this.getNextVersion('minor');
        console.log(`🏷️  Creating alpha tag for version ${nextMinor}`);
        this.createUniqueTag(nextMinor, 'alpha', 'Alpha release for development');
    }

    createBetaTag(version) {
        console.log(`🏷️  Creating beta tag for version ${version}`);
        this.createUniqueTag(version, 'beta', 'Beta release for QA');
    }

    createRCTag() {
        const nextPatch = this.getNextVersion('patch');
        console.log(`🏷️  Creating RC tag for version ${nextPatch}`);
        this.createUniqueTag(nextPatch, 'rc', 'Release candidate');
    }

    createPatchTag() {
        const nextPatch = this.getNextVersion('patch');
        console.log(`🏷️  Creating patch tag: v${nextPatch}`);

        // Para tags finales, verificar si ya existe
        if (this.tagExists(nextPatch)) {
            console.log(`⚠️  Tag v${nextPatch} already exists - skipping`);
            return;
        }

        this.executeCommand(`yarn release:patch --release-as ${nextPatch}`);
    }

    createFinalTag() {
        const nextMinor = this.getNextVersion('minor');
        console.log(`🏷️  Creating final release tag: v${nextMinor}`);

        // Para tags finales, verificar si ya existe
        if (this.tagExists(nextMinor)) {
            console.log(`⚠️  Tag v${nextMinor} already exists - skipping`);
            return;
        }

        this.executeCommand(`yarn release:minor --release-as ${nextMinor}`);
    }

    handleDevelopmentMerge() {
        // Check if there are new commits since last tag
        const lastTag = this.getLatestTag();
        const newCommits = this.executeCommand(`git log ${lastTag}..HEAD --oneline`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });

        if (newCommits.trim()) {
            console.log('🔄 New commits detected - creating alpha tag');
            this.createAlphaTag();
        } else {
            console.log('ℹ️  No new commits since last tag');
        }
    }

    // Main execution
    async run() {
        const command = process.argv[2];

        switch (command) {
            case 'feature':
                await this.handleFeature();
                break;
            case 'release':
                await this.handleRelease();
                break;
            case 'hotfix':
                await this.handleHotfix();
                break;
            case 'merge':
                await this.handleMerge();
                break;
            default:
                console.log('❌ Invalid command. Use: feature, release, hotfix, or merge');
                process.exit(1);
        }
    }
}

// Run the automation
const gitflow = new GitFlowAutomation();
gitflow.run().catch(error => {
    console.error('❌ GitFlow automation failed:', error);
    process.exit(1);
});
