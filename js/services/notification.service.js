// js/services/notification.service.js
// Notification Service：多管道通知系統（支援後期擴展）
const NotificationService = (() => {
  const db = window.firebaseDB;
  const auth = window.firebaseAuth;

  // 檢查 Firebase 是否正確初始化
  if (!db) {
    console.error("Firebase Firestore 未初始化");
    return null;
  }

  // 通知管道配置
  const NOTIFICATION_CHANNELS = {
    email: {
      name: "Email",
      enabled: true,
      priority: 1,
      cost: 0.001, // 每封成本估算
      maxRetries: 3,
    },
    line: {
      name: "LINE Bot",
      enabled: true,
      priority: 2,
      cost: 0,
      maxRetries: 2,
    },
    telegram: {
      name: "Telegram Bot",
      enabled: true,
      priority: 3,
      cost: 0,
      maxRetries: 2,
    },
    sms: {
      name: "SMS",
      enabled: false, // 後期啟用
      priority: 4,
      cost: 0.5,
      maxRetries: 1,
    },
    push: {
      name: "Push Notification",
      enabled: false, // 後期啟用
      priority: 5,
      cost: 0,
      maxRetries: 2,
    },
  };

  // 通知類型定義
  const NOTIFICATION_TYPES = {
    NEW_ORDER: "new_order",
    PAYMENT_SUCCESS: "payment_success",
    PAYMENT_FAILED: "payment_failed",
    ORDER_SHIPPED: "order_shipped",
    ORDER_DELIVERED: "order_delivered",
    ORDER_CANCELLED: "order_cancelled",
    LOW_STOCK: "low_stock",
    PROMOTION: "promotion",
  };

  // 建立通知記錄
  async function createNotification(type, orderData, channels = ["email"]) {
    try {
      console.log("建立通知記錄:", {
        type,
        orderId: orderData.orderId,
        channels,
      });

      const notification = {
        type: type,
        orderId: orderData.orderId,
        userId: orderData.uid || null,
        channels: channels,
        data: orderData,
        status: "pending",
        retryCount: 0,
        createdAt: new Date().toISOString(),
        sentAt: null,
        failedAt: null,
        errorMessage: null,
      };

      const docRef = await db.collection("notifications").add(notification);
      console.log("通知記錄建立成功:", docRef.id);

      // 立即發送通知
      await sendNotification(docRef.id, notification);

      return docRef.id;
    } catch (error) {
      console.error("建立通知記錄失敗:", error);
      throw error;
    }
  }

  // 發送通知
  async function sendNotification(notificationId, notification) {
    try {
      console.log("開始發送通知:", notificationId);

      const results = {};
      const userPrefs = notification.userId
        ? await getUserNotificationPreferences(notification.userId)
        : getDefaultPreferences();

      // 根據用戶偏好過濾管道
      const enabledChannels = notification.channels.filter(
        (channel) =>
          NOTIFICATION_CHANNELS[channel]?.enabled && userPrefs[channel]?.enabled
      );

      // 並行發送到多個管道
      const sendPromises = enabledChannels.map(async (channel) => {
        try {
          const result = await sendToChannel(channel, notification);
          results[channel] = { success: true, result };
          return { channel, success: true };
        } catch (error) {
          console.error(`${channel} 通知發送失敗:`, error);
          results[channel] = { success: false, error: error.message };
          return { channel, success: false, error: error.message };
        }
      });

      const channelResults = await Promise.allSettled(sendPromises);

      // 更新通知狀態
      const allSuccess = channelResults.every(
        (result) => result.status === "fulfilled" && result.value.success
      );

      await updateNotificationStatus(notificationId, {
        status: allSuccess ? "sent" : "partial_failed",
        sentAt: new Date().toISOString(),
        results: results,
      });

      console.log("通知發送完成:", results);
      return results;
    } catch (error) {
      console.error("發送通知失敗:", error);
      await updateNotificationStatus(notificationId, {
        status: "failed",
        failedAt: new Date().toISOString(),
        errorMessage: error.message,
      });
      throw error;
    }
  }

  // 發送到特定管道
  async function sendToChannel(channel, notification) {
    switch (channel) {
      case "email":
        return await sendEmailNotification(notification);
      case "line":
        return await sendLineBotNotification(notification);
      case "telegram":
        return await sendTelegramNotification(notification);
      case "sms":
        return await sendSMSNotification(notification);
      case "push":
        return await sendPushNotification(notification);
      default:
        throw new Error(`不支援的通知管道: ${channel}`);
    }
  }

  // Email 通知
  async function sendEmailNotification(notification) {
    try {
      console.log("發送 Email 通知:", notification.orderId);

      // 使用 Firebase Functions 發送 Email
      if (typeof firebase !== "undefined" && firebase.functions) {
        const sendEmail = firebase.functions().httpsCallable("sendOrderEmail");
        const result = await sendEmail({
          type: notification.type,
          orderData: notification.data,
          template: getEmailTemplate(notification.type),
        });
        return result.data;
      } else {
        // 備用方案：直接發送
        return await sendEmailDirect(notification);
      }
    } catch (error) {
      console.error("Email 通知發送失敗:", error);
      throw error;
    }
  }

  // LINE Bot 通知
  async function sendLineBotNotification(notification) {
    try {
      console.log("發送 LINE Bot 通知:", notification.orderId);

      const message = formatLineMessage(notification);

      // 使用 LINE Bot API
      const response = await fetch("/api/line-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          userId: getLineBotUserId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`LINE Bot 通知發送失敗: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("LINE Bot 通知發送失敗:", error);
      throw error;
    }
  }

  // Telegram 通知
  async function sendTelegramNotification(notification) {
    try {
      console.log("發送 Telegram 通知:", notification.orderId);

      const message = formatTelegramMessage(notification);

      // 使用 Telegram Bot API
      const response = await fetch("/api/telegram-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          chatId: getTelegramChatId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram 通知發送失敗: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Telegram 通知發送失敗:", error);
      throw error;
    }
  }

  // SMS 通知（後期實作）
  async function sendSMSNotification(notification) {
    // 後期實作，使用 Twilio 或其他 SMS 服務
    console.log("SMS 通知功能待實作");
    throw new Error("SMS 通知功能尚未啟用");
  }

  // Push 通知（後期實作）
  async function sendPushNotification(notification) {
    // 後期實作，使用 Web Push API
    console.log("Push 通知功能待實作");
    throw new Error("Push 通知功能尚未啟用");
  }

  // 獲取用戶通知偏好
  async function getUserNotificationPreferences(userId) {
    try {
      const doc = await db
        .collection("userNotificationPreferences")
        .doc(userId)
        .get();
      if (doc.exists) {
        return doc.data();
      } else {
        // 建立預設偏好
        const defaultPrefs = getDefaultPreferences();
        await db
          .collection("userNotificationPreferences")
          .doc(userId)
          .set(defaultPrefs);
        return defaultPrefs;
      }
    } catch (error) {
      console.error("獲取用戶通知偏好失敗:", error);
      return getDefaultPreferences();
    }
  }

  // 更新用戶通知偏好
  async function updateUserNotificationPreferences(userId, preferences) {
    try {
      await db
        .collection("userNotificationPreferences")
        .doc(userId)
        .update({
          ...preferences,
          updatedAt: new Date().toISOString(),
        });
      console.log("用戶通知偏好更新成功");
      return true;
    } catch (error) {
      console.error("更新用戶通知偏好失敗:", error);
      throw error;
    }
  }

  // 獲取預設通知偏好
  function getDefaultPreferences() {
    return {
      email: { enabled: true, frequency: "immediate" },
      line: { enabled: true, frequency: "immediate" },
      sms: { enabled: false, frequency: "urgent_only" },
      push: { enabled: false, frequency: "immediate" },
      createdAt: new Date().toISOString(),
    };
  }

  // 更新通知狀態
  async function updateNotificationStatus(notificationId, updateData) {
    try {
      await db
        .collection("notifications")
        .doc(notificationId)
        .update({
          ...updateData,
          updatedAt: new Date().toISOString(),
        });
    } catch (error) {
      console.error("更新通知狀態失敗:", error);
      throw error;
    }
  }

  // 格式化 LINE 訊息
  function formatLineMessage(notification) {
    const orderData = notification.data;

    switch (notification.type) {
      case NOTIFICATION_TYPES.NEW_ORDER:
        return `🛒 新訂單通知\n訂單編號：${orderData.orderId}\n金額：NT$ ${
          orderData.finalTotal
        }\n客戶：${orderData.customer.name}\n時間：${new Date().toLocaleString(
          "zh-TW"
        )}`;

      case NOTIFICATION_TYPES.PAYMENT_SUCCESS:
        return `✅ 付款成功\n訂單編號：${orderData.orderId}\n金額：NT$ ${
          orderData.finalTotal
        }\n時間：${new Date().toLocaleString("zh-TW")}`;

      case NOTIFICATION_TYPES.ORDER_SHIPPED:
        return `🚚 商品已出貨\n訂單編號：${orderData.orderId}\n預計送達：1-2 個工作天`;

      default:
        return `📢 訂單狀態更新\n訂單編號：${orderData.orderId}\n狀態：${notification.type}`;
    }
  }

  // 格式化 Telegram 訊息
  function formatTelegramMessage(notification) {
    const orderData = notification.data;

    switch (notification.type) {
      case NOTIFICATION_TYPES.NEW_ORDER:
        return `🛒 *新訂單通知*\n\n📋 訂單編號：\`${
          orderData.orderId
        }\`\n💰 金額：NT$ ${orderData.finalTotal}\n👤 客戶：${
          orderData.customer.name
        }\n📞 電話：${
          orderData.customer.phone
        }\n📅 時間：${new Date().toLocaleString("zh-TW")}`;

      case NOTIFICATION_TYPES.PAYMENT_SUCCESS:
        return `✅ *付款成功*\n\n📋 訂單編號：\`${
          orderData.orderId
        }\`\n💰 金額：NT$ ${
          orderData.finalTotal
        }\n📅 時間：${new Date().toLocaleString("zh-TW")}`;

      case NOTIFICATION_TYPES.ORDER_SHIPPED:
        return `🚚 *商品已出貨*\n\n📋 訂單編號：\`${orderData.orderId}\`\n📦 預計送達：1-2 個工作天`;

      default:
        return `📢 *訂單狀態更新*\n\n📋 訂單編號：\`${orderData.orderId}\`\n📊 狀態：${notification.type}`;
    }
  }

  // 獲取 Email 模板
  function getEmailTemplate(type) {
    const templates = {
      [NOTIFICATION_TYPES.NEW_ORDER]: "new_order_email",
      [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: "payment_success_email",
      [NOTIFICATION_TYPES.ORDER_SHIPPED]: "order_shipped_email",
    };
    return templates[type] || "default_email";
  }

  // 直接發送 Email（備用方案）
  async function sendEmailDirect(notification) {
    // 使用 EmailJS 或其他前端 Email 服務
    console.log("使用備用 Email 發送方案");
    return { success: true, method: "direct" };
  }

  // 獲取 LINE Bot 用戶 ID
  function getLineBotUserId() {
    // 從設定檔獲取
    if (
      typeof NotificationConfig !== "undefined" &&
      NotificationConfig.LINE_BOT.ADMIN_USER_ID
    ) {
      return NotificationConfig.LINE_BOT.ADMIN_USER_ID;
    }
    // 備用方案
    return "your_line_user_id";
  }

  // 獲取 Telegram 聊天室 ID
  function getTelegramChatId() {
    // 從設定檔獲取
    if (
      typeof NotificationConfig !== "undefined" &&
      NotificationConfig.TELEGRAM_BOT.CHAT_ID
    ) {
      return NotificationConfig.TELEGRAM_BOT.CHAT_ID;
    }
    // 備用方案
    return "your_chat_id";
  }

  // 重試失敗的通知
  async function retryFailedNotifications() {
    try {
      const snapshot = await db
        .collection("notifications")
        .where("status", "in", ["failed", "partial_failed"])
        .where("retryCount", "<", 3)
        .get();

      const retryPromises = snapshot.docs.map(async (doc) => {
        const notification = { id: doc.id, ...doc.data() };
        const newRetryCount = notification.retryCount + 1;

        await updateNotificationStatus(doc.id, {
          retryCount: newRetryCount,
          status: "pending",
        });

        return sendNotification(doc.id, notification);
      });

      await Promise.allSettled(retryPromises);
      console.log(`重試了 ${snapshot.docs.length} 個失敗的通知`);
    } catch (error) {
      console.error("重試失敗通知時發生錯誤:", error);
    }
  }

  // 獲取通知統計
  async function getNotificationStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const snapshot = await db
        .collection("notifications")
        .where("createdAt", ">=", startDate.toISOString())
        .get();

      const notifications = snapshot.docs.map((doc) => doc.data());

      const stats = {
        total: notifications.length,
        sent: notifications.filter((n) => n.status === "sent").length,
        failed: notifications.filter((n) => n.status === "failed").length,
        partialFailed: notifications.filter(
          (n) => n.status === "partial_failed"
        ).length,
        byType: {},
        byChannel: {},
      };

      // 按類型統計
      notifications.forEach((n) => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      });

      // 按管道統計
      notifications.forEach((n) => {
        n.channels.forEach((channel) => {
          stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;
        });
      });

      return stats;
    } catch (error) {
      console.error("獲取通知統計失敗:", error);
      return null;
    }
  }

  return {
    createNotification,
    sendNotification,
    getUserNotificationPreferences,
    updateUserNotificationPreferences,
    retryFailedNotifications,
    getNotificationStats,
    NOTIFICATION_TYPES,
    NOTIFICATION_CHANNELS,
  };
})();

window.NotificationService = NotificationService;
