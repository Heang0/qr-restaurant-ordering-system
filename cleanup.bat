@echo off
echo ====================================
echo  Cleaning Up Old Files
echo ====================================
echo.

echo [1/4] Removing old public files...
rmdir /s /q public\js 2>nul
del /q public\index.html 2>nul
del /q public\login.html 2>nul
del /q public\order.html 2>nul
del /q public\admin.html 2>nul
del /q public\superadmin.html 2>nul
del /q public\style.css 2>nul
del /q public\order-custom.css 2>nul
echo ✅ Old public files removed

echo.
echo [2/4] Removing node_modules...
rmdir /s /q node_modules 2>nul
echo ✅ node_modules removed

echo.
echo [3/3] Removing package-lock.json...
del /q package-lock.json 2>nul
echo ✅ package-lock.json removed

echo.
echo ====================================
echo  Cleanup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Run: npm install
echo 2. Test: npm run dev
echo 3. Deploy to Vercel!
echo.
pause
