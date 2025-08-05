@echo off
echo ========================================
echo 🚀 隱湖小竹 - 本地測試伺服器
echo ========================================
echo.

echo 📋 檢查可用的伺服器選項...
echo.

echo 1. 🟢 Node.js 伺服器 (推薦)
echo 2. 🐍 Python 伺服器
echo 3. 🐘 PHP 伺服器
echo 4. 🔍 檢查現有伺服器
echo 5. ❌ 退出
echo.

set /p choice="請選擇 (1-5): "

if "%choice%"=="1" goto nodejs
if "%choice%"=="2" goto python
if "%choice%"=="3" goto php
if "%choice%"=="4" goto check
if "%choice%"=="5" goto exit

:nodejs
echo.
echo 🟢 啟動 Node.js 伺服器...
echo.

REM 檢查是否有 server.js
if exist server.js (
    echo ✅ 找到 server.js，正在啟動...
    node server.js
) else (
    echo ⚠️ 未找到 server.js，創建簡單伺服器...
    echo.
    echo 正在安裝 Express...
    npm install express --save
    echo.
    echo 創建 server.js...
    echo const express = require('express');> server.js
    echo const app = express();>> server.js
    echo app.use(express.static('.'));>> server.js
    echo app.listen(3000, () => {>> server.js
    echo   console.log('伺服器運行在 http://localhost:3000');>> server.js
    echo });>> server.js
    echo.
    echo 🚀 啟動伺服器...
    node server.js
)
goto end

:python
echo.
echo 🐍 啟動 Python 伺服器...
echo.
python -m http.server 3000
goto end

:php
echo.
echo 🐘 啟動 PHP 伺服器...
echo.
php -S localhost:3000
goto end

:check
echo.
echo 🔍 檢查現有伺服器...
echo.
curl -I http://localhost:3000 2>nul
if %errorlevel%==0 (
    echo ✅ 發現伺服器運行在 localhost:3000
    echo 🌐 請訪問: http://localhost:3000
) else (
    echo ❌ 未發現運行中的伺服器
    echo 💡 請先啟動一個伺服器
)
echo.
pause
goto end

:exit
echo.
echo 👋 再見！
goto end

:end
echo.
echo 📝 提示：
echo - 伺服器啟動後，請訪問: http://localhost:3000
echo - 按 Ctrl+C 停止伺服器
echo - 使用 local-test-server.html 進行詳細測試
echo.
pause 