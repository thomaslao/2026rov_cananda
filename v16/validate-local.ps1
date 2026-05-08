$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$preferredPort = if ($env:V16_VALIDATE_PORT) { [int]$env:V16_VALIDATE_PORT } else { 8017 }
$maxAttempts = if ($env:V16_VALIDATE_PORT_ATTEMPTS) { [int]$env:V16_VALIDATE_PORT_ATTEMPTS } else { 10 }

function Test-PortAvailable {
  param([int]$Port)
  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse('127.0.0.1'), $Port)
    $listener.Start()
    return $true
  } catch {
    return $false
  } finally {
    if ($listener) {
      $listener.Stop()
    }
  }
}

$port = $preferredPort
for ($i = 0; $i -lt $maxAttempts; $i++) {
  $candidate = $preferredPort + $i
  if (Test-PortAvailable -Port $candidate) {
    $port = $candidate
    break
  }
  if ($i -eq ($maxAttempts - 1)) {
    throw "No available validation port found from $preferredPort to $($preferredPort + $maxAttempts - 1)."
  }
}

$baseUrl = "http://127.0.0.1:$port"

$server = $null
try {
  $env:V16_PORT = $port
  $server = Start-Process -FilePath 'node' -ArgumentList 'serve.mjs' -WorkingDirectory $root -WindowStyle Hidden -PassThru
  Start-Sleep -Seconds 1

  $env:V16_BASE_URL = $baseUrl
  node smoke-server.mjs
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -ErrorAction SilentlyContinue
  }
}
