# SnapFix public mirror publish script
# Force-pushes a filtered snapshot to the `hemanth` remote (single orphan commit).

param(
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$remote = "hemanth"
$sourceBranch = "main"
$orphanBranch = "hemanth-mirror-root"
$worktreePath = Join-Path $repoRoot ".hemanth-mirror-worktree"
$excludeFile = Join-Path $repoRoot "deployment\hemanth-exclude.txt"
$keepFile = Join-Path $repoRoot "deployment\hemanth-keep.txt"
$commitMessage = "Public mirror: omit proprietary paths"
$authorName = "hemanthgit1221"
$authorEmail = "hemanthgit1221@users.noreply.github.com"

function Write-Info([string]$Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Ok([string]$Message) { Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Warn([string]$Message) { Write-Host "[WARN] $Message" -ForegroundColor Yellow }

function Read-PatternFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "Pattern file not found: $Path"
    }
    Get-Content $Path |
        Where-Object { $_ -and -not $_.StartsWith("#") } |
        ForEach-Object { $_.Trim().Replace("\", "/") }
}

function Test-PathMatchesPrefix {
    param(
        [string]$FilePath,
        [string[]]$Prefixes
    )
    $normalized = $FilePath.Replace("\", "/")
    foreach ($prefix in $Prefixes) {
        $p = $prefix.TrimEnd("/")
        if ($normalized -eq $p) { return $true }
        if ($normalized.StartsWith("$p/")) { return $true }
    }
    return $false
}

function Test-ShouldExclude {
    param(
        [string]$FilePath,
        [string[]]$ExcludePrefixes,
        [string[]]$KeepPrefixes
    )
    if (Test-PathMatchesPrefix -FilePath $FilePath -Prefixes $KeepPrefixes) {
        return $false
    }
    return (Test-PathMatchesPrefix -FilePath $FilePath -Prefixes $ExcludePrefixes)
}

Push-Location $repoRoot
try {
    Write-Info "SnapFix public mirror publish"
    Write-Info "Source branch: $sourceBranch | Remote: $remote"

    docker --version | Out-Null
    git --version | Out-Null

    $excludePrefixes = Read-PatternFile $excludeFile
    $keepPrefixes = Read-PatternFile $keepFile

    $remotes = git remote
    if ($remotes -notcontains $remote) {
        throw "Remote '$remote' not found. Add it first: git remote add hemanth https://github.com/hemanthgit1221/snapfix.git"
    }

    if ($worktreePath -and (Test-Path $worktreePath)) {
        Write-Info "Removing existing mirror worktree..."
        git worktree remove --force $worktreePath 2>$null
        if (Test-Path $worktreePath) {
            Remove-Item $worktreePath -Recurse -Force
        }
    }

    git branch -D $orphanBranch 2>$null | Out-Null

    Write-Info "Creating mirror worktree from $sourceBranch..."
    git worktree add $worktreePath $sourceBranch

    Push-Location $worktreePath
    try {
        $tracked = git ls-files
        $toRemove = @()
        foreach ($file in $tracked) {
            if (Test-ShouldExclude -FilePath $file -ExcludePrefixes $excludePrefixes -KeepPrefixes $keepPrefixes) {
                $toRemove += $file
            }
        }

        Write-Info "Tracked files: $($tracked.Count)"
        Write-Info "Removing from mirror: $($toRemove.Count)"
        Write-Info "Keeping on mirror: $($tracked.Count - $toRemove.Count)"

        if ($WhatIf) {
            Write-Warn "WhatIf mode — files that would be removed:"
            $toRemove | ForEach-Object { Write-Host "  $_" }
            return
        }

        foreach ($file in $toRemove) {
            git rm -rf --ignore-unmatch -- $file | Out-Null
        }

        Write-Info "Creating orphan commit..."
        git checkout --orphan $orphanBranch
        git add -A

        $env:GIT_AUTHOR_NAME = $authorName
        $env:GIT_COMMITTER_NAME = $authorName
        $env:GIT_AUTHOR_EMAIL = $authorEmail
        $env:GIT_COMMITTER_EMAIL = $authorEmail

        git commit -m $commitMessage

        Write-Info "Force pushing to $remote/$sourceBranch..."
        git push --force $remote "${orphanBranch}:${sourceBranch}"

        Write-Ok "Public mirror published to $remote ($sourceBranch)"
    }
    finally {
        Pop-Location
    }

    Write-Info "Cleaning up mirror worktree..."
    git worktree remove --force $worktreePath 2>$null
    if (Test-Path $worktreePath) {
        Remove-Item $worktreePath -Recurse -Force
    }
    git branch -D $orphanBranch 2>$null | Out-Null
}
finally {
    Pop-Location
}
