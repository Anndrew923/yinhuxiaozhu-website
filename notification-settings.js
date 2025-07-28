// notification-settings.js
// 通知設定頁面功能

let currentUser = null;
let userPreferences = null;

// 頁面載入時初始化
document.addEventListener("DOMContentLoaded", async () => {
  console.log("通知設定頁面載入中...");

  // 檢查用戶登入狀態
  if (typeof AuthService !== "undefined" && AuthService) {
    AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        console.log("用戶已登入:", user.uid);
        await loadUserNotificationPreferences();
      } else {
        console.log("用戶未登入");
        showLoginPrompt();
      }
    });
  } else {
    console.error("AuthService 未初始化");
  }
});

// 載入用戶通知偏好
async function loadUserNotificationPreferences() {
  try {
    if (!currentUser) {
      console.error("用戶未登入");
      return;
    }

    console.log("載入用戶通知偏好...");

    if (typeof NotificationService !== "undefined" && NotificationService) {
      userPreferences =
        await NotificationService.getUserNotificationPreferences(
          currentUser.uid
        );
      console.log("載入的偏好設定:", userPreferences);

      // 更新 UI
      updateUIFromPreferences(userPreferences);
    } else {
      console.error("NotificationService 未初始化");
    }
  } catch (error) {
    console.error("載入通知偏好失敗:", error);
    showError("載入設定失敗，請稍後再試");
  }
}

// 根據偏好設定更新 UI
function updateUIFromPreferences(preferences) {
  if (!preferences) return;

  // 更新通知管道開關
  document.getElementById("emailEnabled").checked =
    preferences.email?.enabled || false;
  document.getElementById("lineEnabled").checked =
    preferences.line?.enabled || false;
  document.getElementById("smsEnabled").checked =
    preferences.sms?.enabled || false;
  document.getElementById("pushEnabled").checked =
    preferences.push?.enabled || false;

  // 更新通知頻率
  const frequency = preferences.email?.frequency || "immediate";
  document.getElementById(frequency).checked = true;

  // 更新通知類型（如果有儲存的話）
  if (preferences.types) {
    document.getElementById("newOrderEnabled").checked =
      preferences.types.newOrder !== false;
    document.getElementById("paymentEnabled").checked =
      preferences.types.payment !== false;
    document.getElementById("shippingEnabled").checked =
      preferences.types.shipping !== false;
    document.getElementById("promotionEnabled").checked =
      preferences.types.promotion || false;
  }
}

// 儲存通知設定
async function saveNotificationSettings() {
  try {
    if (!currentUser) {
      showError("請先登入");
      return;
    }

    console.log("儲存通知設定...");

    // 收集表單資料
    const preferences = {
      email: {
        enabled: document.getElementById("emailEnabled").checked,
        frequency: getSelectedFrequency(),
      },
      line: {
        enabled: document.getElementById("lineEnabled").checked,
        frequency: getSelectedFrequency(),
      },
      sms: {
        enabled: document.getElementById("smsEnabled").checked,
        frequency: getSelectedFrequency(),
      },
      push: {
        enabled: document.getElementById("pushEnabled").checked,
        frequency: getSelectedFrequency(),
      },
      types: {
        newOrder: document.getElementById("newOrderEnabled").checked,
        payment: document.getElementById("paymentEnabled").checked,
        shipping: document.getElementById("shippingEnabled").checked,
        promotion: document.getElementById("promotionEnabled").checked,
      },
      updatedAt: new Date().toISOString(),
    };

    console.log("準備儲存的偏好設定:", preferences);

    // 儲存到資料庫
    if (typeof NotificationService !== "undefined" && NotificationService) {
      await NotificationService.updateUserNotificationPreferences(
        currentUser.uid,
        preferences
      );
      console.log("通知偏好儲存成功");

      userPreferences = preferences;
      showSuccess("設定已儲存");
    } else {
      console.error("NotificationService 未初始化");
      showError("儲存失敗，請稍後再試");
    }
  } catch (error) {
    console.error("儲存通知設定失敗:", error);
    showError("儲存失敗，請稍後再試");
  }
}

