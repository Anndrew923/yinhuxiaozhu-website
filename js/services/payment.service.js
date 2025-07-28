// js/services/payment.service.js
// Payment Service：金流整合服務（支援多種金流平台）
const PaymentService = (() => {
  const db = window.firebaseDB;
  const auth = window.firebaseAuth;

  // 檢查 Firebase 是否正確初始化
  if (!db) {
    console.error("Firebase Firestore 未初始化");
    return null;
  }

  // 金流平台配置（可根據選擇的平台調整）
  const PAYMENT_CONFIG = {
    // 綠界科技 ECPay
    ecpay: {
      name: "ECPay",
      apiUrl: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5", // 測試環境
      // apiUrl: 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5', // 正式環境
      merchantId: process.env.ECPAY_MERCHANT_ID || "2000132", // 測試用商店代號
      hashKey: process.env.ECPAY_HASH_KEY || "5294y06JbISpM5x9",
      hashIV: process.env.ECPAY_HASH_IV || "v77hoKGq4kWxNNIS",
      returnUrl: `${window.location.origin}/payment-callback.html`,
      clientBackUrl: `${window.location.origin}/payment-success.html`,
      paymentInfoUrl: `${window.location.origin}/payment-info.html`,
    },

    // 藍新金流 NewebPay
    newebpay: {
      name: "NewebPay",
      apiUrl: "https://ccore.newebpay.com/MPG/mpg_gateway", // 測試環境
      // apiUrl: 'https://core.newebpay.com/MPG/mpg_gateway', // 正式環境
      merchantId: process.env.NEWEBPAY_MERCHANT_ID || "MS123456789",
      hashKey:
        process.env.NEWEBPAY_HASH_KEY || "12345678901234567890123456789012",
      hashIV: process.env.NEWEBPAY_HASH_IV || "1234567890123456",
      returnUrl: `${window.location.origin}/payment-callback.html`,
      clientBackUrl: `${window.location.origin}/payment-success.html`,
    },

    // Stripe
    stripe: {
      name: "Stripe",
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_...",
      secretKey: process.env.STRIPE_SECRET_KEY || "sk_test_...",
      apiUrl: "https://api.stripe.com/v1",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_...",
    },
  };

  // 當前選擇的金流平台
  let currentPlatform = "ecpay"; // 預設使用綠界，可動態切換

  // 設定金流平台
  function setPaymentPlatform(platform) {
    if (PAYMENT_CONFIG[platform]) {
      currentPlatform = platform;
      console.log(`切換到金流平台: ${PAYMENT_CONFIG[platform].name}`);
      return true;
    } else {
      console.error(`不支援的金流平台: ${platform}`);
      return false;
    }
  }

  // 取得當前平台配置
  function getCurrentConfig() {
    return PAYMENT_CONFIG[currentPlatform];
  }

  // 建立支付訂單
  async function createPaymentOrder(orderData, paymentMethod = "credit") {
    try {
      console.log("開始建立支付訂單:", { orderData, paymentMethod });

      // 生成訂單編號
      const orderNumber = generateOrderNumber();

      // 準備訂單資料
      const order = {
        orderNumber: orderNumber,
        amount: orderData.finalTotal,
        items: orderData.items,
        customer: orderData.customer,
        delivery: orderData.delivery,
        paymentMethod: paymentMethod,
        status: "pending",
        createdAt: new Date().toISOString(),
        platform: currentPlatform,
      };

      // 儲存訂單到 Firestore
      if (auth.currentUser) {
        order.uid = auth.currentUser.uid;
        await db.collection("orders").doc(orderNumber).set(order);
      }

      // 根據平台建立支付請求
      const paymentRequest = await buildPaymentRequest(order, paymentMethod);

      console.log("支付訂單建立成功:", orderNumber);
      return {
        orderNumber: orderNumber,
        paymentRequest: paymentRequest,
      };
    } catch (error) {
      console.error("建立支付訂單失敗:", error);
      throw error;
    }
  }

  // 根據平台建立支付請求
  async function buildPaymentRequest(order, paymentMethod) {
    const config = getCurrentConfig();

    switch (currentPlatform) {
      case "ecpay":
        return buildECPayRequest(order, paymentMethod, config);
      case "newebpay":
        return buildNewebPayRequest(order, paymentMethod, config);
      case "stripe":
        return buildStripeRequest(order, paymentMethod, config);
      default:
        throw new Error(`不支援的平台: ${currentPlatform}`);
    }
  }

  // 建立綠界支付請求
  function buildECPayRequest(order, paymentMethod, config) {
    const baseParams = {
      MerchantID: config.merchantId,
      MerchantTradeNo: order.orderNumber,
      MerchantTradeDate: new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[-:]/g, ""),
      PaymentType: "aio",
      TotalAmount: order.amount,
      TradeDesc: "隱湖小竹餐點訂購",
      ItemName: order.items
        .map((item) => `${item.name} x${item.quantity}`)
        .join("#"),
      ReturnURL: config.returnUrl,
      ClientBackURL: config.clientBackUrl,
      OrderResultURL: config.paymentInfoUrl,
    };

    // 根據付款方式設定參數
    switch (paymentMethod) {
      case "credit":
        baseParams.ChoosePayment = "Credit";
        break;
      case "linepay":
        baseParams.ChoosePayment = "LinePay";
        // Line Pay 特殊設定
        if (config.linePayChannelId) {
          baseParams.LinePayChannelId = config.linePayChannelId;
        }
        break;
      case "cod":
        baseParams.ChoosePayment = "CVS";
        baseParams.StoreExpireDate = 7; // 7天內取貨
        break;
    }

    // 加入檢查碼（實際實作需要加密）
    baseParams.CheckMacValue = generateCheckMacValue(baseParams, config);

    return {
      method: "POST",
      url: config.apiUrl,
      data: baseParams,
    };
  }

  // 建立藍新支付請求
  function buildNewebPayRequest(order, paymentMethod, config) {
    const baseParams = {
      MerchantID: config.merchantId,
      MerchantOrderNo: order.orderNumber,
      Amt: order.amount,
      ItemDesc: order.items
        .map((item) => `${item.name} x${item.quantity}`)
        .join(", "),
      ReturnURL: config.returnUrl,
      ClientBackURL: config.clientBackUrl,
      Email: order.customer.email || "customer@example.com",
    };

    // 根據付款方式設定參數
    switch (paymentMethod) {
      case "credit":
        baseParams.TradeDesc = "信用卡付款";
        break;
      case "linepay":
        baseParams.TradeDesc = "Line Pay";
        break;
    }

    // 加入檢查碼
    baseParams.TradeInfo = generateTradeInfo(baseParams, config);
    baseParams.TradeSha = generateTradeSha(baseParams.TradeInfo, config);

    return {
      method: "POST",
      url: config.apiUrl,
      data: baseParams,
    };
  }

  // 建立 Stripe 支付請求
  function buildStripeRequest(order, paymentMethod, config) {
    return {
      method: "POST",
      url: `${config.apiUrl}/payment_intents`,
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        amount: order.amount * 100, // Stripe 使用分為單位
        currency: "twd",
        metadata: {
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
        },
      },
    };
  }

  // 處理支付回調
  async function handlePaymentCallback(callbackData) {
    try {
      console.log("收到支付回調:", callbackData);

      const config = getCurrentConfig();
      let paymentResult;

      // 根據平台處理回調
      switch (currentPlatform) {
        case "ecpay":
          paymentResult = handleECPayCallback(callbackData, config);
          break;
        case "newebpay":
          paymentResult = handleNewebPayCallback(callbackData, config);
          break;
        case "stripe":
          paymentResult = handleStripeCallback(callbackData, config);
          break;
        default:
          throw new Error(`不支援的平台: ${currentPlatform}`);
      }

      // 更新訂單狀態
      if (paymentResult.success) {
        await updateOrderStatus(
          paymentResult.orderNumber,
          "paid",
          paymentResult
        );
        console.log("支付成功，訂單狀態已更新");
      } else {
        await updateOrderStatus(
          paymentResult.orderNumber,
          "failed",
          paymentResult
        );
        console.log("支付失敗，訂單狀態已更新");
      }

      return paymentResult;
    } catch (error) {
      console.error("處理支付回調失敗:", error);
      throw error;
    }
  }

  // 處理綠界回調
  function handleECPayCallback(data, config) {
    // 驗證檢查碼
    const checkMacValue = generateCheckMacValue(data, config);
    if (checkMacValue !== data.CheckMacValue) {
      throw new Error("檢查碼驗證失敗");
    }

    return {
      success: data.RtnCode === "1",
      orderNumber: data.MerchantTradeNo,
      transactionId: data.TradeNo,
      amount: data.TradeAmt,
      paymentDate: data.PaymentDate,
      message: data.RtnMsg,
    };
  }

  // 處理藍新回調
  function handleNewebPayCallback(data, config) {
    // 驗證檢查碼
    const tradeSha = generateTradeSha(data.TradeInfo, config);
    if (tradeSha !== data.TradeSha) {
      throw new Error("檢查碼驗證失敗");
    }

    // 解密 TradeInfo
    const tradeInfo = decryptTradeInfo(data.TradeInfo, config);

    return {
      success: tradeInfo.Status === "SUCCESS",
      orderNumber: tradeInfo.MerchantOrderNo,
      transactionId: tradeInfo.TradeNo,
      amount: tradeInfo.Amt,
      paymentDate: tradeInfo.PayTime,
      message: tradeInfo.Message,
    };
  }

  // 處理 Stripe 回調
  function handleStripeCallback(data, config) {
    return {
      success: data.type === "payment_intent.succeeded",
      orderNumber: data.data.object.metadata.orderNumber,
      transactionId: data.data.object.id,
      amount: data.data.object.amount / 100,
      paymentDate: new Date(data.data.object.created * 1000).toISOString(),
      message: data.data.object.status,
    };
  }

  // 更新訂單狀態
  async function updateOrderStatus(orderNumber, status, paymentInfo = {}) {
    try {
      const updateData = {
        status: status,
        paymentInfo: paymentInfo,
        updatedAt: new Date().toISOString(),
      };

      if (status === "paid") {
        updateData.paymentDate = new Date().toISOString();
      }

      await db.collection("orders").doc(orderNumber).update(updateData);
      console.log("訂單狀態更新成功:", orderNumber, status);

      // 如果支付成功且用戶已登入，添加點數
      if (status === "paid" && auth.currentUser) {
        try {
          const orderDoc = await db.collection("orders").doc(orderNumber).get();
          const orderData = orderDoc.data();
          await PointService.addPoints(
            auth.currentUser.uid,
            orderData.amount,
            orderNumber,
            { type: "order_purchase" }
          );
          console.log("點數回饋成功");
        } catch (pointError) {
          console.error("點數回饋失敗:", pointError);
        }
      }
    } catch (error) {
      console.error("更新訂單狀態失敗:", error);
      throw error;
    }
  }

  // 生成訂單編號
  function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `YH${year}${month}${day}${random}`;
  }

  // 生成檢查碼（綠界）
  function generateCheckMacValue(params, config) {
    // 這裡需要實作綠界的檢查碼生成邏輯
    // 實際實作需要根據綠界的文件進行加密
    console.log("需要實作綠界檢查碼生成");
    return "placeholder_checkmac";
  }

  // 生成交易資訊（藍新）
  function generateTradeInfo(params, config) {
    // 這裡需要實作藍新的交易資訊生成邏輯
    console.log("需要實作藍新交易資訊生成");
    return "placeholder_tradeinfo";
  }

  // 生成交易檢查碼（藍新）
  function generateTradeSha(tradeInfo, config) {
    // 這裡需要實作藍新的檢查碼生成邏輯
    console.log("需要實作藍新檢查碼生成");
    return "placeholder_tradesha";
  }

  // 解密交易資訊（藍新）
  function decryptTradeInfo(tradeInfo, config) {
    // 這裡需要實作藍新的解密邏輯
    console.log("需要實作藍新交易資訊解密");
    return {
      Status: "SUCCESS",
      MerchantOrderNo: "ORDER123",
      TradeNo: "TRADE123",
      Amt: 1000,
      PayTime: new Date().toISOString(),
      Message: "付款成功",
    };
  }

  // 取得支援的付款方式
  function getSupportedPaymentMethods() {
    const config = getCurrentConfig();

    switch (currentPlatform) {
      case "ecpay":
        return ["credit", "linepay", "cod"];
      case "newebpay":
        return ["credit", "linepay"];
      case "stripe":
        return ["credit"];
      default:
        return ["credit"];
    }
  }

  // 取得平台資訊
  function getPlatformInfo() {
    const config = getCurrentConfig();
    return {
      name: config.name,
      platform: currentPlatform,
      supportedMethods: getSupportedPaymentMethods(),
    };
  }

  return {
    setPaymentPlatform,
    getCurrentConfig,
    createPaymentOrder,
    handlePaymentCallback,
    updateOrderStatus,
    getSupportedPaymentMethods,
    getPlatformInfo,
  };
})();

window.PaymentService = PaymentService;
