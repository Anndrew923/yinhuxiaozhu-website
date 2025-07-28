const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Email 發送配置
const emailConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: functions.config().email.user || "your-email@gmail.com",
    pass: functions.config().email.pass || "your-app-password",
  },
};

const transporter = nodemailer.createTransporter(emailConfig);

// 發送訂單 Email 通知
exports.sendOrderEmail = functions.https.onCall(async (data, context) => {
  try {
    const { type, orderData, template } = data;

    // 驗證資料
    if (!orderData || !orderData.orderId) {
      throw new Error("缺少訂單資料");
    }

    // 根據類型選擇模板
    const emailContent = generateEmailContent(type, orderData, template);

    // 發送 Email
    const mailOptions = {
      from: `"隱湖小竹" <${emailConfig.auth.user}>`,
      to: orderData.customer.email || "admin@yinhu.com", // 預設發送給管理員
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("Email 發送成功:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email 發送失敗:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Email 發送失敗",
      error.message
    );
  }
});

// 生成 Email 內容
function generateEmailContent(type, orderData, template) {
  const orderId = orderData.orderId;
  const amount = orderData.finalTotal;
  const customerName = orderData.customer.name;
  const items = orderData.items;

  switch (type) {
    case "new_order":
      return {
        subject: `新訂單通知 - 訂單編號: ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🛒 新訂單通知</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>訂單資訊</h3>
              <p><strong>訂單編號：</strong>${orderId}</p>
              <p><strong>客戶姓名：</strong>${customerName}</p>
              <p><strong>訂單金額：</strong>NT$ ${amount}</p>
              <p><strong>下單時間：</strong>${new Date().toLocaleString(
                "zh-TW"
              )}</p>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h3>訂單商品</h3>
              ${items
                .map(
                  (item) => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                  <span>${item.name} x ${item.quantity}</span>
                  <span>NT$ ${item.price * item.quantity}</span>
                </div>
              `
                )
                .join("")}
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
              <p style="margin: 0; color: #2e7d32;">請盡快處理此訂單，確保客戶滿意度！</p>
            </div>
          </div>
        `,
      };

    case "payment_success":
      return {
        subject: `付款成功通知 - 訂單編號: ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4caf50;">✅ 付款成功通知</h2>
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>付款資訊</h3>
              <p><strong>訂單編號：</strong>${orderId}</p>
              <p><strong>付款金額：</strong>NT$ ${amount}</p>
              <p><strong>付款時間：</strong>${new Date().toLocaleString(
                "zh-TW"
              )}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px;">
              <p style="margin: 0; color: #f57c00;">請準備商品並安排出貨！</p>
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: `訂單狀態更新 - 訂單編號: ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">📢 訂單狀態更新</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>訂單編號：</strong>${orderId}</p>
              <p><strong>狀態類型：</strong>${type}</p>
              <p><strong>更新時間：</strong>${new Date().toLocaleString(
                "zh-TW"
              )}</p>
            </div>
          </div>
        `,
      };
  }
}

// 定期重試失敗的通知
exports.retryFailedNotifications = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    try {
      const db = admin.firestore();

      // 獲取失敗的通知
      const snapshot = await db
        .collection("notifications")
        .where("status", "in", ["failed", "partial_failed"])
        .where("retryCount", "<", 3)
        .get();

      console.log(`找到 ${snapshot.docs.length} 個需要重試的通知`);

      const retryPromises = snapshot.docs.map(async (doc) => {
        const notification = { id: doc.id, ...doc.data() };

        // 更新重試次數
        await doc.ref.update({
          retryCount: notification.retryCount + 1,
          status: "pending",
          updatedAt: new Date().toISOString(),
        });

        // 重新發送通知
        return sendNotification(notification);
      });

      await Promise.allSettled(retryPromises);
      console.log("重試完成");
    } catch (error) {
      console.error("重試失敗通知時發生錯誤:", error);
    }
  });

// 發送通知的輔助函數
async function sendNotification(notification) {
  // 這裡可以實作重新發送邏輯
  console.log("重新發送通知:", notification.id);
  return { success: true };
}
