#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Estrategias de versionado por rama
 */
const BRANCH_STRATEGIES = {
    'main': { type: 'stable', prefix: 'v', description: 'Versiones estables de producción' },
    'master': { type: 'stable', prefix: 'v', description: 'Versiones estables de producción' },
    'development': { type: 'pre-release', prefix: 'v', suffix: '-beta', description: 'Versiones beta para desarrollo' },
    'feature': { type: 'pre-release', prefix: 'v', suffix: '-alpha', description: 'Versiones alpha para features' },
    'release': { type: 'pre-release', prefix: 'v', suffix: '-rc', description: 'Versiones release candidate para QA' },
    'hotfix': { type: 'patch', prefix: 'v', description: 'Versiones de parche para correcciones urgentes' }
};

/**
 * Obtiene la rama actual
 */
function getCurrentBranch() {
    try {
        return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
        console.error('❌ Error al obtener la rama actual:', error.message);
        process.exit(1);
    }
}

/**
 * Obtiene el último tag
 */
function getLatestTag() {
    try {
        const tags = execSync('git tag --list --sort=-version:refname', { encoding: 'utf8' })
            .trim()
            .split('\n')
            .filter(tag => tag.length > 0);
        return tags.length > 0 ? tags[0] : null;
    } catch (error) {
        return null;
    }
}

/**
 * Extrae la versión base de un tag
 */
function extractBaseVersion(tag) {
    if (!tag) return '0.0.0';
    
    let version = tag.replace(/^v/, '');
    version = version.replace(/-alpha\..*$/, '');
    version = version.replace(/-beta\..*$/, '');
    version = version.replace(/-rc\..*$/, '');
    version = version.replace(/-stable.*$/, '');
    version = version.replace(/-dev.*$/, '');
    version = version.replace(/\+.*$/, '');
    
    return version;
}

/**
 * Verifica si el commit actual ya tiene un tag
 */
function hasTagForCurrentCommit() {
    try {
        const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        const tagsForCommit = execSync(`git tag --points-at ${currentCommit}`, { encoding: 'utf8' })
            .trim()
            .split('\n')
            .filter(tag => tag.length > 0);
        
        return tagsForCommit.length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * Detecta la estrategia basada en el nombre de la rama
 */
function detectStrategy(branchName) {
    // Buscar coincidencias exactas
    if (BRANCH_STRATEGIES[branchName]) {
        return BRANCH_STRATEGIES[branchName];
    }

    // Buscar patrones
    if (branchName.startsWith('feature/') || branchName.startsWith('fix/') || branchName.startsWith('skin/')) {
        return BRANCH_STRATEGIES['feature'];
    }
    if (branchName.startsWith('hotfix/')) {
        return BRANCH_STRATEGIES['hotfix'];
    }
    if (branchName.startsWith('release/')) {
        return BRANCH_STRATEGIES['release'];
    }

    // Estrategia por defecto
    return {
        type: 'pre-release',
        prefix: 'v',
        suffix: '-dev',
        description: 'Versión de desarrollo'
    };
}

/**
 * Genera la siguiente versión
 */
function generateNextVersion(currentVersion, strategy, branchName) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (strategy.type) {
        case 'stable':
            return `${major}.${minor}.${patch + 1}`;
        
        case 'pre-release':
            if (branchName.startsWith('feature/') || branchName.startsWith('fix/') || branchName.startsWith('skin/')) {
                return `${major}.${minor}.${patch}`;
            }
            if (branchName === 'development') {
                return `${major}.${minor + 1}.0`;
            }
            if (branchName.startsWith('release/')) {
                return `${major}.${minor}.${patch}`;
            }
            return `${major}.${minor}.${patch + 1}`;
        
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        
        default:
            return `${major}.${minor}.${patch + 1}`;
    }
}

/**
 * Genera el sufijo para pre-releases
 */
function generateSuffix(strategy, branchName) {
    if (!strategy.suffix) return '';
    
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    if (branchName.startsWith('feature/') || branchName.startsWith('fix/') || branchName.startsWith('skin/')) {
        return `-alpha.${timestamp}`;
    }
    if (branchName.startsWith('release/')) {
        return `-rc.${timestamp}`;
    }
    if (branchName === 'development') {
        return `-beta.${timestamp}`;
    }
    
    return strategy.suffix;
}

/**
 * Función principal
 */
function autoTag() {
    try {
        console.log('🤖 Auto-tagging por rama...\n');

        // Verificar repositorio Git
        try {
            execSync('git rev-parse --git-dir', { stdio: 'pipe' });
        } catch (error) {
            console.error('❌ Error: No se encontró un repositorio Git válido');
            process.exit(1);
        }

        // Obtener información
        const currentBranch = getCurrentBranch();
        const strategy = detectStrategy(currentBranch);
        const latestTag = getLatestTag();
        const baseVersion = extractBaseVersion(latestTag);

        console.log(`🌿 Rama actual: ${currentBranch}`);
        console.log(`📋 Estrategia: ${strategy.description}`);
        console.log(`🏷️  Último tag: ${latestTag || 'Ninguno'}`);
        console.log(`📊 Versión base: ${baseVersion}\n`);

        // Verificar si ya tiene tag
        if (hasTagForCurrentCommit()) {
            console.log('✅ El commit actual ya tiene un tag');
            console.log('💡 No se necesita crear un nuevo tag');
            return;
        }

        // Generar nueva versión
        const nextVersion = generateNextVersion(baseVersion, strategy, currentBranch);
        const suffix = generateSuffix(strategy, currentBranch);
        const newTag = `${strategy.prefix}${nextVersion}${suffix}`;

        console.log(`🎯 Nueva versión sugerida: ${newTag}`);

        // Verificar cambios sin commitear
        const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
        if (status) {
            console.log('\n⚠️  Hay cambios sin commitear:');
            console.log(status);
            console.log('\n💡 Haz commit de tus cambios antes de crear el tag');
            return;
        }

        // Preguntar confirmación
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question(`¿Crear tag ${newTag}? (y/N): `, (answer) => {
            readline.close();

            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                try {
                    console.log(`\n🏷️  Creando tag: ${newTag}`);
                    execSync(`git tag ${newTag}`, { stdio: 'inherit' });

                    const tagInfo = execSync(`git show ${newTag} --no-patch --format="%H"`, { encoding: 'utf8' }).trim();
                    console.log(`✅ Tag creado exitosamente en commit: ${tagInfo}`);

                    const pushReadline = require('readline').createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    pushReadline.question('¿Hacer push del tag al repositorio remoto? (y/N): ', (pushAnswer) => {
                        pushReadline.close();

                        if (pushAnswer.toLowerCase() === 'y' || pushAnswer.toLowerCase() === 'yes') {
                            console.log('🚀 Haciendo push del tag...');
                            execSync(`git push origin ${newTag}`, { stdio: 'inherit' });
                            console.log('✅ Tag enviado al repositorio remoto');
                        } else {
                            console.log('💡 Para hacer push más tarde: git push origin ' + newTag);
                        }
                    });

                } catch (error) {
                    console.error('❌ Error al crear el tag:', error.message);
                    process.exit(1);
                }
            } else {
                console.log('❌ Creación de tag cancelada');
            }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar
autoTag();
