// js/services/notification.service.js
// 前端通知服務 - 透過 API 呼叫後端

class NotificationService {
  constructor() {
    this.apiEndpoint = window.getApiEndpoint
      ? window.getApiEndpoint()
      : "http://localhost:8000";
  }

  // 發送 Email 通知
  async sendEmail(to, subject, content, from = null) {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          content,
          from,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Email 發送失敗");
      }

      return result;
    } catch (error) {
      console.error("Email 通知錯誤:", error);
      throw error;
    }
  }

  // 發送 LINE 通知
  async sendLineNotification(message, userId = null) {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/api/send-line-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            userId,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "LINE 通知發送失敗");
      }

      return result;
    } catch (error) {
      console.error("LINE 通知錯誤:", error);
      throw error;
    }
  }

  // 發送訂單通知（整合 Email 和 LINE）
  async sendOrderNotification(
    orderData,
    notificationTypes = ["email", "line"]
  ) {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/api/send-order-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderData,
            notificationTypes,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "訂單通知發送失敗");
      }

      return result;
    } catch (error) {
      console.error("訂單通知錯誤:", error);
      throw error;
    }
  }

  // 測試 Email 通知
  async testEmailNotification() {
    const testData = {
      to: "admin@yinhu.com",
      subject: "測試 Email 通知",
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🧪 測試 Email 通知</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>測試時間：</strong>${new Date().toLocaleString(
              "zh-TW"
            )}</p>
            <p><strong>測試狀態：</strong>✅ 成功</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
            <p style="margin: 0; color: #2e7d32;">Email 通知功能運作正常！</p>
          </div>
        </div>
      `,
    };

    return await this.sendEmail(
      testData.to,
      testData.subject,
      testData.content
    );
  }

  // 測試 LINE 通知
  async testLineNotification() {
    const testMessage = `🧪 測試 LINE 通知

⏰ 測試時間：${new Date().toLocaleString("zh-TW")}
✅ 測試狀態：成功

LINE 通知功能運作正常！`;

    return await this.sendLineNotification(testMessage);
  }

  // 模擬訂單 Email
  async simulateOrderEmail() {
    const mockOrderData = {
      orderId: "TEST-" + Date.now(),
      finalTotal: 1500,
      customer: {
        name: "測試客戶",
        email: "test@example.com",
      },
      items: [
        {
          name: "測試商品 A",
          quantity: 2,
          price: 500,
        },
        {
          name: "測試商品 B",
          quantity: 1,
          price: 500,
        },
      ],
    };

    return await this.sendOrderNotification(mockOrderData, ["email"]);
  }

  // 模擬貨到付款 Email
  async simulateCashOnDeliveryEmail() {
    const mockOrderData = {
      orderId: "COD-" + Date.now(),
      finalTotal: 2000,
      paymentMethod: "cash_on_delivery",
      customer: {
        name: "貨到付款測試客戶",
        email: "cod@example.com",
        phone: "0912345678",
        address: "台北市測試區測試路123號",
      },
      items: [
        {
          name: "貨到付款商品 A",
          quantity: 1,
          price: 1200,
        },
        {
          name: "貨到付款商品 B",
          quantity: 2,
          price: 400,
        },
      ],
    };

    return await this.sendOrderNotification(mockOrderData, ["email", "line"]);
  }

  // 記錄通知結果
  logNotification(type, result, error = null) {
    const timestamp = new Date().toLocaleString("zh-TW");
    const logEntry = {
      timestamp,
      type,
      success: !error,
      result: error ? error.message : result,
    };

    console.log(`[${timestamp}] ${type} 通知:`, logEntry);

    // 如果有測試記錄容器，則顯示結果
    const testLog = document.getElementById("testLog");
    if (testLog) {
      const logElement = document.createElement("div");
      logElement.className = `log-entry ${error ? "log-error" : "log-success"}`;

      const statusIndicator = document.createElement("span");
      statusIndicator.className = `status-indicator ${
        error ? "status-error" : "status-success"
      }`;

      logElement.innerHTML = `
        ${statusIndicator.outerHTML}
        <strong>${type}</strong> - ${timestamp}
        <br>
        ${error ? `❌ ${error.message}` : `✅ ${result.message || "成功"}`}
      `;

      testLog.appendChild(logElement);
      testLog.scrollTop = testLog.scrollHeight;
    }

    return logEntry;
  }
}

// 建立全域實例
window.notificationService = new NotificationService();
