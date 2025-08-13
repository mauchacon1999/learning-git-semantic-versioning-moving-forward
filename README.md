# Learning Git Semantic Versioning Moving Forward

Este proyecto incluye herramientas para gestionar tags de Git con versionado semántico usando Husky.

## 🚀 Configuración

### Prerrequisitos
- Node.js 22.17.0 o superior
- pnpm
- Git

### Instalación
```bash
pnpm install
```

## 📋 Scripts Disponibles

### 1. Verificar Tags Existentes
```bash
pnpm run verify-tags
```
Verifica si existen tags en el repositorio y si siguen el formato de versionado semántico.

### 2. Listar Tags
```bash
pnpm run list-tags
```
Muestra todos los tags existentes con información detallada, fechas y estadísticas.

### 3. Crear Nuevo Tag
```bash
# Crear tag interactivamente
pnpm run create-tag

# Crear tag específico
pnpm run create-tag v1.0.0
```

### 4. Auto-tagging por Rama
```bash
pnpm run auto-tag
```
Crea automáticamente tags basados en la rama actual y la estrategia de versionado.

### 5. Configurar Hooks por Rama
```bash
# Configurar hooks para la rama actual
pnpm run setup-branch-hooks

# Ver estrategias disponibles
pnpm run setup-branch-hooks --show
```

### 6. Gestor GitFlow
```bash
# Ver comandos disponibles
pnpm run gitflow

# Crear feature
pnpm run gitflow feature nueva-funcionalidad

# Finalizar feature
pnpm run gitflow finish-feature

# Crear release
pnpm run gitflow release 1.0.0

# Finalizar release
pnpm run gitflow finish-release

# Crear hotfix
pnpm run gitflow hotfix 1.0.1

# Finalizar hotfix
pnpm run gitflow finish-hotfix

# Ver estado
pnpm run gitflow status
```

## 🏷️ Formatos de Tags Válidos

- `v1.0.0` - Versión estable
- `1.0.0` - Versión estable (sin v)
- `v1.0.0-alpha` - Versión pre-release
- `v1.0.0-beta.1` - Versión pre-release con número
- `v1.0.0+20231201` - Versión con build metadata

## 🌿 Estrategias por Rama

### Rama `main` / `master`
- **Tipo**: Versiones estables de producción
- **Formato**: `v1.0.0`
- **Hooks**: Verificación estricta de tags antes de push

### Rama `development`
- **Tipo**: Versiones beta para desarrollo
- **Formato**: `v1.0.0-beta.20231201`
- **Hooks**: Auto-tagging en push

### Ramas `feature/*`
- **Tipo**: Versiones alpha para features
- **Formato**: `v1.0.0-alpha.20231201`
- **Hooks**: Auto-tagging en push

### Ramas `hotfix/*`
- **Tipo**: Versiones de parche para correcciones urgentes
- **Formato**: `v1.0.1`
- **Hooks**: Auto-tagging en push

### Ramas `release/*`
- **Tipo**: Versiones release candidate
- **Formato**: `v1.0.0-rc.20231201`
- **Hooks**: Auto-tagging en push

## 🔧 Hooks de Git (Husky)

### Pre-commit
Se ejecuta automáticamente antes de cada commit para verificar el estado del repositorio.

### Pre-push
Se ejecuta automáticamente antes de cada push para verificar que existan tags válidos.

## 📝 Flujo de Trabajo Recomendado

1. **Hacer cambios en el código**
2. **Hacer commit de los cambios**
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   ```
3. **Crear un tag para la versión**
   ```bash
   pnpm run create-tag v1.1.0
   ```
4. **Hacer push de los cambios y el tag**
   ```bash
   git push origin main
   git push origin v1.1.0
   ```

## 🎯 Versionado Semántico

Sigue el estándar [SemVer](https://semver.org/):

- **MAJOR** (1.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (1.1.0): Nuevas funcionalidades compatibles
- **PATCH** (1.0.1): Correcciones de bugs compatibles

## 🔍 Verificaciones Automáticas

- ✅ Formato de versionado semántico
- ✅ Duplicados de tags
- ✅ Estado del repositorio
- ✅ Relación entre commits y tags

## 🛠️ Comandos Útiles

```bash
# Ver todos los tags
git tag

# Ver información de un tag específico
git show v1.0.0

# Eliminar un tag local
git tag -d v1.0.0

# Eliminar un tag remoto
git push origin --delete v1.0.0

# Ver commits entre dos tags
git log v1.0.0..v1.1.0
```