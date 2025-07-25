// 付款成功頁面資料
let orderData = null;

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    loadOrderData();
});

// 載入訂單資料
function loadOrderData() {
    // 從 URL 參數獲取訂單編號
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');
    
    if (!orderNumber) {
        alert('沒有找到訂單資訊');
        window.location.href = 'index.html';
        return;
    }
    
    // 從本地儲存獲取訂單資料
    const orderHistory = JSON.parse(localStorage.getItem('yinhuOrderHistory') || '[]');
    orderData = orderHistory.find(order => order.orderNumber === orderNumber);
    
    if (!orderData) {
        alert('沒有找到訂單資料');
        window.location.href = 'index.html';
        return;
    }
    
    displayOrderInfo();
}

// 顯示訂單資訊
function displayOrderInfo() {
    if (!orderData) return;
    
    // 訂單資訊
    document.getElementById('orderNumber').textContent = orderData.orderNumber;
    document.getElementById('orderAmount').textContent = `NT$ ${orderData.finalTotal}`;
    document.getElementById('paymentMethod').textContent = getPaymentMethodText(orderData.paymentMethod);
    document.getElementById('paymentTime').textContent = formatDateTime(orderData.paymentDate);
    
    // 配送資訊
    document.getElementById('customerName').textContent = orderData.customer.name;
    document.getElementById('customerPhone').textContent = orderData.customer.phone;
    document.getElementById('deliveryAddress').textContent = 
        `${orderData.customer.address}, ${orderData.customer.city}${orderData.customer.district}`;
    document.getElementById('deliveryMethod').textContent = getDeliveryMethodText(orderData.delivery);
    
    // 訂單商品
    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = orderData.items.map(item => `
        <div class="order-item">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">x${item.quantity}</div>
            </div>
            <div class="item-price">NT$ ${item.price * item.quantity}</div>
        </div>
    `).join('');
}

// 取得付款方式文字
function getPaymentMethodText(method) {
    const methods = {
        'credit': '信用卡付款',
        'linepay': 'Line Pay',
        'cod': '貨到付款'
    };
    return methods[method] || method;
}

// 取得配送方式文字
function getDeliveryMethodText(method) {
    const methods = {
        'home': '宅配到府',
        'convenience': '超商取貨',
        'pickup': '門市自取'
    };
    return methods[method] || method;
}

// 格式化日期時間
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 查看訂單歷史
function viewOrderHistory() {
    // 跳轉到訂單歷史頁面
    window.location.href = 'order-history.html';
}

// 返回首頁
function goToHome() {
    window.location.href = 'index.html';
} 