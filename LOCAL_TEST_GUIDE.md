# 本地測試指南 - 隱湖小竹會員系統

## 🔧 本地測試問題解決方案

### 問題描述

本地測試時會員資料無法正確顯示，但線上部署正常運作。

### 可能原因

1. **API 金鑰限制**
2. **授權網域設定**
3. **CORS 政策**
4. **瀏覽器快取問題**

## 📋 檢查清單

### 1. Firebase 控制台設定

#### Authentication > Settings > Authorized domains

確保包含以下網域：

- `localhost`
- `127.0.0.1`
- `localhost:8000` (如果使用特定端口)

#### Firestore Database > Rules

確保規則允許本地測試：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // 測試環境
    }
  }
}
```

### 2. Google Cloud Console 設定

#### API 金鑰限制

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇專案：`hidden-lakeside`
3. 前往 **APIs & Services > Credentials**
4. 找到您的 API 金鑰
5. 檢查 **Application restrictions** 和 **API restrictions**

**建議設定：**

- Application restrictions: `HTTP referrers (web sites)`
- 允許的網域：
  - `localhost/*`
  - `127.0.0.1/*`
  - `localhost:8000/*`
  - `your-production-domain.com/*`

### 3. 瀏覽器設定

#### 清除快取

1. 按 `Ctrl + Shift + R` 強制重新載入
2. 或開啟開發者工具 > Application > Storage > Clear storage

#### 檢查網路請求

1. 開啟開發者工具 > Network
2. 重新載入頁面
3. 檢查是否有 Firebase 相關的錯誤請求

### 4. 本地伺服器設定

#### 確保使用正確的端口

```bash
# 使用 node server.js 啟動
# 確保訪問 http://localhost:8000
```

#### 檢查 CORS 設定

如果使用自定義伺服器，確保 CORS 設定正確。

## 🐛 除錯步驟

### 1. 檢查控制台訊息

重新載入頁面後，查看控制台是否有以下訊息：

- ✅ "Firebase 配置載入: hidden-lakeside"
- ✅ "Firebase 初始化成功"
- ✅ "檢測到本地環境，啟用本地測試模式"
- ✅ "Firestore 連線正常"

### 2. 測試註冊流程

1. 清除所有瀏覽器資料
2. 註冊新帳號
3. 檢查控制台訊息
4. 查看 Firestore 是否有新文件

### 3. 常見錯誤訊息

#### "Firebase Auth 未初始化"

- 檢查 Firebase SDK 是否正確載入
- 確認網路連線正常

#### "Firestore 連線失敗"

- 檢查 Firestore 規則
- 確認 API 金鑰設定

#### "auth/unauthorized-domain"

- 在 Firebase 控制台添加 `localhost` 到授權網域

## 🚀 快速修復

如果問題持續，可以嘗試：

1. **使用無痕模式**測試
2. **更換瀏覽器**測試
3. **暫時移除 API 金鑰限制**（僅測試用）
4. **使用 Firebase Emulator**進行本地開發

## 📞 支援

如果問題仍然存在，請提供：

1. 控制台錯誤訊息截圖
2. Network 標籤中的錯誤請求
3. Firebase 控制台的設定截圖
