// config/server-config.js
// 後端專用設定檔 - 包含敏感資訊，不應暴露給前端

const ServerConfig = {
  // LINE Bot 設定
  LINE_BOT: {
    CHANNEL_ACCESS_TOKEN:
      process.env.LINE_CHANNEL_ACCESS_TOKEN || "your_channel_access_token_here",
    CHANNEL_SECRET:
      process.env.LINE_CHANNEL_SECRET || "your_channel_secret_here",
    ADMIN_USER_ID: process.env.LINE_ADMIN_USER_ID || "your_line_user_id_here",
  },

  // Telegram Bot 設定
  TELEGRAM_BOT: {
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "your_telegram_bot_token_here",
    CHAT_ID: process.env.TELEGRAM_CHAT_ID || "your_chat_id_here",
  },

  // Email 設定
  EMAIL: {
    GMAIL: {
      USER: process.env.GMAIL_USER || "topaj01@gmail.com",
      APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || "cfiu hlvy ouon jlpn",
    },
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@yinhu.com",
  },

  // 通知設定
  SETTINGS: {
    TEST_MODE: process.env.NODE_ENV !== "production",
    TEST_INTERVAL: 30,
    MAX_RETRIES: 3,
  },
};

// 驗證設定
function validateServerConfig() {
  const errors = [];

  // 檢查 Email 設定
  if (
    !ServerConfig.EMAIL.GMAIL.USER ||
    ServerConfig.EMAIL.GMAIL.USER === "your-email@gmail.com"
  ) {
    errors.push("請設定 GMAIL_USER 環境變數");
  }

  if (
    !ServerConfig.EMAIL.GMAIL.APP_PASSWORD ||
    ServerConfig.EMAIL.GMAIL.APP_PASSWORD === "your-app-password"
  ) {
    errors.push("請設定 GMAIL_APP_PASSWORD 環境變數");
  }

  // 檢查通知管道設定
  const hasLineBot =
    ServerConfig.LINE_BOT.CHANNEL_ACCESS_TOKEN &&
    ServerConfig.LINE_BOT.CHANNEL_ACCESS_TOKEN !==
      "your_channel_access_token_here";
  const hasTelegram =
    ServerConfig.TELEGRAM_BOT.BOT_TOKEN &&
    ServerConfig.TELEGRAM_BOT.BOT_TOKEN !== "your_telegram_bot_token_here";

  if (!hasLineBot && !hasTelegram) {
    console.warn("警告：未設定即時通知管道（LINE Bot 或 Telegram Bot）");
  }

  return errors;
}

module.exports = {
  ServerConfig,
  validateServerConfig,
};
