$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$releaseDir = Join-Path $repoRoot "release"
$targetDir = Join-Path $repoRoot "src-tauri\target\release"
$nsisDir = Join-Path $targetDir "bundle\nsis"
$packageJsonPath = Join-Path $repoRoot "package.json"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Refresh-Path {
  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machinePath;$userPath"
}

function Refresh-ShellIconCache {
  try {
    $ie4uinit = Join-Path $env:SystemRoot "System32\ie4uinit.exe"
    if (Test-Path $ie4uinit) {
      & $ie4uinit -show | Out-Null
    }
  } catch {
    Write-Warning "Could not run ie4uinit icon refresh: $($_.Exception.Message)"
  }

  try {
    Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class PlanDeskShellNotify {
  [DllImport("shell32.dll")]
  public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@ -ErrorAction SilentlyContinue
    [PlanDeskShellNotify]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
  } catch {
    Write-Warning "Could not notify Windows shell about refreshed icons: $($_.Exception.Message)"
  }
}

function Invoke-Checked {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code $LASTEXITCODE`: $FilePath $($Arguments -join ' ')"
  }
}

function Get-VsDevCmd {
  $vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
  if (-not (Test-Path $vswhere)) {
    return $null
  }

  $installPath = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
  if (-not $installPath) {
    return $null
  }

  $candidate = Join-Path $installPath "Common7\Tools\VsDevCmd.bat"
  if (Test-Path $candidate) {
    return $candidate
  }

  return $null
}

Set-Location $repoRoot
Refresh-Path

$appVersion = (Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json).version
if (-not $appVersion) {
  throw "Could not read app version from package.json"
}

Write-Step "Checking required commands"
if (-not (Test-Command "npm.cmd")) {
  throw "npm.cmd was not found. Install Node.js first."
}
if (-not (Test-Command "cargo")) {
  throw "cargo was not found. Run npm.cmd run desktop:setup, restart PowerShell, then rerun this build."
}
if (-not (Test-Command "rustc")) {
  throw "rustc was not found. Run npm.cmd run desktop:setup, restart PowerShell, then rerun this build."
}

$vsDevCmd = Get-VsDevCmd
if (-not $vsDevCmd) {
  Write-Warning "Visual Studio C++ Build Tools were not found via vswhere. The Rust build may fail if MSVC tools are missing."
}

Write-Step "Installing JavaScript dependencies"
Invoke-Checked "npm.cmd" @("install")

Write-Step "Running TypeScript and lint checks"
Invoke-Checked "npm.cmd" @("run", "typecheck")
Invoke-Checked "npm.cmd" @("run", "lint")

Write-Step "Building PlanDesk Windows installer"
if ($vsDevCmd) {
  $cmd = "call `"$vsDevCmd`" -arch=x64 -host_arch=x64 && npm.cmd run tauri:build -- --bundles nsis"
  cmd.exe /d /s /c $cmd
  if ($LASTEXITCODE -ne 0) {
    throw "Tauri build failed with exit code $LASTEXITCODE"
  }
} else {
  Invoke-Checked "npm.cmd" @("run", "tauri:build", "--", "--bundles", "nsis")
}

Write-Step "Collecting release files"
if (Test-Path $releaseDir) {
  Remove-Item -LiteralPath $releaseDir -Recurse -Force
}
New-Item -ItemType Directory -Path $releaseDir | Out-Null

$installer = Get-ChildItem -Path $nsisDir -Filter "*setup*.exe" -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $installer) {
  $installer = Get-ChildItem -Path $nsisDir -Filter "*.exe" -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
}
if (-not $installer) {
  throw "Tauri build finished, but no NSIS installer .exe was found in $nsisDir"
}

$installerTarget = Join-Path $releaseDir "PlanDesk_${appVersion}_x64-setup.exe"
Copy-Item -LiteralPath $installer.FullName -Destination $installerTarget -Force

$appExe = @(
  (Join-Path $targetDir "PlanDesk.exe"),
  (Join-Path $targetDir "plandesk.exe")
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($appExe) {
  Copy-Item -LiteralPath $appExe -Destination (Join-Path $releaseDir "PlanDesk.exe") -Force
  Copy-Item -LiteralPath $appExe -Destination (Join-Path $releaseDir "PlanDesk_${appVersion}_x64.exe") -Force
} else {
  Write-Warning "Direct PlanDesk executable was not found in $targetDir"
}

Refresh-ShellIconCache

Write-Step "Release ready"
Get-ChildItem -Path $releaseDir -File | Select-Object Name, Length, FullName | Format-Table -AutoSize
