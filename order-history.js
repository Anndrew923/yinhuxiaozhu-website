// 訂單歷史頁面資料
let allOrders = [];
let currentFilter = 'all';

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    loadOrderHistory();
});

// 載入訂單歷史
function loadOrderHistory() {
    const savedOrders = localStorage.getItem('yinhuOrderHistory');
    if (savedOrders) {
        allOrders = JSON.parse(savedOrders);
        // 按日期排序，最新的在前
        allOrders.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    }
    
    displayOrders();
}

// 顯示訂單
function displayOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    const emptyState = document.getElementById('emptyState');
    
    // 篩選訂單
    let filteredOrders = allOrders;
    if (currentFilter !== 'all') {
        filteredOrders = allOrders.filter(order => {
            // 這裡可以根據實際需求設定訂單狀態
            // 目前所有訂單都是 'paid' 狀態，可以模擬不同狀態
            const orderDate = new Date(order.paymentDate);
            const now = new Date();
            const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
            
            switch (currentFilter) {
                case 'pending':
                    return daysDiff <= 1; // 1天內為待處理
                case 'shipped':
                    return daysDiff > 1 && daysDiff <= 3; // 1-3天為已出貨
                case 'completed':
                    return daysDiff > 3; // 3天以上為已完成
                default:
                    return true;
            }
        });
    }
    
    if (filteredOrders.length === 0) {
        ordersContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    ordersContainer.style.display = 'block';
    emptyState.style.display = 'none';
    
    ordersContainer.innerHTML = filteredOrders.map(order => `
        <div class="order-card" onclick="viewOrderDetail('${order.orderNumber}')">
            <div class="order-header">
                <div class="order-number">訂單編號：${order.orderNumber}</div>
                <div class="order-status ${getOrderStatusClass(order)}">${getOrderStatusText(order)}</div>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-quantity">x${item.quantity}</div>
                        </div>
                        <div class="item-price">NT$ ${item.price * item.quantity}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-footer">
                <div class="order-total">
                    <span>總計：</span>
                    <span class="total-amount">NT$ ${order.finalTotal}</span>
                </div>
                <div class="order-date">${formatDate(order.paymentDate)}</div>
            </div>
        </div>
    `).join('');
}

// 篩選訂單
function filterOrders(filter) {
    currentFilter = filter;
    
    // 更新篩選標籤狀態
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayOrders();
}

// 取得訂單狀態文字
function getOrderStatusText(order) {
    const orderDate = new Date(order.paymentDate);
    const now = new Date();
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
        return '待處理';
    } else if (daysDiff <= 3) {
        return '已出貨';
    } else {
        return '已完成';
    }
}

// 取得訂單狀態樣式類別
function getOrderStatusClass(order) {
    const orderDate = new Date(order.paymentDate);
    const now = new Date();
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
        return 'status-pending';
    } else if (daysDiff <= 3) {
        return 'status-shipped';
    } else {
        return 'status-completed';
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 查看訂單詳情
function viewOrderDetail(orderNumber) {
    // 儲存要查看的訂單編號
    localStorage.setItem('viewOrderNumber', orderNumber);
    // 跳轉到訂單詳情頁面
    window.location.href = 'order-detail.html';
}

// 導航功能
function goToHome() {
    window.location.href = 'index.html';
}

function goToFeatured() {
    window.location.href = 'order.html';
}

function goToCart() {
    window.location.href = 'order.html';
}

function goToMember() {
    window.location.href = 'member.html';
}

function goToShop() {
    window.location.href = 'order.html';
} 