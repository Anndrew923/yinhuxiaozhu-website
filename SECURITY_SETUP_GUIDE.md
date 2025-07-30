# 安全性設定指南

## 概述

為了保護您的敏感資訊（如 API 金鑰、密碼等），我們已經重新架構了通知系統，將敏感資訊移到後端安全處理。

## 檔案結構

### 安全的設定檔

1. **`config/server-config.js`** - 後端設定檔（包含敏感資訊）
2. **`config/client-config.js`** - 前端設定檔（僅包含非敏感資訊）

### 舊的不安全檔案

- **`config/notification-config.js`** - 舊的設定檔（已不安全，建議移除）

## 設定步驟

### 1. 設定環境變數（推薦方式）

建立 `.env` 檔案在專案根目錄：

```bash
# Gmail 設定
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# 管理員 Email
ADMIN_EMAIL=admin@yinhu.com

# LINE Bot 設定
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_ADMIN_USER_ID=your_line_user_id_here

# Telegram Bot 設定（可選）
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# 環境設定
NODE_ENV=development
```

### 2. 安裝 dotenv 套件

```bash
npm install dotenv
```

### 3. 更新 server.js

在 `server.js` 頂部加入：

```javascript
require("dotenv").config();
```

### 4. 設定 LINE Bot

1. 前往 [LINE Developers](https://developers.line.biz/)
2. 建立 Provider 和 Messaging API Channel
3. 取得 Channel Access Token 和 Channel Secret
4. 將 Bot 加入好友，取得您的用戶 ID
5. 更新環境變數

### 5. 設定 Gmail

1. 前往 [Google 帳戶設定](https://myaccount.google.com/)
2. 開啟兩步驟驗證
3. 產生應用程式密碼
4. 更新環境變數

## 安全性優勢

### 之前（不安全）

- 敏感資訊暴露在前端 JavaScript
- API 金鑰和密碼可以被任何人查看
- 設定檔直接給瀏覽器讀取

### 現在（安全）

- 敏感資訊只存在於後端
- 前端透過 API 呼叫後端
- 環境變數或伺服器設定檔保護敏感資訊
- 支援不同環境的設定

## API 端點

### 本地開發

- `http://localhost:8000/api/send-email`
- `http://localhost:8000/api/send-line-notification`
- `http://localhost:8000/api/send-order-notification`

### 生產環境

- 使用 Firebase Functions 或其他雲端服務
- 更新 `config/client-config.js` 中的 API 端點

## 測試

1. 啟動本地伺服器：`node server.js`
2. 開啟 `notification-test-simple.html`
3. 測試各種通知功能

## 注意事項

1. **永遠不要**將 `.env` 檔案提交到版本控制
2. **永遠不要**在前端 JavaScript 中硬編碼敏感資訊
3. 定期更換 API 金鑰和密碼
4. 使用 HTTPS 在生產環境中

## 故障排除

### 常見錯誤

1. **"Email 設定不完整"**

   - 檢查環境變數是否正確設定
   - 確認 Gmail 應用程式密碼是否有效

2. **"LINE Bot 未設定"**

   - 檢查 LINE Bot 設定是否完整
   - 確認 Channel Access Token 是否有效

3. **"無法連接到伺服器"**
   - 確認 `node server.js` 正在運行
   - 檢查防火牆設定

### 除錯技巧

1. 檢查伺服器控制台輸出
2. 查看瀏覽器開發者工具的網路標籤
3. 確認所有必要的套件已安裝
