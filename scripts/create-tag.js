#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Crea un tag de Git con validación de versionado semántico
 */
function createTag() {
  try {
    console.log('🏷️  Creando tag de Git...\n');

    // Verificar si estamos en un repositorio Git
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Error: No se encontró un repositorio Git válido');
      process.exit(1);
    }

    // Obtener argumentos de la línea de comandos
    const args = process.argv.slice(2);
    let tagName = args[0];

    // Si no se proporciona un tag, solicitar uno
    if (!tagName) {
      console.log('📝 Ingresa el nombre del tag (ej: v1.0.0, v1.1.0-beta):');
      tagName = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      }).question('Tag: ', (answer) => {
        createTagWithName(answer.trim());
      });
      return;
    }

    createTagWithName(tagName);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function createTagWithName(tagName) {
  // Validar formato semántico
  const semanticVersionRegex = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  
  if (!semanticVersionRegex.test(tagName)) {
    console.error('❌ Error: El tag no sigue el formato de versionado semántico');
    console.log('💡 Formatos válidos:');
    console.log('   - v1.0.0 (versión estable)');
    console.log('   - 1.0.0 (versión estable sin v)');
    console.log('   - v1.0.0-alpha (versión pre-release)');
    console.log('   - v1.0.0-beta.1 (versión pre-release con número)');
    console.log('   - v1.0.0+20231201 (versión con build metadata)');
    process.exit(1);
  }

  // Verificar si el tag ya existe
  try {
    execSync(`git rev-parse ${tagName}`, { stdio: 'pipe' });
    console.error(`❌ Error: El tag '${tagName}' ya existe`);
    process.exit(1);
  } catch (error) {
    // El tag no existe, continuar
  }

  // Verificar que no haya cambios sin commitear
  const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (status) {
    console.log('⚠️  Advertencia: Hay cambios sin commitear:');
    console.log(status);
    console.log('\n💡 Sugerencia: Haz commit de tus cambios antes de crear el tag');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('¿Continuar de todas formas? (y/N): ', (answer) => {
      readline.close();
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        createTagAndPush(tagName);
      } else {
        console.log('❌ Creación de tag cancelada');
        process.exit(0);
      }
    });
  } else {
    createTagAndPush(tagName);
  }
}

function createTagAndPush(tagName) {
  try {
    // Crear el tag
    console.log(`🏷️  Creando tag: ${tagName}`);
    execSync(`git tag ${tagName}`, { stdio: 'inherit' });
    
    // Mostrar información del tag
    const tagInfo = execSync(`git show ${tagName} --no-patch --format="%H"`, { encoding: 'utf8' }).trim();
    console.log(`✅ Tag creado exitosamente en commit: ${tagInfo}`);
    
    // Preguntar si quiere hacer push del tag
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('¿Hacer push del tag al repositorio remoto? (y/N): ', (answer) => {
      readline.close();
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('🚀 Haciendo push del tag...');
        execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
        console.log('✅ Tag enviado al repositorio remoto');
      } else {
        console.log('💡 Para hacer push más tarde: git push origin ' + tagName);
      }
    });

  } catch (error) {
    console.error('❌ Error al crear el tag:', error.message);
    process.exit(1);
  }
}

// Ejecutar la función principal
createTag();
