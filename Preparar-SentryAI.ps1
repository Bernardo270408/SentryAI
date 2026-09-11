$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Test-Path -LiteralPath '.venv\Scripts\python.exe')) {
    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    $bundledPython = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
    if ($pythonCommand) { $pythonForSetup = $pythonCommand.Source }
    elseif (Test-Path -LiteralPath $bundledPython) { $pythonForSetup = $bundledPython }
    else { throw 'Instale Python 3.11 ou superior e execute novamente.' }
    & $pythonForSetup -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar o ambiente Python.' }
}
& '.\.venv\Scripts\python.exe' -m pip install -r Backend\requirements.txt -r Backend\requirements-rag.txt
if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar dependências.' }
if (-not (Test-Path -LiteralPath '.env')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env'
    Write-Host 'Preencha OPENAI_API_KEY no .env antes de usar a IA.'
}
& '.\.venv\Scripts\python.exe' Backend\prepare_demo.py
if ($LASTEXITCODE -ne 0) { throw 'Falha ao preparar a demonstração.' }
Write-Host 'Pronto. Execute Iniciar-SentryAI.cmd e abra http://127.0.0.1:5000.'
