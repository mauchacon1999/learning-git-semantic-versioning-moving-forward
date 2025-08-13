# Learning Git Semantic Versioning Moving Forward

Sistema de GitFlow adaptado para tu flujo de trabajo con tags automáticos y comandos específicos para desarrollo, QA y producción, integrado con Bitbucket.

## 🎯 Objetivo

Sistema de GitFlow adaptado a tu flujo de trabajo con tags automáticos y comandos específicos para desarrollo, QA y producción, integrado con Bitbucket.

## 🚀 Configuración

### Prerrequisitos

- Node.js 22.17.0 o superior
- pnpm
- Git
- Bitbucket

### Instalación

```bash
pnpm install
```

## 🌿 Flujo de Trabajo con Bitbucket

### **1. Desarrollo de Features por Módulo**

```bash
# Módulo Depósito (v1.8)
# Crear primera feature del módulo
pnpm run gitflow feature add-estilos-deposito
# → Crea: feature/add-estilos-deposito
# → Auto-tag: v1.8.0-alpha.1.20231201

# Trabajar en la feature
git add .
git commit -m "feat: agregar estilos de depósito"

# Trabajar en la feature
git add .
git commit -m "feat: agregar estilos de depósito"

# Crear segunda feature del mismo módulo
pnpm run gitflow feature add-submit-deposit
# → Crea: feature/add-submit-deposit
# → Auto-tag: v1.8.0-alpha.2.20231201

# Trabajar en la segunda feature
git add .
git commit -m "feat: agregar funcionalidad de submit"

# NOTA: Los features se terminan cuando creas el release desde development
# Ejemplo: Development v1.7.0-beta → Release v1.8 → Development v1.8.0-beta
```

#### **Ejemplo: Desarrollo de Múltiples Módulos**

```bash
# Módulo Depósito (v1.8) - En desarrollo
pnpm run gitflow feature add-estilos-deposito
# → feature/add-estilos-deposito (v1.8.0-alpha.1.20231201)

pnpm run gitflow feature add-submit-deposit
# → feature/add-submit-deposit (v1.8.0-alpha.2.20231201)

# Módulo Retiros (v1.9) - Nuevo módulo, nueva versión
pnpm run gitflow feature add-retiros
# → feature/add-retiros (v1.9.0-alpha.1.20231201)

# Trabajar en paralelo en diferentes módulos
# - Módulo Depósito: Estilos + Submit (v1.8)
# - Módulo Retiros: Funcionalidad de retiros (v1.9)

# Trabajar en las features
# - feature/add-estilos-deposito: Estilos del módulo depósito
# - feature/add-submit-deposit: Funcionalidad de submit
# - feature/add-retiros: Funcionalidad de retiros

# NOTA: Los features se terminan cuando creas el release desde development
# Development v1.7.0-beta → Release v1.8 → Development v1.8.0-beta

# Development acumula features de ambos módulos
# → development: v1.9.0-beta.20231201 (última versión)
```

### **2. Módulo Completo → Release para QA**

```bash
# Cuando el módulo está completo (todas las features en development)
# Bitbucket crea release/1.8 automáticamente desde development
# Tú haces checkout manual:
git checkout release/1.8
# O usar comando de checkout:
pnpm run gitflow checkout-release 1.8
# → Auto-tag: v1.8.0-rc.20231201
# → [DESPLIEGUE A AMBIENTE QA]

# Ejemplo: Módulo Depósito completo
# - Development v1.7.0-beta (versión anterior)
# - feature/add-estilos-deposito ✅ (en development)
# - feature/add-submit-deposit ✅ (en development)
# → Crear release/v1.8 → Development se actualiza a v1.8.0-beta
```

### **3. QA Reporta Errores → Hotfix de QA**

```bash
# QA reporta error en release/1.8 → crear hotfix desde release
pnpm run gitflow qa-hotfix qa-error-1.8
# → Crea: hotfix/qa-error-1.8 desde release/v1.8
# → Auto-tag: v1.8.0-rc.1.20231201
# → Crea PR automáticamente a release/1.8

# Corregir error
git add .
git commit -m "fix: corregir error reportado por QA"

# Finalizar hotfix de QA
pnpm run gitflow finish-qa-hotfix
# → Merge a release/v1.8
# → Auto-tag: v1.8.0-rc.2.20231201
# → [NUEVO DESPLIEGUE A QA]
```

### **4. QA Aprueba → Pasar a Master**

```bash
# QA aprueba → pasar a master
pnpm run gitflow qa-approve 1.8
# → Merge a master
# → Auto-tag: v1.8.0 (versión estable)
# → Merge a development
# → Elimina release/1.8
# → Crea PR automáticamente a master
```

