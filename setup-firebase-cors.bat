@echo off
echo ========================================
echo 🔧 Firebase Storage CORS 設定工具
echo ========================================
echo.

echo 📋 檢查 Google Cloud SDK...
where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未找到 Google Cloud SDK
    echo.
    echo 💡 請先安裝 Google Cloud SDK：
    echo https://cloud.google.com/sdk/docs/install
    echo.
    pause
    exit /b 1
)

echo ✅ Google Cloud SDK 已安裝
echo.

echo 🔧 設定專案...
gcloud config set project hidden-lakeside
if %errorlevel% neq 0 (
    echo ❌ 專案設定失敗
    pause
    exit /b 1
)

echo ✅ 專案已設定為：hidden-lakeside
echo.

echo 📝 創建 CORS 設定檔案...
echo [
echo   {
echo     "origin": [
echo       "https://yinhuxiaozhu-website.netlify.app",
echo       "http://localhost:3000",
echo       "http://localhost:8080",
echo       "http://127.0.0.1:3000",
echo       "http://127.0.0.1:8080"
echo     ],
echo     "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
echo     "maxAgeSeconds": 3600,
echo     "responseHeader": [
echo       "Content-Type",
echo       "Access-Control-Allow-Origin",
echo       "Access-Control-Allow-Methods",
echo       "Access-Control-Allow-Headers"
echo     ]
echo   }
echo ] > cors.json

echo ✅ CORS 設定檔案已創建
echo.

echo 🚀 套用 CORS 設定到 Firebase Storage...
gsutil cors set cors.json gs://hidden-lakeside.firebasestorage.app
if %errorlevel% neq 0 (
    echo ❌ CORS 設定失敗
    echo.
    echo 💡 可能的原因：
    echo - 您沒有足夠的權限
    echo - 需要先登入 Google Cloud
    echo - Bucket 名稱不正確
    echo.
    echo 🔧 請先執行：gcloud auth login
    echo.
    pause
    exit /b 1
)

echo ✅ CORS 設定已成功套用！
echo.

echo 🔍 驗證 CORS 設定...
gsutil cors get gs://hidden-lakeside.firebasestorage.app
echo.

echo 🎉 CORS 設定完成！
echo.
echo 📋 設定的網域：
echo - https://yinhuxiaozhu-website.netlify.app
echo - http://localhost:3000
echo - http://localhost:8080
echo.

echo 🧹 清理暫存檔案...
del cors.json
echo ✅ 清理完成
echo.

echo 🎯 下一步：
echo 1. 等待 5-10 分鐘讓設定生效
echo 2. 測試圖片上傳功能
echo 3. 檢查控制台是否還有 CORS 錯誤
echo.

pause 