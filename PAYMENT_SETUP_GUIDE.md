# 金流平台設定指南

## 概述

本專案已建立通用的金流整合架構，支援多種金流平台。您只需要選擇一個平台並進行簡單配置即可開始使用。

## 支援的金流平台

### 1. 綠界科技 (ECPay) - 推薦

- **優點**：台灣最常用的金流平台，支援多種付款方式
- **支援付款方式**：信用卡、Line Pay、貨到付款
- **適合對象**：中小型商家
- **費用**：較低

### 2. 藍新金流 (NewebPay)

- **優點**：功能完整，介面友善
- **支援付款方式**：信用卡、Line Pay
- **適合對象**：中大型商家
- **費用**：中等

### 3. Stripe

- **優點**：國際知名，功能強大
- **支援付款方式**：信用卡
- **適合對象**：有國際化需求的商家
- **費用**：較高

## 快速設定

### 步驟 1：選擇金流平台

在 `js/services/payment.service.js` 中修改預設平台：

```javascript
// 當前選擇的金流平台
let currentPlatform = "ecpay"; // 改為您選擇的平台
```

### 步驟 2：設定環境變數

建立 `.env` 檔案（如果使用 Node.js）或在您的部署環境中設定：

```bash
# 綠界科技
ECPAY_MERCHANT_ID=您的商店代號
ECPAY_HASH_KEY=您的 HashKey
ECPAY_HASH_IV=您的 HashIV
ECPAY_LINEPAY_CHANNEL_ID=您的 Line Pay Channel ID (可選)

# 藍新金流
NEWEBPAY_MERCHANT_ID=您的商店代號
NEWEBPAY_HASH_KEY=您的 HashKey
NEWEBPAY_HASH_IV=您的 HashIV

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 步驟 3：更新配置

在 `js/services/payment.service.js` 中更新對應平台的配置：

```javascript
const PAYMENT_CONFIG = {
  ecpay: {
    name: "ECPay",
    apiUrl: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5", // 測試環境
    // apiUrl: 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5', // 正式環境
    merchantId: process.env.ECPAY_MERCHANT_ID || "您的商店代號",
    hashKey: process.env.ECPAY_HASH_KEY || "您的 HashKey",
    hashIV: process.env.ECPAY_HASH_IV || "您的 HashIV",
    // ... 其他配置
  },
};
```

## 平台切換

### 動態切換平台

您可以在程式碼中動態切換金流平台：

```javascript
// 切換到綠界
PaymentService.setPaymentPlatform("ecpay");

// 切換到藍新
PaymentService.setPaymentPlatform("newebpay");

// 切換到 Stripe
PaymentService.setPaymentPlatform("stripe");
```

### 取得平台資訊

```javascript
// 取得當前平台資訊
const platformInfo = PaymentService.getPlatformInfo();
console.log(platformInfo);
// 輸出：{ name: 'ECPay', platform: 'ecpay', supportedMethods: ['credit', 'linepay', 'cod'] }

// 取得支援的付款方式
const methods = PaymentService.getSupportedPaymentMethods();
console.log(methods);
// 輸出：['credit', 'linepay', 'cod']
```

## 各平台詳細設定

### 綠界科技 (ECPay)

1. **註冊帳號**：前往 [綠界科技官網](https://www.ecpay.com.tw/) 註冊
2. **取得測試資料**：
   - 商店代號：2000132
   - HashKey：5294y06JbISpM5x9
   - HashIV：v77hoKGq4kWxNNIS
3. **設定回調 URL**：
   - ReturnURL：`https://您的網域/payment-callback.html`
   - ClientBackURL：`https://您的網域/payment-success.html`
4. **Line Pay 設定**（可選）：
   - 在綠界後台開啟 Line Pay 功能
   - 取得 Line Pay Channel ID
   - 設定 Line Pay 回調 URL

### 藍新金流 (NewebPay)

1. **註冊帳號**：前往 [藍新金流官網](https://www.newebpay.com/) 註冊
2. **取得測試資料**：
   - 商店代號：MS123456789
   - HashKey：12345678901234567890123456789012
   - HashIV：1234567890123456
3. **設定回調 URL**：
   - ReturnURL：`https://您的網域/payment-callback.html`
   - ClientBackURL：`https://您的網域/payment-success.html`

### Stripe

1. **註冊帳號**：前往 [Stripe 官網](https://stripe.com/) 註冊
2. **取得 API 金鑰**：
   - Publishable Key：`pk_test_...`
   - Secret Key：`sk_test_...`
3. **設定 Webhook**：
   - Webhook URL：`https://您的網域/payment-callback.html`
   - Webhook Secret：`whsec_...`

## 測試流程

### 1. 測試環境設定

確保使用測試環境的 API URL 和測試資料：

```javascript
// 測試環境
apiUrl: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";

// 正式環境（上線後切換）
apiUrl: "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";
```

### 2. 測試信用卡

各平台提供的測試信用卡：

**綠界科技**：

- 卡號：4311-9522-2222-2222
- 有效期限：任意未來日期
- 安全碼：任意 3 位數字

**藍新金流**：

- 卡號：4000-0000-0000-0002
- 有效期限：任意未來日期
- 安全碼：任意 3 位數字

**Stripe**：

- 卡號：4242-4242-4242-4242
- 有效期限：任意未來日期
- 安全碼：任意 3 位數字

### 3. 測試流程

1. 進入訂餐頁面，選擇商品
2. 進入結帳頁面，填寫配送資訊
3. 進入付款頁面，選擇付款方式
4. 使用測試信用卡完成付款
5. 檢查回調處理是否正常
6. 確認訂單狀態更新

## 注意事項

### 安全性

1. **環境變數**：敏感資訊必須使用環境變數，不要寫在程式碼中
2. **HTTPS**：正式環境必須使用 HTTPS
3. **檢查碼驗證**：務必實作檢查碼驗證邏輯

### 法規要求

1. **個資法**：妥善保護客戶個人資料
2. **電子支付機構管理條例**：符合相關法規要求
3. **發票開立**：正確處理電子發票

### 錯誤處理

1. **網路錯誤**：處理網路連線失敗
2. **支付失敗**：提供清楚的錯誤訊息
3. **回調處理**：確保回調處理的可靠性

## 常見問題

### Q: 如何從測試環境切換到正式環境？

A: 修改 `js/services/payment.service.js` 中的 API URL：

```javascript
// 測試環境
apiUrl: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";

// 正式環境
apiUrl: "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";
```

### Q: 支付成功但訂單狀態沒有更新？

A: 檢查以下項目：

1. 回調 URL 是否正確設定
2. 檢查碼驗證是否正確實作
3. Firebase 連線是否正常
4. 查看瀏覽器開發者工具的錯誤訊息

### Q: 如何新增其他金流平台？

A: 在 `PAYMENT_CONFIG` 中新增平台配置，並實作對應的處理函數：

```javascript
const PAYMENT_CONFIG = {
  // 現有平台...
  newPlatform: {
    name: "New Platform",
    apiUrl: "https://api.newplatform.com",
    // 其他配置...
  },
};
```

## 技術支援

如果您在設定過程中遇到問題，請：

1. 查看瀏覽器開發者工具的錯誤訊息
2. 檢查 Firebase 控制台的日誌
3. 確認金流平台的設定是否正確
4. 參考各平台的官方文件

## 下一步

設定完成後，您可以：

1. 進行完整的測試流程
2. 設定正式環境
3. 監控支付流程
4. 優化用戶體驗
