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

// 檢查 Email 設定
function checkEmailConfiguration() {
  addLog("檢查 Email 設定...", "info");

  if (typeof NotificationConfig !== "undefined") {
    const emailConfig = NotificationConfig.EMAIL.GMAIL;

    if (
      emailConfig.USER &&
      emailConfig.USER !== "your-email@gmail.com" &&
      emailConfig.APP_PASSWORD &&
      emailConfig.APP_PASSWORD !== "your-app-password"
    ) {
      addLog("Email 設定完整，可以開始測試", "success");
    } else {
      addLog("Email 設定不完整，請先完成 Gmail 設定", "error");
      addLog("請更新 config/notification-config.js 檔案", "error");
    }
  } else {
    addLog("無法載入設定檔", "error");
  }
}

// 直接發送 Email（不依賴 NotificationService）
async function sendEmailDirect(subject, content) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: NotificationConfig.EMAIL.GMAIL.USER,
        subject: subject,
        content: content,
        from: NotificationConfig.EMAIL.GMAIL.USER,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Email 發送失敗:", error);
    throw error;
  }
}

// 測試 Email 通知
async function testEmailNotification() {
  try {
    addLog("開始測試 Email 通知...", "info");

    // 檢查設定
    if (
      typeof NotificationConfig === "undefined" ||
      NotificationConfig.EMAIL.GMAIL.USER === "your-email@gmail.com"
    ) {
      throw new Error("請先完成 Email 設定");
    }

    const subject = "🧪 隱湖小竹 - Email 通知測試";
    const content = `
      <h2>Email 通知測試成功！</h2>
      <p>恭喜您！Email 通知系統已經成功設定。</p>
      <p><strong>測試時間：</strong>${new Date().toLocaleString("zh-TW")}</p>
      <p><strong>收件信箱：</strong>${NotificationConfig.EMAIL.GMAIL.USER}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        這是一封測試 Email，用於確認通知系統運作正常。
      </p>
    `;

    const result = await sendEmailDirect(subject, content);
    addLog("Email 通知測試成功！", "success");
    addLog("請檢查您的信箱: " + NotificationConfig.EMAIL.GMAIL.USER, "info");
  } catch (error) {
    console.error("Email 通知測試失敗:", error);
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

    const testData = createTestOrderData();
    const subject = "🛒 隱湖小竹 - 新訂單通知";
    const content = `
      <h2>新訂單通知</h2>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>訂單資訊</h3>
        <p><strong>訂單編號：</strong>${testData.orderId}</p>
        <p><strong>訂單時間：</strong>${new Date().toLocaleString("zh-TW")}</p>
        <p><strong>訂單金額：</strong>NT$ ${testData.finalTotal}</p>
        <p><strong>付款方式：</strong>${testData.paymentMethod}</p>
      </div>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>客戶資訊</h3>
        <p><strong>姓名：</strong>${testData.customer.name}</p>
        <p><strong>電話：</strong>${testData.customer.phone}</p>
        <p><strong>Email：</strong>${testData.customer.email}</p>
        <p><strong>地址：</strong>${testData.customer.address}</p>
      </div>
      
      <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>商品清單</h3>
        ${testData.items
          .map(
            (item) => `
          <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
            <p><strong>${item.name}</strong></p>
            <p>數量：${item.quantity} × NT$ ${item.price} = NT$ ${item.total}</p>
          </div>
        `
          )
          .join("")}
      </div>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        這是一封模擬訂單通知，用於測試通知系統。
      </p>
    `;

    const result = await sendEmailDirect(subject, content);
    addLog("模擬訂單 Email 發送成功！", "success");
    addLog("請檢查您的信箱: " + NotificationConfig.EMAIL.GMAIL.USER, "info");
  } catch (error) {
    console.error("模擬訂單 Email 失敗:", error);
    addLog("模擬訂單 Email 失敗: " + error.message, "error");
  }
}

// 模擬貨到付款 Email
async function simulateCashOnDeliveryEmail() {
  try {
    addLog("模擬貨到付款 Email 通知...", "info");

    const testData = createTestOrderData();
    testData.paymentMethod = "貨到付款";

    const subject = "💰 隱湖小竹 - 貨到付款訂單通知";
    const content = `
      <h2>貨到付款訂單通知</h2>
      <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
        <h3 style="color: #e65100;">⚠️ 重要提醒</h3>
        <p><strong>付款方式：貨到付款</strong></p>
        <p>請準備現金 NT$ ${testData.finalTotal} 以便收貨時付款</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>訂單資訊</h3>
        <p><strong>訂單編號：</strong>${testData.orderId}</p>
        <p><strong>訂單時間：</strong>${new Date().toLocaleString("zh-TW")}</p>
        <p><strong>訂單金額：</strong>NT$ ${testData.finalTotal}</p>
        <p><strong>付款方式：</strong>${testData.paymentMethod}</p>
      </div>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>客戶資訊</h3>
        <p><strong>姓名：</strong>${testData.customer.name}</p>
        <p><strong>電話：</strong>${testData.customer.phone}</p>
        <p><strong>Email：</strong>${testData.customer.email}</p>
        <p><strong>地址：</strong>${testData.customer.address}</p>
      </div>
      
      <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>商品清單</h3>
        ${testData.items
          .map(
            (item) => `
          <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
            <p><strong>${item.name}</strong></p>
            <p>數量：${item.quantity} × NT$ ${item.price} = NT$ ${item.total}</p>
          </div>
        `
          )
          .join("")}
      </div>
      
      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>配送資訊</h3>
        <p><strong>預計送達：</strong>1-2 個工作天</p>
        <p><strong>配送時間：</strong>週一至週五 9:00-18:00</p>
        <p><strong>聯絡電話：</strong>0988-318-540</p>
      </div>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        這是一封模擬貨到付款訂單通知，用於測試通知系統。
      </p>
    `;

    const result = await sendEmailDirect(subject, content);
    addLog("貨到付款 Email 發送成功！", "success");
    addLog("請檢查您的信箱: " + NotificationConfig.EMAIL.GMAIL.USER, "info");
  } catch (error) {
    console.error("貨到付款 Email 失敗:", error);
    addLog("貨到付款 Email 失敗: " + error.message, "error");
  }
}

// 建立測試訂單資料
function createTestOrderData() {
  return {
    orderId: "TEST-" + Date.now(),
    orderTime: new Date().toISOString(),
    finalTotal: 1580,
    paymentMethod: "信用卡",
    customer: {
      name: "測試客戶",
      phone: "0912-345-678",
      email: NotificationConfig.EMAIL.GMAIL.USER,
      address: "台北市信義區信義路五段7號",
    },
    items: [
      {
        name: "隱湖小竹特製茶葉",
        quantity: 2,
        price: 580,
        total: 1160,
      },
      {
        name: "手工茶具組",
        quantity: 1,
        price: 420,
        total: 420,
      },
    ],
  };
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
