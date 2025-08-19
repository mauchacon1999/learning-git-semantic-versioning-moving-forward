# Integrate Version Script
# Autor: Senior Developer
# Descripción: Ejemplo de cómo integrar la versión en diferentes tipos de aplicaciones

param(
    [Parameter(Mandatory=$false)]
    [string]$AppType = "web",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Configuración
$VERSION_FILE = "version.txt"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    $Colors = @{
        Success = "Green"
        Warning = "Yellow"
        Error = "Red"
        Info = "Cyan"
    }
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Get-CurrentVersion {
    if (Test-Path $VERSION_FILE) {
        return (Get-Content $VERSION_FILE -Raw).Trim()
    }
    
    # Fallback a Git tag
    $lastTag = git describe --tags --abbrev=0 2>$null
    if ($LASTEXITCODE -eq 0) {
        return $lastTag.TrimStart('v')
    }
    
    Write-ColorOutput "❌ Error: No se pudo obtener la versión actual" "Error"
    exit 1
}

function Generate-JavaScriptVersion {
    param([string]$Version, [string]$OutputPath)
    
    $jsContent = @"
// Auto-generated version file
// Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

export const APP_VERSION = '$Version';
export const BUILD_DATE = '$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")';
export const GIT_COMMIT = '$(git rev-parse --short HEAD 2>$null)';

export const versionInfo = {
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    gitCommit: GIT_COMMIT,
    environment: 'production'
};

// Función para mostrar información de versión en consola
export function logVersionInfo() {
    console.log('🚀 App Version:', APP_VERSION);
    console.log('📅 Build Date:', BUILD_DATE);
    console.log('🔗 Git Commit:', GIT_COMMIT);
}

// Función para obtener información de versión como objeto
export function getVersionInfo() {
    return versionInfo;
}
"@
    
    $jsPath = Join-Path $OutputPath "version.js"
    Set-Content $jsPath $jsContent -Encoding UTF8
    Write-ColorOutput "✅ Archivo JavaScript generado: $jsPath" "Success"
}

function Generate-TypeScriptVersion {
    param([string]$Version, [string]$OutputPath)
    
    $tsContent = @"
// Auto-generated version file
// Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

export interface VersionInfo {
    version: string;
    buildDate: string;
    gitCommit: string;
    environment: string;
}

export const APP_VERSION: string = '$Version';
export const BUILD_DATE: string = '$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")';
export const GIT_COMMIT: string = '$(git rev-parse --short HEAD 2>$null)';

export const versionInfo: VersionInfo = {
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    gitCommit: GIT_COMMIT,
    environment: 'production'
};

// Función para mostrar información de versión en consola
export function logVersionInfo(): void {
    console.log('🚀 App Version:', APP_VERSION);
    console.log('📅 Build Date:', BUILD_DATE);
    console.log('🔗 Git Commit:', GIT_COMMIT);
}

// Función para obtener información de versión como objeto
export function getVersionInfo(): VersionInfo {
    return versionInfo;
}
"@
    
    $tsPath = Join-Path $OutputPath "version.ts"
    Set-Content $tsPath $tsContent -Encoding UTF8
    Write-ColorOutput "✅ Archivo TypeScript generado: $tsPath" "Success"
}

function Generate-ReactVersion {
    param([string]$Version, [string]$OutputPath)
    
    $reactContent = @"
// Auto-generated version file for React
// Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

import React from 'react';

export interface VersionInfo {
    version: string;
    buildDate: string;
    gitCommit: string;
    environment: string;
}

export const APP_VERSION: string = '$Version';
export const BUILD_DATE: string = '$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")';
export const GIT_COMMIT: string = '$(git rev-parse --short HEAD 2>$null)';

export const versionInfo: VersionInfo = {
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    gitCommit: GIT_COMMIT,
    environment: 'production'
};

// Componente React para mostrar versión
export const VersionDisplay: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={\`version-display \${className}\`}>
            <span title="Versión de la aplicación">v{APP_VERSION}</span>
        </div>
    );
};

// Hook personalizado para obtener información de versión
export const useVersion = (): VersionInfo => {
    return versionInfo;
};

// Función para mostrar información de versión en consola
export function logVersionInfo(): void {
    console.log('🚀 App Version:', APP_VERSION);
    console.log('📅 Build Date:', BUILD_DATE);
    console.log('🔗 Git Commit:', GIT_COMMIT);
}
"@
    
    $reactPath = Join-Path $OutputPath "version.tsx"
    Set-Content $reactPath $reactContent -Encoding UTF8
    Write-ColorOutput "✅ Archivo React/TypeScript generado: $reactPath" "Success"
}

function Generate-NodeVersion {
    param([string]$Version, [string]$OutputPath)
    
    $nodeContent = @"
// Auto-generated version file for Node.js
// Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

const versionInfo = {
    version: '$Version',
    buildDate: '$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")',
    gitCommit: '$(git rev-parse --short HEAD 2>$null)',
    environment: process.env.NODE_ENV || 'development'
};

// Función para obtener información de versión
function getVersionInfo() {
    return versionInfo;
}

// Función para mostrar información de versión en consola
function logVersionInfo() {
    console.log('🚀 App Version:', versionInfo.version);
    console.log('📅 Build Date:', versionInfo.buildDate);
    console.log('🔗 Git Commit:', versionInfo.gitCommit);
    console.log('🌍 Environment:', versionInfo.environment);
}

// Middleware para Express.js
function versionMiddleware(req, res, next) {
    res.setHeader('X-App-Version', versionInfo.version);
    res.setHeader('X-Build-Date', versionInfo.buildDate);
    res.setHeader('X-Git-Commit', versionInfo.gitCommit);
    next();
}

module.exports = {
    versionInfo,
    getVersionInfo,
    logVersionInfo,
    versionMiddleware
};
"@
    
    $nodePath = Join-Path $OutputPath "version.js"
    Set-Content $nodePath $nodeContent -Encoding UTF8
    Write-ColorOutput "✅ Archivo Node.js generado: $nodePath" "Success"
}

function Generate-EnvFile {
    param([string]$Version, [string]$OutputPath)
    
    $envContent = @"
# Auto-generated environment file
# Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

APP_VERSION=$Version
BUILD_DATE=$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
GIT_COMMIT=$(git rev-parse --short HEAD 2>$null)
NODE_ENV=production
"@
    
    $envPath = Join-Path $OutputPath ".env.version"
    Set-Content $envPath $envContent -Encoding UTF8
    Write-ColorOutput "✅ Archivo .env generado: $envPath" "Success"
}

function Generate-ConfigFile {
    param([string]$Version, [string]$OutputPath)
    
    $configContent = @"
{
    "version": "$Version",
    "buildDate": "$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")",
    "gitCommit": "$(git rev-parse --short HEAD 2>$null)",
    "environment": "production"
}
"@
    
    $configPath = Join-Path $OutputPath "version.json"
    Set-Content $configPath $configContent -Encoding UTF8
    Write-ColorOutput "✅ Archivo JSON generado: $configPath" "Success"
}

function Show-Usage {
    Write-ColorOutput "📋 Uso del Script de Integración de Versión" "Info"
    Write-ColorOutput "=============================================" "Info"
    Write-ColorOutput "Sintaxis: .\scripts\integrate-version.ps1 [Parámetros]" "Info"
    Write-ColorOutput "" "Info"
    Write-ColorOutput "Parámetros:" "Info"
    Write-ColorOutput "  -AppType: Tipo de aplicación (web, react, node, ts, js)" "Info"
    Write-ColorOutput "  -OutputPath: Directorio de salida (default: .)" "Info"
    Write-ColorOutput "  -Verbose: Mostrar información detallada" "Info"
    Write-ColorOutput "" "Info"
    Write-ColorOutput "Ejemplos:" "Info"
    Write-ColorOutput "  .\scripts\integrate-version.ps1 -AppType react" "Info"
    Write-ColorOutput "  .\scripts\integrate-version.ps1 -AppType node -OutputPath src" "Info"
    Write-ColorOutput "  .\scripts\integrate-version.ps1 -AppType web -Verbose" "Info"
}

# Función principal
function Main {
    if ($Verbose) {
        Write-ColorOutput "🚀 Integrate Version Script" "Info"
        Write-ColorOutput "=============================" "Info"
    }
    
    # Obtener versión actual
    $currentVersion = Get-CurrentVersion
    
    if ($Verbose) {
        Write-ColorOutput "📍 Versión actual: $currentVersion" "Info"
        Write-ColorOutput "📁 Directorio de salida: $OutputPath" "Info"
        Write-ColorOutput "🎯 Tipo de aplicación: $AppType" "Info"
    }
    
    # Crear directorio si no existe
    if (-not (Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
        Write-ColorOutput "📁 Directorio creado: $OutputPath" "Info"
    }
    
    # Generar archivos según el tipo de aplicación
    switch ($AppType.ToLower()) {
        "web" {
            Generate-JavaScriptVersion $currentVersion $OutputPath
            Generate-ConfigFile $currentVersion $OutputPath
        }
        "react" {
            Generate-ReactVersion $currentVersion $OutputPath
            Generate-ConfigFile $currentVersion $OutputPath
        }
        "node" {
            Generate-NodeVersion $currentVersion $OutputPath
            Generate-EnvFile $currentVersion $OutputPath
        }
        "ts" {
            Generate-TypeScriptVersion $currentVersion $OutputPath
            Generate-ConfigFile $currentVersion $OutputPath
        }
        "js" {
            Generate-JavaScriptVersion $currentVersion $OutputPath
            Generate-ConfigFile $currentVersion $OutputPath
        }
        default {
            Write-ColorOutput "❌ Error: Tipo de aplicación no válido: $AppType" "Error"
            Write-ColorOutput "Tipos válidos: web, react, node, ts, js" "Info"
            Show-Usage
            exit 1
        }
    }
    
    if ($Verbose) {
        Write-ColorOutput "`n✅ Integración de versión completada exitosamente!" "Success"
        Write-ColorOutput "📝 Archivos generados en: $OutputPath" "Info"
    }
}

# Ejecutar función principal
Main
