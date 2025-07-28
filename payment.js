// 付款頁面資料
let orderData = null;
let selectedPayment = 'credit';
let selectedInvoice = 'personal';

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    loadOrderData();
    setupCardNumberFormatting();
    setupCardExpiryFormatting();
});

// 載入訂單資料
function loadOrderData() {
    const savedOrder = localStorage.getItem('yinhuOrder');
    if (!savedOrder) {
        alert('沒有找到訂單資料，請重新結帳');
        window.location.href = 'order.html';
        return;
    }
    
    orderData = JSON.parse(savedOrder);
    updateOrderSummary();
}

// 更新訂單摘要
function updateOrderSummary() {
    if (!orderData) return;
    
    const orderItems = document.getElementById('orderItems');
    const subtotalElement = document.getElementById('subtotal');
    const shippingFeeElement = document.getElementById('shippingFee');
    const discountRow = document.getElementById('discountRow');
    const discountAmountElement = document.getElementById('discountAmount');
    const finalTotalElement = document.getElementById('finalTotal');
    
    // 更新訂單項目
    orderItems.innerHTML = orderData.items.map(item => `
        <div class="order-item">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">x${item.quantity}</div>
            </div>
            <div class="item-price">NT$ ${item.price * item.quantity}</div>
        </div>
    `).join('');
    
    // 更新總計
    subtotalElement.textContent = `NT$ ${orderData.subtotal}`;
    shippingFeeElement.textContent = `NT$ ${orderData.shippingFee}`;
    
    // 顯示折扣（如果有）
    if (orderData.discountAmount > 0) {
        discountRow.style.display = 'flex';
        discountAmountElement.textContent = `-NT$ ${orderData.discountAmount}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    finalTotalElement.textContent = `NT$ ${orderData.finalTotal}`;
}

// 選擇付款方式
function selectPayment(paymentType) {
    selectedPayment = paymentType;
    
    // 更新選中的付款方式
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('selected');
    });
    document.querySelector(`[value="${paymentType}"]`).closest('.payment-method').classList.add('selected');
    
    // 顯示/隱藏信用卡表單
    const creditCardSection = document.getElementById('creditCardSection');
    if (paymentType === 'credit') {
        creditCardSection.style.display = 'block';
    } else {
        creditCardSection.style.display = 'none';
    }
}

// 選擇發票類型
function selectInvoice(invoiceType) {
    selectedInvoice = invoiceType;
    
    // 更新選中的發票選項
    document.querySelectorAll('.invoice-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[value="${invoiceType}"]`).closest('.invoice-option').classList.add('selected');
    
    // 顯示/隱藏公司發票表單
    const companyInvoiceForm = document.getElementById('companyInvoiceForm');
    if (invoiceType === 'company') {
        companyInvoiceForm.style.display = 'block';
    } else {
        companyInvoiceForm.style.display = 'none';
    }
}

// 信用卡號碼格式化
function setupCardNumberFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    cardNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
}

// 信用卡有效期限格式化
function setupCardExpiryFormatting() {
    const cardExpiry = document.getElementById('cardExpiry');
    cardExpiry.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
}

// 驗證信用卡資訊
function validateCreditCard() {
    const cardHolderName = document.getElementById('cardHolderName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;
    
    if (!cardHolderName) {
        alert('請輸入持卡人姓名');
        document.getElementById('cardHolderName').focus();
        return false;
    }
    
    if (cardNumber.length !== 16) {
        alert('請輸入正確的信用卡號碼');
        document.getElementById('cardNumber').focus();
        return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        alert('請輸入正確的有效期限格式 (MM/YY)');
        document.getElementById('cardExpiry').focus();
        return false;
    }
    
    if (cardCvv.length < 3) {
        alert('請輸入正確的安全碼');
        document.getElementById('cardCvv').focus();
        return false;
    }
    
    return true;
}

// 驗證公司發票資訊
function validateCompanyInvoice() {
    if (selectedInvoice === 'company') {
        const companyName = document.getElementById('companyName').value.trim();
        const companyTaxId = document.getElementById('companyTaxId').value.trim();
        
        if (!companyName) {
            alert('請輸入公司名稱');
            document.getElementById('companyName').focus();
            return false;
        }
        
        if (companyTaxId.length !== 8) {
            alert('請輸入正確的統一編號');
            document.getElementById('companyTaxId').focus();
            return false;
        }
    }
    
    return true;
}

// 生成訂單編號
function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `YH${year}${month}${day}${random}`;
}

