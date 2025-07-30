// notification-test-simple.js
// 簡化版通知測試功能

let currentUser = null;

// 頁面載入時初始化
document.addEventListener("DOMContentLoaded", async () => {
  console.log("簡化版通知測試頁面載入中...");

  // 檢查設定
  checkEmailConfiguration();

  // 檢查用戶登入狀態
  if (typeof AuthService !== "undefined" && AuthService) {
    AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        console.log("用戶已登入:", user.uid);
        addLog("用戶已登入: " + user.email, "success");
      } else {
        console.log("用戶未登入");
        addLog("用戶未登入，將使用預設測試資料", "info");
      }
    });
  }
});

// 檢查設定
function checkEmailConfiguration() {
  addLog("檢查通知系統設定...", "info");

  if (typeof ClientConfig !== "undefined") {
    addLog("前端設定載入成功", "success");
    addLog("API 端點: " + getApiEndpoint(), "info");
  } else {
    addLog("無法載入前端設定檔", "error");
  }

  // 檢查通知服務是否可用
  if (typeof window.notificationService !== "undefined") {
    addLog("通知服務初始化成功", "success");
  } else {
    addLog("通知服務初始化失敗", "error");
  }
}

// 測試 Email 通知
async function testEmailNotification() {
  try {
    addLog("開始測試 Email 通知...", "info");

    if (!window.notificationService) {
      throw new Error("通知服務未初始化");
    }

    const result = await window.notificationService.testEmailNotification();
    window.notificationService.logNotification("Email 測試", result);
    addLog("Email 通知測試成功！", "success");
    addLog("請檢查您的信箱", "info");
  } catch (error) {
    console.error("Email 通知測試失敗:", error);
    window.notificationService.logNotification("Email 測試", null, error);
    addLog("Email 通知測試失敗: " + error.message, "error");

    if (error.message.includes("設定")) {
      addLog("請按照頁面上方的設定指南完成 Email 設定", "error");
    } else if (error.message.includes("fetch")) {
      addLog("請確認伺服器正在運行（node server.js）", "error");
    }
  }
}

// 模擬訂單 Email
async function simulateOrderEmail() {
  try {
    addLog("模擬訂單 Email 通知...", "info");

    if (!window.notificationService) {
      throw new Error("通知服務未初始化");
    }

    const result = await window.notificationService.simulateOrderEmail();
    window.notificationService.logNotification("模擬訂單 Email", result);
    addLog("模擬訂單 Email 發送成功！", "success");
    addLog("請檢查您的信箱", "info");
  } catch (error) {
    console.error("模擬訂單 Email 失敗:", error);
    window.notificationService.logNotification("模擬訂單 Email", null, error);
    addLog("模擬訂單 Email 失敗: " + error.message, "error");
  }
}

// 模擬貨到付款 Email
async function simulateCashOnDeliveryEmail() {
  try {
    addLog("模擬貨到付款 Email 通知...", "info");

    if (!window.notificationService) {
      throw new Error("通知服務未初始化");
    }

    const result =
      await window.notificationService.simulateCashOnDeliveryEmail();
    window.notificationService.logNotification("貨到付款 Email", result);
    addLog("貨到付款 Email 發送成功！", "success");
    addLog("請檢查您的信箱", "info");
  } catch (error) {
    console.error("貨到付款 Email 失敗:", error);
    window.notificationService.logNotification("貨到付款 Email", null, error);
    addLog("貨到付款 Email 失敗: " + error.message, "error");
  }
}

// 添加日誌
function addLog(message, type = "info") {
  const logContainer = document.getElementById("testLog");
  const timestamp = new Date().toLocaleTimeString("zh-TW");

  let statusClass = "log-info";
  let statusIndicator = "status-pending";

  switch (type) {
    case "success":
      statusClass = "log-success";
      statusIndicator = "status-success";
      break;
    case "error":
      statusClass = "log-error";
      statusIndicator = "status-error";
      break;
    case "warning":
      statusClass = "log-warning";
      statusIndicator = "status-warning";
      break;
  }

  const logEntry = document.createElement("div");
  logEntry.className = `log-entry ${statusClass}`;
  logEntry.innerHTML = `
    <span class="status-indicator ${statusIndicator}"></span>
    [${timestamp}] ${message}
  `;

  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// 清除日誌
function clearLog() {
  const logContainer = document.getElementById("testLog");
  logContainer.innerHTML = `
    <div class="log-entry log-info">
      <span class="status-indicator status-pending"></span>
      系統初始化完成，等待測試...
    </div>
  `;
}
