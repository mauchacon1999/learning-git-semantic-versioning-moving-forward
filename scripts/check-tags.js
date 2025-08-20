#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TagChecker {
    constructor() {
        this.packagePath = path.join(process.cwd(), 'package.json');
    }

    // Obtener la versión actual del package.json
    getCurrentVersion() {
        try {
            const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
            return packageJson.version;
        } catch (error) {
            console.error('❌ Error leyendo package.json:', error.message);
            process.exit(1);
        }
    }

    // Verificar si ya existe un tag para la versión actual
    tagExists(version) {
        try {
            const tagName = `v${version}`;
            const result = execSync(`git tag -l "${tagName}"`, { encoding: 'utf8' });
            return result.trim() === tagName;
        } catch (error) {
            return false;
        }
    }

    // Obtener todos los tags existentes
    getAllTags() {
        try {
            const result = execSync('git tag -l', { encoding: 'utf8' });
            return result.trim().split('\n').filter(tag => tag.length > 0);
        } catch (error) {
            return [];
        }
    }

    // Verificar si hay commits sin tag desde el último tag
    hasUnreleasedCommits() {
        try {
            const tags = this.getAllTags();
            if (tags.length === 0) {
                // Si no hay tags, verificar si hay commits
                const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' });
                return parseInt(commitCount.trim()) > 0;
            }

            // Verificar commits desde el último tag
            const lastTag = tags[tags.length - 1];
            const commitCount = execSync(`git rev-list --count ${lastTag}..HEAD`, { encoding: 'utf8' });
            return parseInt(commitCount.trim()) > 0;
        } catch (error) {
            return true; // Si hay error, asumir que hay commits sin tag
        }
    }

    // Verificar si es seguro crear un nuevo tag
    canCreateTag() {
        const currentVersion = this.getCurrentVersion();
        const tagName = `v${currentVersion}`;

        console.log(`📋 Verificando tag: ${tagName}`);

        if (this.tagExists(currentVersion)) {
            console.log(`❌ El tag ${tagName} ya existe`);
            console.log('💡 Opciones:');
            console.log('   1. Incrementar la versión en package.json');
            console.log('   2. Usar --force para sobrescribir');
            console.log('   3. Eliminar el tag existente');
            return false;
        }

        if (!this.hasUnreleasedCommits()) {
            console.log('⚠️  No hay commits nuevos desde el último tag');
            console.log('💡 Asegúrate de tener commits antes de crear un tag');
            return false;
        }

        console.log(`✅ Es seguro crear el tag ${tagName}`);
        return true;
    }

    // Mostrar información de tags existentes
    showTagInfo() {
        const tags = this.getAllTags();
        const currentVersion = this.getCurrentVersion();

        console.log('\n📊 Información de Tags:');
        console.log(`   Versión actual: ${currentVersion}`);
        console.log(`   Tags existentes: ${tags.length}`);

        if (tags.length > 0) {
            console.log('   Últimos 5 tags:');
            tags.slice(-5).forEach(tag => {
                const isCurrent = tag === `v${currentVersion}`;
                console.log(`     ${isCurrent ? '→ ' : '  '}${tag}${isCurrent ? ' (actual)' : ''}`);
            });
        }

        console.log(`   Commits sin tag: ${this.hasUnreleasedCommits() ? 'Sí' : 'No'}`);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const checker = new TagChecker();

    console.log('🔍 Verificando tags...\n');

    checker.showTagInfo();
    console.log('\n' + '='.repeat(50));

    const canCreate = checker.canCreateTag();

    if (canCreate) {
        console.log('\n✅ Puedes proceder con la creación del tag');
        process.exit(0);
    } else {
        console.log('\n❌ No se puede crear el tag en este momento');
        process.exit(1);
    }
}

module.exports = TagChecker;