// 處理付款
async function processPayment() {
    if (!orderData) {
        alert('沒有訂單資料');
        return;
    }
    
    // 驗證付款方式
    if (selectedPayment === 'credit' && !validateCreditCard()) {
        return;
    }
    
    // 驗證發票資訊
    if (!validateCompanyInvoice()) {
        return;
    }
    
    // 顯示付款處理遮罩
    document.getElementById('paymentOverlay').style.display = 'flex';
    
    try {
        // 檢查 PaymentService 是否可用
        if (typeof PaymentService === 'undefined' || !PaymentService) {
            console.warn("PaymentService 未初始化，使用模擬付款");
            await simulatePayment();
            return;
        }
        
        // 使用 PaymentService 建立支付訂單
        const paymentResult = await PaymentService.createPaymentOrder(orderData, selectedPayment);
        console.log("支付訂單建立成功:", paymentResult);
        
        // 根據平台處理支付
        const config = PaymentService.getCurrentConfig();
        
        if (currentPlatform === 'stripe') {
            // Stripe 需要特殊處理（使用 Stripe Elements）
            await handleStripePayment(paymentResult);
        } else {
            // 其他平台（綠界、藍新）使用表單提交
            await handleFormPayment(paymentResult.paymentRequest);
        }
        
    } catch (error) {
        console.error("支付處理失敗:", error);
        document.getElementById('paymentOverlay').style.display = 'none';
        alert('支付處理失敗，請稍後再試');
    }
}

// 處理 Stripe 支付
async function handleStripePayment(paymentResult) {
    // 這裡需要實作 Stripe Elements 的整合
    // 暫時使用模擬付款
    console.log("Stripe 支付處理（待實作）");
    await simulatePayment();
}

// 處理表單支付（綠界、藍新）
async function handleFormPayment(paymentRequest) {
    // 建立隱藏表單並提交
    const form = document.createElement('form');
    form.method = paymentRequest.method;
    form.action = paymentRequest.url;
    form.style.display = 'none';
    
    // 添加表單資料
    Object.keys(paymentRequest.data).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentRequest.data[key];
        form.appendChild(input);
    });
    
    // 添加表單到頁面並提交
    document.body.appendChild(form);
    form.submit();
}

// 模擬付款（當 PaymentService 不可用時）
async function simulatePayment() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 生成訂單編號
            const orderNumber = generateOrderNumber();
            
            // 準備完整的訂單資料
            const completeOrder = {
                ...orderData,
                orderNumber: orderNumber,
                paymentMethod: selectedPayment,
                invoiceType: selectedInvoice,
                paymentDate: new Date().toISOString(),
                status: 'paid'
            };
            
            // 儲存訂單到本地
            saveOrderToHistory(completeOrder);
            
            // 清空購物車
            localStorage.removeItem('yinhuCart');
            
            // 跳轉到付款成功頁面
            window.location.href = `payment-success.html?order=${orderNumber}`;
            
            resolve();
        }, 3000);
    });
}

// 儲存訂單到歷史記錄
function saveOrderToHistory(order) {
    let orderHistory = JSON.parse(localStorage.getItem('yinhuOrderHistory') || '[]');
    orderHistory.push(order);
    localStorage.setItem('yinhuOrderHistory', JSON.stringify(orderHistory));
}

// 返回結帳頁面
function goBack() {
    window.location.href = 'checkout.html';
}

// 自動選擇付款方式
document.addEventListener('DOMContentLoaded', function() {
    // 預設選擇信用卡付款
    selectPayment('credit');
    selectInvoice('personal');
}); 