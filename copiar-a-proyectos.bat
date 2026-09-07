@echo off
echo ========================================================
echo Copiando Party Game Show a Escritorio\Documentos\Proyectos
echo ========================================================

set DESTINO="C:\Users\ald19\Desktop\Documentos\Proyectos\party-game-show"

if not exist %DESTINO% mkdir %DESTINO%

robocopy "%~dp0." %DESTINO% /E /XD node_modules .git /NFL /NDL

echo.
echo ========================================================
echo Proyecto copiado con exito a:
echo %DESTINO%
echo.
echo Para arrancar ejecuta:
echo   cd %DESTINO%
echo   pnpm install
echo   pnpm dev --host
echo ========================================================
pause
