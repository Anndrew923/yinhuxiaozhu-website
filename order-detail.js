// 訂單詳情頁面資料
let orderData = null;

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    loadOrderDetail();
});

// 載入訂單詳情
function loadOrderDetail() {
    const orderNumber = localStorage.getItem('viewOrderNumber');
    if (!orderNumber) {
        alert('沒有找到訂單資訊');
        window.location.href = 'order-history.html';
        return;
    }
    
    // 從本地儲存獲取訂單資料
    const orderHistory = JSON.parse(localStorage.getItem('yinhuOrderHistory') || '[]');
    orderData = orderHistory.find(order => order.orderNumber === orderNumber);
    
    if (!orderData) {
        alert('沒有找到訂單資料');
        window.location.href = 'order-history.html';
        return;
    }
    
    displayOrderDetail();
}

// 顯示訂單詳情
function displayOrderDetail() {
    if (!orderData) return;
    
    // 更新頁面標題
    document.title = `訂單 ${orderData.orderNumber} | 隱湖小竹`;
    
    // 更新訂單狀態
    updateOrderStatus();
    
    // 更新訂單資訊
    document.getElementById('orderNumber').textContent = orderData.orderNumber;
    document.getElementById('orderDate').textContent = formatDateTime(orderData.paymentDate);
    document.getElementById('paymentMethod').textContent = getPaymentMethodText(orderData.paymentMethod);
    document.getElementById('paymentAmount').textContent = `NT$ ${orderData.finalTotal}`;
    
    // 更新配送資訊
    document.getElementById('customerName').textContent = orderData.customer.name;
    document.getElementById('customerPhone').textContent = orderData.customer.phone;
    document.getElementById('deliveryAddress').textContent = 
        `${orderData.customer.address}, ${orderData.customer.city}${orderData.customer.district}`;
    document.getElementById('deliveryMethod').textContent = getDeliveryMethodText(orderData.delivery);
    
    // 更新訂單商品
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
    
    // 更新訂單摘要
    document.getElementById('subtotal').textContent = `NT$ ${orderData.subtotal}`;
    document.getElementById('shippingFee').textContent = `NT$ ${orderData.shippingFee}`;
    
    if (orderData.discountAmount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discountAmount').textContent = `-NT$ ${orderData.discountAmount}`;
    }
    
    document.getElementById('finalTotal').textContent = `NT$ ${orderData.finalTotal}`;
    
    // 顯示備註（如果有）
    if (orderData.note && orderData.note.trim()) {
        document.getElementById('noteSection').style.display = 'block';
        document.getElementById('orderNote').textContent = orderData.note;
    }
}

// 更新訂單狀態
function updateOrderStatus() {
    const orderDate = new Date(orderData.paymentDate);
    const now = new Date();
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    
    const statusElement = document.getElementById('orderStatus');
    const statusDescElement = document.getElementById('orderStatusDesc');
    const statusIcon = document.querySelector('.status-icon i');
    
    if (daysDiff <= 1) {
        statusElement.textContent = '訂單處理中';
        statusDescElement.textContent = '我們正在為您準備商品';
        statusIcon.className = 'fas fa-clock';
        statusIcon.style.color = '#ff9800';
    } else if (daysDiff <= 3) {
        statusElement.textContent = '商品已出貨';
        statusDescElement.textContent = '您的商品正在配送中';
        statusIcon.className = 'fas fa-truck';
        statusIcon.style.color = '#2196f3';
    } else {
        statusElement.textContent = '訂單已完成';
        statusDescElement.textContent = '您的訂單已成功送達';
        statusIcon.className = 'fas fa-check-circle';
        statusIcon.style.color = '#4caf50';
    }
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

// 再次購買
function reorder() {
    if (!orderData) return;
    
    // 將訂單商品加入購物車
    const cart = orderData.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
    }));
    
    localStorage.setItem('yinhuCart', JSON.stringify(cart));
    
    // 跳轉到購物車頁面
    window.location.href = 'order.html';
}

// 聯繫客服
function contactSupport() {
    alert('客服專線：0800-123-456\n客服信箱：service@yinhu.com\n服務時間：週一至週五 9:00-18:00');
} 