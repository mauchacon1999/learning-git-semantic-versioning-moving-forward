#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Estrategias de versionado por rama
 */
const BRANCH_STRATEGIES = {
    'main': {
        type: 'stable',
        prefix: 'v',
        description: 'Versiones estables de producción'
    },
    'master': {
        type: 'stable',
        prefix: 'v',
        description: 'Versiones estables de producción'
    },
    'develop': {
        type: 'pre-release',
        prefix: 'v',
        suffix: '-beta',
        description: 'Versiones beta para desarrollo'
    },
    'staging': {
        type: 'pre-release',
        prefix: 'v',
        suffix: '-rc',
        description: 'Versiones release candidate'
    },
    'feature': {
        type: 'pre-release',
        prefix: 'v',
        suffix: '-alpha',
        description: 'Versiones alpha para features'
    },
    'hotfix': {
        type: 'patch',
        prefix: 'v',
        description: 'Versiones de parche para correcciones urgentes'
    }
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
 * Obtiene el último tag de la rama actual
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

    // Remover prefijo y sufijos
    let version = tag.replace(/^v/, '');
    version = version.replace(/-alpha.*$/, '');
    version = version.replace(/-beta.*$/, '');
    version = version.replace(/-rc.*$/, '');
    version = version.replace(/\+.*$/, '');

    return version;
}

/**
 * Genera el siguiente número de versión según la estrategia
 */
function generateNextVersion(currentVersion, strategy, branchName) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (strategy.type) {
        case 'stable':
            return `${major}.${minor}.${patch + 1}`;

        case 'pre-release':
            if (branchName.startsWith('feature/')) {
                return `${major}.${minor + 1}.${patch}`;
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
    const branchSuffix = branchName.replace(/[^a-zA-Z0-9]/g, '-');

    switch (strategy.suffix) {
        case '-alpha':
            return `-alpha.${timestamp}`;
        case '-beta':
            return `-beta.${timestamp}`;
        case '-rc':
            return `-rc.${timestamp}`;
        default:
            return strategy.suffix;
    }
}

/**
 * Detecta la estrategia basada en el nombre de la rama
 */
function detectStrategy(branchName) {
    // Buscar coincidencias exactas primero
    if (BRANCH_STRATEGIES[branchName]) {
        return BRANCH_STRATEGIES[branchName];
    }

    // Buscar patrones en el nombre de la rama
    if (branchName.startsWith('feature/')) {
        return BRANCH_STRATEGIES['feature'];
    }

    if (branchName.startsWith('hotfix/')) {
        return BRANCH_STRATEGIES['hotfix'];
    }

    if (branchName.startsWith('release/')) {
        return BRANCH_STRATEGIES['staging'];
    }

    // Estrategia por defecto para ramas desconocidas
    return {
        type: 'pre-release',
        prefix: 'v',
        suffix: '-dev',
        description: 'Versión de desarrollo'
    };
}

/**
 * Función principal de auto-tagging
 */
function autoTag() {
    try {
        console.log('🤖 Auto-tagging por rama...\n');

        // Verificar si estamos en un repositorio Git
        try {
            execSync('git rev-parse --git-dir', { stdio: 'pipe' });
        } catch (error) {
            console.error('❌ Error: No se encontró un repositorio Git válido');
            process.exit(1);
        }

        // Obtener información de la rama
        const currentBranch = getCurrentBranch();
        const strategy = detectStrategy(currentBranch);
        const latestTag = getLatestTag();
        const baseVersion = extractBaseVersion(latestTag);

        console.log(`🌿 Rama actual: ${currentBranch}`);
        console.log(`📋 Estrategia: ${strategy.description}`);
        console.log(`🏷️  Último tag: ${latestTag || 'Ninguno'}`);
        console.log(`📊 Versión base: ${baseVersion}\n`);

        // Generar nueva versión
        const nextVersion = generateNextVersion(baseVersion, strategy, currentBranch);
        const suffix = generateSuffix(strategy, currentBranch);
        const newTag = `${strategy.prefix}${nextVersion}${suffix}`;

        console.log(`🎯 Nueva versión sugerida: ${newTag}`);

        // Verificar si hay cambios sin commitear
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
                    // Crear el tag
                    console.log(`\n🏷️  Creando tag: ${newTag}`);
                    execSync(`git tag ${newTag}`, { stdio: 'inherit' });

                    // Mostrar información del tag
                    const tagInfo = execSync(`git show ${newTag} --no-patch --format="%H"`, { encoding: 'utf8' }).trim();
                    console.log(`✅ Tag creado exitosamente en commit: ${tagInfo}`);

                    // Preguntar si hacer push
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

// Ejecutar la función principal
autoTag();
