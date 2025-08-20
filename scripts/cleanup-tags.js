#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TagCleanup {
    constructor() {
        this.packagePath = path.join(process.cwd(), 'package.json');
    }

    // Obtener todos los tags
    getAllTags() {
        try {
            const result = execSync('git tag -l', { encoding: 'utf8' });
            return result.trim().split('\n').filter(tag => tag.length > 0);
        } catch (error) {
            return [];
        }
    }

    // Obtener la versión actual
    getCurrentVersion() {
        try {
            const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
            return packageJson.version;
        } catch (error) {
            console.error('❌ Error leyendo package.json:', error.message);
            return null;
        }
    }

    // Encontrar tags duplicados
    findDuplicateTags() {
        const tags = this.getAllTags();
        const duplicates = [];
        const seen = new Set();

        tags.forEach(tag => {
            if (seen.has(tag)) {
                duplicates.push(tag);
            } else {
                seen.add(tag);
            }
        });

        return duplicates;
    }

    // Encontrar tags que no coinciden con la versión actual
    findMismatchedTags() {
        const currentVersion = this.getCurrentVersion();
        const tags = this.getAllTags();
        const expectedTag = `v${currentVersion}`;

        return tags.filter(tag => tag === expectedTag);
    }

    // Eliminar tag local
    deleteLocalTag(tagName) {
        try {
            execSync(`git tag -d ${tagName}`, { stdio: 'pipe' });
            console.log(`✅ Tag local eliminado: ${tagName}`);
            return true;
        } catch (error) {
            console.log(`❌ Error eliminando tag local ${tagName}: ${error.message}`);
            return false;
        }
    }

    // Eliminar tag remoto
    deleteRemoteTag(tagName) {
        try {
            execSync(`git push origin --delete ${tagName}`, { stdio: 'pipe' });
            console.log(`✅ Tag remoto eliminado: ${tagName}`);
            return true;
        } catch (error) {
            console.log(`⚠️  Tag remoto ${tagName} no existe o ya fue eliminado`);
            return false;
        }
    }

    // Mostrar información de tags
    showTagInfo() {
        const tags = this.getAllTags();
        const currentVersion = this.getCurrentVersion();
        const duplicates = this.findDuplicateTags();

        console.log('\n📊 Información de Tags:');
        console.log(`   Versión actual: ${currentVersion}`);
        console.log(`   Tags totales: ${tags.length}`);
        console.log(`   Tags duplicados: ${duplicates.length}`);

        if (tags.length > 0) {
            console.log('\n   Todos los tags:');
            tags.forEach(tag => {
                const isCurrent = tag === `v${currentVersion}`;
                const isDuplicate = duplicates.includes(tag);
                let marker = '  ';
                if (isCurrent) marker = '→ ';
                if (isDuplicate) marker = '⚠️ ';
                console.log(`     ${marker}${tag}${isCurrent ? ' (actual)' : ''}${isDuplicate ? ' (duplicado)' : ''}`);
            });
        }
    }

    // Limpiar tags duplicados
    cleanupDuplicates() {
        const duplicates = this.findDuplicateTags();

        if (duplicates.length === 0) {
            console.log('✅ No hay tags duplicados para limpiar');
            return;
        }

        console.log(`\n🧹 Limpiando ${duplicates.length} tags duplicados...`);

        duplicates.forEach(tag => {
            console.log(`\n📝 Procesando: ${tag}`);
            this.deleteLocalTag(tag);
            this.deleteRemoteTag(tag);
        });

        console.log('\n✅ Limpieza de duplicados completada');
    }

    // Limpiar tag específico
    cleanupSpecificTag(tagName) {
        console.log(`\n🧹 Limpiando tag específico: ${tagName}`);

        const deleted = this.deleteLocalTag(tagName);
        if (deleted) {
            this.deleteRemoteTag(tagName);
        }
    }

    // Limpiar todos los tags (¡CUIDADO!)
    cleanupAllTags() {
        const tags = this.getAllTags();

        if (tags.length === 0) {
            console.log('✅ No hay tags para limpiar');
            return;
        }

        console.log(`\n⚠️  ATENCIÓN: Esto eliminará TODOS los ${tags.length} tags`);
        console.log('¿Estás seguro? (y/N)');

        // En un entorno real, aquí pedirías confirmación
        console.log('💡 Para confirmar, ejecuta: node scripts/cleanup-tags.js --confirm-all');
    }

    // Ejecutar limpieza
    run() {
        const args = process.argv.slice(2);

        console.log('🔍 Verificando tags...');
        this.showTagInfo();

        if (args.includes('--duplicates')) {
            this.cleanupDuplicates();
        } else if (args.includes('--all')) {
            this.cleanupAllTags();
        } else if (args.includes('--tag')) {
            const tagIndex = args.indexOf('--tag');
            if (tagIndex + 1 < args.length) {
                const tagName = args[tagIndex + 1];
                this.cleanupSpecificTag(tagName);
            } else {
                console.log('❌ Debes especificar un tag: --tag <nombre-del-tag>');
            }
        } else {
            console.log('\n💡 Opciones disponibles:');
            console.log('   npm run cleanup:tags --duplicates  # Limpiar duplicados');
            console.log('   npm run cleanup:tags --all         # Limpiar todos (¡CUIDADO!)');
            console.log('   npm run cleanup:tags --tag v1.0.0  # Limpiar tag específico');
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const cleanup = new TagCleanup();
    cleanup.run();
}

module.exports = TagCleanup;
