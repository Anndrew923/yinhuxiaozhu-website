// notification-test.js
// 通知測試頁面功能

let currentUser = null;

// 頁面載入時初始化
document.addEventListener("DOMContentLoaded", async () => {
  console.log("通知測試頁面載入中...");

  // 檢查設定
  checkConfiguration();

  // 檢查用戶登入狀態
  if (typeof AuthService !== "undefined" && AuthService) {
    AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        console.log("用戶已登入:", user.uid);
        addLog("用戶已登入: " + user.email, "success");
      } else {
        console.log("用戶未登入");
        addLog("用戶未登入，部分功能可能受限", "info");
      }
    });
  }
});

// 檢查設定是否完整
function checkConfiguration() {
  const configStatus = document.getElementById("configStatus");

  if (typeof validateNotificationConfig === "function") {
    const errors = validateNotificationConfig();

    if (errors.length === 0) {
      configStatus.className = "config-status config-ok";
      configStatus.innerHTML =
        '<i class="fas fa-check-circle"></i> 設定完整，可以開始測試';
      addLog("設定檢查完成，所有必要設定都已配置", "success");
    } else {
      configStatus.className = "config-status config-error";
      configStatus.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> 設定不完整
                <ul style="margin: 10px 0 0 20px;">
                    ${errors.map((error) => `<li>${error}</li>`).join("")}
                </ul>
            `;
      addLog("設定檢查失敗: " + errors.join(", "), "error");
    }
  } else {
    configStatus.className = "config-status config-error";
    configStatus.innerHTML =
      '<i class="fas fa-exclamation-triangle"></i> 無法載入設定檔';
    addLog("無法載入設定檔", "error");
  }
}

// 測試 Email 通知
async function testEmailOnly() {
  try {
    addLog("開始測試 Email 通知...", "info");

    const testData = createTestOrderData();

    if (typeof NotificationService !== "undefined" && NotificationService) {
      const result = await NotificationService.createNotification(
        NotificationService.NOTIFICATION_TYPES.NEW_ORDER,
        testData,
        ["email"]
      );

      addLog("Email 通知測試成功，通知 ID: " + result, "success");
    } else {
      throw new Error("NotificationService 未初始化");
    }
  } catch (error) {
    console.error("Email 通知測試失敗:", error);
    addLog("Email 通知測試失敗: " + error.message, "error");
  }
}

// 測試 LINE 通知
async function testLineOnly() {
  try {
    addLog("開始測試 LINE 通知...", "info");

    const testData = createTestOrderData();

    if (typeof NotificationService !== "undefined" && NotificationService) {
      const result = await NotificationService.createNotification(
        NotificationService.NOTIFICATION_TYPES.NEW_ORDER,
        testData,
        ["line"]
      );

      addLog("LINE 通知測試成功，通知 ID: " + result, "success");
    } else {
      throw new Error("NotificationService 未初始化");
    }
  } catch (error) {
    console.error("LINE 通知測試失敗:", error);
    addLog("LINE 通知測試失敗: " + error.message, "error");
  }
}

// 測試 Email + LINE 通知
async function testBothChannels() {
  try {
    addLog("開始測試 Email + LINE 通知...", "info");

    const testData = createTestOrderData();

    if (typeof NotificationService !== "undefined" && NotificationService) {
      const result = await NotificationService.createNotification(
        NotificationService.NOTIFICATION_TYPES.NEW_ORDER,
        testData,
        ["email", "line"]
      );

      addLog("Email + LINE 通知測試成功，通知 ID: " + result, "success");
    } else {
      throw new Error("NotificationService 未初始化");
    }
  } catch (error) {
    console.error("Email + LINE 通知測試失敗:", error);
    addLog("Email + LINE 通知測試失敗: " + error.message, "error");
  }
}

// 模擬新訂單
async function simulateNewOrder() {
  try {
    addLog("模擬新訂單流程...", "info");

    const testData = createTestOrderData();

    // 模擬訂單建立
    if (typeof OrderService !== "undefined" && OrderService) {
      const orderId = await OrderService.createOrder(
        currentUser ? currentUser.uid : "test_user",
        testData
      );

      addLog("模擬訂單建立成功，訂單 ID: " + orderId, "success");
    } else {
      // 如果 OrderService 不可用，直接發送通知
      if (typeof NotificationService !== "undefined" && NotificationService) {
        const result = await NotificationService.createNotification(
          NotificationService.NOTIFICATION_TYPES.NEW_ORDER,
          testData,
          ["email", "line"]
        );

        addLog("模擬新訂單通知發送成功，通知 ID: " + result, "success");
      }
    }
  } catch (error) {
    console.error("模擬新訂單失敗:", error);
    addLog("模擬新訂單失敗: " + error.message, "error");
  }
}

// 模擬付款成功
async function simulatePaymentSuccess() {
  try {
    addLog("模擬付款成功流程...", "info");

    const testData = createTestOrderData();
    testData.paymentStatus = "paid";
    testData.paymentDate = new Date().toISOString();

    if (typeof NotificationService !== "undefined" && NotificationService) {
      const result = await NotificationService.createNotification(
        NotificationService.NOTIFICATION_TYPES.PAYMENT_SUCCESS,
        testData,
        ["email", "line"]
      );

      addLog("模擬付款成功通知發送成功，通知 ID: " + result, "success");
    } else {
      throw new Error("NotificationService 未初始化");
    }
  } catch (error) {
    console.error("模擬付款成功失敗:", error);
    addLog("模擬付款成功失敗: " + error.message, "error");
  }
}

// 模擬商品出貨
async function simulateOrderShipped() {
  try {
    addLog("模擬商品出貨流程...", "info");

    const testData = createTestOrderData();
    testData.shippingInfo = {
      trackingNumber: "TEST" + Date.now(),
      carrier: "黑貓宅急便",
      estimatedDelivery: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    if (typeof NotificationService !== "undefined" && NotificationService) {
      const result = await NotificationService.createNotification(
        NotificationService.NOTIFICATION_TYPES.ORDER_SHIPPED,
        testData,
        ["email", "line"]
      );

      addLog("模擬商品出貨通知發送成功，通知 ID: " + result, "success");
    } else {
      throw new Error("NotificationService 未初始化");
    }
  } catch (error) {
    console.error("模擬商品出貨失敗:", error);
    addLog("模擬商品出貨失敗: " + error.message, "error");
  }
}

// 模擬貨到付款訂單
async function simulateCashOnDelivery() {
  try {
    addLog("模擬貨到付款訂單流程...", "info");

    const testData = createTestOrderData();
    testData.paymentMethod = "cod"; // 貨到付款
    testData.paymentStatus = "pending";
    testData.delivery = "home";
    testData.customer = {
      name: "測試客戶",
      phone: "0912-345-678",
      address: "台北市信義區信義路五段7號",
      city: "台北市",
      district: "信義區",
    };

    // 1. 模擬訂單建立
    addLog("步驟 1: 建立貨到付款訂單...", "info");

    if (typeof OrderService !== "undefined" && OrderService) {
      const orderId = await OrderService.createOrder(
        currentUser ? currentUser.uid : "test_user",
        testData
      );

      addLog("貨到付款訂單建立成功，訂單 ID: " + orderId, "success");

      // 2. 模擬商品出貨
      setTimeout(async () => {
        addLog("步驟 2: 商品出貨通知...", "info");
        testData.orderId = orderId;
        testData.shippingInfo = {
          trackingNumber: "COD" + Date.now(),
          carrier: "黑貓宅急便",
          estimatedDelivery: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        if (typeof NotificationService !== "undefined" && NotificationService) {
          const result = await NotificationService.createNotification(
            NotificationService.NOTIFICATION_TYPES.ORDER_SHIPPED,
            testData,
            ["email", "line"]
          );

          addLog("貨到付款出貨通知發送成功，通知 ID: " + result, "success");
        }
      }, 2000);
    } else {
      // 如果 OrderService 不可用，直接發送通知
      if (typeof NotificationService !== "undefined" && NotificationService) {
        const result = await NotificationService.createNotification(
          NotificationService.NOTIFICATION_TYPES.NEW_ORDER,
          testData,
          ["email", "line"]
        );

        addLog("貨到付款訂單通知發送成功，通知 ID: " + result, "success");
      }
    }
  } catch (error) {
    console.error("模擬貨到付款訂單失敗:", error);
    addLog("模擬貨到付款訂單失敗: " + error.message, "error");
  }
}

// 建立測試訂單資料
function createTestOrderData() {
  const testItems = [
    { name: "測試商品 A", price: 500, quantity: 2 },
    { name: "測試商品 B", price: 300, quantity: 1 },
  ];

  const subtotal = testItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = 150;
  const finalTotal = subtotal + shippingFee;

  return {
    orderId: `TEST_${Date.now()}`,
    finalTotal: finalTotal,
    subtotal: subtotal,
    shippingFee: shippingFee,
    discountAmount: 0,
    items: testItems,
    customer: {
      name: currentUser ? currentUser.displayName || "測試用戶" : "測試用戶",
      email: currentUser ? currentUser.email : "test@example.com",
      phone: "0912-345-678",
      address: "台北市信義區信義路五段7號",
      city: "台北市",
      district: "信義區",
    },
    delivery: "home",
    paymentMethod: "credit",
    paymentStatus: "pending",
    note: "這是一個測試訂單",
    uid: currentUser ? currentUser.uid : "test_user",
  };
}

// 添加測試記錄
function addLog(message, type = "info") {
  const logContainer = document.getElementById("testLog");
  const timestamp = new Date().toLocaleTimeString();

  const logEntry = document.createElement("div");
  logEntry.className = `log-entry log-${type}`;

  const statusClass =
    type === "success"
      ? "status-success"
      : type === "error"
      ? "status-error"
      : "status-pending";

  logEntry.innerHTML = `
        <span class="status-indicator ${statusClass}"></span>
        [${timestamp}] ${message}
    `;

  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;

  // 限制記錄數量
  while (logContainer.children.length > 50) {
    logContainer.removeChild(logContainer.firstChild);
  }
}

// 清除測試記錄
function clearLog() {
  const logContainer = document.getElementById("testLog");
  logContainer.innerHTML = `
        <div class="log-entry log-info">
            <span class="status-indicator status-pending"></span>
            記錄已清除，等待新的測試...
        </div>
    `;
}
