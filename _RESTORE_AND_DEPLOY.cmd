@echo off
setlocal
cd /d "%~dp0"

echo === Restore UI texts from Cursor local history ===
node scripts\restore-before-ui-cleanup.mjs
if errorlevel 1 goto :fail

echo.
echo === Commit and push to GitHub (Amvera rebuild) ===
git add -A
git status -sb
git diff --cached --stat
git commit -m "Restore UI texts before cleanup"
if errorlevel 1 (
  echo Nothing to commit or commit failed.
  git status -sb
  goto :done
)
git push origin main
if errorlevel 1 goto :fail

echo.
echo OK. Wait for Amvera build, then Ctrl+Shift+R on the site.
goto :done

:fail
echo.
echo FAILED. Copy this window output and send to chat.
exit /b 1

:done
pause
