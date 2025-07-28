# 通知系統設定指南

## 重要更新

**LINE Notify 已於 2024 年 3 月結束服務**，我們已更新系統支援以下替代方案：

## 設定選項

### 1. Email 通知（必需）

- **成本**：免費
- **設定難度**：簡單
- **推薦度**：⭐⭐⭐⭐⭐

### 2. Telegram Bot（推薦）

- **成本**：免費
- **設定難度**：中等
- **推薦度**：⭐⭐⭐⭐⭐

### 3. LINE Bot

- **成本**：免費
- **設定難度**：複雜
- **推薦度**：⭐⭐⭐

---

## Email 設定（Gmail）

### 步驟 1：開啟兩步驟驗證

1. 前往 [Google 帳戶設定](https://myaccount.google.com/)
2. 點擊「安全性」
3. 找到「兩步驟驗證」並開啟

### 步驟 2：產生應用程式密碼

1. 在「安全性」頁面找到「應用程式密碼」
2. 點擊「產生新的應用程式密碼」
3. 選擇「郵件」
4. 複製產生的 16 位元密碼

### 步驟 3：更新設定檔

在 `config/notification-config.js` 中更新：

```javascript
EMAIL: {
  GMAIL: {
    USER: 'your-email@gmail.com',        // 您的 Gmail
    APP_PASSWORD: 'your-16-digit-password' // 16 位元應用程式密碼
  }
}
```

---

## Telegram Bot 設定（推薦）

### 步驟 1：建立 Bot

1. 在 Telegram 中搜尋 `@BotFather`
2. 發送 `/newbot` 指令
3. 輸入 Bot 名稱（例如：隱湖小竹通知）
4. 輸入 Bot 用戶名（例如：yinhu_notify_bot）
5. 複製 Bot Token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 步驟 2：取得聊天室 ID

1. 搜尋您剛建立的 Bot
2. 點擊「開始」或發送 `/start`
3. 在瀏覽器中訪問：`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. 找到 `"chat":{"id":123456789}` 中的數字，這就是您的聊天室 ID

### 步驟 3：更新設定檔

在 `config/notification-config.js` 中更新：

```javascript
TELEGRAM_BOT: {
  BOT_TOKEN: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
  CHAT_ID: '123456789'
}
```

---

## LINE Bot 設定

### 步驟 1：建立 Provider

1. 前往 [LINE Developers](https://developers.line.biz/)
2. 登入您的 LINE 帳號
3. 點擊「Create New Provider」
4. 輸入 Provider 名稱（例如：隱湖小竹）

### 步驟 2：建立 Channel

1. 在 Provider 中點擊「Create Channel」
2. 選擇「Messaging API」
3. 填寫基本資訊：
   - Channel name: 隱湖小竹通知
   - Channel description: 訂單通知系統
   - Category: 選擇適合的類別

### 步驟 3：取得 Token 和 Secret

1. 在 Channel 設定中找到「Messaging API」標籤
2. 點擊「Issue」按鈕產生 Channel Access Token
3. 複製 Channel Access Token 和 Channel Secret

### 步驟 4：取得用戶 ID

1. 在 Channel 設定中找到「Messaging API」標籤
2. 複製 QR Code 或 Bot 連結
3. 用您的 LINE 帳號加入 Bot 好友
4. 發送訊息給 Bot
5. 在 Channel 設定中查看「Webhook URL」下方的用戶 ID

### 步驟 5：更新設定檔

在 `config/notification-config.js` 中更新：

```javascript
LINE_BOT: {
  CHANNEL_ACCESS_TOKEN: 'your_channel_access_token',
  CHANNEL_SECRET: 'your_channel_secret',
  ADMIN_USER_ID: 'your_line_user_id'
}
```

---

## 測試通知

### 1. 基本測試

訪問 `notification-test-simple.html` 進行測試

### 2. 測試功能

- ✅ Email 通知測試
- ✅ 模擬訂單 Email
- ✅ 貨到付款 Email 流程
- ✅ Telegram Bot 通知（如果已設定）
- ✅ LINE Bot 通知（如果已設定）

### 3. 測試記錄

- 即時查看測試結果
- 詳細錯誤訊息
- 成功/失敗狀態顯示

---

## 常見問題

### Q: LINE Notify 為什麼不能用了？

A: LINE Notify 已於 2024 年 3 月結束服務，建議使用 Telegram Bot 或 LINE Bot 替代。

### Q: Telegram Bot 設定複雜嗎？

A: 不複雜，只需要 4 個步驟，約 5 分鐘即可完成。

### Q: 可以同時使用多種通知管道嗎？

A: 可以，系統支援同時發送到 Email、Telegram 和 LINE Bot。

### Q: 通知成本如何？

A: Email 和 Telegram Bot 完全免費，LINE Bot 也有免費額度。

---

## 推薦設定順序

1. **Email 設定**（必需，最簡單）
2. **Telegram Bot 設定**（推薦，功能強大）
3. **LINE Bot 設定**（可選，較複雜）

完成設定後，您就可以享受即時的訂單通知服務了！
