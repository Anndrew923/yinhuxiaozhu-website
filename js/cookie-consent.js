// js/cookie-consent.js
// Cookie 同意通知管理
const CookieConsent = (() => {
  const COOKIE_CONSENT_KEY = "yinhu_cookie_consent";
  const COOKIE_PREFERENCES_KEY = "yinhu_cookie_preferences";

  // Cookie 類型定義
  const COOKIE_TYPES = {
    NECESSARY: "necessary",
    FUNCTIONAL: "functional",
    ANALYTICAL: "analytical",
  };

  // 檢查是否已同意 Cookie
  function hasConsented() {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "true";
  }

  // 獲取 Cookie 偏好設定
  function getCookiePreferences() {
    const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    return preferences
      ? JSON.parse(preferences)
      : {
          [COOKIE_TYPES.NECESSARY]: true, // 必要性 Cookie 預設開啟
          [COOKIE_TYPES.FUNCTIONAL]: false,
          [COOKIE_TYPES.ANALYTICAL]: false,
        };
  }

  // 儲存 Cookie 偏好設定
  function saveCookiePreferences(preferences) {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  }

  // 創建 Cookie 同意通知
  function createConsentBanner() {
    // 檢查是否已經顯示過
    if (hasConsented()) {
      return;
    }

    const banner = document.createElement("div");
    banner.id = "cookie-consent-banner";
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-banner-text">
          <h3>🍪 Cookie 使用通知</h3>
          <p>我們使用 Cookie 來改善您的使用體驗、分析網站流量，並提供個人化內容。 
          <a href="privacy-policy.html" target="_blank">了解更多</a></p>
        </div>
        <div class="cookie-banner-buttons">
          <button id="cookie-accept-all" class="btn btn-primary">接受全部</button>
          <button id="cookie-customize" class="btn btn-secondary">自訂設定</button>
          <button id="cookie-reject" class="btn btn-outline">拒絕非必要</button>
        </div>
      </div>
    `;

    // 添加樣式
    const style = document.createElement("style");
    style.textContent = `
      #cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(44, 85, 48, 0.95);
        color: white;
        z-index: 10000;
        padding: 20px;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        backdrop-filter: blur(10px);
      }
      
      .cookie-banner-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }
      
      .cookie-banner-text h3 {
        margin: 0 0 10px 0;
        font-size: 18px;
      }
      
      .cookie-banner-text p {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .cookie-banner-text a {
        color: #4a7c59;
        text-decoration: underline;
      }
      
      .cookie-banner-buttons {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
        align-items: stretch;
      }
      
      .cookie-banner-buttons .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        min-width: 100px;
      }
      
      .btn-primary {
        background: #4a7c59;
        color: white;
      }
      
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      
      .btn-outline {
        background: transparent;
        color: white;
        border: 1px solid white;
      }
      
      .btn:hover {
        opacity: 0.8;
        transform: translateY(-1px);
      }
      
      @media (max-width: 768px) {
        .cookie-banner-content {
          flex-direction: column;
          text-align: center;
        }
        
        .cookie-banner-buttons {
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }
        
        .cookie-banner-buttons .btn {
          flex: 1;
          min-width: 120px;
          margin-bottom: 5px;
        }
      }
      
      @media (max-width: 480px) {
        .cookie-banner-buttons .btn {
          flex-basis: 100%;
          margin-bottom: 8px;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    // 綁定事件
    document
      .getElementById("cookie-accept-all")
      .addEventListener("click", () => {
        acceptAllCookies();
      });

    document
      .getElementById("cookie-customize")
      .addEventListener("click", () => {
        showCookieSettings();
      });

    document.getElementById("cookie-reject").addEventListener("click", () => {
      rejectNonEssentialCookies();
    });
  }

  // 觸發 Cookie 同意事件
  function triggerCookieConsentEvent() {
    const event = new CustomEvent("cookieConsentGiven", {
      detail: { timestamp: new Date().toISOString() },
    });
    document.dispatchEvent(event);
  }

  // 接受所有 Cookie
  function acceptAllCookies() {
    const preferences = {
      [COOKIE_TYPES.NECESSARY]: true,
      [COOKIE_TYPES.FUNCTIONAL]: true,
      [COOKIE_TYPES.ANALYTICAL]: true,
    };
    saveCookiePreferences(preferences);
    hideConsentBanner();
    initializeCookies(preferences);
    // 觸發同意事件
    triggerCookieConsentEvent();
  }

  // 拒絕非必要 Cookie
  function rejectNonEssentialCookies() {
    const preferences = {
      [COOKIE_TYPES.NECESSARY]: true,
      [COOKIE_TYPES.FUNCTIONAL]: false,
      [COOKIE_TYPES.ANALYTICAL]: false,
    };
    saveCookiePreferences(preferences);
    hideConsentBanner();
    initializeCookies(preferences);
    // 觸發同意事件
    triggerCookieConsentEvent();
  }

  // 顯示 Cookie 設定面板
  function showCookieSettings() {
    const modal = document.createElement("div");
    modal.id = "cookie-settings-modal";
    modal.innerHTML = `
      <div class="cookie-modal-overlay">
        <div class="cookie-modal-content">
          <div class="cookie-modal-header">
            <h2>Cookie 設定</h2>
            <button id="cookie-modal-close" class="cookie-modal-close">&times;</button>
          </div>
          <div class="cookie-modal-body">
            <div class="cookie-type">
              <div class="cookie-type-header">
                <h3>必要性 Cookie</h3>
                <label class="switch">
                  <input type="checkbox" id="necessary-cookies" checked disabled>
                  <span class="slider"></span>
                </label>
              </div>
              <p>這些 Cookie 是網站正常運作所必需的，無法停用。包括會員登入狀態、購物車內容等。</p>
            </div>
            
            <div class="cookie-type">
              <div class="cookie-type-header">
                <h3>功能性 Cookie</h3>
                <label class="switch">
                  <input type="checkbox" id="functional-cookies">
                  <span class="slider"></span>
                </label>
              </div>
              <p>這些 Cookie 用於記住您的偏好設定，提供個人化體驗。</p>
            </div>
            
            <div class="cookie-type">
              <div class="cookie-type-header">
                <h3>分析性 Cookie</h3>
                <label class="switch">
                  <input type="checkbox" id="analytical-cookies">
                  <span class="slider"></span>
                </label>
              </div>
              <p>這些 Cookie 幫助我們了解網站使用情況，改善服務品質。</p>
            </div>
          </div>
          <div class="cookie-modal-footer">
            <button id="cookie-save-preferences" class="btn btn-primary">儲存設定</button>
            <button id="cookie-accept-all-modal" class="btn btn-secondary">接受全部</button>
          </div>
        </div>
      </div>
    `;

    // 添加樣式
    const modalStyle = document.createElement("style");
    modalStyle.textContent = `
      #cookie-settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10001;
      }
      
      .cookie-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .cookie-modal-content {
        background: white;
        border-radius: 8px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .cookie-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
      }
      
      .cookie-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      
      .cookie-modal-body {
        padding: 20px;
      }
      
      .cookie-type {
        margin-bottom: 20px;
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 4px;
      }
      
      .cookie-type-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      
      .cookie-type h3 {
        margin: 0;
        color: #2c5530;
      }
      
      .cookie-type p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
      
      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }
      
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
      }
      
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      
      input:checked + .slider {
        background-color: #4a7c59;
      }
      
      input:checked + .slider:before {
        transform: translateX(26px);
      }
      
      .cookie-modal-footer {
        padding: 20px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        align-items: stretch;
      }
      
      .cookie-modal-footer .btn {
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 100px;
        box-sizing: border-box;
      }
      
      @media (max-width: 480px) {
        .cookie-modal-footer {
          flex-direction: column;
        }
        
        .cookie-modal-footer .btn {
          width: 100%;
          margin-bottom: 8px;
        }
        
        .cookie-modal-footer .btn:last-child {
          margin-bottom: 0;
        }
      }
    `;

    document.head.appendChild(modalStyle);
    document.body.appendChild(modal);

    // 綁定事件
    document
      .getElementById("cookie-modal-close")
      .addEventListener("click", () => {
        document.body.removeChild(modal);
      });

    document
      .getElementById("cookie-save-preferences")
      .addEventListener("click", () => {
        const preferences = {
          [COOKIE_TYPES.NECESSARY]: true,
          [COOKIE_TYPES.FUNCTIONAL]:
            document.getElementById("functional-cookies").checked,
          [COOKIE_TYPES.ANALYTICAL]:
            document.getElementById("analytical-cookies").checked,
        };
        saveCookiePreferences(preferences);
        hideConsentBanner();
        document.body.removeChild(modal);
        initializeCookies(preferences);
        // 觸發同意事件
        triggerCookieConsentEvent();
      });

    document
      .getElementById("cookie-accept-all-modal")
      .addEventListener("click", () => {
        acceptAllCookies();
        document.body.removeChild(modal);
      });
  }

  // 隱藏同意通知
  function hideConsentBanner() {
    const banner = document.getElementById("cookie-consent-banner");
    if (banner) {
      banner.style.animation = "slideDown 0.3s ease-out";
      setTimeout(() => {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      }, 300);
    }
  }

  // 初始化 Cookie 功能
  function initializeCookies(preferences) {
    console.log("初始化 Cookie 功能:", preferences);

    // 根據偏好設定初始化不同的 Cookie 功能
    if (preferences[COOKIE_TYPES.FUNCTIONAL]) {
      // 初始化功能性 Cookie
      initializeFunctionalCookies();
    }

    if (preferences[COOKIE_TYPES.ANALYTICAL]) {
      // 初始化分析性 Cookie
      initializeAnalyticalCookies();
    }
  }

  // 初始化功能性 Cookie
  function initializeFunctionalCookies() {
    console.log("初始化功能性 Cookie");
    // 這裡可以添加功能性 Cookie 的初始化邏輯
    // 例如：語言偏好、主題設定等
  }

  // 初始化分析性 Cookie
  function initializeAnalyticalCookies() {
    console.log("初始化分析性 Cookie");
    // 這裡可以添加分析性 Cookie 的初始化邏輯
    // 例如：Google Analytics、自定義分析等
  }

  // 檢查特定類型的 Cookie 是否已啟用
  function isCookieTypeEnabled(type) {
    const preferences = getCookiePreferences();
    return preferences[type] || false;
  }

  // 初始化
  function init() {
    // 檢查是否已經同意
    if (hasConsented()) {
      const preferences = getCookiePreferences();
      initializeCookies(preferences);
      return;
    }

    // 顯示同意通知
    createConsentBanner();
  }

  return {
    init,
    hasConsented,
    getCookiePreferences,
    isCookieTypeEnabled,
    acceptAllCookies,
    rejectNonEssentialCookies,
    showCookieSettings,
  };
})();

// 當 DOM 載入完成後初始化
document.addEventListener("DOMContentLoaded", () => {
  CookieConsent.init();
});

// 導出到全域
window.CookieConsent = CookieConsent;
