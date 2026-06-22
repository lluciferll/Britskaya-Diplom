@echo off
setlocal
cd /d "%~dp0"

echo === Master Forge: dev-сервер (без Docker) ===
echo Папка: %CD%
echo Откроется http://localhost:3050
echo.

if not exist node_modules (
  echo npm install...
  call npm install
)

call npm run dev
