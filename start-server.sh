#!/bin/bash
echo "正在啟動本地伺服器..."
echo ""
echo "請在瀏覽器中訪問：http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止伺服器"
echo ""
python3 -m http.server 8000 