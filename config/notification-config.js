// config/notification-config.js
// 通知系統設定檔

const NotificationConfig = {
  // LINE Bot 設定（LINE Notify 已結束服務）
  LINE_BOT: {
    // LINE Bot Channel Access Token
    CHANNEL_ACCESS_TOKEN: "your_channel_access_token_here",

    // LINE Bot Channel Secret
    CHANNEL_SECRET: "your_channel_secret_here",

    // 管理員用戶 ID（接收通知的 LINE 用戶 ID）
    ADMIN_USER_ID: "your_line_user_id_here",
  },

  // Telegram Bot 設定（替代方案）
  TELEGRAM_BOT: {
    // Telegram Bot Token
    BOT_TOKEN: "your_telegram_bot_token_here",

    // 聊天室 ID（可以是個人聊天室或群組）
    CHAT_ID: "your_chat_id_here",
  },

  // Email 設定
  EMAIL: {
    // Gmail 設定（用於測試）
    GMAIL: {
      USER: "topaj01@gmail.com", // 您的 Gmail 帳號
      APP_PASSWORD: "cfiu hlvy ouon jlpn", // 您的應用程式密碼
    },

    // 管理員 Email（接收所有通知）
    ADMIN_EMAIL: "admin@yinhu.com",
  },

  // 通知設定
  SETTINGS: {
    // 是否啟用測試模式
    TEST_MODE: true,

    // 測試通知間隔（秒）
    TEST_INTERVAL: 30,

    // 最大重試次數
    MAX_RETRIES: 3,
  },
};

// 檢查設定是否完整
function validateConfig() {
  const errors = [];

  // 檢查 Email 設定
  if (
    !NotificationConfig.EMAIL.GMAIL.USER ||
    NotificationConfig.EMAIL.GMAIL.USER === "your-email@gmail.com"
  ) {
    errors.push("請設定 Gmail 帳號");
  }

  if (
    !NotificationConfig.EMAIL.GMAIL.APP_PASSWORD ||
    NotificationConfig.EMAIL.GMAIL.APP_PASSWORD === "your-app-password"
  ) {
    errors.push("請設定 Gmail 應用程式密碼");
  }

  // 檢查通知管道設定（至少需要一種）
  const hasLineBot =
    NotificationConfig.LINE_BOT.CHANNEL_ACCESS_TOKEN &&
    NotificationConfig.LINE_BOT.CHANNEL_ACCESS_TOKEN !==
      "your_channel_access_token_here";
  const hasTelegram =
    NotificationConfig.TELEGRAM_BOT.BOT_TOKEN &&
    NotificationConfig.TELEGRAM_BOT.BOT_TOKEN !==
      "your_telegram_bot_token_here";

  if (!hasLineBot && !hasTelegram) {
    errors.push("請至少設定一種即時通知管道（LINE Bot 或 Telegram Bot）");
  }

  return errors;
}

// 匯出設定
window.NotificationConfig = NotificationConfig;
window.validateNotificationConfig = validateConfig;
