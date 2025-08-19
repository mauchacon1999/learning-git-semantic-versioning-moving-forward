#!/usr/bin/env pwsh

Write-Host "Post-merge hook ejecutandose..." -ForegroundColor Cyan

# Obtener la rama actual
$CURRENT_BRANCH = git branch --show-current

# Solo crear tags cuando se crea una rama release
if ($CURRENT_BRANCH -like "release/*") {
    Write-Host "Rama: $CURRENT_BRANCH - Creando tag para release..." -ForegroundColor Yellow
    
    # Contar commits desde el ultimo tag
    $LAST_TAG = git describe --tags --abbrev=0 2>$null
    if ($LASTEXITCODE -ne 0) {
        $LAST_TAG = git rev-list --max-parents=0 HEAD
    }
    
    $COMMITS_SINCE_LAST_TAG = git rev-list --count "$LAST_TAG..HEAD"
    
    if ([int]$COMMITS_SINCE_LAST_TAG -gt 0) {
        Write-Host "Encontrados $COMMITS_SINCE_LAST_TAG commits nuevos" -ForegroundColor Green
        
        # Para ramas release, siempre es minor (nuevas funcionalidades)
        $VERSION_TYPE = "minor"
        
        Write-Host "Creando tag para release: $VERSION_TYPE" -ForegroundColor Magenta
        & powershell -ExecutionPolicy Bypass -File "scripts/git-tag-automation-simple.ps1" -VersionType $VERSION_TYPE -AutoConfirm
    } else {
        Write-Host "No hay commits nuevos para taggear" -ForegroundColor Green
    }
} else {
    Write-Host "Rama $CURRENT_BRANCH - No se crean tags automaticos (solo en release)" -ForegroundColor Gray
}
