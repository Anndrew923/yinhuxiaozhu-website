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

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 全域共享實例
window.firebaseAuth = firebase.auth();
window.firebaseDB = firebase.firestore();

// 解決 WebChannel 連線問題
window.firebaseDB.settings({
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
