# 歡迎頁面設置指南

## 🎯 歡迎頁面特色

我已經為您創建了一個精美的歡迎頁面，具有以下特色：

### ✨ 視覺效果

- **深綠色背景** - 與品牌色調一致
- **Logo 浮動動畫** - 輕微的上下浮動效果
- **漸入動畫** - 優雅的淡入效果
- **載入動畫** - 三個跳動的點點
- **響應式設計** - 適配所有螢幕尺寸

### 🎮 互動功能

- **自動跳轉** - 5 秒後自動跳轉到首頁
- **跳過按鈕** - 右上角可立即跳轉
- **點擊跳轉** - 點擊 logo 或按任意鍵跳轉
- **多種跳轉方式** - 提供多種用戶選擇

## 📁 檔案設置

### 需要的圖片

將歡迎頁面的 logo 圖片放到 `assets` 資料夾中：

- **檔案名稱：** `welcome-logo.png`
- **建議尺寸：** 500x300 像素或更大
- **格式：** PNG（推薦）或 JPG
- **背景：** 透明或深色背景

### 檔案結構

```
your-website/
├── welcome.html          # 歡迎頁面（入口頁面）
├── index.html           # 首頁
├── assets/
│   ├── welcome-logo.png # 歡迎頁面logo
│   ├── home-logo.png    # 首頁logo
│   └── logo.png         # 登入頁logo
└── ...
```

## 🔧 自訂選項

### 調整顯示時間

修改 `welcome.html` 中的跳轉時間：

```javascript
// 自動跳轉到首頁（5秒後）
setTimeout(() => {
  window.location.href = "index.html";
}, 5000); // 改為 3000 = 3秒，8000 = 8秒
```

### 調整 Logo 尺寸

```css
.welcome-logo {
  max-width: 500px; /* 調整最大寬度 */
}
```

### 調整背景顏色

```css
body {
  background: #2d5a27; /* 調整背景色 */
}
```

### 調整動畫效果

```css
/* 調整浮動動畫幅度 */
@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px); /* 調整浮動高度 */
  }
}
```

## 📱 響應式設計

### 桌面版

- Logo 最大寬度：500px
- 文字大小：1.5rem

### 平板版

- Logo 最大寬度：400px
- 文字大小：1.2rem

### 手機版

- Logo 最大寬度：300px
- 文字大小：1rem

## 🚀 使用方式

### 方法一：直接使用歡迎頁面作為入口

1. 將 `welcome.html` 設為網站的首頁
2. 用戶訪問網站時會先看到歡迎頁面
3. 5 秒後自動跳轉到 `index.html`

### 方法二：修改現有首頁

1. 將 `index.html` 重新命名為 `home.html`
2. 將 `welcome.html` 重新命名為 `index.html`
3. 修改跳轉目標為 `home.html`

### 方法三：添加導覽連結

在首頁添加返回歡迎頁面的連結：

```html
<a href="welcome.html">重新體驗歡迎頁面</a>
```

## 🎨 設計建議

### Logo 設計

- **簡潔設計** - 避免過於複雜的細節
- **高對比度** - 在深綠色背景上清晰可見
- **品牌一致性** - 與其他 logo 保持風格一致

### 動畫效果

- **適度動畫** - 不會過於干擾用戶
- **流暢過渡** - 所有動畫都很平滑
- **響應式動畫** - 在不同裝置上都有良好效果

## ✅ 測試步驟

1. **放置圖片**

   - 將 `welcome-logo.png` 放到 `assets` 資料夾

2. **測試功能**

   - 開啟 `welcome.html` 查看效果
   - 測試自動跳轉功能
   - 測試各種跳轉方式

3. **響應式測試**

   - 測試不同螢幕尺寸
   - 確認動畫效果正常

4. **用戶體驗測試**
   - 確認載入時間合適
   - 確認跳轉功能正常

## 🔄 進階自訂

### 添加背景音樂

```html
<audio autoplay>
  <source src="assets/welcome-music.mp3" type="audio/mpeg" />
</audio>
```

### 添加更多動畫

```css
.welcome-container {
  animation: fadeInUp 1.5s ease-out, rotate 10s linear infinite;
}
```

### 添加進度條

```html
<div class="progress-bar">
  <div class="progress-fill"></div>
</div>
```

## 📞 如果遇到問題

### 常見問題

1. **圖片不顯示**

   - 檢查檔案路徑是否正確
   - 確認檔案格式是否支援

2. **跳轉不工作**

   - 檢查 JavaScript 是否正常載入
   - 確認目標檔案路徑正確

3. **動畫效果不佳**
   - 檢查瀏覽器是否支援 CSS 動畫
   - 確認沒有 JavaScript 錯誤

### 需要協助

如果遇到問題，請提供：

- 瀏覽器資訊
- 錯誤訊息
- 圖片檔案資訊
