# 社交登入設定指南

## 🔧 Firebase Console 設定

### 1. 登入 Firebase Console

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案：`hidden-lakeside`
3. 在左側選單中點擊 **Authentication**

### 2. 啟用 Google 登入

#### 步驟 1：啟用 Google 提供者

1. 在 Authentication 頁面，點擊 **Sign-in method** 標籤
2. 找到 **Google** 提供者，點擊編輯圖示
3. 將 **Enable** 開關打開
4. 設定 **Project support email**（您的電子郵件）
5. 點擊 **Save**

#### 步驟 2：設定 OAuth 同意畫面（如果需要）

1. 系統可能會要求您設定 OAuth 同意畫面
2. 點擊 **Configure** 連結
3. 填寫必要資訊：
   - **App name**: 隱湖小竹
   - **User support email**: 您的電子郵件
   - **Developer contact information**: 您的電子郵件
4. 點擊 **Save and continue**

### 3. 啟用 Facebook 登入

#### 步驟 1：建立 Facebook 應用程式

1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 點擊 **My Apps** → **Create App**
3. 選擇 **Consumer** 類型
4. 填寫應用程式資訊：
   - **App Name**: 隱湖小竹
   - **Contact Email**: 您的電子郵件
5. 點擊 **Create App**

#### 步驟 2：設定 Facebook 登入

1. 在 Facebook 應用程式儀表板中，點擊 **Add Product**
2. 找到 **Facebook Login**，點擊 **Set Up**
3. 選擇 **Web** 平台
4. 填寫網站 URL：`https://your-domain.com`（您的實際網域）
5. 點擊 **Save**

#### 步驟 3：獲取 Facebook 應用程式 ID 和密鑰

1. 在 Facebook 應用程式儀表板中，點擊 **Settings** → **Basic**
2. 記錄 **App ID** 和 **App Secret**
3. 在 **App Domains** 中添加您的網域

#### 步驟 4：在 Firebase 中設定 Facebook

1. 回到 Firebase Console → Authentication → Sign-in method
2. 找到 **Facebook** 提供者，點擊編輯圖示
3. 將 **Enable** 開關打開
4. 填入 Facebook 應用程式 ID 和密鑰
5. 點擊 **Save**

### 4. 設定授權網域

#### 步驟 1：添加授權網域

1. 在 Firebase Authentication 頁面，點擊 **Settings** 標籤
2. 在 **Authorized domains** 區域，點擊 **Add domain**
3. 添加您的網域（例如：`your-domain.com`）
4. 如果是本地測試，添加 `localhost`

## 🧪 測試社交登入

### 1. 本地測試

```bash
# 啟動本地伺服器
python -m http.server 8000
# 或使用 Node.js
npx http-server -p 8000
```

### 2. 測試步驟

1. 前往 `http://localhost:8000/login.html`
2. 點擊 **Google 登入** 按鈕
3. 選擇 Google 帳戶並授權
4. 檢查是否成功登入並跳轉到會員中心

### 3. 檢查 Firestore 資料

1. 在 Firebase Console 中，前往 **Firestore Database**
2. 查看 `user` 集合
3. 確認新用戶資料已建立，包含：
   - `uid`: 用戶唯一識別碼
   - `name`: 用戶姓名
   - `email`: 電子郵件
   - `provider`: 'google' 或 'facebook'
   - `createdAt`: 建立時間

## 🔒 安全注意事項

### 1. 環境變數

```javascript
// 建議將敏感資訊移到環境變數
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  // ... 其他設定
};
```

### 2. 網域驗證

- 確保只有授權的網域可以進行社交登入
- 定期檢查授權網域清單
- 移除不再使用的網域

### 3. 錯誤處理

```javascript
// 處理常見錯誤
try {
  await AuthService.signInWithGoogle();
} catch (error) {
  switch (error.code) {
    case "auth/popup-closed-by-user":
      console.log("用戶關閉了登入視窗");
      break;
    case "auth/popup-blocked":
      console.log("彈出視窗被瀏覽器阻擋");
      break;
    case "auth/cancelled-popup-request":
      console.log("登入請求被取消");
      break;
    default:
      console.error("登入失敗:", error.message);
  }
}
```

## 📱 響應式設計

### 1. 手機版優化

```css
/* 確保社交登入按鈕在手機上正常顯示 */
@media (max-width: 768px) {
  .social-btn {
    width: 100%;
    margin-bottom: 10px;
  }
}
```

### 2. 彈出視窗處理

```javascript
// 檢測彈出視窗是否被阻擋
function checkPopupBlocked() {
  const popup = window.open("", "_blank", "width=400,height=600");
  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    alert("請允許彈出視窗以使用社交登入功能");
    return false;
  }
  popup.close();
  return true;
}
```

## 🚨 常見問題排解

### 1. 彈出視窗被阻擋

**問題**：社交登入彈出視窗被瀏覽器阻擋
**解決方案**：

- 允許網站彈出視窗
- 使用重定向方式登入
- 提供手動登入選項

### 2. 網域不匹配

**問題**：Firebase 錯誤提示網域不匹配
**解決方案**：

- 檢查 Firebase 授權網域設定
- 確保使用正確的網域
- 本地測試時使用 `localhost`

### 3. Facebook 應用程式設定問題

**問題**：Facebook 登入失敗
**解決方案**：

- 檢查 Facebook 應用程式設定
- 確認網域已添加到應用程式
- 檢查應用程式是否已發布

### 4. Google OAuth 同意畫面

**問題**：Google 登入時顯示 OAuth 錯誤
**解決方案**：

- 完成 OAuth 同意畫面設定
- 添加必要的範圍（scopes）
- 設定隱私政策和使用條款

## 📊 監控和分析

### 1. Firebase Analytics

- 追蹤社交登入使用情況
- 分析用戶行為
- 監控登入成功率

### 2. 錯誤監控

```javascript
// 記錄登入錯誤
function logLoginError(provider, error) {
  console.error(`${provider} 登入錯誤:`, error);
  // 可以發送到錯誤追蹤服務
}
```

## 🔄 更新和維護

### 1. 定期檢查

- 每月檢查 Firebase 設定
- 更新 Facebook 應用程式設定
- 檢查授權網域清單

### 2. 用戶回饋

- 收集用戶使用體驗
- 監控登入成功率
- 根據回饋調整設定

---

**注意**：此指南會根據 Firebase 和社交平台的政策更新而調整。建議定期檢查官方文件以確保合規性。
