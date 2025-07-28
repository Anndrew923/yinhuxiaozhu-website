# Logo 設置指南

## 🎯 快速設置

我已經為您修改了登入頁面的 logo 設置。現在您只需要：

1. **將您的 logo 圖片放到 `assets` 資料夾中**
2. **命名為 `logo.png`**

## 📁 Logo 檔案要求

### 檔案格式

- **推薦格式：** PNG（支援透明背景）
- **其他格式：** JPG, JPEG
- **檔案名稱：** `logo.png`

### 圖片規格

- **建議尺寸：** 240x240 像素或更大
- **形狀：** 圓形（您的 logo 本身就是圓形設計）
- **背景：** 深綠色背景（#2d5a27）
- **檔案大小：** 建議小於 500KB

### 針對您的 logo 設計

您的 logo 有深綠色背景和白色元素，我已經調整了 CSS 設置：

- 使用 `object-fit: contain` 確保 logo 完整顯示
- 設置深綠色背景配合您的設計
- 調整邊框粗細以配合 logo 風格

## 🎨 Logo 顯示效果

### 當前設置

- **形狀：** 圓形
- **尺寸：** 120x120 像素
- **邊框：** 白色邊框（3px）
- **陰影：** 綠色陰影效果
- **背景：** 深綠色背景（#2d5a27）
- **顯示模式：** contain（確保 logo 完整顯示）

### 自訂選項

如果您想要調整 logo 的顯示效果，可以修改以下參數：

#### 調整尺寸

```css
.logo-placeholder {
  width: 150px; /* 調整寬度 */
  height: 150px; /* 調整高度 */
}
```

#### 調整邊框

```css
.logo-placeholder {
  border: 6px solid white; /* 調整邊框粗細 */
}
```

#### 調整陰影

```css
.logo-placeholder {
  box-shadow: 0 10px 30px rgba(45, 90, 39, 0.4); /* 調整陰影 */
}
```

## 📱 響應式設計

Logo 會自動適應不同螢幕尺寸：

- **桌面版：** 120x120 像素
- **平板版：** 100x100 像素
- **手機版：** 80x80 像素

## 🔧 進階自訂

### 如果您想要不同的 logo 檔案名稱

修改 `login.html` 中的這一行：

```html
<img src="assets/your-logo-name.png" alt="隱湖小竹 Logo" />
```

### 如果您想要不同的 logo 路徑

```html
<img src="assets/images/logo.png" alt="隱湖小竹 Logo" />
```

### 如果您想要移除圓形裁剪

修改 CSS 中的 `border-radius: 50%;` 為 `border-radius: 0;`

## ✅ 測試步驟

1. 將 logo 圖片放到 `assets` 資料夾
2. 開啟 `login.html` 查看效果
3. 測試不同螢幕尺寸的顯示效果
4. 確認 logo 清晰度和載入速度

## 🎨 設計建議

- 使用高解析度圖片以確保清晰度
- 選擇與網站主題色調相配的 logo
- 確保 logo 在白色背景上清晰可見
- 考慮 logo 在不同尺寸下的可讀性
