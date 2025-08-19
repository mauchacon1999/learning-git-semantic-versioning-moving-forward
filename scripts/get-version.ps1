# Get Version Script
# Autor: Senior Developer
# Descripción: Obtiene la versión actual de la aplicación desde archivo o Git tags

param(
    [Parameter(Mandatory=$false)]
    [switch]$Json,
    
    [Parameter(Mandatory=$false)]
    [switch]$OnlyVersion,
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowDetails
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

function Get-VersionFromFile {
    if (Test-Path $VERSION_FILE) {
        $version = Get-Content $VERSION_FILE -Raw
        return $version.Trim()
    }
    return $null
}

function Get-LastGitTag {
    $lastTag = git describe --tags --abbrev=0 2>$null
    if ($LASTEXITCODE -eq 0) {
        return $lastTag.TrimStart('v')
    }
    return $null
}

function Get-GitInfo {
    $currentBranch = git branch --show-current
    $lastCommit = git rev-parse --short HEAD
    $commitDate = git log -1 --format="%cd" --date=short
    
    return @{
        Branch = $currentBranch
        LastCommit = $lastCommit
        CommitDate = $commitDate
    }
}

function Get-VersionInfo {
    $versionFromFile = Get-VersionFromFile
    $versionFromGit = Get-LastGitTag
    $gitInfo = Get-GitInfo
    
    # Prioridad: archivo de versión > tag de Git
    $currentVersion = if ($versionFromFile) { $versionFromFile } else { $versionFromGit }
    
    if (-not $currentVersion) {
        Write-ColorOutput "Error: No se pudo determinar la version actual" "Error"
        exit 1
    }
    
    $versionInfo = @{
        Version = $currentVersion
        Source = if ($versionFromFile) { "file" } else { "git" }
        Git = $gitInfo
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    return $versionInfo
}

function Show-VersionInfo {
    param([hashtable]$VersionInfo)
    
    if ($OnlyVersion) {
        Write-Output $VersionInfo.Version
        return
    }
    
    if ($Json) {
        $VersionInfo | ConvertTo-Json -Depth 3
        return
    }
    
    if ($ShowDetails) {
        Write-ColorOutput "INFORMACION DE VERSION" "Info"
        Write-ColorOutput "=========================" "Info"
        Write-ColorOutput "Version actual: $($VersionInfo.Version)" "Success"
        Write-ColorOutput "Fuente: $($VersionInfo.Source)" "Info"
        Write-ColorOutput "Rama: $($VersionInfo.Git.Branch)" "Info"
        Write-ColorOutput "Ultimo commit: $($VersionInfo.Git.LastCommit)" "Info"
        Write-ColorOutput "Fecha commit: $($VersionInfo.Git.CommitDate)" "Info"
        Write-ColorOutput "Timestamp: $($VersionInfo.Timestamp)" "Info"
    } else {
        Write-ColorOutput "Version actual: $($VersionInfo.Version)" "Success"
    }
}

# Función principal
function Main {
    try {
        $versionInfo = Get-VersionInfo
        Show-VersionInfo $versionInfo
    }
    catch {
        Write-ColorOutput "Error: $($_.Exception.Message)" "Error"
        exit 1
    }
}

# Ejecutar función principal
Main
