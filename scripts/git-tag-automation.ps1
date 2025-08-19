# Git Tag Automation Script
# Autor: Senior Developer
# Descripción: Automatización de tags con versionado semántico para flujo Git Flow

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("patch", "minor", "major")]
    [string]$VersionType = "patch",
    
    [Parameter(Mandatory=$false)]
    [string]$CustomVersion = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Configuración
$SCRIPT_VERSION = "1.0.0"
$VERSION_FILE = "version.txt"
$CHANGELOG_FILE = "CHANGELOG.md"

# Colores para output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Test-GitRepository {
    if (-not (Test-Path ".git")) {
        Write-ColorOutput "❌ Error: No se encontró un repositorio Git en el directorio actual" "Error"
        exit 1
    }
}

function Test-GitStatus {
    $status = git status --porcelain
    if ($status -and -not $Force) {
        Write-ColorOutput "⚠️  Advertencia: Hay cambios sin commitear en el repositorio" "Warning"
        Write-ColorOutput "   Cambios detectados:" "Info"
        $status | ForEach-Object { Write-Host "   $_" }
        Write-ColorOutput "   Usa -Force para continuar o haz commit de los cambios primero" "Warning"
        exit 1
    }
}

function Get-LastTag {
    $lastTag = git describe --tags --abbrev=0 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "ℹ️  No se encontraron tags previos. Iniciando con v1.0.0" "Info"
        return "v0.0.0"
    }
    return $lastTag
}

function Parse-Version {
    param([string]$VersionString)
    
    if ($VersionString -match "^v?(\d+)\.(\d+)\.(\d+)(.*)$") {
        return @{
            Major = [int]$matches[1]
            Minor = [int]$matches[2]
            Patch = [int]$matches[3]
            Suffix = $matches[4]
        }
    }
    
    Write-ColorOutput "❌ Error: Formato de versión inválido: $VersionString" "Error"
    exit 1
}

function Get-NextVersion {
    param(
        [string]$CurrentVersion,
        [string]$Type
    )
    
    $version = Parse-Version $CurrentVersion
    
    switch ($Type) {
        "major" {
            $version.Major++
            $version.Minor = 0
            $version.Patch = 0
        }
        "minor" {
            $version.Minor++
            $version.Patch = 0
        }
        "patch" {
            $version.Patch++
        }
    }
    
    return "v$($version.Major).$($version.Minor).$($version.Patch)"
}

function Test-TagExists {
    param([string]$TagName)
    
    $existingTag = git tag -l $TagName
    return [bool]$existingTag
}

function Get-CommitMessages {
    param([string]$FromTag, [string]$ToTag = "HEAD")
    
    if ($FromTag -eq "v0.0.0") {
        return git log --oneline --no-merges
    }
    
    return git log --oneline --no-merges "$FromTag..$ToTag"
}

function Generate-Changelog {
    param(
        [string]$NewVersion,
        [string]$PreviousVersion
    )
    
    $commits = Get-CommitMessages $PreviousVersion $NewVersion
    
    if (-not $commits) {
        Write-ColorOutput "ℹ️  No hay commits nuevos para incluir en el changelog" "Info"
        return
    }
    
    $changelogEntry = @"
## [$NewVersion] - $(Get-Date -Format "yyyy-MM-dd")

### Cambios
"@
    
    $commits | ForEach-Object {
        $changelogEntry += "`n- $_"
    }
    
    $changelogEntry += "`n`n"
    
    # Agregar al inicio del archivo si existe, sino crear nuevo
    if (Test-Path $CHANGELOG_FILE) {
        $content = Get-Content $CHANGELOG_FILE -Raw
        $newContent = $changelogEntry + $content
        Set-Content $CHANGELOG_FILE $newContent -Encoding UTF8
    } else {
        Set-Content $CHANGELOG_FILE $changelogEntry -Encoding UTF8
    }
    
    Write-ColorOutput "✅ Changelog actualizado: $CHANGELOG_FILE" "Success"
}

