# Logo 顯示問題診斷指南

## 🔍 問題診斷步驟

### 步驟 1: 基本檢查

1. **開啟測試頁面**

   - 開啟 `simple-logo-test.html`
   - 查看是否有錯誤訊息

2. **檢查檔案**
   - 確認 `assets/logo.png` 檔案存在
   - 確認檔案大小正常（約 91KB）

### 步驟 2: 常見問題解決

#### 問題 1: 圖片完全不顯示

**可能原因：**

- 檔案路徑錯誤
- 檔案損壞
- 瀏覽器快取問題

**解決方案：**

```bash
# 清除瀏覽器快取
# 或使用無痕模式開啟
```

#### 問題 2: 圖片顯示但位置不對

**可能原因：**

- CSS 設定衝突
- 容器尺寸問題

**解決方案：**
檢查 CSS 中的設定是否正確

#### 問題 3: 圓形顯示不完整

**可能原因：**

- `object-fit` 設定問題
- 圖片比例不適合

**解決方案：**
調整 `object-fit` 設定

### 步驟 3: 測試不同設定

#### 設定 A: 基本顯示

```css
.logo-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

#### 設定 B: 完整顯示

```css
.logo-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

#### 設定 C: 縮放顯示

```css
.logo-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: scale-down;
}
```

### 步驟 4: 瀏覽器相容性檢查

#### 支援的瀏覽器

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

#### 不支援的瀏覽器

- ❌ Internet Explorer 11 及以下

### 步驟 5: 檔案格式檢查

#### 支援的格式

- ✅ PNG（推薦）
- ✅ JPG/JPEG
- ✅ WebP（現代瀏覽器）

#### 不支援的格式

- ❌ AI（需要轉換）
- ❌ SVG（需要特殊處理）

## 🛠️ 快速修復

### 修復 1: 重置 CSS 設定

```css
.logo-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 30px;
  display: block;
  overflow: hidden;
  background: #2d5a27;
}

.logo-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
```

### 修復 2: 強制重新載入

```html
<img src="assets/logo.png?v=1" alt="隱湖小竹 Logo" />
```

### 修復 3: 備用方案

```html
<div class="logo-placeholder">
  <img
    src="assets/logo.png"
    alt="隱湖小竹 Logo"
    onerror="this.style.display='none'; this.parentElement.innerHTML='隱湖';"
  />
</div>
```

## 📱 響應式測試

### 桌面版測試

- 開啟開發者工具
- 設定螢幕尺寸為 1920x1080
- 檢查 logo 顯示

### 手機版測試

- 開啟開發者工具
- 設定螢幕尺寸為 375x667
- 檢查 logo 顯示

### 平板版測試

- 開啟開發者工具
- 設定螢幕尺寸為 768x1024
- 檢查 logo 顯示

## 🔧 進階診斷

### 檢查網路請求

1. 開啟開發者工具
2. 切換到 Network 標籤
3. 重新載入頁面
4. 查看 `logo.png` 的載入狀態

### 檢查控制台錯誤

1. 開啟開發者工具
2. 切換到 Console 標籤
3. 查看是否有錯誤訊息

### 檢查元素樣式

1. 開啟開發者工具
2. 右鍵點擊 logo
3. 選擇「檢查元素」
4. 查看 CSS 樣式設定

## 📞 如果問題持續

如果以上步驟都無法解決問題，請提供：

1. **瀏覽器資訊**

   - 瀏覽器名稱和版本
   - 作業系統

2. **錯誤訊息**

   - 控制台錯誤
   - 網路請求狀態

3. **測試結果**

   - `simple-logo-test.html` 的結果
   - 圖片是否能在其他頁面顯示

4. **檔案資訊**
   - 圖片檔案大小
   - 圖片實際尺寸
