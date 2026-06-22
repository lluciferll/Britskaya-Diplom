@echo off
setlocal
cd /d "%~dp0"

echo === Master Forge: пересборка Docker с нуля ===
echo Папка: %CD%
echo.

findstr /C:"subtitle=" "src\app\login\page.tsx" >nul
if errorlevel 1 (
  echo ОШИБКА: в src\app\login\page.tsx нет subtitle= — это не та копия проекта.
  pause
  exit /b 1
)
echo OK: в login/page.tsx есть subtitle (исходники с текстами)
echo.

docker compose down
docker compose build --no-cache
if errorlevel 1 (
  echo Сборка не удалась.
  pause
  exit /b 1
)

echo.
echo Запуск на http://localhost:3050
echo После старта открой сайт и нажми Ctrl+Shift+R
docker compose up
