# Firebase 社交登入設定步驟

## 🎯 目標

在 Firebase Console 中啟用 Google 和 Facebook 登入功能

## 📋 設定步驟

### 步驟 1：登入 Firebase Console

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案：`hidden-lakeside`
3. 在左側選單中點擊 **Authentication**

### 步驟 2：啟用 Google 登入

1. 點擊 **Sign-in method** 標籤
2. 找到 **Google** 提供者（應該在列表頂部）
3. 點擊 Google 旁邊的編輯圖示（鉛筆圖示）
4. 在彈出的設定視窗中：
   - ✅ 將 **Enable** 開關打開
   - 📧 設定 **Project support email**（您的電子郵件）
   - 💾 點擊 **Save**

**預期結果：**

- Google 提供者狀態應該顯示為 "Enabled"
- 提供者圖示旁邊應該有綠色勾號

### 步驟 3：啟用 Facebook 登入（可選）

1. 在 Sign-in method 頁面，找到 **Facebook** 提供者
2. 點擊 Facebook 旁邊的編輯圖示
3. 在彈出的設定視窗中：
   - ✅ 將 **Enable** 開關打開
   - 🔑 填入 Facebook 應用程式 ID（如果有的話）
   - 🔐 填入 Facebook 應用程式密鑰（如果有的話）
   - 💾 點擊 **Save**

**注意：** 如果沒有 Facebook 應用程式，可以暫時跳過這一步

### 步驟 4：確認授權網域

1. 點擊 **Settings** 標籤
2. 在 **Authorized domains** 區域查看
3. 確認列表中有 `localhost`
4. 如果沒有，點擊 **Add domain** 並輸入 `localhost`

**授權網域列表應該包含：**

- `localhost` （本地測試用）
- `hidden-lakeside.firebaseapp.com` （Firebase 託管）
- 您的實際網域（如果有的話）

## ✅ 驗證設定

### 檢查清單

- [ ] Google 提供者狀態為 "Enabled"
- [ ] Facebook 提供者狀態為 "Enabled"（如果設定了）
- [ ] 授權網域包含 `localhost`
- [ ] 沒有錯誤訊息

### 測試步驟

1. 回到您的測試頁面：`http://localhost:8000/social-login-test.html`
2. 點擊 **Google 登入** 按鈕
3. 應該會彈出 Google 登入視窗
4. 選擇 Google 帳戶並授權
5. 檢查是否成功登入

## 🚨 常見問題

### 問題 1：Google 登入仍然顯示 "disabled"

**解決方案：**

- 確保已點擊 **Save** 按鈕
- 重新整理 Firebase Console 頁面
- 檢查是否有錯誤訊息

### 問題 2：OAuth 同意畫面錯誤

**解決方案：**

- 點擊 **Configure** 連結
- 填寫必要資訊：
  - App name: 隱湖小竹
  - User support email: 您的電子郵件
  - Developer contact information: 您的電子郵件

### 問題 3：授權網域錯誤

**解決方案：**

- 確保添加了 `localhost`
- 等待幾分鐘讓設定生效
- 清除瀏覽器快取

## 📸 設定完成後的預期畫面

### Sign-in method 頁面應該顯示：

```
✅ Google (Enabled)
✅ Facebook (Enabled) - 如果設定了
✅ Email/Password (Enabled)
```

### Settings 頁面應該顯示：

```
Authorized domains:
- localhost
- hidden-lakeside.firebaseapp.com
```

## 🔄 下一步

設定完成後，您就可以：

1. 測試 Google 登入功能
2. 測試 Facebook 登入功能（如果設定了）
3. 檢查 Firestore 中的用戶資料
4. 整合到您的網站中

## 📞 需要協助？

如果設定過程中遇到問題：

1. 截圖 Firebase Console 的相關頁面
2. 提供具體的錯誤訊息
3. 說明您在哪個步驟遇到困難