function Update-VersionFile {
    param([string]$Version)
    
    $versionContent = $Version.TrimStart('v')
    Set-Content $VERSION_FILE $versionContent -Encoding UTF8
    Write-ColorOutput "✅ Archivo de versión actualizado: $VERSION_FILE" "Success"
}

function Create-GitTag {
    param(
        [string]$TagName,
        [string]$Message
    )
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN: Se crearía el tag '$TagName' con mensaje: $Message" "Info"
        return
    }
    
    git tag -a $TagName -m $Message
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Tag '$TagName' creado exitosamente" "Success"
    } else {
        Write-ColorOutput "❌ Error al crear el tag '$TagName'" "Error"
        exit 1
    }
}

function Push-Tag {
    param([string]$TagName)
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN: Se haría push del tag '$TagName'" "Info"
        return
    }
    
    git push origin $TagName
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Tag '$TagName' enviado al repositorio remoto" "Success"
    } else {
        Write-ColorOutput "❌ Error al enviar el tag '$TagName'" "Error"
        exit 1
    }
}

function Show-Summary {
    param(
        [string]$NewVersion,
        [string]$PreviousVersion,
        [string]$Branch
    )
    
    Write-ColorOutput "`n📋 RESUMEN DE LA OPERACIÓN" "Info"
    Write-ColorOutput "================================" "Info"
    Write-ColorOutput "Versión anterior: $PreviousVersion" "Info"
    Write-ColorOutput "Nueva versión: $NewVersion" "Success"
    Write-ColorOutput "Rama actual: $Branch" "Info"
    Write-ColorOutput "Tipo de incremento: $VersionType" "Info"
    
    if ($DryRun) {
        Write-ColorOutput "🔍 MODO DRY RUN - No se realizaron cambios" "Warning"
    }
}

# Función principal
function Main {
    Write-ColorOutput "🚀 Git Tag Automation v$SCRIPT_VERSION" "Info"
    Write-ColorOutput "========================================" "Info"
    
    # Validaciones iniciales
    Test-GitRepository
    Test-GitStatus
    
    # Obtener información del repositorio
    $currentBranch = git branch --show-current
    $lastTag = Get-LastTag
    
    Write-ColorOutput "📍 Rama actual: $currentBranch" "Info"
    Write-ColorOutput "🏷️  Último tag: $lastTag" "Info"
    
    # Determinar nueva versión
    if ($CustomVersion) {
        if ($CustomVersion -notmatch "^v?\d+\.\d+\.\d+$") {
            Write-ColorOutput "❌ Error: Formato de versión personalizada inválido. Use formato: X.Y.Z" "Error"
            exit 1
        }
        $newVersion = if ($CustomVersion.StartsWith("v")) { $CustomVersion } else { "v$CustomVersion" }
    } else {
        $newVersion = Get-NextVersion $lastTag $VersionType
    }
    
    # Verificar si el tag ya existe
    if (Test-TagExists $newVersion) {
        Write-ColorOutput "❌ Error: El tag '$newVersion' ya existe" "Error"
        exit 1
    }
    
    # Mostrar información antes de proceder
    Write-ColorOutput "`n📝 Información de la nueva versión:" "Info"
    Write-ColorOutput "   Nueva versión: $newVersion" "Success"
    Write-ColorOutput "   Rama: $currentBranch" "Info"
    
    if (-not $DryRun) {
        $confirmation = Read-Host "`n¿Deseas continuar? (y/N)"
        if ($confirmation -ne "y" -and $confirmation -ne "Y") {
            Write-ColorOutput "❌ Operación cancelada por el usuario" "Warning"
            exit 0
        }
    }
    
    # Crear tag
    $tagMessage = "Release $newVersion - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Create-GitTag $newVersion $tagMessage
    
    # Actualizar archivos
    Update-VersionFile $newVersion
    Generate-Changelog $newVersion $lastTag
    
    # Push del tag
    Push-Tag $newVersion
    
    # Mostrar resumen
    Show-Summary $newVersion $lastTag $currentBranch
    
    Write-ColorOutput "`n🎉 ¡Proceso completado exitosamente!" "Success"
}

# Ejecutar función principal
Main
