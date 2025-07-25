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

  return { signUp, signIn, signOut, onAuthStateChanged };
})();

window.AuthService = AuthService;
