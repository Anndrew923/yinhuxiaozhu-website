// config/client-config.js
// 前端設定檔 - 只包含非敏感資訊

const ClientConfig = {
  // API 端點
  API: {
    // 本地開發伺服器
    LOCAL: "http://localhost:8000",
    // Firebase Functions（如果部署到雲端）
    FIREBASE: "https://your-region-your-project.cloudfunctions.net",
  },

  // 通知設定（非敏感資訊）
  NOTIFICATIONS: {
    // 是否啟用測試模式
    TEST_MODE: true,

    // 測試通知間隔（秒）
    TEST_INTERVAL: 30,

    // 最大重試次數
    MAX_RETRIES: 3,

    // 支援的通知類型
    SUPPORTED_TYPES: ["email", "line", "telegram"],
  },

  // 應用程式設定
  APP: {
    NAME: "隱湖小竹",
    VERSION: "1.0.0",
    ADMIN_EMAIL: "admin@yinhu.com",
  },
};

// 取得當前環境的 API 端點
function getApiEndpoint() {
  // 檢查是否在本地開發環境
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return ClientConfig.API.LOCAL;
  }

  // 生產環境使用 Firebase Functions
  return ClientConfig.API.FIREBASE;
}

// 驗證前端設定
function validateClientConfig() {
  const errors = [];

  // 檢查 API 端點設定
  if (!ClientConfig.API.LOCAL || !ClientConfig.API.FIREBASE) {
    errors.push("請設定 API 端點");
  }

  return errors;
}

// 匯出設定
window.ClientConfig = ClientConfig;
window.getApiEndpoint = getApiEndpoint;
window.validateClientConfig = validateClientConfig;
