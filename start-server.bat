@echo off
echo 正在啟動網路伺服器...
echo.
echo 本機訪問：http://localhost:8000
echo 網路訪問：http://10.36.165.62:8000
echo.
echo 按 Ctrl+C 停止伺服器
echo.
python -m http.server 8000 --bind 0.0.0.0
pause 