### **5. Error en Producción → Hotfix de Emergencia**

```bash
# Problema en producción (master) → hotfix urgente desde master
pnpm run gitflow hotfix critical-bug
# → Crea: hotfix/critical-bug desde master
# → Auto-tag: v1.8.1 (patch)

# Corregir problema
git add .
git commit -m "fix: corregir bug crítico en producción"

# Finalizar hotfix de emergencia
pnpm run gitflow finish-hotfix
# → Merge a master
# → Auto-tag: v1.8.1 (versión estable)
# → Merge a development
# → [DESPLIEGUE URGENTE A PRODUCCIÓN]
```

## 🏷️ Estrategia de Tags

### **Tags por Rama:**

- **`feature/*`**: `v{major}.{minor}.{patch}-alpha.{feature-number}.{date}`
- **`development`**: `v{major}.{minor}.{patch}-beta.{date}`
- **`release/*`**: `v{major}.{minor}.{patch}-rc.{hotfix-number}.{date}`
- **`master`**: `v{major}.{minor}.{patch}` (versión estable)

### **Ejemplo de Secuencia por Módulo:**

```bash
# Módulo Depósito v1.8
development → v1.7.0-beta.20231201 (versión anterior)
feature/add-estilos-deposito → v1.8.0-alpha.1.20231201
feature/add-submit-deposit → v1.8.0-alpha.2.20231201
development → v1.8.0-beta.20231201 (módulo completo, features terminadas)
release/v1.8 → v1.8.0-rc.20231201 (en QA)
hotfix/qa-error-1.8 → v1.8.0-rc.1.20231201 (error QA)
hotfix/qa-error-2.8 → v1.8.0-rc.2.20231201 (error QA)
master → v1.8.0 (versión estable)

# Módulo Retiros v1.9 (nuevo módulo)
feature/add-retiros → v1.9.0-alpha.1.20231201
development → v1.9.0-beta.20231201 (módulo completo)
release/v1.9 → v1.9.0-rc.20231201 (en QA)

# Hotfix de emergencia (desde master)
hotfix/critical-bug → v1.8.1 (versión estable)
```

## 🔧 Comandos Disponibles

### **Comandos Principales:**

```bash
# Features
pnpm run gitflow feature <nombre>          # Crear feature
# NOTA: Los features se terminan cuando creas el release desde development

# Releases (adaptados para Bitbucket)
pnpm run gitflow checkout-release <version>  # Checkout release existente
pnpm run gitflow qa-approve <version>      # Aprobar QA → master

# Hotfixes
pnpm run gitflow qa-hotfix <nombre>        # Hotfix desde release (errores QA)
pnpm run gitflow finish-qa-hotfix          # Finalizar hotfix de QA
pnpm run gitflow hotfix <nombre>           # Hotfix desde master (emergencia producción)
pnpm run gitflow finish-hotfix             # Finalizar hotfix de emergencia

# Información
pnpm run gitflow status                    # Ver estado actual
pnpm run gitflow dashboard                 # Dashboard completo
```

### **Comandos de Verificación:**

```bash
pnpm run gitflow verify-release <version>  # Verificar release para QA
pnpm run gitflow verify-qa-hotfixes <version>  # Verificar hotfixes de QA
pnpm run gitflow verify-production         # Verificar producción
```

### **Comandos de Información:**

```bash
pnpm run gitflow qa-report <version>       # Reporte de QA
pnpm run gitflow changelog <version>       # Changelog
pnpm run gitflow release-notes <version>   # Release notes
```

### **Comandos para Bitbucket:**

```bash
pnpm run gitflow list-releases             # Listar releases disponibles
pnpm run gitflow release-info <version>    # Información del release
pnpm run gitflow sync-bitbucket-release <version>  # Sincronizar con Bitbucket
pnpm run gitflow create-pr-release <version>  # Crear Pull Request para release
```

## 🌐 Integración con Bitbucket

### **Pull Requests Automáticos:**

```bash
# Al crear feature
pnpm run gitflow feature <nombre>
# → Crea PR automáticamente a development cuando hagas merge

# Al crear hotfix de QA
pnpm run gitflow qa-hotfix qa-error-1
# → Crea PR automáticamente a release/1.8

# Al aprobar QA
pnpm run gitflow qa-approve 1.8
# → Crea PR automáticamente a master
```

### **Webhooks de Bitbucket:**

```bash
# Configurar webhooks para:
# - Creación de release branches
# - Merge de PRs
# - Tags automáticos
```

## 📊 Dashboard de Estado

