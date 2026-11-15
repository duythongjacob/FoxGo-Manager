@echo off
REM FoxGo Manager - chay tren may (local). Nhay dup file nay de mo.
REM   1 = dev     : http://localhost:5170  (sua code tu cap nhat)
REM   2 = preview : build roi chay ban build tai http://localhost:4170 (giong ban deploy Firebase Hosting)
REM Xem them: README.md, docs/BAO_TRI.md
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Chua cai Node.js / npm. Tai tai https://nodejs.org roi chay lai.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Cai thu vien lan dau...
  call npm install || goto :loi
)

echo.
echo  FoxGo Manager - chon che do:
echo    1. Dev     (http://localhost:5170)
echo    2. Preview ban build (http://localhost:4170)
echo.
choice /c 12 /n /m "Chon 1 hoac 2: "
if errorlevel 2 goto :preview

:dev
call npm run dev -- --open
goto :eof

:preview
call npm run build || goto :loi
call npm run preview -- --open
goto :eof

:loi
echo.
echo Co loi - xem thong bao o tren.
pause
exit /b 1
