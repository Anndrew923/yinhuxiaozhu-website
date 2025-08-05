# 技術筆記 - 按鈕對齊問題解決方案

## 問題描述
在管理頁面（商品管理、菜單管理、訂單管理）中，按鈕出現「高高低低參差不齊」的對齊問題，影響使用者體驗。

## 問題根因分析
1. **CSS 優先級衝突**：每個頁面都有自己的 `.btn` 樣式定義，覆蓋全域樣式
2. **缺少強制高度**：沒有統一的 `height` 設定，按鈕高度被內容撐開
3. **行高不一致**：不同按鈕的 `line-height` 不同，造成垂直對齊問題
4. **容器對齊缺失**：`.toolbar-right` 和 `.modal-footer` 缺少 `align-items: center`

## 成功解決方案（參考註冊 Modal）

### 1. 按鈕樣式統一修正
```css
.btn {
  padding: 10px 20px !important;
  border: none !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  text-decoration: none !important;
  display: flex !important;                    /* 關鍵：使用 flex 而非 inline-flex */
  align-items: center !important;              /* 關鍵：垂直居中 */
  justify-content: center !important;          /* 關鍵：水平居中 */
  gap: 6px !important;
  box-sizing: border-box !important;
  height: 40px !important;                     /* 關鍵：固定高度 */
  line-height: 1 !important;                   /* 關鍵：統一行高 */
  overflow: hidden !important;                 /* 關鍵：防止內容撐高 */
  white-space: nowrap !important;              /* 關鍵：防止文字換行 */
  margin: 0 !important;                        /* 關鍵：重置邊距 */
  vertical-align: top !important;              /* 關鍵：頂部對齊 */
}
```

### 2. 容器對齊修正
```css
/* 工具列容器 */
.toolbar-right {
  display: flex;
  gap: 10px;
  align-items: center;                         /* 關鍵：容器內元素垂直居中 */
}

/* Modal 底部容器 */
.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  align-items: center;                         /* 關鍵：容器內按鈕垂直居中 */
  gap: 10px;
}
```

## 關鍵技術要點

### 1. 使用 `!important` 確保優先級
- 由於各頁面有本地樣式，必須使用 `!important` 覆蓋
- 確保樣式在所有情況下都能生效

### 2. `display: flex` 而非 `inline-flex`
- `flex` 提供更好的對齊控制
- 配合 `align-items: center` 和 `justify-content: center` 完美居中

### 3. 固定高度 + 防止撐開
- `height: 40px` 確保所有按鈕高度一致
- `overflow: hidden` 防止內容超出
- `white-space: nowrap` 防止文字換行撐高

### 4. 統一行高
- `line-height: 1` 確保文字垂直居中
- 避免不同字體大小造成的對齊問題

### 5. 容器層級對齊
- 在 `.toolbar-right` 和 `.modal-footer` 加上 `align-items: center`
- 確保容器內所有元素垂直對齊

## 適用範圍
- 所有管理頁面的按鈕
- 工具列按鈕組
- Modal 內的操作按鈕
- 任何需要水平對齊的按鈕組合

## 驗證方法
1. 檢查按鈕是否完全水平對齊
2. 確認不同文字長度的按鈕高度一致
3. 驗證圖標按鈕與文字按鈕對齊
4. 測試 Modal 內按鈕對齊

## 未來預防措施
1. 新頁面直接使用此 `.btn` 樣式
2. 避免在本地樣式中覆蓋核心對齊屬性
3. 統一使用 `display: flex` 而非 `inline-flex`
4. 始終設定固定高度和 `line-height: 1`

## 參考案例
- 註冊 Modal 按鈕（完美對齊的範例）
- 位置：`js/services/auth.service.js` 第 330-350 行

---
*最後更新：2025-08-05*
*解決者：AI Assistant* 