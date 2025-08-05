// js/services/auth.service.js
// Auth Service：註冊、登入、登出
const AuthService = (() => {
  // 等待 Firebase 初始化完成
  function waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        if (window.firebaseAuth && window.firebaseDB) {
          resolve();
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  let auth, db;

  // 初始化 Firebase 實例
  async function initFirebase() {
    await waitForFirebase();
    auth = window.firebaseAuth;
    db = window.firebaseDB;
    
    if (!auth) {
      console.error("Firebase Auth 未初始化");
      return false;
    }

    if (!db) {
      console.error("Firebase Firestore 未初始化");
      return false;
    }
    
    return true;
  }

  async function signUp(email, password, name, phone) {
    try {
      await initFirebase();
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

  async function signIn(email, password) {
    await initFirebase();
    return auth.signInWithEmailAndPassword(email, password);
  }

  async function signOut() {
    await initFirebase();
    return auth.signOut();
  }

  async function onAuthStateChanged(callback) {
    await initFirebase();
    return auth.onAuthStateChanged(callback);
  }

  // Google 登入
  async function signInWithGoogle() {
    try {
      await initFirebase();
      const provider = new firebase.auth.GoogleAuthProvider();
      // 設定語言為繁體中文
      provider.setCustomParameters({
        hl: "zh-TW",
      });

      const result = await auth.signInWithPopup(provider);

      // 檢查是否為新用戶
      if (result.additionalUserInfo.isNewUser) {
        // 新用戶，建立用戶資料
        const userData = {
          uid: result.user.uid,
          name: result.user.displayName || "Google 用戶",
          email: result.user.email,
          phone: result.user.phoneNumber || "",
          points: 0,
          createdAt: new Date().toISOString(),
          provider: "google",
        };

        try {
          await db.collection("user").doc(result.user.uid).set(userData);
          console.log("Google 用戶資料建立成功");
        } catch (error) {
          console.error("Google 用戶資料建立失敗:", error);
        }
      }

      return result.user;
    } catch (error) {
      console.error("Google 登入失敗:", error);
      throw error;
    }
  }

  // Facebook 登入
  async function signInWithFacebook() {
    try {
      await initFirebase();
      const provider = new firebase.auth.FacebookAuthProvider();
      // 設定語言為繁體中文
      provider.setCustomParameters({
        display: "popup",
        locale: "zh_TW",
      });

      const result = await auth.signInWithPopup(provider);

      // 檢查是否為新用戶
      if (result.additionalUserInfo.isNewUser) {
        // 新用戶，建立用戶資料
        const userData = {
          uid: result.user.uid,
          name: result.user.displayName || "Facebook 用戶",
          email: result.user.email,
          phone: result.user.phoneNumber || "",
          points: 0,
          createdAt: new Date().toISOString(),
          provider: "facebook",
        };

        try {
          await db.collection("user").doc(result.user.uid).set(userData);
          console.log("Facebook 用戶資料建立成功");
        } catch (error) {
          console.error("Facebook 用戶資料建立失敗:", error);
        }
      }

      return result.user;
    } catch (error) {
      console.error("Facebook 登入失敗:", error);
      throw error;
    }
  }

  // 檢查是否應該顯示註冊邀請
  async function shouldShowSignupPrompt() {
    // 確保 Firebase 已初始化
    await initFirebase();
    
    // 檢查是否已登入
    if (auth && auth.currentUser) {
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
            justify-content: center;
            align-items: center;
            gap: 15px;
            flex-wrap: nowrap;
          }
          .btn-primary, .btn-secondary {
            padding: 0 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 16px;
            height: 48px !important; /* 強制高度，防止覆蓋 */
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            line-height: 1; /* 與全站一致 */
            overflow: hidden; /* 防止內容撐高 */
            white-space: nowrap; /* 防止文字換行 */
            min-width: 140px;
            flex: 1; /* 讓按鈕平均分配空間 */
            max-width: 200px; /* 限制最大寬度 */
            margin: 0; /* 移除預設邊距 */
            text-decoration: none; /* 移除連結樣式 */
            transition: background-color 0.2s ease; /* 平滑過渡效果 */
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
          
          /* 確保按鈕在所有瀏覽器中都有一致的外觀 */
          .btn-primary:focus, .btn-secondary:focus {
            outline: 2px solid #007bff;
            outline-offset: 2px;
          }
          
          /* 防止按鈕被其他樣式覆蓋 */
          .signup-modal .btn-primary,
          .signup-modal .btn-secondary {
            height: 48px !important;
            min-height: 48px !important;
            max-height: 48px !important;
          }
        </style>
      `;
      document.head.insertAdjacentHTML("beforeend", styles);
    }
  }

  // 關閉註冊邀請Modal並繼續結帳流程
  function closeSignupModal() {
    const modal = document.getElementById("signupModal");
    if (modal) {
      modal.remove();
    }
    // 繼續執行原本的結帳流程
    continueCheckoutProcess();
  }

  // 繼續結帳流程的函數
  function continueCheckoutProcess() {
    // 檢查表單是否已填寫完整
    const requiredFields = [
      "customerName",
      "customerPhone", 
      "customerAddress",
      "customerCity",
      "customerDistrict",
    ];

    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field || !field.value.trim()) {
        alert("請先填寫完整的配送資訊");
        return;
      }
    }

    // 驗證電話號碼格式
    const phone = document.getElementById("customerPhone").value;
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(phone)) {
      alert("請輸入正確的手機號碼格式");
      document.getElementById("customerPhone").focus();
      return;
    }

    // 儲存地址
    if (typeof saveAddress === 'function') {
      saveAddress();
    }

    // 從 checkout.js 獲取當前資料
    const cart = JSON.parse(localStorage.getItem("yinhuCart") || "[]");
    const cartTotal = window.cartTotal || cart.reduce((total, item) => total + item.price * item.quantity, 0);
    
    // 嘗試從 checkout.js 的變數獲取資料，如果不存在則使用預設值
    const shippingFee = window.shippingFee || 150;
    const discountAmount = window.discountAmount || 0;
    const selectedDelivery = window.selectedDelivery || "home";
    const appliedCoupon = window.appliedCoupon || null;

    const orderData = {
      items: cart,
      subtotal: cartTotal,
      shippingFee: shippingFee,
      discountAmount: discountAmount,
      finalTotal: cartTotal + shippingFee - discountAmount,
      delivery: selectedDelivery,
      customer: {
        name: document.getElementById("customerName")?.value || "",
        phone: document.getElementById("customerPhone")?.value || "",
        address: document.getElementById("customerAddress")?.value || "",
        city: document.getElementById("customerCity")?.value || "",
        district: document.getElementById("customerDistrict")?.value || "",
      },
      note: document.getElementById("orderNote")?.value || "",
      coupon: appliedCoupon,
    };

    // 儲存訂單資料到 localStorage
    localStorage.setItem("yinhuOrder", JSON.stringify(orderData));

    // 跳轉到付款頁面
    window.location.href = "payment.html";
  }

  // 跳轉到註冊頁面
  function goToSignup() {
    closeSignupModal();
    window.location.href = "login.html?action=signup";
  }

  // 將函數設為全域可訪問
  window.closeSignupModal = closeSignupModal;
  window.goToSignup = goToSignup;
  window.continueCheckoutProcess = continueCheckoutProcess;

  // 檢查用戶是否為管理員
  async function checkAdminRole(uid) {
    try {
      await initFirebase();
      const adminDoc = await db.collection("admins").doc(uid).get();
      if (adminDoc.exists) {
        const adminData = adminDoc.data();
        return {
          isAdmin: true,
          role: adminData.role,
          permissions: adminData.permissions,
          adminData: adminData,
        };
      }
      return { isAdmin: false };
    } catch (error) {
      console.error("檢查管理員權限失敗:", error);
      return { isAdmin: false };
    }
  }

  // 管理員登入
  async function adminSignIn(email, password) {
    try {
      await initFirebase();
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      // 檢查是否為管理員
      const adminCheck = await checkAdminRole(user.uid);
      if (!adminCheck.isAdmin) {
        await signOut();
        throw new Error("您沒有管理員權限");
      }

      return {
        user: user,
        adminData: adminCheck.adminData,
      };
    } catch (error) {
      console.error("管理員登入失敗:", error);
      throw error;
    }
  }

  // 創建管理員帳號（僅限超級管理員）
  async function createAdmin(adminData, currentUserUid) {
    try {
      await initFirebase();
      // 檢查當前用戶是否為超級管理員
      const currentAdminCheck = await checkAdminRole(currentUserUid);
      if (
        !currentAdminCheck.isAdmin ||
        currentAdminCheck.adminData.role !== "super_admin"
      ) {
        throw new Error("只有超級管理員可以創建管理員帳號");
      }

      // 創建管理員資料
      const newAdminData = {
        email: adminData.email,
        name: adminData.name,
        role: adminData.role, // super_admin, order_manager, product_manager, finance_manager, customer_service
        permissions: getPermissionsByRole(adminData.role),
        createdAt: new Date().toISOString(),
        createdBy: currentUserUid,
        isActive: true,
      };

      // 注意：實際密碼創建需要 Firebase Admin SDK 或邀請機制
      // 這裡先儲存管理員資料，密碼需要另外處理
      await db.collection("admins").doc(adminData.uid).set(newAdminData);

      return newAdminData;
    } catch (error) {
      console.error("創建管理員失敗:", error);
      throw error;
    }
  }

  // 根據角色獲取權限
  function getPermissionsByRole(role) {
    const permissions = {
      super_admin: ["all"],
      order_manager: [
        "orders.view",
        "orders.edit",
        "orders.status",
        "customers.view",
      ],
      product_manager: [
        "products.view",
        "products.edit",
        "products.create",
        "products.delete",
        "products.manage",
        "inventory.manage",
      ],
      finance_manager: [
        "orders.view",
        "reports.view",
        "refunds.manage",
        "coupons.manage",
      ],
      customer_service: ["orders.view", "customers.view", "customers.edit"],
    };
    return permissions[role] || [];
  }

  // 檢查權限
  function hasPermission(userPermissions, requiredPermission) {
    if (userPermissions.includes("all")) return true;
    return userPermissions.includes(requiredPermission);
  }

  return {
    signUp,
    signIn,
    signOut,
    onAuthStateChanged,
    signInWithGoogle,
    signInWithFacebook,
    shouldShowSignupPrompt,
    calculatePotentialPoints,
    showSignupPrompt,
    closeSignupModal,
    goToSignup,
    continueCheckoutProcess,
    // 新增管理員相關功能
    checkAdminRole,
    adminSignIn,
    createAdmin,
    getPermissionsByRole,
    hasPermission,
  };
})();

window.AuthService = AuthService;
