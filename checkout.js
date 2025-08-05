// 結帳頁面資料
let cart = [];
let cartTotal = 0;
let shippingFee = 150; // 預設宅配運費
let selectedDelivery = "home";
let appliedCoupon = null;
let discountAmount = 0;

// 將重要變數設為全域可訪問，供 AuthService 使用
window.shippingFee = shippingFee;
window.selectedDelivery = selectedDelivery;
window.appliedCoupon = appliedCoupon;
window.discountAmount = discountAmount;

// 運費設定
const shippingFees = {
  home: 150, // 宅配到府
  convenience: 80, // 超商取貨
  pickup: 0, // 門市自取
};

// 優惠券資料庫
const coupons = {
  WELCOME100: {
    code: "WELCOME100",
    name: "新會員優惠",
    discount: 100,
    minAmount: 500,
    type: "fixed",
  },
  SAVE20: {
    code: "SAVE20",
    name: "全館9折",
    discount: 0.1,
    minAmount: 300,
    type: "percentage",
  },
  FREESHIP: {
    code: "FREESHIP",
    name: "免運費",
    discount: "shipping",
    minAmount: 800,
    type: "shipping",
  },
};

// 初始化頁面
document.addEventListener("DOMContentLoaded", function () {
  loadCartFromStorage();
  updateOrderSummary();
  loadSavedAddress();
});

// 載入購物車資料
function loadCartFromStorage() {
  const savedCart = localStorage.getItem("yinhuCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    calculateCartTotal();
  }
}

// 計算購物車總價
function calculateCartTotal() {
  cartTotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  
  // 更新全域變數
  window.cartTotal = cartTotal;
}

// 更新訂單摘要
function updateOrderSummary() {
  const orderItems = document.getElementById("orderItems");
  const subtotalElement = document.getElementById("subtotal");
  const shippingFeeElement = document.getElementById("shippingFee");
  const finalTotalElement = document.getElementById("finalTotal");

  // 更新訂單項目
  if (cart.length === 0) {
    orderItems.innerHTML =
      '<p style="text-align: center; color: #999; padding: 20px;">購物車是空的</p>';
  } else {
    orderItems.innerHTML = cart
      .map(
        (item) => `
            <div class="order-item">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">x${item.quantity}</div>
                </div>
                <div class="item-price">NT$ ${item.price * item.quantity}</div>
            </div>
        `
      )
      .join("");
  }

  // 計算總計
  const subtotal = cartTotal;
  const finalTotal = subtotal + shippingFee - discountAmount;

  // 更新顯示
  subtotalElement.textContent = `NT$ ${subtotal}`;
  shippingFeeElement.textContent = `NT$ ${shippingFee}`;
  finalTotalElement.textContent = `NT$ ${finalTotal}`;
}

// 選擇配送方式
function selectDelivery(deliveryType) {
  selectedDelivery = deliveryType;
  shippingFee = shippingFees[deliveryType];

  // 更新全域變數
  window.selectedDelivery = selectedDelivery;
  window.shippingFee = shippingFee;

  // 更新選中的配送方式
  document.querySelectorAll(".delivery-option").forEach((option) => {
    option.classList.remove("selected");
  });
  document
    .querySelector(`[value="${deliveryType}"]`)
    .closest(".delivery-option")
    .classList.add("selected");

  // 重新計算總計
  updateOrderSummary();
}

// 應用優惠券
function applyCoupon() {
  const couponCode = document
    .getElementById("couponCode")
    .value.trim()
    .toUpperCase();
  const coupon = coupons[couponCode];

  if (!coupon) {
    alert("優惠券代碼無效");
    return;
  }

  if (cartTotal < coupon.minAmount) {
    alert(`訂單金額需滿 NT$ ${coupon.minAmount} 才能使用此優惠券`);
    return;
  }

  // 計算折扣金額
  if (coupon.type === "fixed") {
    discountAmount = coupon.discount;
  } else if (coupon.type === "percentage") {
    discountAmount = Math.floor(cartTotal * coupon.discount);
  } else if (coupon.type === "shipping") {
    discountAmount = shippingFee;
  }

  appliedCoupon = coupon;

  // 更新全域變數
  window.appliedCoupon = appliedCoupon;
  window.discountAmount = discountAmount;

  // 顯示已使用的優惠券
  document.getElementById(
    "couponText"
  ).textContent = `${coupon.name} - NT$ ${discountAmount}`;
  document.getElementById("couponApplied").style.display = "flex";
  document.getElementById("couponCode").value = "";

  // 更新總計
  updateOrderSummary();

  alert(`優惠券使用成功！折扣 NT$ ${discountAmount}`);
}

