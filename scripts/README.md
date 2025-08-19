# 🚀 Git Tag Automation Scripts

Scripts de automatización para el manejo de tags de Git con versionado semántico, diseñados para flujos de trabajo Git Flow.

## 📋 Scripts Disponibles

### 1. `git-tag-automation.ps1`

Script principal para crear tags automáticamente con versionado semántico.

### 2. `get-version.ps1`

Script para obtener la versión actual de la aplicación.

## 🎯 Características Principales

- ✅ **Versionado Semántico**: Sigue el estándar MAJOR.MINOR.PATCH
- ✅ **Validación de Tags**: Verifica que el tag no exista antes de crearlo
- ✅ **Detección Automática**: Encuentra el último tag y genera el siguiente
- ✅ **Archivo de Versión**: Crea/actualiza `version.txt` para uso en la aplicación
- ✅ **Changelog Automático**: Genera entradas en `CHANGELOG.md`
- ✅ **Validaciones**: Verifica estado del repositorio antes de crear tags
- ✅ **Modo Dry Run**: Permite simular la operación sin hacer cambios
- ✅ **Output Coloreado**: Interfaz visual clara y profesional

## 🛠️ Uso del Script Principal

### Sintaxis Básica

```powershell
.\scripts\git-tag-automation.ps1 [Parámetros]
```

### Parámetros Disponibles

| Parámetro        | Descripción                             | Valores                   | Default  |
| ---------------- | --------------------------------------- | ------------------------- | -------- |
| `-VersionType`   | Tipo de incremento de versión           | `patch`, `minor`, `major` | `patch`  |
| `-CustomVersion` | Versión personalizada                   | `X.Y.Z` o `vX.Y.Z`        | -        |
| `-DryRun`        | Simular operación sin cambios           | Switch                    | `$false` |
| `-Force`         | Forzar ejecución con cambios pendientes | Switch                    | `$false` |

### Ejemplos de Uso

#### 1. Crear un tag con incremento patch (default)

```powershell
.\scripts\git-tag-automation.ps1
```

**Resultado**: Si el último tag es `v1.2.3`, crea `v1.2.4`

#### 2. Crear un tag con incremento minor

```powershell
.\scripts\git-tag-automation.ps1 -VersionType minor
```

**Resultado**: Si el último tag es `v1.2.3`, crea `v1.3.0`

#### 3. Crear un tag con incremento major

```powershell
.\scripts\git-tag-automation.ps1 -VersionType major
```

**Resultado**: Si el último tag es `v1.2.3`, crea `v2.0.0`

#### 4. Crear una versión personalizada

```powershell
.\scripts\git-tag-automation.ps1 -CustomVersion "1.5.0"
```

**Resultado**: Crea el tag `v1.5.0`

#### 5. Simular la operación (Dry Run)

```powershell
.\scripts\git-tag-automation.ps1 -DryRun
```

**Resultado**: Muestra qué se haría sin ejecutar cambios

#### 6. Forzar ejecución con cambios pendientes

```powershell
.\scripts\git-tag-automation.ps1 -Force
```

**Resultado**: Ejecuta aunque haya cambios sin commitear

## 🔍 Uso del Script de Versión

### Sintaxis Básica

```powershell
.\scripts\get-version.ps1 [Parámetros]
```

### Parámetros Disponibles

| Parámetro      | Descripción                         |
| -------------- | ----------------------------------- |
| `-Json`        | Mostrar información en formato JSON |
| `-OnlyVersion` | Mostrar solo el número de versión   |
| `-Verbose`     | Mostrar información detallada       |

### Ejemplos de Uso

#### 1. Obtener versión actual

```powershell
.\scripts\get-version.ps1
```

**Resultado**: `🏷️  Versión actual: 1.2.3`

#### 2. Solo el número de versión

```powershell
.\scripts\get-version.ps1 -OnlyVersion
```

**Resultado**: `1.2.3`

#### 3. Información detallada

```powershell
.\scripts\get-version.ps1 -Verbose
```

**Resultado**: Muestra versión, rama, commit, fecha, etc.

#### 4. Formato JSON

```powershell
.\scripts\get-version.ps1 -Json
```

**Resultado**: JSON con toda la información de versión

## 📁 Archivos Generados

### `version.txt`

Contiene solo el número de versión (sin el prefijo 'v'):

```
1.2.3
```

### `CHANGELOG.md`

Archivo de cambios automático:

```markdown
## [v1.2.3] - 2024-01-15

### Cambios

- add/forms-deposit: Agregar formularios de depósito
- add/button-deposit: Implementar botón de depósito
- fix/color-deposit: Corregir colores del módulo de depósito

## [v1.2.2] - 2024-01-10

### Cambios

- add/certificates: Agregar módulo de certificados
```

## 🔄 Flujo de Trabajo Recomendado

### 1. Desarrollo Normal (Patch)

```powershell
# Después de completar fixes en development
.\scripts\git-tag-automation.ps1 -VersionType patch
```

### 2. Nuevas Funcionalidades (Minor)

```powershell
# Después de completar features en development
.\scripts\git-tag-automation.ps1 -VersionType minor
```

### 3. Cambios Breaking (Major)

```powershell
# Después de cambios que rompen compatibilidad
.\scripts\git-tag-automation.ps1 -VersionType major
```

### 4. Hotfixes

```powershell
# Para correcciones urgentes en master
.\scripts\git-tag-automation.ps1 -VersionType patch -Force
```

## ⚠️ Validaciones del Script

### Antes de Crear un Tag

1. ✅ Verifica que esté en un repositorio Git
2. ✅ Verifica que no haya cambios sin commitear (a menos que use `-Force`)
3. ✅ Verifica que el tag no exista ya
4. ✅ Valida el formato de versión personalizada

### Después de Crear un Tag

1. ✅ Crea/actualiza `version.txt`
2. ✅ Genera entrada en `CHANGELOG.md`
3. ✅ Hace push del tag al repositorio remoto
4. ✅ Muestra resumen de la operación

## 🎨 Integración con tu Flujo Actual

### Tu Flujo:

```
development → release → master
     ↓           ↓        ↓
   patch     minor    major
```

### Uso Recomendado:

- **En development**: `-VersionType patch` (correcciones)
- **En release**: `-VersionType minor` (nuevas features)
- **En master**: `-VersionType major` (cambios breaking)

## 🚨 Casos de Error Comunes

### 1. "No se encontró un repositorio Git"

**Solución**: Ejecutar desde el directorio raíz del proyecto

### 2. "Hay cambios sin commitear"

**Solución**:

```powershell
git add .
git commit -m "feat: preparar release"
.\scripts\git-tag-automation.ps1
```

### 3. "El tag ya existe"

**Solución**: Usar un tipo de incremento diferente o versión personalizada

### 4. "Error al enviar el tag"

**Solución**: Verificar conexión a internet y permisos del repositorio

## 🔧 Personalización

### Cambiar Archivos de Configuración

Edita las variables al inicio de los scripts:

```powershell
$VERSION_FILE = "version.txt"        # Archivo de versión
$CHANGELOG_FILE = "CHANGELOG.md"     # Archivo de changelog
```

### Agregar Validaciones Personalizadas

Puedes agregar funciones de validación en la función `Main()` del script principal.

## 📞 Soporte

Para reportar bugs o solicitar nuevas características, contacta al equipo de desarrollo.

---

**Versión del Script**: 1.0.0  
**Última Actualización**: Enero 2024
