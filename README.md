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

## 🏷️ Formatos de Tags Válidos

- `v1.0.0` - Versión estable
- `1.0.0` - Versión estable (sin v)
- `v1.0.0-alpha` - Versión pre-release
- `v1.0.0-beta.1` - Versión pre-release con número
- `v1.0.0+20231201` - Versión con build metadata

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