// 獲取選中的通知頻率
function getSelectedFrequency() {
  const frequencyInputs = document.querySelectorAll('input[name="frequency"]');
  for (const input of frequencyInputs) {
    if (input.checked) {
      return input.value;
    }
  }
  return "immediate"; // 預設值
}

// 恢復預設設定
function resetToDefaults() {
  if (confirm("確定要恢復預設設定嗎？")) {
    console.log("恢復預設設定...");

    // 重置為預設值
    document.getElementById("emailEnabled").checked = true;
    document.getElementById("lineEnabled").checked = true;
    document.getElementById("smsEnabled").checked = false;
    document.getElementById("pushEnabled").checked = false;

    document.getElementById("newOrderEnabled").checked = true;
    document.getElementById("paymentEnabled").checked = true;
    document.getElementById("shippingEnabled").checked = true;
    document.getElementById("promotionEnabled").checked = false;

    document.getElementById("immediate").checked = true;

    showSuccess("已恢復預設設定");
  }
}

// 測試 Email 通知
async function testEmailNotification() {
  try {
    if (!currentUser) {
      showError("請先登入");
      return;
    }

    console.log("測試 Email 通知...");

    // 建立測試通知資料
    const testOrderData = {
      orderId: `TEST_${Date.now()}`,
      finalTotal: 1000,
      customer: {
        name: currentUser.displayName || "測試用戶",
        email: currentUser.email,
      },
      items: [{ name: "測試商品", price: 1000, quantity: 1 }],
      uid: currentUser.uid,
    };

    // 發送測試通知
    if (typeof NotificationService !== "undefined" && NotificationService) {
      await NotificationService.createNotification(
        NotificationService.NOTIFICATION_TYPES.NEW_ORDER,
        testOrderData,
        ["email"]
      );

      showSuccess("測試 Email 已發送，請檢查您的信箱");
    } else {
      showError("通知服務未初始化");
    }
  } catch (error) {
    console.error("測試 Email 通知失敗:", error);
    showError("測試失敗，請稍後再試");
  }
}

// 測試 LINE 通知
async function testLineNotification() {
  try {
    console.log("測試 LINE 通知...");

    // 建立測試通知資料
    const testOrderData = {
      orderId: `TEST_${Date.now()}`,
      finalTotal: 1000,
      customer: {
        name: "測試用戶",
      },
      items: [{ name: "測試商品", price: 1000, quantity: 1 }],
    };

    // 發送測試通知
    if (typeof NotificationService !== "undefined" && NotificationService) {
      await NotificationService.createNotification(
        NotificationService.NOTIFICATION_TYPES.NEW_ORDER,
        testOrderData,
        ["line"]
      );

      showSuccess("測試 LINE 通知已發送");
    } else {
      showError("通知服務未初始化");
    }
  } catch (error) {
    console.error("測試 LINE 通知失敗:", error);
    showError("測試失敗，請稍後再試");
  }
}

// 顯示登入提示
function showLoginPrompt() {
  const mainContent = document.querySelector(".main-content");
  mainContent.innerHTML = `
        <div class="login-prompt">
            <div class="login-prompt-content">
                <i class="fas fa-user-lock" style="font-size: 48px; color: #666; margin-bottom: 20px;"></i>
                <h2>需要登入</h2>
                <p>請先登入您的帳號以管理通知設定</p>
                <button class="btn-primary" onclick="window.location.href='login.html'">
                    <i class="fas fa-sign-in-alt"></i> 前往登入
                </button>
            </div>
        </div>
    `;
}

// 顯示成功訊息
function showSuccess(message) {
  showNotification(message, "success");
}

// 顯示錯誤訊息
function showError(message) {
  showNotification(message, "error");
}

// 顯示通知訊息
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;

  // 根據類型設定背景色
  switch (type) {
    case "success":
      notification.style.background = "#4caf50";
      break;
    case "error":
      notification.style.background = "#f44336";
      break;
    default:
      notification.style.background = "#2196f3";
  }

  notification.textContent = message;

  // 添加動畫樣式
  if (!document.getElementById("notificationStyles")) {
    const style = document.createElement("style");
    style.id = "notificationStyles";
    style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // 3秒後自動移除
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
