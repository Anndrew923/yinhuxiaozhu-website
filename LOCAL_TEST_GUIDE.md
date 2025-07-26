# 本地測試指南

## 問題說明

使用 `file://` 協議直接開啟 HTML 檔案會遇到以下限制：

- Firebase 某些功能無法正常運作
- `postMessage` 等 API 受限
- 控制台會顯示警告訊息

## 解決方案

### 🎯 推薦方法：使用 npm run dev

```bash
# 在專案根目錄執行
npm run dev
```

然後開啟 http://localhost:8000

### 其他方法：

#### 方法二：使用 Python 內建伺服器

```bash
# 在專案根目錄執行
python -m http.server 8000
```

然後開啟 http://localhost:8000

#### 方法三：使用 Node.js Live Server

```bash
# 安裝 live-server
npm install -g live-server

# 在專案根目錄執行
live-server --port=8000
```

#### 方法四：使用 VS Code Live Server 擴充

1. 安裝 "Live Server" 擴充
2. 右鍵點擊 `index.html`
3. 選擇 "Open with Live Server"

## 測試確認

啟動本地伺服器後，控制台應該顯示：

- "檢測到本地環境，啟用本地測試模式"
- "Firebase 初始化成功"
- 不再出現 `file://` 相關警告

## 按鈕高度問題

如果按鈕高度仍不一致，請：

1. 清除瀏覽器快取 (Ctrl+F5)
2. 檢查 CSS 是否正確載入
3. 確認沒有其他樣式覆蓋
