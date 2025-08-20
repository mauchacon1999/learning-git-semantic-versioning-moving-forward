#!/usr/bin/env node

const { execSync } = require('child_process');

class TagCleanup {
    constructor() {
        this.tags = this.getAllTags();
    }

    getAllTags() {
        try {
            const tags = execSync('git tag --sort=-version:refname', { 
                encoding: 'utf8' 
            }).trim().split('\n').filter(tag => tag);
            return tags;
        } catch (error) {
            console.log('No tags found');
            return [];
        }
    }

    findDuplicateTags() {
        const duplicates = {};
        
        this.tags.forEach(tag => {
            // Extraer la versión base (sin timestamp)
            const baseVersion = tag.replace(/-\w+\.\d+\.\d+$/, '');
            
            if (!duplicates[baseVersion]) {
                duplicates[baseVersion] = [];
            }
            duplicates[baseVersion].push(tag);
        });

        return Object.entries(duplicates)
            .filter(([base, tags]) => tags.length > 1)
            .reduce((acc, [base, tags]) => {
                acc[base] = tags;
                return acc;
            }, {});
    }

    showDuplicateTags() {
        console.log('🔍 Buscando tags duplicados...\n');
        
        const duplicates = this.findDuplicateTags();
        
        if (Object.keys(duplicates).length === 0) {
            console.log('✅ No se encontraron tags duplicados');
            return;
        }

        console.log('⚠️  Tags duplicados encontrados:\n');
        
        Object.entries(duplicates).forEach(([base, tags]) => {
            console.log(`📦 ${base}:`);
            tags.forEach(tag => {
                console.log(`   - ${tag}`);
            });
            console.log('');
        });
    }

    cleanupDuplicateTags() {
        console.log('🧹 Limpiando tags duplicados...\n');
        
        const duplicates = this.findDuplicateTags();
        
        if (Object.keys(duplicates).length === 0) {
            console.log('✅ No hay tags duplicados para limpiar');
            return;
        }

        Object.entries(duplicates).forEach(([base, tags]) => {
            console.log(`📦 Limpiando duplicados de ${base}:`);
            
            // Mantener el más reciente (primero en la lista)
            const keepTag = tags[0];
            const removeTags = tags.slice(1);
            
            console.log(`   ✅ Manteniendo: ${keepTag}`);
            
            removeTags.forEach(tag => {
                try {
                    console.log(`   🗑️  Eliminando: ${tag}`);
                    execSync(`git tag -d ${tag}`, { stdio: 'pipe' });
                    
                    // También eliminar del remoto si existe
                    try {
                        execSync(`git push origin --delete ${tag}`, { stdio: 'pipe' });
                        console.log(`   🌐 Eliminado del remoto: ${tag}`);
                    } catch (error) {
                        console.log(`   ⚠️  No se pudo eliminar del remoto: ${tag}`);
                    }
                } catch (error) {
                    console.log(`   ❌ Error eliminando: ${tag}`);
                }
            });
            console.log('');
        });
    }

    showTagSummary() {
        console.log('📊 Resumen de Tags:\n');
        
        const duplicates = this.findDuplicateTags();
        const uniqueTags = this.tags.length - Object.values(duplicates)
            .reduce((total, tags) => total + (tags.length - 1), 0);
        
        console.log(`📈 Total de tags: ${this.tags.length}`);
        console.log(`✅ Tags únicos: ${uniqueTags}`);
        console.log(`⚠️  Tags duplicados: ${this.tags.length - uniqueTags}`);
        console.log(`🔄 Grupos duplicados: ${Object.keys(duplicates).length}`);
        
        if (this.tags.length > 0) {
            console.log(`\n🏷️  Tags más recientes:`);
            this.tags.slice(0, 5).forEach(tag => {
                console.log(`   - ${tag}`);
            });
        }
    }

    run() {
        const command = process.argv[2];
        
        switch (command) {
            case 'show':
                this.showDuplicateTags();
                break;
            case 'cleanup':
                this.cleanupDuplicateTags();
                break;
            case 'summary':
                this.showTagSummary();
                break;
            case 'all':
                this.showTagSummary();
                console.log('\n' + '='.repeat(50) + '\n');
                this.showDuplicateTags();
                break;
            default:
                console.log('❌ Comando inválido. Uso: show, cleanup, summary, o all');
                console.log('\n📋 Comandos disponibles:');
                console.log('  yarn cleanup:tags show     - Mostrar tags duplicados');
                console.log('  yarn cleanup:tags cleanup  - Limpiar tags duplicados');
                console.log('  yarn cleanup:tags summary  - Mostrar resumen');
                console.log('  yarn cleanup:tags all      - Mostrar todo');
                process.exit(1);
        }
    }
}

// Ejecutar limpieza
const cleanup = new TagCleanup();
cleanup.run();
