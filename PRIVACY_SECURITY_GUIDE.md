# 隱私權與資料安全設定指南

## 📋 概述

本指南說明如何為隱湖小竹網站設定完整的隱私權保護和資料安全機制，確保符合法規要求並保護用戶資料安全。

## 🔒 已實作的安全功能

### 1. 隱私權政策頁面

- **檔案位置**: `privacy-policy.html`
- **功能**: 完整的隱私權聲明，包含：
  - 資料收集目的和類型
  - Cookie 使用政策
  - 資料安全措施
  - 用戶權利說明
  - 資料保留期間
  - 聯絡資訊

### 2. Cookie 同意通知系統

- **檔案位置**: `js/cookie-consent.js`
- **功能**:
  - 自動顯示 Cookie 同意通知
  - 三種同意選項：接受全部、自訂設定、拒絕非必要
  - 詳細的 Cookie 設定面板
  - 本地儲存用戶偏好

### 3. 資料安全服務

- **檔案位置**: `js/services/security.service.js`
- **功能**:
  - 密碼強度驗證
  - 資料加密/解密
  - 敏感資料遮罩
  - 輸入資料清理
  - 會話管理
  - 登入嘗試限制
  - 安全日誌記錄
  - 資料備份/恢復

### 4. 安全設定頁面

- **檔案位置**: `security-settings.html`
- **功能**:
  - 安全評分顯示
  - 帳戶安全設定
  - 資料保護選項
  - 會話管理
  - 隱私設定

## 🚀 設定步驟

### 步驟 1: 在所有頁面加入 Cookie 通知

在每個 HTML 頁面的 `<head>` 區塊中加入：

```html
<!-- 載入 Cookie 同意通知 -->
<script src="js/cookie-consent.js"></script>
```

### 步驟 2: 在會員相關頁面加入安全服務

在需要安全功能的頁面中加入：

```html
<!-- 載入安全服務 -->
<script src="js/services/security.service.js"></script>
```

### 步驟 3: 更新導航連結

在網站導航中加入隱私權政策和安全設定的連結：

```html
<a href="privacy-policy.html">隱私權政策</a>
<a href="security-settings.html">安全設定</a>
```

## 📊 法規合規檢查清單

### 個人資料保護法 (GDPR/個資法)

- ✅ 明確的資料收集目的聲明
- ✅ 用戶同意機制
- ✅ 資料處理權利說明
- ✅ 資料保留期間規定
- ✅ 聯絡資訊提供

### Cookie 法規 (ePrivacy Directive)

- ✅ Cookie 同意通知
- ✅ 分類 Cookie 說明
- ✅ 用戶選擇權
- ✅ 同意記錄保存

### 電子商務法規

- ✅ 交易資料保護
- ✅ 付款資訊安全
- ✅ 客戶服務聯絡方式

## 🔧 進階安全設定

### 1. HTTPS 強制重導向

在伺服器設定中加入：

```javascript
// 檢查是否為 HTTPS
if (
  window.location.protocol !== "https:" &&
  window.location.hostname !== "localhost"
) {
  window.location.href =
    "https:" + window.location.href.substring(window.location.protocol.length);
}
```

### 2. 內容安全政策 (CSP)

在 HTML 中加入：

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com; style-src 'self' 'unsafe-inline';"
/>
```

### 3. 安全標頭設定

在伺服器回應中加入：

```javascript
// 安全標頭
res.setHeader("X-Content-Type-Options", "nosniff");
res.setHeader("X-Frame-Options", "DENY");
res.setHeader("X-XSS-Protection", "1; mode=block");
res.setHeader(
  "Strict-Transport-Security",
  "max-age=31536000; includeSubDomains"
);
```

## 📈 監控與維護

### 1. 定期安全檢查

建議每月進行以下檢查：

- 安全評分評估
- 資料備份狀態
- 登入嘗試記錄
- 系統日誌分析

### 2. 用戶教育

提供用戶安全建議：

- 強密碼設定
- 定期密碼更換
- 可疑活動報告
- 安全瀏覽習慣

### 3. 法規更新追蹤

定期檢查：

- 個資法修訂
- Cookie 法規變更
- 電子商務法規更新

## 🛠️ 故障排除

### 常見問題

1. **Cookie 通知不顯示**

   - 檢查 `js/cookie-consent.js` 是否正確載入
   - 確認 localStorage 可用
   - 檢查瀏覽器設定

2. **安全服務無法初始化**

   - 檢查 Firebase 設定
   - 確認網路連線
   - 查看瀏覽器控制台錯誤

3. **隱私權政策頁面無法存取**
   - 檢查檔案路徑
   - 確認伺服器設定
   - 驗證檔案權限

### 除錯工具

使用瀏覽器開發者工具：

- Console 查看錯誤訊息
- Network 檢查檔案載入
- Application 檢查 localStorage
- Security 檢查 HTTPS 狀態

## 📞 支援與聯絡

如有問題或需要協助，請聯絡：

- **技術支援**: tech@yinhu.com
- **隱私權問題**: privacy@yinhu.com
- **安全事件報告**: security@yinhu.com

## 🔄 更新記錄

- **2024-12**: 初始版本建立
- 包含完整的隱私權政策
- Cookie 同意通知系統
- 資料安全服務
- 安全設定頁面

---

**注意**: 本指南應根據實際業務需求和法規要求進行調整。建議定期檢視和更新以確保合規性。
