#!/usr/bin/env pwsh

Write-Host "🔄 Post-merge hook ejecutándose..." -ForegroundColor Cyan

# Obtener la rama actual
$CURRENT_BRANCH = git branch --show-current

# Solo crear tags en development y master
if ($CURRENT_BRANCH -eq "development" -or $CURRENT_BRANCH -eq "master") {
    Write-Host "📦 Rama: $CURRENT_BRANCH - Verificando si crear tag automático..." -ForegroundColor Yellow
    
    # Contar commits desde el último tag
    $LAST_TAG = git describe --tags --abbrev=0 2>$null
    if ($LASTEXITCODE -ne 0) {
        $LAST_TAG = git rev-list --max-parents=0 HEAD
    }
    
    $COMMITS_SINCE_LAST_TAG = git rev-list --count "$LAST_TAG..HEAD"
    
    if ([int]$COMMITS_SINCE_LAST_TAG -gt 0) {
        Write-Host "🎯 Encontrados $COMMITS_SINCE_LAST_TAG commits nuevos" -ForegroundColor Green
        
        # Determinar tipo de versión basado en la rama y commits
        if ($CURRENT_BRANCH -eq "master") {
            $VERSION_TYPE = "major"
        } else {
            # En development, verificar si hay features o solo fixes
            $FEATURE_COMMITS = git log --oneline --since="1 day ago" | Select-String "feat:" | Measure-Object | Select-Object -ExpandProperty Count
            if ([int]$FEATURE_COMMITS -gt 0) {
                $VERSION_TYPE = "minor"
            } else {
                $VERSION_TYPE = "patch"
            }
        }
        
        Write-Host "🏷️  Creando tag automático: $VERSION_TYPE" -ForegroundColor Magenta
        & powershell -ExecutionPolicy Bypass -File "scripts/git-tag-automation-simple.ps1" -VersionType $VERSION_TYPE -AutoConfirm
    } else {
        Write-Host "✅ No hay commits nuevos para taggear" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Rama $CURRENT_BRANCH - No se crean tags automáticos" -ForegroundColor Gray
}
