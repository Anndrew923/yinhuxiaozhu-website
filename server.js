require('dotenv').config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const url = require("url");
const fetch = require("node-fetch");
const { ServerConfig, validateServerConfig } = require("./config/server-config");

// 驗證伺服器設定
const configErrors = validateServerConfig();
if (configErrors.length > 0) {
  console.error("設定錯誤:", configErrors);
  console.log("請設定環境變數或檢查 config/server-config.js");
}

const server = http.createServer(async (req, res) => {
  // 添加CORS頭
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 處理OPTIONS請求
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // 解析 URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 處理 API 請求
  if (pathname === "/api/send-email" && req.method === "POST") {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const { to, subject, content, from } = JSON.parse(body);

          // 使用安全的伺服器設定
          const emailUser = ServerConfig.EMAIL.GMAIL.USER;
          const emailPassword = ServerConfig.EMAIL.GMAIL.APP_PASSWORD;

          if (!emailUser || !emailPassword) {
            throw new Error("Email 設定不完整");
          }

          // 建立 transporter
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: emailUser,
              pass: emailPassword,
            },
          });

          // 發送 Email
          const mailOptions = {
            from: from || emailUser,
            to: to,
            subject: subject,
            html: content,
          };

          const info = await transporter.sendMail(mailOptions);
          
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: true,
            messageId: info.messageId,
            message: "Email 發送成功"
          }));

        } catch (error) {
          console.error("Email 發送錯誤:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: false,
            error: error.message
          }));
        }
      });
      return;
    } catch (error) {
      console.error("API 處理錯誤:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        error: "內部伺服器錯誤"
      }));
      return;
    }
  }

  // 處理 LINE 通知 API
  if (pathname === "/api/send-line-notification" && req.method === "POST") {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const { message, userId } = JSON.parse(body);

          if (!message) {
            throw new Error("缺少訊息內容");
          }

          // 檢查 LINE Bot 設定
          if (!ServerConfig.LINE_BOT.CHANNEL_ACCESS_TOKEN || 
              ServerConfig.LINE_BOT.CHANNEL_ACCESS_TOKEN === "your_channel_access_token_here") {
            throw new Error("LINE Bot 未設定，請先設定 Channel Access Token");
          }

          // 發送 LINE 訊息
          const result = await sendLineMessage(message, userId);
          
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: true,
            message: "LINE 通知發送成功",
            result: result
          }));

        } catch (error) {
          console.error("LINE 通知發送錯誤:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: false,
            error: error.message
          }));
        }
      });
      return;
    } catch (error) {
      console.error("API 處理錯誤:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        error: "內部伺服器錯誤"
      }));
      return;
    }
  }

  // 處理訂單通知 API（整合 Email 和 LINE）
  if (pathname === "/api/send-order-notification" && req.method === "POST") {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const { orderData, notificationTypes = ["email", "line"] } = JSON.parse(body);

          if (!orderData || !orderData.orderId) {
            throw new Error("缺少訂單資料");
          }

          const results = {};

          // 發送 Email 通知
          if (notificationTypes.includes("email")) {
            try {
              const emailResult = await sendOrderEmail(orderData);
              results.email = emailResult;
            } catch (error) {
              console.error("Email 通知失敗:", error);
              results.email = { success: false, error: error.message };
            }
          }

          // 發送 LINE 通知
          if (notificationTypes.includes("line")) {
            try {
              const lineResult = await sendOrderLineNotification(orderData);
              results.line = lineResult;
            } catch (error) {
              console.error("LINE 通知失敗:", error);
              results.line = { success: false, error: error.message };
            }
          }
          
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: true,
            message: "訂單通知發送完成",
            results: results
          }));

        } catch (error) {
          console.error("訂單通知發送錯誤:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: false,
            error: error.message
          }));
        }
      });
      return;
    } catch (error) {
      console.error("API 處理錯誤:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        error: "內部伺服器錯誤"
      }));
      return;
    }
  }

  let filePath = "." + req.url;

  // 移除查詢參數
  filePath = filePath.split("?")[0];

  if (filePath === "./") {
    filePath = "./index.html";
  }

  console.log(`Request: ${req.method} ${req.url} -> ${filePath}`);

  const extname = path.extname(filePath);
  let contentType = "text/html";

  switch (extname) {
    case ".js":
      contentType = "text/javascript";
      break;
    case ".css":
      contentType = "text/css";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".jpg":
    case ".jpeg":
      contentType = "image/jpeg";
      break;
    case ".gif":
      contentType = "image/gif";
      break;
    case ".svg":
      contentType = "image/svg+xml";
      break;
    case ".ico":
      contentType = "image/x-icon";
      break;
    case ".woff":
      contentType = "font/woff";
      break;
    case ".woff2":
      contentType = "font/woff2";
      break;
    case ".ttf":
      contentType = "font/ttf";
      break;
    case ".eot":
      contentType = "application/vnd.ms-fontobject";
      break;
  }

  // 檢查文件是否存在
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(`File not found: ${filePath}`);
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error(`Error reading file ${filePath}:`, error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Server error: ${error.code}`);
    } else {
      console.log(`Serving: ${filePath} (${contentType})`);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      res.end(content, "utf-8");
    }
  });
});

// LINE 通知輔助函數
async function sendLineMessage(message, userId = null) {
  const targetUserId = userId || ServerConfig.LINE_BOT.ADMIN_USER_ID;
  
  if (!targetUserId || targetUserId === "your_line_user_id_here") {
    throw new Error("未設定 LINE 用戶 ID");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ServerConfig.LINE_BOT.CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: targetUserId,
      messages: [
        {
          type: "text",
          text: message
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`LINE API 錯誤: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

// 訂單 Email 通知輔助函數
async function sendOrderEmail(orderData) {
  const emailUser = ServerConfig.EMAIL.GMAIL.USER;
  const emailPassword = ServerConfig.EMAIL.GMAIL.APP_PASSWORD;

  const transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  const emailContent = generateOrderEmailContent(orderData);

  const mailOptions = {
    from: `"隱湖小竹" <${emailUser}>`,
    to: orderData.customer?.email || ServerConfig.EMAIL.ADMIN_EMAIL,
    subject: emailContent.subject,
    html: emailContent.html,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
}

// 訂單 LINE 通知輔助函數
async function sendOrderLineNotification(orderData) {
  const message = generateOrderLineMessage(orderData);
  return await sendLineMessage(message);
}

// 生成訂單 Email 內容
function generateOrderEmailContent(orderData) {
  const orderId = orderData.orderId;
  const amount = orderData.finalTotal || orderData.total;
  const customerName = orderData.customer?.name || "客戶";
  const items = orderData.items || [];

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
          <p><strong>下單時間：</strong>${new Date().toLocaleString("zh-TW")}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3>訂單商品</h3>
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
              <span>${item.name} x ${item.quantity}</span>
              <span>NT$ ${item.price * item.quantity}</span>
            </div>
          `).join("")}
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
          <p style="margin: 0; color: #2e7d32;">請盡快處理此訂單，確保客戶滿意度！</p>
        </div>
      </div>
    `
  };
}

// 生成訂單 LINE 訊息
function generateOrderLineMessage(orderData) {
  const orderId = orderData.orderId;
  const amount = orderData.finalTotal || orderData.total;
  const customerName = orderData.customer?.name || "客戶";
  const items = orderData.items || [];

  const itemsText = items.map(item => 
    `• ${item.name} x ${item.quantity} = NT$ ${item.price * item.quantity}`
  ).join("\n");

  return `🛒 新訂單通知

📋 訂單編號：${orderId}
👤 客戶姓名：${customerName}
💰 訂單金額：NT$ ${amount}
⏰ 下單時間：${new Date().toLocaleString("zh-TW")}

📦 訂購商品：
${itemsText}

請盡快處理此訂單！`;
}

// 伺服器啟動

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log("Press Ctrl+C to stop the server");
  console.log("Available files:");
  console.log("- index.html");
  console.log("- order.html");
  console.log("- product.html");
  console.log("- styles.css");
  console.log("- assets/");
  console.log("\nAPI 端點:");
  console.log("- POST /api/send-email");
  console.log("- POST /api/send-line-notification");
  console.log("- POST /api/send-order-notification");
});
