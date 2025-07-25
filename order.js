// 購物車資料結構
let cart = [];
let cartTotal = 0;

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 從 localStorage 載入購物車資料
    loadCartFromStorage();
    updateCartDisplay();
    
    // 綁定分類選單點擊事件
    bindCategoryEvents();
    
    // 綁定搜尋功能
    bindSearchEvents();
});

// 載入購物車資料
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('yinhuCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        calculateCartTotal();
    }
}

// 儲存購物車資料
function saveCartToStorage() {
    localStorage.setItem('yinhuCart', JSON.stringify(cart));
}

// 添加商品到購物車
function addToCart(productName, price) {
    // 檢查商品是否已在購物車中
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    // 更新購物車顯示
    updateCartDisplay();
    saveCartToStorage();
    
    // 顯示添加成功提示
    showAddToCartNotification(productName);
}

// 從購物車移除商品
function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartDisplay();
    saveCartToStorage();
}

// 更新商品數量
function updateQuantity(productName, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productName);
        return;
    }
    
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity = newQuantity;
        updateCartDisplay();
        saveCartToStorage();
    }
}

// 計算購物車總價
function calculateCartTotal() {
    cartTotal = cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// 更新購物車顯示
function updateCartDisplay() {
    calculateCartTotal();
    
    // 更新購物車數量
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // 更新購物車側邊欄
    const cartItems = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">購物車是空的</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">NT$ ${item.price}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
                </div>
            </div>
        `).join('');
    }
    
    cartTotalElement.textContent = `NT$ ${cartTotal}`;
}

// 切換購物車側邊欄
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('open');
}

// 顯示添加成功提示
function showAddToCartNotification(productName) {
    // 建立提示元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = `已添加 ${productName} 到購物車`;
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒後自動移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 綁定分類選單事件
function bindCategoryEvents() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他項目的 active 狀態
            categoryItems.forEach(cat => cat.classList.remove('active'));
            // 添加當前項目的 active 狀態
            this.classList.add('active');
            
            // 這裡可以添加篩選商品的邏輯
            filterProductsByCategory(this.textContent);
        });
    });
}

// 綁定搜尋事件
function bindSearchEvents() {
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterProductsBySearch(searchTerm);
    });
}

// 根據分類篩選商品
function filterProductsByCategory(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const labels = card.querySelectorAll('.label');
        let shouldShow = false;
        
        labels.forEach(label => {
            if (label.textContent === category) {
                shouldShow = true;
            }
        });
        
        if (category === '特價' || category === '新品') {
            // 這裡可以添加特價和新品的邏輯
            shouldShow = true;
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

// 根據搜尋關鍵字篩選商品
function filterProductsBySearch(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        const productDesc = card.querySelector('.product-desc').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 結帳功能
function checkout() {
    if (cart.length === 0) {
        alert('購物車是空的，請先添加商品');
        return;
    }
    
    // 這裡可以添加結帳邏輯
    // 例如：跳轉到結帳頁面或顯示結帳表單
    alert('結帳功能開發中...\n\n訂單總計：NT$ ' + cartTotal);
    
    // 清空購物車（測試用）
    // cart = [];
    // updateCartDisplay();
    // saveCartToStorage();
}

// 跳轉到商品詳情頁
function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// 點擊購物車外部關閉側邊欄
document.addEventListener('click', function(event) {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartFab = document.querySelector('.cart-fab');
    
    if (cartSidebar.classList.contains('open') && 
        !cartSidebar.contains(event.target) && 
        !cartFab.contains(event.target)) {
        cartSidebar.classList.remove('open');
    }
}); 