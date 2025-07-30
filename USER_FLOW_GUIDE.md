# 用戶流程設計指南

## 🎯 流程設計目標

設計一個用戶友好且符合法規要求的網站訪問流程，確保：

1. 新用戶能看到歡迎頁面
2. 用戶必須同意 Cookie 設定才能進入主網站
3. 重複訪問的用戶直接進入主頁面
4. 提供良好的用戶體驗

## 🔄 新的用戶流程

### 首次訪問流程

```
用戶訪問網站
    ↓
顯示歡迎頁面 (index.html) - 3秒後自動跳轉
    ↓
進入主頁面 (home.html)
    ↓
自動顯示 Cookie 同意通知
    ↓
用戶選擇 Cookie 設定
    ├─ 接受全部 → 繼續使用網站
    ├─ 自訂設定 → 顯示設定面板 → 儲存設定 → 繼續使用網站
    └─ 拒絕非必要 → 繼續使用網站
```

### 重複訪問流程

```
用戶再次訪問網站
    ↓
檢查是否已看過歡迎頁面
    ↓
已看過 → 直接跳轉到主頁面
    ↓
進入主頁面 (home.html)
```

## 📋 技術實作細節

### 1. 歡迎頁面邏輯 (index.html)

```javascript
// 檢查是否已經看過歡迎頁面
function hasSeenWelcome() {
  return localStorage.getItem("yinhu_welcome_seen") === "true";
}

// 檢查 Cookie 同意狀態
function checkCookieConsent() {
  return localStorage.getItem("yinhu_cookie_consent") === "true";
}

// 頁面載入時的處理邏輯
window.addEventListener("DOMContentLoaded", function () {
  // 如果已經看過歡迎頁面，直接跳轉到首頁
  if (hasSeenWelcome()) {
    window.location.href = "home.html";
    return;
  }

  // 如果已經同意 Cookie，等待 3 秒後自動跳轉
  if (checkCookieConsent()) {
    setTimeout(() => {
      goToHome();
    }, 3000);
  } else {
    // 如果還沒同意 Cookie，等待用戶選擇
    console.log("等待用戶同意 Cookie 設定...");
  }
});

// 監聽 Cookie 同意事件
document.addEventListener("cookieConsentGiven", function () {
  console.log("用戶已同意 Cookie 設定，準備跳轉到首頁...");
  setTimeout(() => {
    goToHome();
  }, 1000);
});
```

### 2. Cookie 同意通知 (js/cookie-consent.js)

```javascript
// 觸發 Cookie 同意事件
function triggerCookieConsentEvent() {
  const event = new CustomEvent("cookieConsentGiven", {
    detail: { timestamp: new Date().toISOString() },
  });
  document.dispatchEvent(event);
}

// 在所有同意函數中觸發事件
function acceptAllCookies() {
  // ... 設定邏輯 ...
  triggerCookieConsentEvent();
}

function rejectNonEssentialCookies() {
  // ... 設定邏輯 ...
  triggerCookieConsentEvent();
}
```

## 🎨 用戶體驗優化

### 1. 視覺反饋

- **歡迎頁面**：優雅的動畫效果，讓用戶感受到歡迎
- **Cookie 通知**：清晰的說明和選項
- **跳轉過程**：平滑的過渡效果

### 2. 互動選項

- **跳過按鈕**：允許用戶直接跳過歡迎頁面
- **點擊 Logo**：點擊 Logo 也可以跳轉
- **鍵盤支援**：按任意鍵跳轉
- **自訂設定**：詳細的 Cookie 設定選項

### 3. 時間控制

- **自動跳轉**：已同意 Cookie 的用戶 3 秒後自動跳轉
- **同意後跳轉**：選擇 Cookie 設定後 1 秒跳轉
- **手動跳轉**：用戶可以隨時手動跳轉

## 🔧 設定選項

### localStorage 鍵值

| 鍵值                       | 用途               | 預設值  |
| -------------------------- | ------------------ | ------- |
| `yinhu_welcome_seen`       | 是否已看過歡迎頁面 | `false` |
| `yinhu_cookie_consent`     | 是否已同意 Cookie  | `false` |
| `yinhu_cookie_preferences` | Cookie 偏好設定    | `{}`    |

### 可調整的參數

```javascript
// 歡迎頁面顯示時間（毫秒）
const WELCOME_DISPLAY_TIME = 3000;

// Cookie 同意後跳轉延遲（毫秒）
const CONSENT_JUMP_DELAY = 1000;

// 會話超時時間（毫秒）
const SESSION_TIMEOUT = 30 * 60 * 1000;
```

## 🚀 部署建議

### 1. 測試流程

1. **清除瀏覽器資料**：測試首次訪問流程
2. **保留 Cookie**：測試重複訪問流程
3. **不同選擇**：測試各種 Cookie 設定選項
4. **網路延遲**：測試慢速網路下的體驗

### 2. 監控指標

- 歡迎頁面完成率
- Cookie 同意率
- 用戶跳過率
- 頁面載入時間

### 3. 優化建議

- 根據用戶行為調整顯示時間
- 收集用戶反饋改進流程
- 定期檢查法規要求更新

## 🔄 流程變更記錄

### v1.0 (2024-12)

- 初始流程設計
- 整合 Cookie 同意機制
- 實現智能跳轉邏輯
- 優化用戶體驗

### 未來改進方向

- 多語言支援
- 更豐富的動畫效果
- 個人化歡迎訊息
- A/B 測試支援

---

**注意**：此流程設計應根據實際用戶反饋和業務需求進行調整。建議定期檢視和優化以提供最佳用戶體驗。
