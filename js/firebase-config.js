// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCOJJTOjpf7wy_p-IBwFJ68fKVpFlFxhYU",
  authDomain: "hidden-lakeside.firebaseapp.com",
  projectId: "hidden-lakeside",
  storageBucket: "hidden-lakeside.firebasestorage.app",
  messagingSenderId: "1067594076514",
  appId: "1:1067594076514:web:d4f2e5405b3cc7e6385c3b",
  measurementId: "G-W3G1KD117R",
};

console.log("Firebase 配置載入:", firebaseConfig.projectId);

// 初始化 Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase 初始化成功");
} catch (error) {
  console.error("Firebase 初始化失敗:", error);
}

// 全域共享實例
window.firebaseAuth = firebase.auth();
window.firebaseDB = firebase.firestore();

// Firestore 設定（暫時移除以避免警告）
// window.firebaseDB.settings({
//   experimentalForceLongPolling: true,
// });

// 本地測試專用設定
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.protocol === "file:"
) {
  console.log("檢測到本地環境，啟用本地測試模式");
  console.log("當前協議:", window.location.protocol);
  console.log("當前主機:", window.location.hostname);

  // 增加本地環境的除錯
  window.firebaseAuth.onAuthStateChanged((user) => {
    console.log(
      "本地環境 Auth 狀態變更:",
      user ? `已登入 (${user.email})` : "未登入"
    );
  });

  // 測試 Firestore 連線
  window.firebaseDB
    .collection("test")
    .doc("connection")
    .get()
    .then(() => console.log("Firestore 連線正常"))
    .catch((error) => {
      console.warn("Firestore 連線失敗 (本地測試模式):", error.message);
      console.log("這是正常的，因為 file:// 協議有限制");
    });
}
