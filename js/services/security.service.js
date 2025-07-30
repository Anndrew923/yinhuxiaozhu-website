// js/services/security.service.js
// Security Service：資料安全、加密、驗證
const SecurityService = (() => {
  const SECURITY_CONFIG = {
    // 密碼最小長度
    MIN_PASSWORD_LENGTH: 8,
    // 密碼複雜度要求
    PASSWORD_REGEX:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    // 敏感資料欄位
    SENSITIVE_FIELDS: ["password", "creditCard", "cvv", "ssn", "idNumber"],
    // 資料加密金鑰（實際應用中應該從環境變數取得）
    ENCRYPTION_KEY: "yinhu_secure_key_2024",
    // 會話超時時間（毫秒）
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30分鐘
    // 最大登入嘗試次數
    MAX_LOGIN_ATTEMPTS: 5,
    // 鎖定時間（毫秒）
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15分鐘
  };

  // 密碼強度檢查
  function validatePassword(password) {
    const errors = [];

    if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
      errors.push(
        `密碼長度至少需要 ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} 個字元`
      );
    }

    if (!SECURITY_CONFIG.PASSWORD_REGEX.test(password)) {
      errors.push("密碼必須包含大小寫字母、數字和特殊字元");
    }

    // 檢查常見弱密碼
    const commonPasswords = [
      "password",
      "123456",
      "qwerty",
      "admin",
      "123456789",
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("請勿使用常見的弱密碼");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      strength: calculatePasswordStrength(password),
    };
  }

  // 計算密碼強度
  function calculatePasswordStrength(password) {
    let score = 0;

    // 長度分數
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // 字元類型分數
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    // 複雜度分數
    if (/(.)\1{2,}/.test(password)) score -= 1; // 重複字元
    if (/^(.)\1+$/.test(password)) score -= 2; // 全部相同字元

    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    if (score <= 6) return "strong";
    return "very-strong";
  }

  // 簡單的資料加密（實際應用中應使用更強的加密）
  function encryptData(data) {
    try {
      // 這裡使用簡單的 Base64 編碼，實際應用中應使用 AES 加密
      const jsonString = JSON.stringify(data);
      return btoa(encodeURIComponent(jsonString));
    } catch (error) {
      console.error("資料加密失敗:", error);
      return null;
    }
  }

  // 資料解密
  function decryptData(encryptedData) {
    try {
      const jsonString = decodeURIComponent(atob(encryptedData));
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("資料解密失敗:", error);
      return null;
    }
  }

  // 敏感資料遮罩
  function maskSensitiveData(data, fields = SECURITY_CONFIG.SENSITIVE_FIELDS) {
    const masked = { ...data };

    fields.forEach((field) => {
      if (masked[field]) {
        const value = String(masked[field]);
        if (value.length > 4) {
          masked[field] =
            value.substring(0, 2) +
            "*".repeat(value.length - 4) +
            value.substring(value.length - 2);
        } else {
          masked[field] = "*".repeat(value.length);
        }
      }
    });

    return masked;
  }

  // 輸入資料清理和驗證
  function sanitizeInput(input) {
    if (typeof input !== "string") return input;

    // 移除潛在的 XSS 攻擊字元
    return input
      .replace(/[<>]/g, "") // 移除 < 和 >
      .replace(/javascript:/gi, "") // 移除 javascript: 協議
      .replace(/on\w+=/gi, "") // 移除事件處理器
      .trim();
  }

  // 電子郵件格式驗證
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 電話號碼格式驗證
  function validatePhone(phone) {
    const phoneRegex = /^(\+886|0)?[9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  // 檢查會話是否有效
  function isSessionValid() {
    const lastActivity = localStorage.getItem("yinhu_last_activity");
    if (!lastActivity) return false;

    const now = Date.now();
    const timeDiff = now - parseInt(lastActivity);

    return timeDiff < SECURITY_CONFIG.SESSION_TIMEOUT;
  }

  // 更新會話活動時間
  function updateSessionActivity() {
    localStorage.setItem("yinhu_last_activity", Date.now().toString());
  }

  // 檢查登入嘗試次數
  function checkLoginAttempts() {
    const attempts = JSON.parse(
      localStorage.getItem("yinhu_login_attempts") || "[]"
    );
    const now = Date.now();

    // 清理過期的嘗試記錄
    const validAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < SECURITY_CONFIG.LOCKOUT_DURATION
    );

    localStorage.setItem("yinhu_login_attempts", JSON.stringify(validAttempts));

    return {
      count: validAttempts.length,
      isLocked: validAttempts.length >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
      remainingTime:
        validAttempts.length > 0
          ? SECURITY_CONFIG.LOCKOUT_DURATION -
            (now - validAttempts[0].timestamp)
          : 0,
    };
  }

  // 記錄登入嘗試
  function recordLoginAttempt(success = false) {
    const attempts = JSON.parse(
      localStorage.getItem("yinhu_login_attempts") || "[]"
    );

    if (success) {
      // 登入成功，清除嘗試記錄
      localStorage.removeItem("yinhu_login_attempts");
    } else {
      // 登入失敗，記錄嘗試
      attempts.push({
        timestamp: Date.now(),
        ip: getClientIP(), // 實際應用中應從伺服器取得
      });

      localStorage.setItem("yinhu_login_attempts", JSON.stringify(attempts));
    }
  }

  // 取得客戶端 IP（模擬）
  function getClientIP() {
    // 實際應用中應從伺服器取得真實 IP
    return "127.0.0.1";
  }

  // 安全日誌記錄
  function logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      details: details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log("安全事件:", logEntry);

    // 實際應用中應發送到伺服器記錄
    // sendSecurityLog(logEntry);
  }

  // 檢查網站安全性
  function performSecurityCheck() {
    const checks = {
      https: window.location.protocol === "https:",
      secureCookies: document.cookie.includes("Secure"),
      contentSecurityPolicy: !!document.querySelector(
        'meta[http-equiv="Content-Security-Policy"]'
      ),
      xFrameOptions: true, // 實際應用中應檢查伺服器回應頭
      sessionValid: isSessionValid(),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const maxScore = Object.keys(checks).length;

    return {
      checks: checks,
      score: score,
      maxScore: maxScore,
      percentage: Math.round((score / maxScore) * 100),
    };
  }

  // 資料備份檢查
  function checkDataBackup() {
    // 檢查本地資料備份狀態
    const backupInfo = {
      lastBackup: localStorage.getItem("yinhu_last_backup"),
      backupEnabled: localStorage.getItem("yinhu_backup_enabled") === "true",
      autoBackup: localStorage.getItem("yinhu_auto_backup") === "true",
    };

    return backupInfo;
  }

  // 建立資料備份
  function createDataBackup() {
    try {
      const userData = {
        profile: localStorage.getItem("yinhu_user_profile"),
        preferences: localStorage.getItem("yinhu_user_preferences"),
        cart: localStorage.getItem("yinhuCart"),
        timestamp: new Date().toISOString(),
      };

      const backup = encryptData(userData);
      localStorage.setItem("yinhu_data_backup", backup);
      localStorage.setItem("yinhu_last_backup", Date.now().toString());

      logSecurityEvent("data_backup_created", {
        timestamp: userData.timestamp,
      });

      return { success: true, timestamp: userData.timestamp };
    } catch (error) {
      console.error("資料備份失敗:", error);
      logSecurityEvent("data_backup_failed", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // 恢復資料備份
  function restoreDataBackup() {
    try {
      const backup = localStorage.getItem("yinhu_data_backup");
      if (!backup) {
        throw new Error("沒有可用的備份資料");
      }

      const userData = decryptData(backup);
      if (!userData) {
        throw new Error("備份資料損壞");
      }

      // 恢復資料
      if (userData.profile)
        localStorage.setItem("yinhu_user_profile", userData.profile);
      if (userData.preferences)
        localStorage.setItem("yinhu_user_preferences", userData.preferences);
      if (userData.cart) localStorage.setItem("yinhuCart", userData.cart);

      logSecurityEvent("data_backup_restored", {
        timestamp: userData.timestamp,
      });

      return { success: true, timestamp: userData.timestamp };
    } catch (error) {
      console.error("資料恢復失敗:", error);
      logSecurityEvent("data_backup_restore_failed", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // 初始化安全服務
  function init() {
    // 設定定期安全檢查
    setInterval(() => {
      if (!isSessionValid()) {
        logSecurityEvent("session_expired");
        // 可以觸發自動登出
        // AuthService.signOut();
      }
    }, 60000); // 每分鐘檢查一次

    // 設定定期資料備份
    if (localStorage.getItem("yinhu_auto_backup") === "true") {
      setInterval(() => {
        createDataBackup();
      }, 24 * 60 * 60 * 1000); // 每24小時備份一次
    }

    logSecurityEvent("security_service_initialized");
  }

  return {
    init,
    validatePassword,
    calculatePasswordStrength,
    encryptData,
    decryptData,
    maskSensitiveData,
    sanitizeInput,
    validateEmail,
    validatePhone,
    isSessionValid,
    updateSessionActivity,
    checkLoginAttempts,
    recordLoginAttempt,
    logSecurityEvent,
    performSecurityCheck,
    checkDataBackup,
    createDataBackup,
    restoreDataBackup,
    SECURITY_CONFIG,
  };
})();

// 當 DOM 載入完成後初始化
document.addEventListener("DOMContentLoaded", () => {
  SecurityService.init();
});

// 導出到全域
window.SecurityService = SecurityService;
