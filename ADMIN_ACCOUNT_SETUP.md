# 管理員帳號設定指南

## 為同事創建管理員帳號

### 步驟 1：在 Firebase Console 中創建帳號

1. 進入 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `hidden-lakeside`
3. 進入 **Authentication** → **Users**
4. 點擊 **"Add user"**
5. 輸入同事的 email 和臨時密碼
6. 點擊 **"Add user"**

### 步驟 2：在 Firestore 中設定權限

1. 進入 **Firestore Database** → **Data**
2. 找到 `admins` 集合
3. 創建新的文件，ID 為同事的 UID（從 Authentication 中複製）
4. 設定文件內容：

```json
{
  "email": "同事的email@example.com",
  "name": "同事姓名",
  "role": "order_manager", // 或 "product_manager", "finance_manager"
  "permissions": ["view_orders", "update_orders", "view_products"],
  "createdAt": "2024-01-01T00:00:00Z",
  "isActive": true
}
```

### 步驟 3：權限說明

- **super_admin**: 所有權限（只有您）
- **order_manager**: 訂單管理權限
- **product_manager**: 商品管理權限
- **finance_manager**: 財務管理權限
- **customer_service**: 客服權限

## 安全提醒

- 每位同事使用獨立的 email 和密碼
- 定期檢查登入記錄
- 離職同事要立即停用帳號
