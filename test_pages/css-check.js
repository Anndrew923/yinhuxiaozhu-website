// CSS載入檢查腳本
document.addEventListener("DOMContentLoaded", function () {
  // 檢查CSS是否載入
  const styles = getComputedStyle(document.body);
  const primaryColor = styles.getPropertyValue("--primary-color");

  if (!primaryColor || primaryColor.trim() === "") {
    console.error("❌ CSS未正確載入！");
    console.log("請檢查：");
    console.log("1. 瀏覽器快取 - 按 Ctrl+F5 強制重新載入");
    console.log("2. 網路連線 - 檢查 localhost:8000 是否正常");
    console.log("3. 開發者工具 - 按 F12 查看 Console 錯誤");

    // 顯示警告訊息
    const warning = document.createElement("div");
    warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff4444;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;
    warning.innerHTML = "⚠️ CSS載入失敗！請按 Ctrl+F5 重新載入頁面";
    document.body.appendChild(warning);
  } else {
    console.log("✅ CSS載入成功！");
  }
});
