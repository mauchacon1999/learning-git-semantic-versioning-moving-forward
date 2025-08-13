#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Gestor de flujo de trabajo GitFlow
 */
class GitFlowManager {
  constructor() {
    this.currentBranch = this.getCurrentBranch();
  }

  /**
   * Obtiene la rama actual
   */
  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      console.error('❌ Error al obtener la rama actual:', error.message);
      process.exit(1);
    }
  }

  /**
   * Verifica si estamos en un repositorio Git válido
   */
  validateGitRepo() {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Error: No se encontró un repositorio Git válido');
      process.exit(1);
    }
  }

  /**
   * Verifica si hay cambios sin commitear
   */
  checkUncommittedChanges() {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      console.log('⚠️  Hay cambios sin commitear:');
      console.log(status);
      return true;
    }
    return false;
  }

  /**
   * Crea una nueva rama feature
   */
  createFeature(featureName) {
    try {
      console.log(`🌿 Creando feature branch: feature/${featureName}`);
      
      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de crear la feature');
        return;
      }

      // Cambiar a develop
      console.log('🔄 Cambiando a rama develop...');
      execSync('git checkout develop', { stdio: 'inherit' });
      
      // Crear y cambiar a la nueva feature
      const featureBranch = `feature/${featureName}`;
      execSync(`git checkout -b ${featureBranch}`, { stdio: 'inherit' });
      
      console.log(`✅ Feature branch creada: ${featureBranch}`);
      console.log('💡 Ahora puedes trabajar en tu feature');
      console.log('💡 Para finalizar: pnpm run gitflow finish-feature');
      
    } catch (error) {
      console.error('❌ Error al crear feature:', error.message);
    }
  }

  /**
   * Finaliza una feature branch
   */
  finishFeature() {
    try {
      if (!this.currentBranch.startsWith('feature/')) {
        console.error('❌ Error: No estás en una feature branch');
        return;
      }

      console.log(`🏁 Finalizando feature: ${this.currentBranch}`);
      
      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de finalizar la feature');
        return;
      }

      // Hacer merge a develop
      console.log('🔄 Haciendo merge a develop...');
      execSync('git checkout develop', { stdio: 'inherit' });
      execSync(`git merge --no-ff ${this.currentBranch}`, { stdio: 'inherit' });
      
      // Eliminar la feature branch
      execSync(`git branch -d ${this.currentBranch}`, { stdio: 'inherit' });
      
      console.log('✅ Feature finalizada y mergeada a develop');
      
    } catch (error) {
      console.error('❌ Error al finalizar feature:', error.message);
    }
  }

  /**
   * Crea una nueva rama release
   */
  createRelease(version) {
    try {
      console.log(`🚀 Creando release branch: release/${version}`);
      
      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de crear la release');
        return;
      }

      // Cambiar a develop
      console.log('🔄 Cambiando a rama develop...');
      execSync('git checkout develop', { stdio: 'inherit' });
      
      // Crear y cambiar a la nueva release
      const releaseBranch = `release/${version}`;
      execSync(`git checkout -b ${releaseBranch}`, { stdio: 'inherit' });
      
      console.log(`✅ Release branch creada: ${releaseBranch}`);
      console.log('💡 Ahora puedes preparar la release');
      console.log('💡 Para finalizar: pnpm run gitflow finish-release');
      
    } catch (error) {
      console.error('❌ Error al crear release:', error.message);
    }
  }

  /**
   * Finaliza una release branch
   */
  finishRelease() {
    try {
      if (!this.currentBranch.startsWith('release/')) {
        console.error('❌ Error: No estás en una release branch');
        return;
      }

      const version = this.currentBranch.replace('release/', '');
      console.log(`🏁 Finalizando release: ${version}`);
      
      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de finalizar la release');
        return;
      }

      // Hacer merge a main
      console.log('🔄 Haciendo merge a main...');
      execSync('git checkout main', { stdio: 'inherit' });
      execSync(`git merge --no-ff ${this.currentBranch}`, { stdio: 'inherit' });
      
      // Crear tag
      console.log(`🏷️  Creando tag: v${version}`);
      execSync(`git tag v${version}`, { stdio: 'inherit' });
      
      // Hacer merge a develop
      console.log('🔄 Haciendo merge a develop...');
      execSync('git checkout develop', { stdio: 'inherit' });
      execSync(`git merge --no-ff ${this.currentBranch}`, { stdio: 'inherit' });
      
      // Eliminar la release branch
      execSync(`git branch -d ${this.currentBranch}`, { stdio: 'inherit' });
      
      console.log('✅ Release finalizada');
      console.log(`🏷️  Tag creado: v${version}`);
      
    } catch (error) {
      console.error('❌ Error al finalizar release:', error.message);
    }
  }

  /**
   * Crea una nueva rama hotfix
   */
  createHotfix(version) {
    try {
      console.log(`🔥 Creando hotfix branch: hotfix/${version}`);
      
      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de crear el hotfix');
        return;
      }

      // Cambiar a main
      console.log('🔄 Cambiando a rama main...');
      execSync('git checkout main', { stdio: 'inherit' });
      
      // Crear y cambiar a la nueva hotfix
      const hotfixBranch = `hotfix/${version}`;
      execSync(`git checkout -b ${hotfixBranch}`, { stdio: 'inherit' });
      
      console.log(`✅ Hotfix branch creada: ${hotfixBranch}`);
      console.log('💡 Ahora puedes trabajar en el hotfix');
      console.log('💡 Para finalizar: pnpm run gitflow finish-hotfix');
      
    } catch (error) {
      console.error('❌ Error al crear hotfix:', error.message);
    }
  }

  /**
   * Finaliza una hotfix branch
   */
  finishHotfix() {
    try {
      if (!this.currentBranch.startsWith('hotfix/')) {
        console.error('❌ Error: No estás en una hotfix branch');
        return;
      }

      const version = this.currentBranch.replace('hotfix/', '');
      console.log(`🏁 Finalizando hotfix: ${version}`);
      
      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de finalizar el hotfix');
        return;
      }

      // Hacer merge a main
      console.log('🔄 Haciendo merge a main...');
      execSync('git checkout main', { stdio: 'inherit' });
      execSync(`git merge --no-ff ${this.currentBranch}`, { stdio: 'inherit' });
      
      // Crear tag
      console.log(`🏷️  Creando tag: v${version}`);
      execSync(`git tag v${version}`, { stdio: 'inherit' });
      
      // Hacer merge a develop
      console.log('🔄 Haciendo merge a develop...');
      execSync('git checkout develop', { stdio: 'inherit' });
      execSync(`git merge --no-ff ${this.currentBranch}`, { stdio: 'inherit' });
      
      // Eliminar la hotfix branch
      execSync(`git branch -d ${this.currentBranch}`, { stdio: 'inherit' });
      
      console.log('✅ Hotfix finalizado');
      console.log(`🏷️  Tag creado: v${version}`);
      
    } catch (error) {
      console.error('❌ Error al finalizar hotfix:', error.message);
    }
  }

  /**
   * Muestra el estado actual del flujo de trabajo
   */
  showStatus() {
    try {
      console.log('📊 Estado del flujo de trabajo GitFlow:\n');
      
      console.log(`🌿 Rama actual: ${this.currentBranch}`);
      
      // Mostrar todas las ramas
      const branches = execSync('git branch -a', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .map(branch => branch.trim().replace('* ', '').replace('remotes/origin/', ''))
        .filter(branch => branch.length > 0);
      
      console.log('\n📋 Ramas disponibles:');
      branches.forEach(branch => {
        const prefix = branch === this.currentBranch ? '🌿 ' : '   ';
        console.log(`${prefix}${branch}`);
      });
      
      // Mostrar tags recientes
      console.log('\n🏷️  Tags recientes:');
      try {
        const tags = execSync('git tag --sort=-version:refname | head -5', { encoding: 'utf8' })
          .trim()
          .split('\n')
          .filter(tag => tag.length > 0);
        
        tags.forEach(tag => {
          console.log(`   ${tag}`);
        });
      } catch (error) {
        console.log('   No hay tags');
      }
      
    } catch (error) {
      console.error('❌ Error al mostrar estado:', error.message);
    }
  }
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const gitflow = new GitFlowManager();
  
  gitflow.validateGitRepo();
  
  switch (command) {
    case 'feature':
      if (args[1]) {
        gitflow.createFeature(args[1]);
      } else {
        console.log('❌ Error: Debes especificar el nombre de la feature');
        console.log('💡 Uso: pnpm run gitflow feature nombre-feature');
      }
      break;
      
    case 'finish-feature':
      gitflow.finishFeature();
      break;
      
    case 'release':
      if (args[1]) {
        gitflow.createRelease(args[1]);
      } else {
        console.log('❌ Error: Debes especificar la versión de la release');
        console.log('💡 Uso: pnpm run gitflow release 1.0.0');
      }
      break;
      
    case 'finish-release':
      gitflow.finishRelease();
      break;
      
    case 'hotfix':
      if (args[1]) {
        gitflow.createHotfix(args[1]);
      } else {
        console.log('❌ Error: Debes especificar la versión del hotfix');
        console.log('💡 Uso: pnpm run gitflow hotfix 1.0.1');
      }
      break;
      
    case 'finish-hotfix':
      gitflow.finishHotfix();
      break;
      
    case 'status':
      gitflow.showStatus();
      break;
      
    default:
      console.log('🔧 Gestor de flujo de trabajo GitFlow\n');
      console.log('Comandos disponibles:');
      console.log('  feature <nombre>        # Crear nueva feature');
      console.log('  finish-feature          # Finalizar feature actual');
      console.log('  release <version>       # Crear nueva release');
      console.log('  finish-release          # Finalizar release actual');
      console.log('  hotfix <version>        # Crear nuevo hotfix');
      console.log('  finish-hotfix           # Finalizar hotfix actual');
      console.log('  status                  # Mostrar estado actual');
      console.log('');
      console.log('Ejemplos:');
      console.log('  pnpm run gitflow feature nueva-funcionalidad');
      console.log('  pnpm run gitflow release 1.0.0');
      console.log('  pnpm run gitflow hotfix 1.0.1');
  }
}

main();
