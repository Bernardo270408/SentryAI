@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Primeiro execute Preparar-SentryAI.cmd.
  pause
  exit /b 1
)
echo SentryAI: http://127.0.0.1:5000
echo A chave de API deve estar no arquivo .env da raiz.
".venv\Scripts\python.exe" Backend\serve_demo.py
pause
