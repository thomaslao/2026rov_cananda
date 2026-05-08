$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = if ($env:V16_NODE) { $env:V16_NODE } else { 'node' }
$port = if ($env:V16_PORT) { $env:V16_PORT } else { '8016' }
$log = Join-Path $root 'v16-server.log'
$err = Join-Path $root 'v16-server.err.log'

$env:V16_PORT = $port

$process = Start-Process `
  -FilePath $node `
  -ArgumentList 'serve.mjs' `
  -WorkingDirectory $root `
  -RedirectStandardOutput $log `
  -RedirectStandardError $err `
  -WindowStyle Hidden `
  -PassThru

Start-Sleep -Milliseconds 500

if ($process.HasExited) {
  if (Test-Path $err) {
    Get-Content $err
  }
  throw "V16 server exited early with code $($process.ExitCode)."
}

for ($i = 0; $i -lt 20; $i++) {
  $status = & $node 'status-v16.mjs' 2>&1
  if ($LASTEXITCODE -eq 0) {
    $status
    exit 0
  }
  Start-Sleep -Milliseconds 500
}

throw "V16 server started as process $($process.Id), but status did not become ready. Check $log and $err."
