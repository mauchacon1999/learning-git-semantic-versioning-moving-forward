#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Configuración de hooks por rama
 */
const BRANCH_HOOKS = {
  'main': {
    'pre-commit': 'pnpm run verify-tags',
    'pre-push': 'pnpm run verify-tags && pnpm run auto-tag',
    'post-merge': 'echo "Merge completado en main - verificar tags"'
  },
  'master': {
    'pre-commit': 'pnpm run verify-tags',
    'pre-push': 'pnpm run verify-tags && pnpm run auto-tag',
    'post-merge': 'echo "Merge completado en master - verificar tags"'
  },
  'development': {
    'pre-commit': 'pnpm run verify-tags',
    'pre-push': 'pnpm run auto-tag',
    'post-merge': 'echo "Merge completado en development"'
  },
  'feature': {
    'pre-commit': 'pnpm run verify-tags',
    'pre-push': 'pnpm run auto-tag',
    'post-merge': 'echo "Merge completado en feature branch"'
  },
  'hotfix': {
    'pre-commit': 'pnpm run verify-tags',
    'pre-push': 'pnpm run auto-tag',
    'post-merge': 'echo "Merge completado en hotfix branch"'
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
 * Detecta el tipo de rama basado en el nombre
 */
function detectBranchType(branchName) {
  if (branchName === 'main' || branchName === 'master') {
    return 'main';
  }

  if (branchName === 'development') {
    return 'development';
  }

  if (branchName.startsWith('feature/')) {
    return 'feature';
  }

  if (branchName.startsWith('hotfix/')) {
    return 'hotfix';
  }

  if (branchName.startsWith('release/')) {
    return 'staging';
  }

  return 'feature'; // Por defecto
}

/**
 * Crea un hook de Husky
 */
function createHook(hookName, command) {
  const hookPath = path.join('.husky', hookName);
  const hookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔧 Ejecutando ${hookName} para la rama actual..."
${command}
`;

  try {
    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');
    console.log(`✅ Hook ${hookName} creado`);
  } catch (error) {
    console.error(`❌ Error al crear hook ${hookName}:`, error.message);
  }
}

/**
 * Configura hooks para la rama actual
 */
function setupBranchHooks() {
  try {
    console.log('🔧 Configurando hooks por rama...\n');

    // Verificar si estamos en un repositorio Git
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Error: No se encontró un repositorio Git válido');
      process.exit(1);
    }

    // Obtener información de la rama
    const currentBranch = getCurrentBranch();
    const branchType = detectBranchType(currentBranch);
    const hooks = BRANCH_HOOKS[branchType] || BRANCH_HOOKS['feature'];

    console.log(`🌿 Rama actual: ${currentBranch}`);
    console.log(`📋 Tipo de rama: ${branchType}`);
    console.log(`🔧 Hooks a configurar: ${Object.keys(hooks).join(', ')}\n`);

    // Crear hooks
    Object.entries(hooks).forEach(([hookName, command]) => {
      createHook(hookName, command);
    });

    console.log('\n🎉 Configuración completada!');
    console.log('\n📋 Hooks configurados:');
    Object.entries(hooks).forEach(([hookName, command]) => {
      console.log(`   - ${hookName}: ${command}`);
    });

    console.log('\n💡 Los hooks se ejecutarán automáticamente en las operaciones de Git');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Muestra información sobre las estrategias de ramas
 */
function showBranchStrategies() {
  console.log('📋 Estrategias de ramas disponibles:\n');

  Object.entries(BRANCH_HOOKS).forEach(([branchType, hooks]) => {
    console.log(`🌿 ${branchType.toUpperCase()}:`);
    Object.entries(hooks).forEach(([hookName, command]) => {
      console.log(`   - ${hookName}: ${command}`);
    });
    console.log('');
  });
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('🔧 Configurador de hooks por rama\n');
  console.log('Uso:');
  console.log('  pnpm run setup-branch-hooks     # Configurar hooks para la rama actual');
  console.log('  pnpm run setup-branch-hooks --show  # Mostrar estrategias disponibles');
  console.log('');
  showBranchStrategies();
} else if (args.includes('--show')) {
  showBranchStrategies();
} else {
  setupBranchHooks();
}
