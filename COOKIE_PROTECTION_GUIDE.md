# Cookie 保護實施指南

## 🛡️ 概述

本指南說明如何在網站的不同頁面和功能中實施 Cookie 同意檢查，確保用戶在同意 Cookie 設定前無法使用需要 Cookie 的功能。

## 🔒 保護原則

### 1. 基本原則

- **必要性 Cookie**：始終允許，無需同意
- **功能性 Cookie**：需要同意後才能使用
- **分析性 Cookie**：需要同意後才能使用

### 2. 保護範圍

- 導覽連結
- 功能按鈕
- 表單提交
- 會員功能
- 購物車功能
- 個人化設定

## 📋 實施方法

### 1. 檢查函數

```javascript
// 檢查 Cookie 同意狀態
function checkCookieConsent() {
  return localStorage.getItem("yinhu_cookie_consent") === "true";
}

// 檢查特定類型的 Cookie 是否啟用
function isCookieTypeEnabled(type) {
  const preferences = JSON.parse(
    localStorage.getItem("yinhu_cookie_preferences") || "{}"
  );
  return preferences[type] || false;
}
```

### 2. 安全導覽函數

```javascript
// 安全的導覽函數
function safeNavigate(url) {
  if (checkCookieConsent()) {
    window.location.href = url;
  } else {
    showCookieConsentAlert();
  }
}

// 安全的按鈕點擊函數
function safeButtonClick(action) {
  if (checkCookieConsent()) {
    action();
  } else {
    showCookieConsentAlert();
  }
}
```

### 3. 美觀的提示框

```javascript
function showCookieConsentAlert() {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  `;

  modal.innerHTML = `
    <h3 style="color: #2d5a27; margin-bottom: 15px;">🍪 Cookie 設定</h3>
    <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">
      請先同意 Cookie 設定後才能使用此功能。
    </p>
    <button onclick="this.parentElement.parentElement.remove()" 
            style="background: #4a7c59; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
      我知道了
    </button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // 點擊外部關閉
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}
```

## 🔧 頁面實施範例

### 1. 導覽列保護

```html
<!-- 修改前 -->
<li><a href="menu.html">菜單</a></li>

<!-- 修改後 -->
<li><a href="#" onclick="safeNavigate('menu.html'); return false;">菜單</a></li>
```

### 2. 按鈕保護

```html
<!-- 修改前 -->
<a href="order.html" class="btn-primary">立即訂餐</a>

<!-- 修改後 -->
<a
  href="#"
  onclick="safeNavigate('order.html'); return false;"
  class="btn-primary"
  >立即訂餐</a
>
```

### 3. 功能按鈕保護

```html
<!-- 修改前 -->
<button onclick="toggleNews()">NEWS</button>

<!-- 修改後 -->
<button onclick="safeButtonClick(() => toggleNews())">NEWS</button>
```

### 4. 表單保護

```html
<!-- 修改前 -->
<form onsubmit="submitForm()">
  <button type="submit">提交</button>
</form>

<!-- 修改後 -->
<form onsubmit="return safeButtonClick(() => submitForm())">
  <button type="submit">提交</button>
</form>
```

## 📄 需要保護的頁面清單

### 高優先級（必須保護）

- [x] `home.html` - 主頁面
- [ ] `menu.html` - 菜單頁面
- [ ] `order.html` - 訂餐頁面
- [ ] `member.html` - 會員中心
- [ ] `login.html` - 登入頁面
- [ ] `checkout.html` - 結帳頁面

### 中優先級（建議保護）

- [ ] `product.html` - 商品頁面
- [ ] `order-history.html` - 訂單歷史
- [ ] `notification-settings.html` - 通知設定
- [ ] `security-settings.html` - 安全設定

### 低優先級（可選保護）

- [ ] `about.html` - 關於我們
- [ ] `news.html` - 新聞頁面
- [ ] `privacy-policy.html` - 隱私權政策

## 🎯 功能分類保護

### 1. 會員功能

```javascript
function checkMemberAccess() {
  if (!checkCookieConsent()) {
    showCookieConsentAlert();
    return false;
  }
  return true;
}
```

### 2. 購物車功能

```javascript
function addToCart(productId) {
  if (!checkCookieConsent()) {
    showCookieConsentAlert();
    return;
  }
  // 購物車邏輯
}
```

### 3. 個人化功能

```javascript
function saveUserPreference(key, value) {
  if (!isCookieTypeEnabled("functional")) {
    alert("需要啟用功能性 Cookie 才能保存偏好設定。");
    return;
  }
  // 保存邏輯
}
```

### 4. 分析功能

```javascript
function trackUserBehavior(action) {
  if (!isCookieTypeEnabled("analytical")) {
    return; // 靜默跳過
  }
  // 分析邏輯
}
```

## 🚨 例外處理

### 1. 必要功能例外

```javascript
// 某些功能即使沒有 Cookie 同意也應該允許
function allowEssentialFunction() {
  // 例如：查看隱私權政策、聯繫客服等
  return true;
}
```

### 2. 降級處理

```javascript
function gracefulDegradation() {
  if (!checkCookieConsent()) {
    // 提供基本功能，但不提供個人化體驗
    showBasicVersion();
  } else {
    // 提供完整功能
    showFullVersion();
  }
}
```

## 📊 監控與測試

### 1. 測試清單

- [ ] 未同意 Cookie 時無法訪問受保護頁面
- [ ] 未同意 Cookie 時無法使用受保護功能
- [ ] 同意 Cookie 後可以正常使用所有功能
- [ ] 不同 Cookie 類型設定正確影響功能可用性

### 2. 監控指標

- Cookie 同意率
- 功能使用率
- 用戶投訴數量
- 法規合規狀態

## 🔄 更新記錄

### v1.0 (2024-12)

- 初始實施指南
- 基本保護函數
- 頁面實施範例
- 功能分類保護

### 未來改進

- 更精細的權限控制
- 用戶體驗優化
- 自動化測試
- 法規更新追蹤

---

**注意**：此指南應根據實際業務需求和法規要求進行調整。建議定期檢視和更新以確保合規性。
