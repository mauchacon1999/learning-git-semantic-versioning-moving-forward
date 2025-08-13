#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Lista todos los tags de Git con información detallada
 */
function listTags() {
  try {
    console.log('📋 Listando tags de Git...\n');

    // Verificar si estamos en un repositorio Git
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Error: No se encontró un repositorio Git válido');
      process.exit(1);
    }

    // Obtener todos los tags con información detallada
    const tags = execSync('git tag --list --format="%(refname:short)|%(creatordate:short)|%(contents:subject)"', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(tag => tag.length > 0)
      .map(tag => {
        const [name, date, subject] = tag.split('|');
        return { name, date, subject };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (tags.length === 0) {
      console.log('📭 No se encontraron tags en el repositorio');
      console.log('💡 Crea tu primer tag con: pnpm run create-tag v1.0.0');
      return;
    }

    console.log(`📊 Total de tags: ${tags.length}\n`);

    // Mostrar tags con información detallada
    tags.forEach((tag, index) => {
      const isLatest = index === 0;
      const prefix = isLatest ? '🏷️  ' : '   ';
      console.log(`${prefix}${tag.name} (${tag.date})`);
      if (tag.subject) {
        console.log(`    📝 ${tag.subject}`);
      }
      
      // Verificar si es el tag más reciente
      if (isLatest) {
        console.log('    ⭐ Tag más reciente');
      }
      
      console.log('');
    });

    // Mostrar estadísticas
    const semanticVersionRegex = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    const validTags = tags.filter(tag => semanticVersionRegex.test(tag.name));
    const invalidTags = tags.filter(tag => !semanticVersionRegex.test(tag.name));

    console.log('📈 Estadísticas:');
    console.log(`   ✅ Tags válidos: ${validTags.length}`);
    console.log(`   ⚠️  Tags inválidos: ${invalidTags.length}`);

    if (invalidTags.length > 0) {
      console.log('\n⚠️  Tags que no siguen versionado semántico:');
      invalidTags.forEach(tag => {
        console.log(`   - ${tag.name}`);
      });
    }

    // Mostrar el tag más reciente
    if (tags.length > 0) {
      const latestTag = tags[0];
      console.log(`\n🎯 Tag más reciente: ${latestTag.name}`);
      
      // Verificar si el tag está en el commit actual
      try {
        const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        const tagCommit = execSync(`git rev-parse ${latestTag.name}`, { encoding: 'utf8' }).trim();
        
        if (currentCommit === tagCommit) {
          console.log('✅ El commit actual coincide con el tag más reciente');
        } else {
          console.log('⚠️  El commit actual no coincide con el tag más reciente');
          console.log('💡 Considera crear un nuevo tag para este commit');
        }
      } catch (error) {
        console.log('⚠️  No se pudo verificar la relación con el commit actual');
      }
    }

  } catch (error) {
    console.error('❌ Error al listar tags:', error.message);
    process.exit(1);
  }
}

// Ejecutar la función principal
listTags();
