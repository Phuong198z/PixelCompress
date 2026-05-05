@echo off
TITLE PixelCompress - Automatic Setup
echo ======================================================
echo   PIXELCOMPRESS - TỰ ĐỘNG CÀI ĐẶT VÀ CHẠY
echo   Tac gia: Phuong Designer
echo ======================================================
echo.

:: Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [CANH BAO] Khong tim thay Node.js tren may tinh cua ban.
    echo [INFO] Dang thu tu dong cai dat Node.js (dung công nghê winget)...
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    
    if %errorlevel% neq 0 (
        echo [LOI] Khong the tu dong cai dat. 
        echo Vui long tai va cai dat thu cong tai: https://nodejs.org/
        pause
        exit /b
    )
    echo [THANH CONG] Da cai dat Node.js thanh cong!
    echo Vui long KHOI DONG LAI tep nay de tiep tuc.
    pause
    exit /b
)

:: Kiem tra thu muc node_modules
if not exist "node_modules\" (
    echo [INFO] Dang cai dat cac thu vien phu thuoc (can internet)...
    call npm install
) else (
    echo [INFO] Cac thu vien da duoc cai dat.
)

echo [INFO] Dang khoi chay ung dung...
echo ------------------------------------------------------
echo Ung dung se mo tai: http://localhost:3000
echo (Nhan Ctrl+C de dung ung dung)
echo ------------------------------------------------------
echo.

call npm run dev

pause
