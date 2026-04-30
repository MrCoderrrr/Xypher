$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundledNode = "C:\Users\Suresh\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$node = if (Test-Path $bundledNode) { $bundledNode } else { "node" }

$server = Join-Path $root "server"
$client = Join-Path $root "client"

Write-Host "Starting PromptMarket backend on http://localhost:5000"
Start-Process -FilePath $node -ArgumentList "index.js" -WorkingDirectory $server -WindowStyle Hidden

Write-Host "Starting PromptMarket frontend on http://127.0.0.1:5173"
Start-Process -FilePath $node -ArgumentList ".\node_modules\vite\bin\vite.js", "--host", "127.0.0.1", "--port", "5173" -WorkingDirectory $client -WindowStyle Hidden

Start-Sleep -Seconds 3
Write-Host "Backend:  http://localhost:5000/api/payments/token-packs"
Write-Host "Frontend: http://127.0.0.1:5173/"