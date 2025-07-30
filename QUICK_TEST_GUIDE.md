# 快速測試指南

## 🚀 立即開始測試

### 1. 啟動本地伺服器

**Windows 用戶：**

```cmd
# 方法 1：雙擊 start-server.bat
# 方法 2：在命令提示字元中執行
python -m http.server 8000
```

**Mac/Linux 用戶：**

```bash
# 方法 1：執行腳本
chmod +x start-server.sh
./start-server.sh

# 方法 2：直接執行
python3 -m http.server 8000
```

### 2. 開啟測試頁面

在瀏覽器中前往：

- **測試頁面**：`http://localhost:8000/social-login-test.html`
- **登入頁面**：`http://localhost:8000/login.html`

### 3. 設定 Firebase 授權網域

1. 前往 [Firebase Console](https://console.firebase.google.com/project/hidden-lakeside)
2. **Authentication** → **Settings** → **Authorized domains**
3. 點擊 **Add domain**
4. 輸入：`localhost`
5. 點擊 **Add**

### 4. 啟用社交登入

1. 在 Firebase Console 中，前往 **Authentication** → **Sign-in method**
2. 啟用 **Google** 提供者
3. 啟用 **Facebook** 提供者（可選）

## ✅ 預期結果

### 成功情況

- 點擊 Google 登入按鈕會彈出 Google 登入視窗
- 登入成功後會顯示用戶資訊
- 用戶資料會自動建立到 Firestore

### 常見錯誤及解決方案

**錯誤：`auth/unauthorized-domain`**

- 解決：確保已添加 `localhost` 到 Firebase 授權網域

**錯誤：`auth/operation-not-supported-in-this-environment`**

- 解決：確保使用 `http://localhost:8000` 而不是 `file://`

**錯誤：`auth/popup-blocked`**

- 解決：允許瀏覽器彈出視窗

## 🔧 故障排除

### 檢查清單

- [ ] 使用 `http://localhost:8000` 訪問
- [ ] Firebase 授權網域包含 `localhost`
- [ ] Google 登入已在 Firebase Console 中啟用
- [ ] 瀏覽器允許彈出視窗

### 如果仍然有問題

1. 檢查瀏覽器控制台錯誤訊息
2. 確認 Firebase 專案設定正確
3. 嘗試清除瀏覽器快取
4. 使用無痕模式測試

## 📞 需要協助？

如果遇到問題，請：

1. 截圖錯誤訊息
2. 說明使用的瀏覽器和作業系統
3. 提供 Firebase Console 的設定截圖
