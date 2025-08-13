# Sistema GitFlow con Auto-tagging

Este proyecto implementa un sistema GitFlow automatizado con versionado semántico y auto-tagging basado en el tipo de rama.

## 🎯 Características

- **Auto-tagging inteligente** por tipo de rama
- **Versionado semántico** automático
- **Integración con Husky** para hooks de Git
- **Sistema de hotfixes** para correcciones urgentes
- **Flujo QA automatizado** con release candidates

## 🌿 Estrategias de Versionado

### Features (`feature/*`)

- **Tipo:** Pre-release (alpha)
- **Formato:** `v1.1.0-alpha.1.20250813`
- **Descripción:** Versiones alpha para features en desarrollo

### Development

- **Tipo:** Pre-release (beta)
- **Formato:** `v1.1.0-beta.20250813`
- **Descripción:** Versiones beta para desarrollo

### Release (`release/*`)

- **Tipo:** Pre-release (RC)
- **Formato:** `v1.1.0-rc.1.20250813`
- **Descripción:** Versiones release candidate para QA

### Hotfix (`hotfix/*`)

- **Tipo:** Patch
- **Formato:** `v1.1.6`
- **Descripción:** Versiones de parche para correcciones urgentes

### Master/Main

- **Tipo:** Stable
- **Formato:** `v1.1.0`
- **Descripción:** Versiones estables de producción

## 🚀 Comandos Disponibles

### Auto-tagging

```bash
pnpm run auto-tag
```

Genera automáticamente tags basados en el tipo de rama actual.

### Verificación de Tags

```bash
pnpm run verify-tags
```

Verifica que el commit actual tenga un tag asociado.

### GitFlow Manager

```bash
pnpm run gitflow <comando>
```

#### Comandos Disponibles:

- `create-feature <nombre>` - Crear nueva rama feature
- `checkout-release <version>` - Cambiar a rama release
- `create-qa-hotfix <nombre>` - Crear hotfix para QA
- `finish-qa-hotfix` - Finalizar hotfix de QA
- `qa-approve <version>` - Aprobar release para producción
- `create-hotfix <nombre>` - Crear hotfix de emergencia
- `finish-hotfix` - Finalizar hotfix de emergencia
- `dashboard` - Mostrar estado del sistema

## 🔄 Flujo de Trabajo

### 1. Desarrollo de Features

```bash
# Crear feature
pnpm run gitflow create-feature nueva-funcionalidad

# Trabajar en la feature
# Hacer commits...

# Auto-tagging automático
pnpm run auto-tag
# Sugiere: v1.1.0-alpha.1.20250813
```

### 2. Integración en Development

```bash
# Merge a development
git checkout development
git merge feature/nueva-funcionalidad

# Auto-tagging
pnpm run auto-tag
# Sugiere: v1.1.0-beta.20250813
```

### 3. Creación de Release

```bash
# Bitbucket crea release/1.1.0
git checkout release/1.1.0

# Auto-tagging
pnpm run auto-tag
# Sugiere: v1.1.0-rc.1.20250813
```

### 4. Hotfixes de QA

```bash
# Crear hotfix desde release
pnpm run gitflow create-qa-hotfix correccion-qa

# Trabajar en el hotfix
# Hacer commits...

# Auto-tagging
pnpm run auto-tag
# Sugiere: v1.1.1

# Merge a release
git checkout release/1.1.0
git merge hotfix/qa-fix-correccion-qa

# Nuevo RC automático
pnpm run auto-tag
# Sugiere: v1.1.1-rc.2.20250813
```

### 5. Aprobación de QA

```bash
# QA aprueba el release
pnpm run gitflow qa-approve 1.1.1

# Merge automático a master
# Tag estable creado: v1.1.1
```

### 6. Hotfixes de Emergencia

```bash
# Crear hotfix desde master
pnpm run gitflow create-hotfix correccion-emergencia

# Trabajar en el hotfix
# Hacer commits...

# Auto-tagging
pnpm run auto-tag
# Sugiere: v1.1.2

# Finalizar hotfix
pnpm run gitflow finish-hotfix

# Merge automático a master y development
# Tag estable creado: v1.1.2
```

## 📊 Estado del Sistema

### Tags Actuales

```
Release 1.1.0:
├── v1.1.0-alpha.1.20250813 (primera feature)
├── v1.1.0-alpha.2.20250813 (segunda feature)
├── v1.1.0-alpha.3.20250813 (tercera feature)
├── v1.1.0-beta.20250813 (development)
├── v1.1.0-rc.1.20250813 (release inicial)
├── v1.1.1 (primer hotfix - payment)
├── v1.1.1-rc.2.20250813 (release con primer hotfix)
├── v1.1.2 (segundo hotfix - auth)
├── v1.1.2-rc.3.20250813 (release con segundo hotfix)
├── v1.1.3 (tercer hotfix - UI responsive)
├── v1.1.3-rc.4.20250813 (release con tercer hotfix)
├── v1.1.4 (cuarto hotfix - security validation)
├── v1.1.5 (cuarto hotfix - additional security)
├── v1.1.5-rc.5.20250813 (release con cuarto hotfix)
├── v1.1.6 (quinto hotfix - database connection)
└── v1.1.6-rc.6.20250813 (release con quinto hotfix)
```

## 🔧 Configuración

### Husky Hooks

- **pre-commit:** Verifica que el commit tenga un mensaje válido
- **pre-push:** Verifica que el commit actual tenga un tag asociado

### Scripts de Auto-tagging

- **auto-tag.js:** Lógica principal de auto-tagging
- **verify-tags.js:** Verificación de tags existentes
- **gitflow-manager.js:** Gestión de comandos GitFlow

## 🎯 Beneficios

1. **Versionado automático** - No más tags manuales
2. **Trazabilidad completa** - Cada cambio tiene su tag
3. **Flujo estandarizado** - Proceso consistente para todo el equipo
4. **Integración con Bitbucket** - Compatible con el flujo de QA
5. **Hotfixes organizados** - Separación clara entre QA y emergencias

## 🚀 Próximos Pasos

- [ ] Implementar notificaciones automáticas
- [ ] Integrar con sistemas de CI/CD
- [ ] Agregar métricas de versionado
- [ ] Documentar casos edge

---

**Sistema GitFlow Completamente Funcional y Probado** ✅
