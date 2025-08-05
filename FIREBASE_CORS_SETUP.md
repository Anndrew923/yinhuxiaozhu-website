# 🔧 Firebase Storage CORS 設定指南

## 📋 問題說明

您遇到的 CORS 錯誤是因為 Firebase Storage 預設不允許來自 Netlify 的跨域請求。這需要在 Firebase Console 中設定 CORS 規則。

## 🛠️ 解決步驟

### **步驟 1：前往 Firebase Console**

1. 開啟瀏覽器，前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案：`hidden-lakeside`
3. 在左側選單中點擊 **Storage**

### **步驟 2：設定 CORS 規則**

1. 在 Storage 頁面中，點擊 **Rules** 標籤
2. 您會看到當前的 Storage 規則
3. 在規則下方，點擊 **CORS** 標籤（如果沒有看到，可能需要先設定基本規則）

### **步驟 3：添加 CORS 配置**

在 CORS 設定中，添加以下配置：

```json
[
  {
    "origin": [
      "https://yinhuxiaozhu-website.netlify.app",
      "http://localhost:3000",
      "http://localhost:8080",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:8080"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers"
    ]
  }
]
```

### **步驟 4：使用 gsutil 工具（推薦方法）**

如果您有 Google Cloud SDK，可以使用更精確的方法：

1. **安裝 Google Cloud SDK**（如果還沒安裝）
2. **開啟終端機/命令提示字元**
3. **執行以下命令**：

```bash
# 設定專案
gcloud config set project hidden-lakeside

# 創建 CORS 設定檔案
echo '[
  {
    "origin": [
      "https://yinhuxiaozhu-website.netlify.app",
      "http://localhost:3000",
      "http://localhost:8080"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers"
    ]
  }
]' > cors.json

# 套用 CORS 設定
gsutil cors set cors.json gs://hidden-lakeside.firebasestorage.app
```

### **步驟 5：驗證設定**

設定完成後，您可以：

1. **使用我們的測試工具**：
   ```
   https://yinhuxiaozhu-website.netlify.app/fix-firebase-cors.html
   ```

2. **測試檔案上傳功能**

3. **檢查控制台是否還有 CORS 錯誤**

## 🔍 故障排除

### **如果設定後仍有問題：**

1. **清除瀏覽器快取**
2. **等待 5-10 分鐘**（CORS 設定可能需要時間生效）
3. **檢查 Storage Bucket 名稱**是否正確
4. **確認專案 ID**是否正確

### **常見錯誤：**

- **"Access denied"** - 檢查您的 Google 帳號是否有專案權限
- **"Bucket not found"** - 確認 Storage Bucket 名稱
- **"Invalid CORS configuration"** - 檢查 JSON 格式是否正確

## 📚 進階設定

### **更嚴格的 CORS 設定（生產環境推薦）：**

```json
[
  {
    "origin": ["https://yinhuxiaozhu-website.netlify.app"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type"]
  },
  {
    "origin": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type"]
  }
]
```

### **允許所有來源（僅用於開發測試）：**

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

## 🎯 完成檢查清單

- [ ] 已前往 Firebase Console
- [ ] 已設定 CORS 規則
- [ ] 已包含 Netlify 網址
- [ ] 已包含本地開發網址
- [ ] 已測試檔案上傳功能
- [ ] 控制台無 CORS 錯誤

## 📞 需要協助？

如果設定後仍有問題，請：

1. 截圖 Firebase Console 的 CORS 設定
2. 提供控制台的完整錯誤訊息
3. 使用我們的診斷工具進行測試

---

**設定完成後，您的圖片上傳功能應該就能正常運作了！** 🚀 