// js/services/point.service.js
// Point Service：點數系統管理
const PointService = (() => {
  const db = window.firebaseDB;
  const auth = window.firebaseAuth;

  // 檢查 Firebase 是否正確初始化
  if (!db) {
    console.error("Firebase Firestore 未初始化");
    return null;
  }

  if (!auth) {
    console.error("Firebase Auth 未初始化");
    return null;
  }

  // 點數兌換比例設定
  const POINT_RATIO = 50; // 50元台幣 = 1點
  const VIP_POINT_RATIO = 40; // VIP會員 40元台幣 = 1點

  // 計算訂單可獲得點數
  function calculateEarnedPoints(orderAmount, isVIP = false) {
    const ratio = isVIP ? VIP_POINT_RATIO : POINT_RATIO;
    return Math.floor(orderAmount / ratio);
  }

  // 計算點數可兌換金額
  function calculatePointValue(points) {
    return points * 1; // 1點 = 1元台幣
  }

  // 添加點數（訂單完成後）
  async function addPoints(uid, orderAmount, orderId, meta = {}) {
    try {
      console.log("開始添加點數:", { uid, orderAmount, orderId });

      // 檢查用戶是否存在
      const userDoc = await db.collection("user").doc(uid).get();
      if (!userDoc.exists) {
        throw new Error("用戶不存在");
      }

      const userData = userDoc.data();
      const isVIP = userData.vipLevel === "vip"; // 假設有VIP等級
      const earnedPoints = calculateEarnedPoints(orderAmount, isVIP);

      if (earnedPoints <= 0) {
        console.log("訂單金額不足以獲得點數");
        return 0;
      }

      // 更新用戶點數
      const newPoints = (userData.points || 0) + earnedPoints;
      await db.collection("user").doc(uid).update({
        points: newPoints,
        lastUpdated: new Date().toISOString(),
      });

      // 記錄點數交易歷史
      await db.collection("pointTransactions").add({
        uid: uid,
        type: "earn",
        amount: earnedPoints,
        orderAmount: orderAmount,
        orderId: orderId,
        balance: newPoints,
        meta: meta,
        createdAt: new Date().toISOString(),
      });

      console.log("點數添加成功:", earnedPoints);
      return earnedPoints;
    } catch (error) {
      console.error("添加點數失敗:", error);
      throw error;
    }
  }

  // 兌換點數
  async function redeemPoints(uid, points, meta = {}) {
    try {
      console.log("開始兌換點數:", { uid, points });

      // 檢查用戶點數是否足夠
      const userDoc = await db.collection("user").doc(uid).get();
      if (!userDoc.exists) {
        throw new Error("用戶不存在");
      }

      const userData = userDoc.data();
      const currentPoints = userData.points || 0;

      if (currentPoints < points) {
        throw new Error("點數不足");
      }

      // 更新用戶點數
      const newPoints = currentPoints - points;
      await db.collection("user").doc(uid).update({
        points: newPoints,
        lastUpdated: new Date().toISOString(),
      });

      // 記錄點數交易歷史
      await db.collection("pointTransactions").add({
        uid: uid,
        type: "redeem",
        amount: -points,
        balance: newPoints,
        meta: meta,
        createdAt: new Date().toISOString(),
      });

      console.log("點數兌換成功:", points);
      return points;
    } catch (error) {
      console.error("兌換點數失敗:", error);
      throw error;
    }
  }

  // 獲取用戶點數餘額
  async function getUserPoints(uid) {
    try {
      const userDoc = await db.collection("user").doc(uid).get();
      if (userDoc.exists) {
        return userDoc.data().points || 0;
      }
      return 0;
    } catch (error) {
      console.error("獲取用戶點數失敗:", error);
      return 0;
    }
  }

  // 獲取點數交易歷史
  async function getPointHistory(uid, limit = 10) {
    try {
      const snapshot = await db
        .collection("pointTransactions")
        .where("uid", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("獲取點數歷史失敗:", error);
      return [];
    }
  }

  // 檢查是否應該顯示註冊邀請
  function shouldShowSignupPrompt() {
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
    return calculateEarnedPoints(cartTotal);
  }

  return {
    calculateEarnedPoints,
    calculatePointValue,
    addPoints,
    redeemPoints,
    getUserPoints,
    getPointHistory,
    shouldShowSignupPrompt,
    calculatePotentialPoints,
    POINT_RATIO,
    VIP_POINT_RATIO,
  };
})();

window.PointService = PointService;
