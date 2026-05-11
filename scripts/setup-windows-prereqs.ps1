$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Step "Checking Windows package manager"
if (-not (Test-Command "winget")) {
  throw "winget is not available. Install App Installer from Microsoft Store, then rerun this script."
}

Write-Step "Installing Rust toolchain if needed"
if (-not (Test-Command "rustup")) {
  winget install --id Rustlang.Rustup --source winget --accept-package-agreements --accept-source-agreements
} else {
  Write-Host "rustup is already available."
}

Write-Step "Refreshing PATH for this shell"
$machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$env:Path = "$machinePath;$userPath"

if (Test-Command "rustup") {
  Write-Step "Selecting stable MSVC Rust toolchain"
  rustup default stable-msvc
} else {
  Write-Warning "rustup is installed but not available in this shell yet. Restart PowerShell and run: rustup default stable-msvc"
}

Write-Step "Ensuring Microsoft Visual Studio Build Tools are installed"
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
  $vsInstallPath = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
} else {
  $vsInstallPath = $null
}

if (-not $vsInstallPath) {
  Write-Host "Installing Visual Studio Build Tools with Desktop C++ workload. This can take a while."
  winget install --id Microsoft.VisualStudio.2022.BuildTools --source winget --accept-package-agreements --accept-source-agreements --override "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
} else {
  Write-Host "Visual Studio C++ Build Tools found at $vsInstallPath"
}

Write-Step "Checking WebView2 runtime"
$webView2 = Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" -ErrorAction SilentlyContinue
if ($webView2) {
  Write-Host "WebView2 runtime is installed: $($webView2.pv)"
} else {
  Write-Host "WebView2 was not detected. The PlanDesk installer is configured to include the offline WebView2 installer."
}

Write-Step "Done"
Write-Host "If Rust or Build Tools were just installed, restart PowerShell before building."
