#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Gestor de flujo de trabajo GitFlow adaptado para Bitbucket
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

      // Cambiar a development
      console.log('🔄 Cambiando a rama development...');
      execSync('git checkout development', { stdio: 'inherit' });

      // Crear y cambiar a la nueva feature
      const featureBranch = `feature/${featureName}`;
      execSync(`git checkout -b ${featureBranch}`, { stdio: 'inherit' });

      console.log(`✅ Feature branch creada: ${featureBranch}`);
      console.log('💡 Ahora puedes trabajar en tu feature');
      console.log('💡 Cuando esté lista para QA, crea un release desde development');

    } catch (error) {
      console.error('❌ Error al crear feature:', error.message);
    }
  }

  /**
   * Checkout de release existente (creado por Bitbucket)
   */
  checkoutRelease(version) {
    try {
      console.log(`🚀 Haciendo checkout de release existente: release/${version}`);

      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de hacer checkout');
        return;
      }

      // Verificar que la rama release existe
      try {
        execSync(`git show-ref --verify --quiet refs/remotes/origin/release/${version}`);
      } catch (error) {
        console.error(`❌ Error: La rama release/${version} no existe en el remoto`);
        console.log('💡 Verifica que Bitbucket haya creado la rama release');
        return;
      }

      // Hacer checkout de la rama release
      execSync(`git checkout -b release/${version} origin/release/${version}`, { stdio: 'inherit' });

      console.log(`✅ Checkout completado: release/${version}`);
      console.log('💡 Ahora puedes trabajar en QA');

    } catch (error) {
      console.error('❌ Error al hacer checkout de release:', error.message);
    }
  }

  /**
   * Crea hotfix de QA desde release
   */
  createQAHotfix(hotfixName) {
    try {
      if (!this.currentBranch.startsWith('release/')) {
        console.error('❌ Error: Debes estar en una rama release para crear hotfix de QA');
        return;
      }

      console.log(`🔥 Creando hotfix de QA: hotfix/${hotfixName}`);

      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de crear el hotfix');
        return;
      }

      // Crear hotfix desde la rama release actual
      const hotfixBranch = `hotfix/${hotfixName}`;
      execSync(`git checkout -b ${hotfixBranch}`, { stdio: 'inherit' });

      console.log(`✅ Hotfix de QA creado: ${hotfixBranch}`);
      console.log('💡 Corrige el error reportado por QA');
      console.log('💡 Para finalizar: pnpm run gitflow finish-qa-hotfix');

    } catch (error) {
      console.error('❌ Error al crear hotfix de QA:', error.message);
    }
  }

  /**
   * Finaliza hotfix de QA
   */
  finishQAHotfix() {
    try {
      if (!this.currentBranch.startsWith('hotfix/')) {
        console.error('❌ Error: No estás en una rama hotfix');
        return;
      }

      console.log(`🏁 Finalizando hotfix de QA: ${this.currentBranch}`);

      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de finalizar el hotfix');
        return;
      }

      // Obtener la rama release original
      const releaseBranch = execSync('git log --oneline --grep="Merge branch" | head -1', { encoding: 'utf8' })
        .match(/release\/\d+\.\d+/)?.[0] || 'release/1.0';

      // Hacer merge a la rama release
      console.log(`🔄 Haciendo merge a ${releaseBranch}...`);
      execSync(`git checkout ${releaseBranch}`, { stdio: 'inherit' });
      execSync(`git merge --no-ff ${this.currentBranch}`, { stdio: 'inherit' });

      // Eliminar la rama hotfix
      execSync(`git branch -d ${this.currentBranch}`, { stdio: 'inherit' });

      console.log('✅ Hotfix de QA finalizado');
      console.log('💡 Nuevo despliegue a QA automático');

    } catch (error) {
      console.error('❌ Error al finalizar hotfix de QA:', error.message);
    }
  }

  /**
   * Aprueba QA y pasa a master
   */
  qaApprove(version) {
    try {
      console.log(`✅ Aprobando QA para versión ${version}`);

      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de aprobar QA');
        return;
      }

      const releaseBranch = `release/${version}`;

      // Verificar que estamos en la rama release correcta
      if (this.currentBranch !== releaseBranch) {
        console.log(`🔄 Cambiando a ${releaseBranch}...`);
        execSync(`git checkout ${releaseBranch}`, { stdio: 'inherit' });
      }

      // Hacer merge a master
      console.log('🔄 Haciendo merge a master...');
      execSync('git checkout master', { stdio: 'inherit' });
      execSync(`git merge --no-ff ${releaseBranch}`, { stdio: 'inherit' });

      // Crear tag estable
      console.log(`🏷️  Creando tag estable: v${version}`);
      execSync(`git tag v${version}`, { stdio: 'inherit' });

      // Hacer merge a development
      console.log('🔄 Haciendo merge a development...');
      execSync('git checkout development', { stdio: 'inherit' });
      execSync(`git merge --no-ff ${releaseBranch}`, { stdio: 'inherit' });

      // Eliminar la rama release
      execSync(`git branch -d ${releaseBranch}`, { stdio: 'inherit' });

      console.log('✅ QA aprobado y mergeado a master');
      console.log(`🏷️  Tag estable creado: v${version}`);

    } catch (error) {
      console.error('❌ Error al aprobar QA:', error.message);
    }
  }

  /**
   * Crea hotfix de emergencia desde master
   */
  createHotfix(hotfixName) {
    try {
      console.log(`🔥 Creando hotfix de emergencia: hotfix/${hotfixName}`);

      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de crear el hotfix');
        return;
      }

      // Cambiar a master
      console.log('🔄 Cambiando a rama master...');
      execSync('git checkout master', { stdio: 'inherit' });

      // Crear y cambiar a la nueva hotfix
      const hotfixBranch = `hotfix/${hotfixName}`;
      execSync(`git checkout -b ${hotfixBranch}`, { stdio: 'inherit' });

      console.log(`✅ Hotfix de emergencia creado: ${hotfixBranch}`);
      console.log('💡 Corrige el problema crítico en producción');
      console.log('💡 Para finalizar: pnpm run gitflow finish-hotfix');

    } catch (error) {
      console.error('❌ Error al crear hotfix de emergencia:', error.message);
    }
  }

  /**
   * Finaliza hotfix de emergencia
   */
  finishHotfix() {
    try {
      if (!this.currentBranch.startsWith('hotfix/')) {
        console.error('❌ Error: No estás en una rama hotfix');
        return;
      }

      console.log(`🏁 Finalizando hotfix de emergencia: ${this.currentBranch}`);

      if (this.checkUncommittedChanges()) {
        console.log('💡 Haz commit de tus cambios antes de finalizar el hotfix');
        return;
      }

      // Obtener la versión actual de master
      const currentVersion = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      const newVersion = this.incrementPatchVersion(currentVersion);

      // Hacer merge a master
      console.log('🔄 Haciendo merge a master...');
      execSync('git checkout master', { stdio: 'inherit' });
      execSync(`git merge --no-ff ${this.currentBranch}`, { stdio: 'inherit' });

      // Crear tag
      console.log(`🏷️  Creando tag: v${newVersion}`);
      execSync(`git tag v${newVersion}`, { stdio: 'inherit' });

      // Hacer merge a development
      console.log('🔄 Haciendo merge a development...');
      execSync('git checkout development', { stdio: 'inherit' });
      execSync(`git merge --no-ff ${this.currentBranch}`, { stdio: 'inherit' });

      // Eliminar la hotfix branch
      execSync(`git branch -d ${this.currentBranch}`, { stdio: 'inherit' });

      console.log('✅ Hotfix de emergencia finalizado');
      console.log(`🏷️  Tag creado: v${newVersion}`);
      console.log('💡 Despliegue urgente a producción');

    } catch (error) {
      console.error('❌ Error al finalizar hotfix de emergencia:', error.message);
    }
  }

  /**
   * Incrementa la versión patch
   */
  incrementPatchVersion(version) {
    const match = version.match(/v?(\d+)\.(\d+)\.(\d+)/);
    if (match) {
      const [, major, minor, patch] = match;
      return `${major}.${minor}.${parseInt(patch) + 1}`;
    }
    return '1.0.1';
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

  /**
   * Dashboard completo del sistema
   */
  showDashboard() {
    try {
      console.log('📊 Dashboard del Sistema GitFlow\n');

      // Estado de development
      console.log('🌿 Development:');
      try {
        const devBranch = execSync('git show-ref --hash refs/remotes/origin/development', { encoding: 'utf8' }).trim();
        const devCommit = execSync(`git log --oneline -1 ${devBranch}`, { encoding: 'utf8' }).trim();
        console.log(`   Último commit: ${devCommit}`);
      } catch (error) {
        console.log('   No disponible');
      }

      // Releases disponibles
      console.log('\n📋 Releases disponibles:');
      try {
        const releases = execSync('git branch -r | grep "origin/release/"', { encoding: 'utf8' })
          .trim()
          .split('\n')
          .filter(branch => branch.length > 0)
          .map(branch => branch.replace('origin/', ''));

        releases.forEach(release => {
          console.log(`   - ${release}`);
        });
      } catch (error) {
        console.log('   No hay releases');
      }

      // Estado de master
      console.log('\n✅ Production:');
      try {
        const masterBranch = execSync('git show-ref --hash refs/remotes/origin/master', { encoding: 'utf8' }).trim();
        const masterCommit = execSync(`git log --oneline -1 ${masterBranch}`, { encoding: 'utf8' }).trim();
        console.log(`   Último commit: ${masterCommit}`);
      } catch (error) {
        console.log('   No disponible');
      }

      // Tags recientes
      console.log('\n🏷️  Tags recientes:');
      try {
        const tags = execSync('git tag --sort=-version:refname | head -3', { encoding: 'utf8' })
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
      console.error('❌ Error al mostrar dashboard:', error.message);
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

    case 'checkout-release':
      if (args[1]) {
        gitflow.checkoutRelease(args[1]);
      } else {
        console.log('❌ Error: Debes especificar la versión del release');
        console.log('💡 Uso: pnpm run gitflow checkout-release 1.8');
      }
      break;

    case 'qa-hotfix':
      if (args[1]) {
        gitflow.createQAHotfix(args[1]);
      } else {
        console.log('❌ Error: Debes especificar el nombre del hotfix de QA');
        console.log('💡 Uso: pnpm run gitflow qa-hotfix qa-error-1.8');
      }
      break;

    case 'finish-qa-hotfix':
      gitflow.finishQAHotfix();
      break;

    case 'qa-approve':
      if (args[1]) {
        gitflow.qaApprove(args[1]);
      } else {
        console.log('❌ Error: Debes especificar la versión a aprobar');
        console.log('💡 Uso: pnpm run gitflow qa-approve 1.8');
      }
      break;

    case 'hotfix':
      if (args[1]) {
        gitflow.createHotfix(args[1]);
      } else {
        console.log('❌ Error: Debes especificar el nombre del hotfix de emergencia');
        console.log('💡 Uso: pnpm run gitflow hotfix critical-bug');
      }
      break;

    case 'finish-hotfix':
      gitflow.finishHotfix();
      break;

    case 'status':
      gitflow.showStatus();
      break;

    case 'dashboard':
      gitflow.showDashboard();
      break;

    default:
      console.log('🔧 Gestor de flujo de trabajo GitFlow (Adaptado para Bitbucket)\n');
      console.log('Comandos disponibles:');
      console.log('  feature <nombre>              # Crear nueva feature');
      console.log('  checkout-release <version>    # Checkout release existente (creado por Bitbucket)');
      console.log('  qa-hotfix <nombre>            # Hotfix desde release (errores QA)');
      console.log('  finish-qa-hotfix              # Finalizar hotfix de QA');
      console.log('  qa-approve <version>          # Aprobar QA → master');
      console.log('  hotfix <nombre>               # Hotfix desde master (emergencia producción)');
      console.log('  finish-hotfix                 # Finalizar hotfix de emergencia');
      console.log('  status                        # Mostrar estado actual');
      console.log('  dashboard                     # Dashboard completo');
      console.log('');
      console.log('Ejemplos:');
      console.log('  pnpm run gitflow feature add-estilos-deposito');
      console.log('  pnpm run gitflow checkout-release 1.8');
      console.log('  pnpm run gitflow qa-hotfix qa-error-1.8');
      console.log('  pnpm run gitflow qa-approve 1.8');
      console.log('  pnpm run gitflow hotfix critical-bug');
  }
}

main();