```bash
pnpm run gitflow dashboard

# Salida esperada:
 Estado del Sistema GitFlow

 Development: v1.9.0-beta.20231201
   Features activas: 2
   📋 Último merge: feature/add-submit-deposit
   📋 PRs pendientes: 0

📋 Releases disponibles:
   - release/1.8 (creado por Bitbucket)
   - release/1.9 (creado por Bitbucket)

 Release: v1.8.0-rc.2.20231201
   📋 Estado: En QA
   Hotfixes aplicados: 2
   Errores pendientes: 0
   📋 PRs activos: 1

✅ Production: v1.7.0
   Estado: Estable
   Último deploy: 2023-12-01

 Bitbucket Status:
   Webhooks: Activos
   PRs: Sincronizados
   📋 Tags: Sincronizados
```

## 📝 Ejemplos de Uso

### **Ejemplo 1: Desarrollo de Módulo Depósito (v1.8)**

```bash
# 1. Crear primera feature del módulo
pnpm run gitflow feature add-estilos-deposito
# Trabajar en la feature...

# 2. Crear segunda feature del mismo módulo
pnpm run gitflow feature add-submit-deposit
# Trabajar en la feature...

# NOTA: Los features se terminan cuando creas el release desde development
# Development v1.7.0-beta → Release v1.8 → Development v1.8.0-beta

# 3. Módulo completo → Bitbucket crea release/1.8
# 4. Checkout del release para QA
pnpm run gitflow checkout-release 1.8

# 5. QA reporta errores → hotfix desde release
pnpm run gitflow qa-hotfix qa-error-1.8
# Corregir error...
pnpm run gitflow finish-qa-hotfix

# 6. QA aprueba → pasar a master
pnpm run gitflow qa-approve 1.8
```

### **Ejemplo 2: Hotfix de Emergencia (Error en Producción)**

```bash
# Problema crítico en producción (master)
pnpm run gitflow hotfix critical-bug
# Corregir problema urgente...
pnpm run gitflow finish-hotfix
# → Despliegue urgente a producción
```

## 🔥 Tipos de Hotfixes

### **1. Hotfix de QA (desde release)**

```bash
# QA reporta error en release/v1.8
pnpm run gitflow qa-hotfix qa-error-1.8
# → Crea hotfix desde release/1.8
# → Corregir error reportado por QA
# → Merge a release/1.8
# → Nuevo despliegue a QA
# → QA continúa probando hasta que no hay más errores
```

### **2. Hotfix de Emergencia (desde master)**

```bash
# Error crítico en producción
pnpm run gitflow hotfix critical-bug
# → Crea hotfix desde master
# → Corregir problema urgente
# → Merge a master
# → Despliegue urgente a producción
```

## 🔍 Verificaciones Automáticas

### **Pre-commit:**

- Verificar formato de commits
- Verificar que no haya cambios sin commitear

### **Pre-push:**

- Auto-tagging según la rama
- Verificar que existan tags válidos

### **Pre-checkout-release:**

- Verificar que release existe en Bitbucket
- Verificar que development esté estable
- Verificar que no haya features sin finalizar
- Verificar estado de PRs

### **Pre-qa-approve:**

- Verificar que no haya hotfixes pendientes
- Verificar que release esté listo para producción
- QA solo reporta errores, no rechaza releases

## ⚠️ Consideraciones

### **Conflictos:**

- Los hotfixes de QA se aplican sobre release
- Los hotfixes de emergencia se aplican sobre master
- Development siempre se mantiene actualizado

### **Rollback:**

- Si hay problemas en producción, se puede hacer rollback a versión anterior
- QA solo reporta errores, no rechaza releases

### **Integración:**

- El sistema se integra con Husky para hooks automáticos
- Los tags se crean automáticamente según la rama
- Las verificaciones se ejecutan antes de cada operación
- Sincronización automática con Bitbucket

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

# Ver estado de Bitbucket
pnpm run gitflow bitbucket-status
```

## 🎯 Versionado Semántico

Sigue el estándar [SemVer](https://semver.org/):

- **MAJOR** (1.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (1.1.0): Nuevas funcionalidades compatibles
- **PATCH** (1.0.1): Correcciones de bugs compatibles

## 📋 Scripts Disponibles

### 1. Verificar Tags Existentes

```bash
pnpm run verify-tags
```

### 2. Listar Tags

```bash
pnpm run list-tags
```

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

### 5. Configurar Hooks por Rama

```bash
# Configurar hooks para la rama actual
pnpm run setup-branch-hooks

# Ver estrategias disponibles
pnpm run setup-branch-hooks --show
```

## 🔧 Hooks de Git (Husky)

### Pre-commit

Se ejecuta automáticamente antes de cada commit para verificar el estado del repositorio.

### Pre-push

Se ejecuta automáticamente antes de cada push para verificar que existan tags válidos.
