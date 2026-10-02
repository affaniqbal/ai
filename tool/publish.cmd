@echo off
title Publish Notes
cd /d "C:\Users\PC\Documents\GitHub\ai"
if errorlevel 1 goto failed
echo Building your notes...
"C:\Program Files\nodejs\node.exe" "tool\build-notes.js"
if errorlevel 1 goto failed
echo.
echo Publishing to the web...
git add notes index.html
if errorlevel 1 goto failed
rem commit only when something changed; still push in case an earlier push failed
git diff --cached --quiet
if not errorlevel 1 goto push
git commit -m "notes: update"
if errorlevel 1 goto failed
:push
git push
if errorlevel 1 goto failed
echo.
echo ============================================
echo   Published. Your site updates in a minute.
echo ============================================
echo.
pause
exit /b 0

:failed
echo.
echo ============================================
echo   NOT published. See the error above.
echo ============================================
echo.
pause
exit /b 1
