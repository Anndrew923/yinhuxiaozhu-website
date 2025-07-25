// js/services/auth.service.js
// Auth Service：註冊、登入、登出
const AuthService = (() => {
  const auth = window.firebaseAuth;
  const db = window.firebaseDB;

  // 檢查 Firebase 是否正確初始化
  if (!auth) {
    console.error("Firebase Auth 未初始化");
    return null;
  }

  if (!db) {
    console.error("Firebase Firestore 未初始化");
    return null;
  }

  async function signUp(email, password, name, phone) {
    try {
      console.log("開始註冊:", email, name, phone);

      // 建立帳號
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      console.log("帳號建立成功:", cred.user.uid);

      // 建立使用者文件 - 使用更簡單的方式
      console.log("開始建立使用者文件...");
      const userData = {
        uid: cred.user.uid,
        name: name,
        phone: phone,
        email: email,
        points: 0,
        createdAt: new Date().toISOString(), // 使用簡單的時間戳記
      };
      console.log("準備寫入的資料:", userData);

      // 嘗試寫入，如果失敗會拋出錯誤
      try {
        await db.collection("user").doc(cred.user.uid).set(userData);
        console.log("使用者文件建立成功");

        // 立即驗證
        const docRef = await db.collection("user").doc(cred.user.uid).get();
        if (docRef.exists) {
          console.log("驗證寫入結果: 成功");
          console.log("實際寫入的資料:", docRef.data());
        } else {
          console.log("驗證寫入結果: 失敗 - 文件不存在");
        }
      } catch (writeError) {
        console.error("Firestore 寫入失敗:", writeError);
        console.error("錯誤代碼:", writeError.code);
        console.error("錯誤訊息:", writeError.message);

        // 如果寫入失敗，我們仍然返回用戶，但記錄錯誤
        console.warn("註冊成功但資料寫入失敗，用戶需要手動建立資料");
      }

      return cred.user;
    } catch (error) {
      console.error("註冊失敗:", error);
      console.error("錯誤代碼:", error.code);
      console.error("錯誤訊息:", error.message);
      throw error;
    }
  }

  function signIn(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function signOut() {
    return auth.signOut();
  }

  function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }

  // 檢查是否應該顯示註冊邀請
  function shouldShowSignupPrompt() {
    // 檢查是否已登入
    if (auth.currentUser) {
      return false;
    }

    // 檢查購物車金額
    const cart = JSON.parse(localStorage.getItem("yinhuCart") || "[]");
    const cartTotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // 購物車金額超過300元時建議註冊
    return cartTotal >= 300;
  }

  // 計算註冊後可獲得點數
  function calculatePotentialPoints() {
    const cart = JSON.parse(localStorage.getItem("yinhuCart") || "[]");
    const cartTotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return Math.floor(cartTotal / 50); // 50元=1點
  }

  // 顯示註冊邀請Modal
  function showSignupPrompt() {
    const potentialPoints = calculatePotentialPoints();
    const cart = JSON.parse(localStorage.getItem("yinhuCart") || "[]");
    const cartTotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // 創建Modal HTML
    const modalHTML = `
      <div id="signupModal" class="signup-modal">
        <div class="signup-modal-content">
          <div class="signup-modal-header">
            <h2>🎉 成為會員，享受更多優惠！</h2>
            <button class="close-modal" onclick="closeSignupModal()">×</button>
          </div>
          <div class="signup-modal-body">
            <div class="benefits-section">
              <h3>立即註冊即可獲得：</h3>
              <ul>
                <li>✅ <strong>${potentialPoints} 點</strong> 回饋點數（價值 ${potentialPoints} 元）</li>
                <li>✅ 專屬會員優惠券</li>
                <li>✅ 訂單狀態即時通知</li>
                <li>✅ 生日禮金</li>
              </ul>
            </div>
            <div class="current-order">
              <p>您目前的訂單金額：<strong>NT$ ${cartTotal}</strong></p>
              <p>註冊後可獲得：<strong>${potentialPoints} 點</strong></p>
            </div>
          </div>
          <div class="signup-modal-footer">
            <button class="btn-secondary" onclick="closeSignupModal()">稍後再說</button>
            <button class="btn-primary" onclick="goToSignup()">立即註冊</button>
          </div>
        </div>
      </div>
    `;

    // 添加Modal到頁面
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 添加CSS樣式
    if (!document.getElementById("signupModalStyles")) {
      const styles = `
        <style id="signupModalStyles">
          .signup-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
          }
          .signup-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
          .signup-modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .signup-modal-header h2 {
            margin: 0;
            color: #333;
            font-size: 1.5rem;
          }
          .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
          }
          .signup-modal-body {
            padding: 20px;
          }
          .benefits-section ul {
            list-style: none;
            padding: 0;
          }
          .benefits-section li {
            padding: 8px 0;
            color: #555;
          }
          .current-order {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
          }
          .signup-modal-footer {
            padding: 20px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
          }
          .btn-primary, .btn-secondary {
            flex: 1;
            padding: 12px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            height: 48px !important; /* 強制高度，防止覆蓋 */
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            line-height: 48px; /* 匹配高度，防止文字偏移 */
            overflow: hidden; /* 防止內容撐高 */
            white-space: nowrap; /* 防止文字換行 */
            min-width: 140px;
          }
          .btn-primary {
            background: #007bff;
            color: white;
          }
          .btn-primary:hover {
            background: #0056b3;
          }
          .btn-secondary {
            background: #6c757d;
            color: white;
          }
          .btn-secondary:hover {
            background: #545b62;
          }
        </style>
      `;
      document.head.insertAdjacentHTML("beforeend", styles);
    }
  }

  // 關閉註冊邀請Modal（稍後再說）
  function closeSignupModal() {
    const modal = document.getElementById("signupModal");
    if (modal) {
      modal.remove();
    }
    // 繼續結帳流程
    window.location.href = "checkout.html";
  }

  // 跳轉到註冊頁面
  function goToSignup() {
    closeSignupModal();
    window.location.href = "login.html?action=signup";
  }

  // 將函數設為全域可訪問
  window.closeSignupModal = closeSignupModal;
  window.goToSignup = goToSignup;

  return {
    signUp,
    signIn,
    signOut,
    onAuthStateChanged,
    shouldShowSignupPrompt,
    calculatePotentialPoints,
    showSignupPrompt,
    closeSignupModal,
    goToSignup,
  };
})();

window.AuthService = AuthService;
