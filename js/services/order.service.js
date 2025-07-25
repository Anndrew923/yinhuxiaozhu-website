// js/services/order.service.js
// Order Service：訂單管理與點數回饋
const OrderService = (() => {
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

  // 建立訂單
  async function createOrder(uid, orderData) {
    try {
      console.log("開始建立訂單:", { uid, orderData });

      // 生成訂單ID
      const orderId = `ORDER_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 準備訂單資料
      const order = {
        orderId: orderId,
        uid: uid,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingFee: orderData.shippingFee,
        discountAmount: orderData.discountAmount,
        finalTotal: orderData.finalTotal,
        delivery: orderData.delivery,
        customer: orderData.customer,
        note: orderData.note,
        coupon: orderData.coupon,
        status: "pending", // pending, confirmed, preparing, shipped, delivered, cancelled
        paymentStatus: "pending", // pending, paid, failed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 儲存訂單到 Firestore
      await db.collection("orders").doc(orderId).set(order);
      console.log("訂單建立成功:", orderId);

      // 如果用戶已登入，計算並添加點數
      if (uid) {
        try {
          const earnedPoints = await PointService.addPoints(
            uid,
            orderData.finalTotal,
            orderId,
            { type: "order_purchase" }
          );
          console.log("點數回饋成功:", earnedPoints);
        } catch (pointError) {
          console.error("點數回饋失敗:", pointError);
          // 點數回饋失敗不影響訂單建立
        }
      }

      return orderId;
    } catch (error) {
      console.error("建立訂單失敗:", error);
      throw error;
    }
  }

  // 獲取用戶訂單列表
  async function getOrders(uid, limit = 20) {
    try {
      console.log("獲取用戶訂單:", uid);

      const snapshot = await db
        .collection("orders")
        .where("uid", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("獲取訂單成功:", orders.length);
      return orders;
    } catch (error) {
      console.error("獲取訂單失敗:", error);
      return [];
    }
  }

  // 獲取單一訂單詳情
  async function getOrder(orderId) {
    try {
      console.log("獲取訂單詳情:", orderId);

      const doc = await db.collection("orders").doc(orderId).get();
      if (doc.exists) {
        const order = {
          id: doc.id,
          ...doc.data(),
        };
        console.log("獲取訂單詳情成功");
        return order;
      } else {
        console.log("訂單不存在");
        return null;
      }
    } catch (error) {
      console.error("獲取訂單詳情失敗:", error);
      return null;
    }
  }

  // 更新訂單狀態
  async function updateOrderStatus(orderId, status, meta = {}) {
    try {
      console.log("更新訂單狀態:", { orderId, status });

      await db
        .collection("orders")
        .doc(orderId)
        .update({
          status: status,
          updatedAt: new Date().toISOString(),
          ...meta,
        });

      console.log("訂單狀態更新成功");
      return true;
    } catch (error) {
      console.error("更新訂單狀態失敗:", error);
      return false;
    }
  }

  // 更新付款狀態
  async function updatePaymentStatus(orderId, paymentStatus, paymentInfo = {}) {
    try {
      console.log("更新付款狀態:", { orderId, paymentStatus });

      await db.collection("orders").doc(orderId).update({
        paymentStatus: paymentStatus,
        paymentInfo: paymentInfo,
        updatedAt: new Date().toISOString(),
      });

      console.log("付款狀態更新成功");
      return true;
    } catch (error) {
      console.error("更新付款狀態失敗:", error);
      return false;
    }
  }

  // 取消訂單
  async function cancelOrder(orderId, reason = "") {
    try {
      console.log("取消訂單:", { orderId, reason });

      await db.collection("orders").doc(orderId).update({
        status: "cancelled",
        cancelReason: reason,
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log("訂單取消成功");
      return true;
    } catch (error) {
      console.error("取消訂單失敗:", error);
      return false;
    }
  }

  // 獲取訂單統計
  async function getOrderStats(uid) {
    try {
      console.log("獲取訂單統計:", uid);

      const snapshot = await db
        .collection("orders")
        .where("uid", "==", uid)
        .get();

      const orders = snapshot.docs.map((doc) => doc.data());

      const stats = {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.finalTotal, 0),
        pendingOrders: orders.filter((order) => order.status === "pending")
          .length,
        completedOrders: orders.filter((order) => order.status === "delivered")
          .length,
        cancelledOrders: orders.filter((order) => order.status === "cancelled")
          .length,
      };

      console.log("訂單統計:", stats);
      return stats;
    } catch (error) {
      console.error("獲取訂單統計失敗:", error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
      };
    }
  }

  // 檢查用戶是否有未完成訂單
  async function hasPendingOrders(uid) {
    try {
      const snapshot = await db
        .collection("orders")
        .where("uid", "==", uid)
        .where("status", "in", ["pending", "confirmed", "preparing", "shipped"])
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error("檢查未完成訂單失敗:", error);
      return false;
    }
  }

  return {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    getOrderStats,
    hasPendingOrders,
  };
})();

window.OrderService = OrderService;
