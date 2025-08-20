# 🚀 GitFlow Automation System

Sistema de automatización completo para GitFlow con versionado semántico automático.

## 📋 Flujo de Trabajo

### 1. **Feature Branches** → `development`

```
add/forms-deposit → development
add/button-deposit → development
fix/color-deposit → development
```

### 2. **Release Branch** → QA

```
release/1.1.0 → QA testing (1-2 semanas)
```

### 3. **Hotfixes** → Release o Master

```
hotfix/styles-deposit → release/1.1.0
hotfix/critical-bug → master
```

### 4. **Final Release** → Master

```
release/1.1.0 → master (después de QA)
```

## 🏷️ Sistema de Tags Automáticos

### **Development (Alpha)**

- **Trigger:** Merge de features a development
- **Formato:** `v1.1.0-alpha.1234567890`
- **Ejemplo:** `v1.1.0-alpha.1703123456789`

### **Release (Beta)**

- **Trigger:** Creación de release branch
- **Formato:** `v1.1.0-beta.1234567890`
- **Ejemplo:** `v1.1.0-beta.1703123456789`

### **Hotfix en Release (RC)**

- **Trigger:** Commit en hotfix branch
- **Formato:** `v1.1.1-rc.1234567890`
- **Ejemplo:** `v1.1.1-rc.1703123456789`

### **Hotfix en Master (Patch)**

- **Trigger:** Commit en hotfix branch
- **Formato:** `v1.1.1`
- **Ejemplo:** `v1.1.1`

### **Final Release (Minor)**

- **Trigger:** Merge de release a master
- **Formato:** `v1.1.0`
- **Ejemplo:** `v1.1.0`

## 🛠️ Comandos Disponibles

### **Scripts de Release**

```bash
yarn release              # Release automático
yarn release:first        # Primera versión
yarn release:minor        # Incrementar minor
yarn release:major        # Incrementar major
yarn release:patch        # Incrementar patch
yarn release:alpha        # Pre-release alpha
yarn release:beta         # Pre-release beta
yarn release:rc           # Pre-release RC
```

### **Scripts de GitFlow**

```bash
yarn gitflow:feature      # Automatización de features
yarn gitflow:release      # Automatización de releases
yarn gitflow:hotfix       # Automatización de hotfixes
yarn gitflow:merge        # Automatización de merges
```

## 🔧 Configuración de Hooks

### **Hooks Automáticos**

- **post-merge:** Se ejecuta después de merge a development/master
- **pre-push:** Se ejecuta antes de push en feature/release/hotfix
- **post-commit:** Se ejecuta después de commit en release/hotfix

### **Configurar Hooks**

```bash
node scripts/setup-hooks.js
```

## 📝 Convenciones de Commits

### **Tipos de Commits**

- `feat:` ✨ Nuevas características
- `fix:` 🐛 Correcciones de bugs
- `docs:` 📚 Documentación
- `style:` 💄 Cambios de estilo
- `refactor:` ♻️ Refactorización
- `perf:` ⚡ Mejoras de rendimiento
- `test:` 🧪 Tests
- `chore:` 🔧 Tareas de mantenimiento

### **Ejemplos**

```bash
git commit -m "feat: agregar formulario de depósito"
git commit -m "fix: corregir validación de email"
git commit -m "docs: actualizar README"
```

## 🎯 Ejemplo Práctico

### **1. Desarrollo de Features**

```bash
# Crear feature branch
git checkout -b add/forms-deposit
# Hacer cambios y commits
git commit -m "feat: agregar formulario de depósito"
git commit -m "feat: agregar validaciones"
# Merge a development
git checkout development
git merge add/forms-deposit
# ✅ Se crea automáticamente: v1.1.0-alpha.1234567890
```

### **2. Crear Release**

```bash
# Crear release branch
git checkout -b release/1.1.0
# ✅ Se crea automáticamente: v1.1.0-beta.1234567890
```

### **3. Hotfix durante QA**

```bash
# Crear hotfix branch
git checkout -b hotfix/styles-deposit
# Hacer cambios
git commit -m "fix: corregir estilos del formulario"
# ✅ Se crea automáticamente: v1.1.1-rc.1234567890
```

### **4. Final Release**

```bash
# Merge a master
git checkout master
git merge release/1.1.0
# ✅ Se crea automáticamente: v1.1.0
```

## 🔍 Monitoreo

### **Ver Tags Creados**

```bash
git tag --sort=-version:refname
```

### **Ver Changelog**

```bash
cat CHANGELOG.md
```

### **Ver Estado Actual**

```bash
git status
git branch -a
```

## ⚠️ Consideraciones

1. **Siempre usar commits convencionales** para que el changelog se genere correctamente
2. **Los hooks se ejecutan automáticamente** - no necesitas ejecutar comandos manualmente
3. **Los tags se crean con timestamps** para evitar duplicados
4. **El sistema detecta el tipo de branch** automáticamente
5. **Los hotfixes incrementan patch** automáticamente

## 🚨 Troubleshooting

### **Error: "standard-version not found"**

```bash
yarn add --dev standard-version
```

### **Error: "Husky hooks not working"**

```bash
yarn prepare
node scripts/setup-hooks.js
```

### **Error: "Invalid version"**

Verificar que `package.json` tenga campo `version`:

```json
{
  "version": "1.0.0"
}
```

## 📞 Soporte

Para problemas o preguntas sobre el sistema de automatización, revisar:

1. Logs de los hooks en `.husky/`
2. Output de los comandos de GitFlow
3. Estado del `package.json` y `CHANGELOG.md`
