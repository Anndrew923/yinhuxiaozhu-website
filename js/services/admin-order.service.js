// js/services/admin-order.service.js
// 管理員訂單管理服務
const AdminOrderService = (() => {
  const db = window.firebaseDB;
  const auth = window.firebaseAuth;

  if (!db) {
    console.error("Firebase Firestore 未初始化");
    return null;
  }

  // 獲取訂單列表（分頁、篩選、搜尋）
  async function getOrders(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        paymentStatus = null,
        dateFrom = null,
        dateTo = null,
        searchTerm = null,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      let query = db.collection("orders");

      // 狀態篩選
      if (status && status !== "all") {
        query = query.where("status", "==", status);
      }

      // 付款狀態篩選
      if (paymentStatus && paymentStatus !== "all") {
        query = query.where("paymentStatus", "==", paymentStatus);
      }

      // 日期範圍篩選
      if (dateFrom) {
        query = query.where("createdAt", ">=", dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.where("createdAt", "<=", endDate.toISOString());
      }

      // 排序
      query = query.orderBy(sortBy, sortOrder);

      // 獲取數據
      const snapshot = await query.get();
      let orders = [];

      snapshot.forEach((doc) => {
        const orderData = doc.data();
        orders.push({
          id: doc.id,
          ...orderData,
        });
      });

      // 客戶端搜尋（因為 Firestore 全文搜尋限制）
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        orders = orders.filter(
          (order) =>
            order.orderId?.toLowerCase().includes(searchLower) ||
            order.customer?.name?.toLowerCase().includes(searchLower) ||
            order.customer?.phone?.includes(searchTerm) ||
            order.customer?.email?.toLowerCase().includes(searchLower)
        );
      }

      // 分頁
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = orders.slice(startIndex, endIndex);

      return {
        orders: paginatedOrders,
        total: orders.length,
        page: page,
        totalPages: Math.ceil(orders.length / limit),
      };
    } catch (error) {
      console.error("獲取訂單列表失敗:", error);
      throw error;
    }
  }

  // 獲取單一訂單詳情
  async function getOrderById(orderId) {
    try {
      const doc = await db.collection("orders").doc(orderId).get();
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
        };
      } else {
        throw new Error("訂單不存在");
      }
    } catch (error) {
      console.error("獲取訂單詳情失敗:", error);
      throw error;
    }
  }

  // 更新訂單狀態
  async function updateOrderStatus(orderId, newStatus, note = "") {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      // 添加狀態變更記錄
      const statusHistory = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: note,
        updatedBy: auth.currentUser?.uid || "system",
      };

      // 更新訂單
      await db
        .collection("orders")
        .doc(orderId)
        .update({
          ...updateData,
          statusHistory:
            firebase.firestore.FieldValue.arrayUnion(statusHistory),
        });

      // 發送狀態更新通知
      try {
        if (typeof NotificationService !== "undefined" && NotificationService) {
          const order = await getOrderById(orderId);
          await NotificationService.createNotification(
            NotificationService.NOTIFICATION_TYPES.ORDER_STATUS_UPDATE,
            { ...order, newStatus, note },
            ["email", "line"]
          );
        }
      } catch (notificationError) {
        console.error("發送狀態更新通知失敗:", notificationError);
      }

      console.log(`訂單 ${orderId} 狀態已更新為: ${newStatus}`);
      return true;
    } catch (error) {
      console.error("更新訂單狀態失敗:", error);
      throw error;
    }
  }

  // 批量更新訂單狀態
  async function batchUpdateOrderStatus(orderIds, newStatus, note = "") {
    try {
      const batch = db.batch();
      const timestamp = new Date().toISOString();

      for (const orderId of orderIds) {
        const orderRef = db.collection("orders").doc(orderId);
        const statusHistory = {
          status: newStatus,
          timestamp: timestamp,
          note: note,
          updatedBy: auth.currentUser?.uid || "system",
        };

        batch.update(orderRef, {
          status: newStatus,
          updatedAt: timestamp,
          statusHistory:
            firebase.firestore.FieldValue.arrayUnion(statusHistory),
        });
      }

      await batch.commit();
      console.log(`批量更新 ${orderIds.length} 個訂單狀態為: ${newStatus}`);
      return true;
    } catch (error) {
      console.error("批量更新訂單狀態失敗:", error);
      throw error;
    }
  }

  // 更新付款狀態
  async function updatePaymentStatus(orderId, paymentStatus, note = "") {
    try {
      const updateData = {
        paymentStatus: paymentStatus,
        updatedAt: new Date().toISOString(),
      };

      if (paymentStatus === "paid") {
        updateData.paidAt = new Date().toISOString();
      }

      await db.collection("orders").doc(orderId).update(updateData);

      // 發送付款狀態通知
      try {
        if (typeof NotificationService !== "undefined" && NotificationService) {
          const order = await getOrderById(orderId);
          await NotificationService.createNotification(
            NotificationService.NOTIFICATION_TYPES.PAYMENT_STATUS_UPDATE,
            { ...order, paymentStatus, note },
            ["email"]
          );
        }
      } catch (notificationError) {
        console.error("發送付款狀態通知失敗:", notificationError);
      }

      console.log(`訂單 ${orderId} 付款狀態已更新為: ${paymentStatus}`);
      return true;
    } catch (error) {
      console.error("更新付款狀態失敗:", error);
      throw error;
    }
  }

  // 獲取訂單統計數據
  async function getOrderStatistics(dateRange = "today") {
    try {
      let startDate, endDate;
      const now = new Date();

      switch (dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );
          break;
        case "week":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          startDate = new Date(
            weekStart.getFullYear(),
            weekStart.getMonth(),
            weekStart.getDate()
          );
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 7);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        default:
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );
      }

      const snapshot = await db
        .collection("orders")
        .where("createdAt", ">=", startDate.toISOString())
        .where("createdAt", "<", endDate.toISOString())
        .get();

      let stats = {
        totalOrders: 0,
        totalRevenue: 0,
        paidOrders: 0,
        pendingOrders: 0,
        statusBreakdown: {
          pending: 0,
          confirmed: 0,
          preparing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
        paymentBreakdown: {
          pending: 0,
          paid: 0,
          failed: 0,
        },
      };

      snapshot.forEach((doc) => {
        const order = doc.data();
        stats.totalOrders++;

        if (order.paymentStatus === "paid") {
          stats.totalRevenue += order.finalTotal || 0;
          stats.paidOrders++;
        } else {
          stats.pendingOrders++;
        }

        // 狀態統計
        if (stats.statusBreakdown.hasOwnProperty(order.status)) {
          stats.statusBreakdown[order.status]++;
        }

        // 付款狀態統計
        if (stats.paymentBreakdown.hasOwnProperty(order.paymentStatus)) {
          stats.paymentBreakdown[order.paymentStatus]++;
        }
      });

      return stats;
    } catch (error) {
      console.error("獲取訂單統計失敗:", error);
      throw error;
    }
  }

  // 導出訂單數據
  async function exportOrders(options = {}) {
    try {
      const { orders } = await getOrders({ ...options, limit: 10000 });

      // 轉換為 CSV 格式
      const csvHeaders = [
        "訂單編號",
        "客戶姓名",
        "客戶電話",
        "訂單狀態",
        "付款狀態",
        "商品總額",
        "運費",
        "折扣",
        "最終金額",
        "建立時間",
        "更新時間",
      ];

      const csvRows = orders.map((order) => [
        order.orderId || "",
        order.customer?.name || "",
        order.customer?.phone || "",
        getStatusText(order.status),
        getPaymentStatusText(order.paymentStatus),
        order.subtotal || 0,
        order.shippingFee || 0,
        order.discountAmount || 0,
        order.finalTotal || 0,
        formatDate(order.createdAt),
        formatDate(order.updatedAt),
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return csvContent;
    } catch (error) {
      console.error("導出訂單數據失敗:", error);
      throw error;
    }
  }

  // 輔助函數：獲取狀態文字
  function getStatusText(status) {
    const statusMap = {
      pending: "待確認",
      confirmed: "已確認",
      preparing: "準備中",
      shipped: "已出貨",
      delivered: "已送達",
      cancelled: "已取消",
    };
    return statusMap[status] || status;
  }

  // 輔助函數：獲取付款狀態文字
  function getPaymentStatusText(paymentStatus) {
    const statusMap = {
      pending: "待付款",
      paid: "已付款",
      failed: "付款失敗",
    };
    return statusMap[paymentStatus] || paymentStatus;
  }

  // 輔助函數：格式化日期
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("zh-TW");
  }

  return {
    getOrders,
    getOrderById,
    updateOrderStatus,
    batchUpdateOrderStatus,
    updatePaymentStatus,
    getOrderStatistics,
    exportOrders,
    getStatusText,
    getPaymentStatusText,
    formatDate,
  };
})();

window.AdminOrderService = AdminOrderService;
