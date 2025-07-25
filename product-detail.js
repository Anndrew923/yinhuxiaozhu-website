// 商品資料庫
const products = {
  'gift-box': {
    id: 'gift-box',
    name: '禮盒',
    price: 540,
    originalPrice: 600,
    description: '精選六款招牌商品，包含冷凍餛飩、鮮蝦餛飩、炸醬包、肉燥包、辣椒醬等，是送禮自用的最佳選擇。',
    spec: '一盒六入',
    storageMethod: '冷凍保存 -18°C以下',
    expiryDate: '冷凍保存6個月',
    origin: '台灣',
    ingredients: '麵粉、豬肉、蝦仁、蔥、薑、蒜、醬油、辣椒、食用油等',
    images: ['assets/gift-box.jpg'],
    labels: ['主打', '熱銷'],
    notice: [
      '請保持冷凍狀態',
      '解凍後請盡快食用',
      '過敏原：麩質、蝦類',
      '素食者請注意成分'
    ]
  },
  'wonton': {
    id: 'wonton',
    name: '冷凍餛飩',
    price: 120,
    originalPrice: 120,
    description: '手工包製的傳統餛飩，皮薄餡多，口感滑嫩，湯頭鮮美。',
    spec: '12顆/盒',
    storageMethod: '冷凍保存 -18°C以下',
    expiryDate: '冷凍保存6個月',
    origin: '台灣',
    ingredients: '麵粉、豬肉、蔥、薑、醬油、鹽、胡椒粉',
    images: ['assets/wonton.jpg'],
    labels: ['冷凍'],
    notice: [
      '請保持冷凍狀態',
      '解凍後請盡快食用',
      '過敏原：麩質'
    ]
  },
  'shrimp-wonton': {
    id: 'shrimp-wonton',
    name: '冷凍鮮蝦餛飩',
    price: 150,
    originalPrice: 150,
    description: '選用新鮮蝦仁製作的餛飩，蝦味濃郁，口感彈牙。',
    spec: '12顆/盒',
    storageMethod: '冷凍保存 -18°C以下',
    expiryDate: '冷凍保存6個月',
    origin: '台灣',
    ingredients: '麵粉、蝦仁、豬肉、蔥、薑、醬油、鹽',
    images: ['assets/shrimp-wonton.jpg'],
    labels: ['冷凍'],
    notice: [
      '請保持冷凍狀態',
      '解凍後請盡快食用',
      '過敏原：麩質、蝦類'
    ]
  },
  'zhajiang-sauce': {
    id: 'zhajiang-sauce',
    name: '炸醬冷凍包',
    price: 90,
    originalPrice: 90,
    description: '傳統炸醬配方，香濃可口，適合拌麵或炒菜使用。',
    spec: '250克/包,約2-3人份',
    storageMethod: '冷凍保存 -18°C以下',
    expiryDate: '冷凍保存3個月',
    origin: '台灣',
    ingredients: '豬肉、豆干、甜麵醬、醬油、蔥、薑、蒜、食用油',
    images: ['assets/zhajiang-sauce.jpg'],
    labels: ['醬料'],
    notice: [
      '請保持冷凍狀態',
      '解凍後請盡快食用',
      '可加熱後直接使用'
    ]
  },
  'minced-pork-sauce': {
    id: 'minced-pork-sauce',
    name: '肉燥冷凍包',
    price: 90,
    originalPrice: 90,
    description: '香濃肉燥，肥瘦適中，是拌飯拌麵的最佳選擇。',
    spec: '250克/包,約2-3人份',
    storageMethod: '冷凍保存 -18°C以下',
    expiryDate: '冷凍保存3個月',
    origin: '台灣',
    ingredients: '豬肉、醬油、蔥、薑、蒜、五香粉、食用油',
    images: ['assets/minced-pork-sauce.jpg'],
    labels: ['醬料'],
    notice: [
      '請保持冷凍狀態',
      '解凍後請盡快食用',
      '可加熱後直接使用'
    ]
  },
  'chili-sauce': {
    id: 'chili-sauce',
    name: '自製辣椒醬',
    price: 80,
    originalPrice: 80,
    description: '手工製作的辣椒醬，香辣過癮，是調味的最佳選擇。',
    spec: '200克/瓶',
    storageMethod: '冷藏保存 4°C以下',
    expiryDate: '冷藏保存1年',
    origin: '台灣',
    ingredients: '辣椒、蒜、薑、鹽、糖、醋、食用油',
    images: ['assets/chili-sauce.jpg'],
    labels: ['醬料'],
    notice: [
      '請冷藏保存',
      '不可素食',
      '過敏原：辣椒'
    ]
  }
};