// 移除優惠券
function removeCoupon() {
  appliedCoupon = null;
  discountAmount = 0;

  // 更新全域變數
  window.appliedCoupon = appliedCoupon;
  window.discountAmount = discountAmount;

  document.getElementById("couponApplied").style.display = "none";
  updateOrderSummary();
}

// 載入已儲存的地址
function loadSavedAddress() {
  const savedAddress = localStorage.getItem("yinhuAddress");
  if (savedAddress) {
    const address = JSON.parse(savedAddress);
    document.getElementById("customerName").value = address.name || "";
    document.getElementById("customerPhone").value = address.phone || "";
    document.getElementById("customerAddress").value = address.address || "";
    document.getElementById("customerCity").value = address.city || "";
    document.getElementById("customerDistrict").value = address.district || "";
  }
}

// 儲存地址
function saveAddress() {
  const address = {
    name: document.getElementById("customerName").value,
    phone: document.getElementById("customerPhone").value,
    address: document.getElementById("customerAddress").value,
    city: document.getElementById("customerCity").value,
    district: document.getElementById("customerDistrict").value,
  };

  localStorage.setItem("yinhuAddress", JSON.stringify(address));
}

// 將 saveAddress 設為全域可訪問
window.saveAddress = saveAddress;

// 驗證表單
function validateForm() {
  const requiredFields = [
    "customerName",
    "customerPhone",
    "customerAddress",
    "customerCity",
    "customerDistrict",
  ];

  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      alert(`請填寫${field.placeholder}`);
      field.focus();
      return false;
    }
  }

  // 驗證電話號碼格式
  const phone = document.getElementById("customerPhone").value;
  const phoneRegex = /^09\d{8}$/;
  if (!phoneRegex.test(phone)) {
    alert("請輸入正確的手機號碼格式");
    document.getElementById("customerPhone").focus();
    return false;
  }

  return true;
}

// 前往付款頁面
async function proceedToPayment() {
  if (cart.length === 0) {
    alert("購物車是空的，請先添加商品");
    return;
  }

  if (!validateForm()) {
    return;
  }

  // 檢查是否應該顯示註冊邀請（最後一次機會）
  if (typeof AuthService !== 'undefined' && AuthService) {
    try {
      const shouldShow = await AuthService.shouldShowSignupPrompt();
      if (shouldShow) {
        AuthService.showSignupPrompt();
        return;
      }
    } catch (error) {
      console.warn("檢查註冊邀請時發生錯誤:", error);
      // 繼續執行，不阻擋用戶結帳
    }
  }

  // 儲存地址
  saveAddress();

  // 準備訂單資料
  const orderData = {
    items: cart,
    subtotal: cartTotal,
    shippingFee: shippingFee,
    discountAmount: discountAmount,
    finalTotal: cartTotal + shippingFee - discountAmount,
    delivery: selectedDelivery,
    customer: {
      name: document.getElementById("customerName").value,
      phone: document.getElementById("customerPhone").value,
      address: document.getElementById("customerAddress").value,
      city: document.getElementById("customerCity").value,
      district: document.getElementById("customerDistrict").value,
    },
    note: document.getElementById("orderNote").value,
    coupon: appliedCoupon,
  };

  // 儲存訂單資料到 localStorage
  localStorage.setItem("yinhuOrder", JSON.stringify(orderData));

  // 跳轉到付款頁面
  window.location.href = "payment.html";
}

// 返回購物車
function goBack() {
  window.location.href = "order.html";
}

// 自動選擇配送方式
document.addEventListener("DOMContentLoaded", function () {
  // 預設選擇宅配
  selectDelivery("home");
});
