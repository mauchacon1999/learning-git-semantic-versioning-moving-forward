#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Verifica si existen tags de Git y si siguen versionado semántico
 */
function verifyGitTags() {
  try {
    console.log('🔍 Verificando tags de Git...\n');

    // Verificar si estamos en un repositorio Git
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Error: No se encontró un repositorio Git válido');
      process.exit(1);
    }

    // Obtener todos los tags
    const tags = execSync('git tag --list', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(tag => tag.length > 0);

    if (tags.length === 0) {
      console.log('⚠️  Advertencia: No se encontraron tags en el repositorio');
      console.log('💡 Sugerencia: Crea un tag inicial con: git tag v1.0.0');
      return false;
    }

    console.log(`📋 Tags encontrados (${tags.length}):`);
    tags.forEach(tag => console.log(`   - ${tag}`));

    // Verificar formato semántico
    const semanticVersionRegex = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    const invalidTags = tags.filter(tag => !semanticVersionRegex.test(tag));

    if (invalidTags.length > 0) {
      console.log('\n❌ Tags que no siguen versionado semántico:');
      invalidTags.forEach(tag => console.log(`   - ${tag}`));
      console.log('\n💡 Los tags deben seguir el formato: v1.0.0, 1.0.0, v1.0.0-alpha, etc.');
      return false;
    }

    // Obtener el tag más reciente
    const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    console.log(`\n✅ Tag más reciente: ${latestTag}`);

    // Verificar si el tag está en el commit actual
    const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const tagCommit = execSync(`git rev-parse ${latestTag}`, { encoding: 'utf8' }).trim();

    if (currentCommit === tagCommit) {
      console.log('✅ El commit actual tiene un tag');
    } else {
      console.log('⚠️  El commit actual no tiene un tag');
      console.log('💡 Sugerencia: Crea un nuevo tag para este commit');
    }

    console.log('\n🎉 Verificación de tags completada');
    return true;

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    return false;
  }
}

// Ejecutar la verificación
const success = verifyGitTags();
process.exit(success ? 0 : 1);