// 購物車資料
let cart = [];
let cartTotal = 0;
let currentQuantity = 1;
let currentProduct = null;

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 從 URL 獲取商品 ID
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'gift-box';
    
    // 載入商品資料
    loadProduct(productId);
    
    // 載入購物車
    loadCartFromStorage();
    updateCartDisplay();
});

// 載入商品資料
function loadProduct(productId) {
    const product = products[productId];
    if (!product) {
        alert('商品不存在');
        return;
    }
    
    currentProduct = product;
    
    // 更新頁面標題
    document.title = `${product.name} | 隱湖小竹`;
    
    // 更新商品圖片
    const productImage = document.getElementById('productImage');
    productImage.src = product.images[0];
    productImage.alt = product.name;
    
    // 更新商品名稱
    document.getElementById('productName').textContent = product.name;
    
    // 更新價格
    document.getElementById('currentPrice').textContent = `NT$ ${product.price}`;
    if (product.originalPrice > product.price) {
        document.getElementById('originalPrice').textContent = `NT$ ${product.originalPrice}`;
        document.getElementById('originalPrice').style.display = 'inline';
    } else {
        document.getElementById('originalPrice').style.display = 'none';
    }
    
    // 更新商品說明
    document.getElementById('productDescription').textContent = product.description;
    
    // 更新商品詳情
    document.getElementById('productSpec').textContent = product.spec;
    document.getElementById('storageMethod').textContent = product.storageMethod;
    document.getElementById('expiryDate').textContent = product.expiryDate;
    document.getElementById('origin').textContent = product.origin;
    
    // 更新成分說明
    document.getElementById('ingredients').textContent = product.ingredients;
    
    // 更新標籤
    const labelsContainer = document.getElementById('productLabels');
    labelsContainer.innerHTML = product.labels.map(label => 
        `<span class="label">${label}</span>`
    ).join('');
    
    // 更新注意事項
    const noticeList = document.getElementById('noticeList');
    noticeList.innerHTML = product.notice.map(notice => 
        `<li>${notice}</li>`
    ).join('');
    
    // 更新縮圖
    updateThumbnails(product.images);
}

// 更新縮圖
function updateThumbnails(images) {
    const thumbnailsContainer = document.getElementById('imageThumbnails');
    if (images.length <= 1) {
        thumbnailsContainer.style.display = 'none';
        return;
    }
    
    thumbnailsContainer.innerHTML = images.map((image, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${image}', this)">
            <img src="${image}" alt="商品圖片 ${index + 1}" />
        </div>
    `).join('');
}

// 切換主圖片
function changeMainImage(imageSrc, thumbnailElement) {
    document.getElementById('productImage').src = imageSrc;
    
    // 更新縮圖狀態
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnailElement.classList.add('active');
}

// 改變數量
function changeQuantity(delta) {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
        currentQuantity = newQuantity;
        document.getElementById('quantity').textContent = currentQuantity;
    }
}

// 從詳情頁加入購物車
function addToCartFromDetail() {
    if (!currentProduct) return;
    
    const existingItem = cart.find(item => item.name === currentProduct.name);
    
    if (existingItem) {
        existingItem.quantity += currentQuantity;
    } else {
        cart.push({
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: currentQuantity
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    
    // 顯示成功提示
    showAddToCartNotification(currentProduct.name);
    
    // 重置數量
    currentQuantity = 1;
    document.getElementById('quantity').textContent = '1';
}

// 立即購買
function buyNow() {
    if (!currentProduct) return;
    
    // 先加入購物車
    addToCartFromDetail();
    
    // 跳轉到結帳頁面
    alert('立即購買功能開發中...\n\n商品：' + currentProduct.name + '\n數量：' + currentQuantity + '\n總價：NT$ ' + (currentProduct.price * currentQuantity));
}

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

// 計算購物車總價
function calculateCartTotal() {
    cartTotal = cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// 更新購物車顯示
function updateCartDisplay() {
    calculateCartTotal();
    
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
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

// 更新商品數量
function updateQuantity(productName, newQuantity) {
    if (newQuantity <= 0) {
        cart = cart.filter(item => item.name !== productName);
    } else {
        const item = cart.find(item => item.name === productName);
        if (item) {
            item.quantity = newQuantity;
        }
    }
    updateCartDisplay();
    saveCartToStorage();
}

// 切換購物車側邊欄
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('open');
}

// 顯示添加成功提示
function showAddToCartNotification(productName) {
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 結帳功能
function checkout() {
    if (cart.length === 0) {
        alert('購物車是空的，請先添加商品');
        return;
    }
    
    alert('結帳功能開發中...\n\n訂單總計：NT$ ' + cartTotal);
} 