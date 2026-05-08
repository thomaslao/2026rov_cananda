$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$servers = Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -match '^node(\.exe)?$' -and
    $_.CommandLine -match 'serve\.mjs' -and
    $_.CommandLine -match [regex]::Escape($root)
  }

if (-not $servers) {
  Write-Output 'No ROV Task Manager v16 local server process was found.'
  exit 0
}

foreach ($server in $servers) {
  Stop-Process -Id $server.ProcessId -ErrorAction Stop
  Write-Output "Stopped ROV Task Manager v16 local server process $($server.ProcessId)."
}
