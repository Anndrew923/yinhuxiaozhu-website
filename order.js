// 購物車資料結構
let cart = [];
let cartTotal = 0;
let products = []; // 新增：商品數據陣列
let currentCategory = "all"; // 新增：當前選中的分類

// 初始化頁面
document.addEventListener("DOMContentLoaded", function () {
  // 從 localStorage 載入購物車資料
  loadCartFromStorage();
  updateCartDisplay();

  // 載入商品數據
  loadProducts();

  // 綁定分類選單點擊事件
  bindCategoryEvents();

  // 綁定搜尋功能
  bindSearchEvents();

  // 設置滾動隱藏功能
  setupScrollHide();
});

// 新增：從 Firebase 載入商品數據
async function loadProducts() {
  try {
    console.log("開始載入商品數據...");

    // 顯示載入狀態
    showLoadingState();

    // 從 Firestore 獲取商品數據
    const db = firebase.firestore();
    const snapshot = await db
      .collection("products")
      .where("status", "==", "active") // 只載入上架的商品
      .orderBy("createdAt", "desc") // 按建立時間排序
      .get();

    products = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`成功載入 ${products.length} 個商品`);

    // 載入分類數據
    await loadCategories();

    // 渲染商品列表
    renderProducts();
  } catch (error) {
    console.error("載入商品失敗:", error);
    showErrorState("載入商品失敗，請重新整理頁面");
  }
}

// 新增：從 Firebase 載入分類數據
async function loadCategories() {
  try {
    console.log("開始載入分類數據...");

    const db = firebase.firestore();
    const snapshot = await db
      .collection("productCategories")
      .orderBy("order", "asc")
      .get();

    const categories = [];
    snapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`成功載入 ${categories.length} 個分類`);

    // 更新分類選單
    renderCategories(categories);
  } catch (error) {
    console.error("載入分類失敗:", error);
    // 如果載入分類失敗，使用預設分類
    renderDefaultCategories();
  }
}

// 新增：渲染分類選單
function renderCategories(categories) {
  const categoryMenu = document.getElementById("categoryMenu");

  // 創建分類 HTML
  const categoriesHTML = categories
    .map(
      (category) => `
    <div class="category-item" data-category="${category.id}">
      ${category.icon} ${category.name}
    </div>
  `
    )
    .join("");

  // 添加「全部」選項
  const allCategoriesHTML = `
    <div class="category-item active" data-category="all">全部</div>
    ${categoriesHTML}
  `;

  categoryMenu.innerHTML = allCategoriesHTML;

  // 重新綁定分類事件
  bindCategoryEvents();
}

// 新增：渲染預設分類（當 Firebase 載入失敗時使用）
function renderDefaultCategories() {
  const categoryMenu = document.getElementById("categoryMenu");
  categoryMenu.innerHTML = `
    <div class="category-item active" data-category="all">全部</div>
    <div class="category-item" data-category="frozen-foods">❄️ 冷凍</div>
    <div class="category-item" data-category="room-temperature">📦 常溫</div>
    <div class="category-item" data-category="sauces">🥫 醬料</div>
    <div class="category-item" data-category="gift-sets">🎁 禮盒</div>
    <div class="category-item" data-category="seasonal">🌸 季節限定</div>
    <div class="category-item" data-category="new-products">🆕 新品</div>
    <div class="category-item" data-category="promotions">🏷️ 特價</div>
  `;

  // 重新綁定分類事件
  bindCategoryEvents();
}

// 新增：顯示載入狀態
function showLoadingState() {
  const productsGrid = document.querySelector(".products-grid");
  productsGrid.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>載入商品中...</p>
    </div>
  `;
}

// 新增：顯示錯誤狀態
function showErrorState(message) {
  const productsGrid = document.querySelector(".products-grid");
  productsGrid.innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message}</p>
      <button onclick="loadProducts()" class="retry-btn">重新載入</button>
    </div>
  `;
}

// 新增：渲染商品列表
function renderProducts(filteredProducts = null) {
  const productsGrid = document.querySelector(".products-grid");
  const productsToRender = filteredProducts || products;

  if (productsToRender.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>暫無商品</p>
      </div>
    `;
    return;
  }

  const productsHTML = productsToRender
    .map((product) => {
      const categoryName = getCategoryName(product.category);
      return `
      <div class="product-card" onclick="goToProduct('${product.id}')">
        <div class="product-image">
          ${
            product.image
              ? `<img src="${product.image}" alt="${product.name}" onerror="this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-image\\'></i></div>'">`
              : `<div class="placeholder-image">
              <i class="fas fa-image"></i>
            </div>`
          }
          <div class="product-labels">
            ${categoryName ? `<span class="label">${categoryName}</span>` : ""}
            ${
              product.stock <= 0
                ? '<span class="label-warning">缺貨</span>'
                : ""
            }
          </div>
        </div>
        <div class="product-info">
          <h4 class="product-name">${product.name}</h4>
          <p class="product-desc">${product.description || ""}</p>
          <div class="product-price">
            <span class="price">NT$ ${product.price.toLocaleString()}</span>
            ${
              product.originalPrice && product.originalPrice > product.price
                ? `<span class="original-price">NT$ ${product.originalPrice.toLocaleString()}</span>`
                : ""
            }
            <button 
              class="add-to-cart" 
              onclick="event.stopPropagation(); addToCart('${product.name}', ${
        product.price
      })"
              ${product.stock <= 0 ? "disabled" : ""}
            >
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  productsGrid.innerHTML = productsHTML;
}

// 載入購物車資料
function loadCartFromStorage() {
  const savedCart = localStorage.getItem("yinhuCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    calculateCartTotal();
  }
}

// 儲存購物車資料
function saveCartToStorage() {
  localStorage.setItem("yinhuCart", JSON.stringify(cart));
}

// 添加商品到購物車
function addToCart(productName, price, quantity = 1) {
  // 檢查商品是否已在購物車中
  const existingItem = cart.find((item) => item.name === productName);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      name: productName,
      price: price,
      quantity: quantity,
    });
  }

  // 更新購物車顯示
  updateCartDisplay();
  saveCartToStorage();

  // 顯示添加成功提示
  showAddToCartNotification(productName, quantity);
}

// 從購物車移除商品
function removeFromCart(productName) {
  cart = cart.filter((item) => item.name !== productName);
  updateCartDisplay();
  saveCartToStorage();
}

// 更新商品數量
function updateQuantity(productName, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productName);
    return;
  }

  const item = cart.find((item) => item.name === productName);
  if (item) {
    item.quantity = newQuantity;
    updateCartDisplay();
    saveCartToStorage();
  }
}

// 計算購物車總價
function calculateCartTotal() {
  cartTotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

// 更新購物車顯示
function updateCartDisplay() {
  calculateCartTotal();

  // 更新購物車數量徽章
  const cartBadge = document.getElementById("cartBadge");
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartBadge.textContent = totalItems;

  // 更新購物車側邊欄
  const cartItems = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">購物車是空的</div>';
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>NT$ ${item.price.toLocaleString()}</p>
          </div>
          <div class="cart-item-controls">
            <button onclick="updateQuantity('${item.name}', ${
          item.quantity - 1
        })">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity('${item.name}', ${
          item.quantity + 1
        })">+</button>
            <button class="remove-btn" onclick="removeFromCart('${item.name}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `
      )
      .join("");
  }

  cartTotalElement.textContent = `NT$ ${cartTotal.toLocaleString()}`;
}

// 切換購物車側邊欄
function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  if (cartSidebar) {
    cartSidebar.classList.toggle("show");
  } else {
    console.error('購物車側邊欄元素不存在');
  }
}

// 顯示通知
function showNotification(message, type = 'success') {
  const notification = document.createElement("div");
  notification.className = `add-to-cart-notification ${type}`;
  
  const icon = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  notification.innerHTML = `
    <i class="${icon}"></i>
    <span>${message}</span>
  `;

  // 添加到頁面
  document.body.appendChild(notification);

  // 顯示動畫
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // 自動隱藏
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// 顯示添加成功提示
function showAddToCartNotification(productName, quantity = 1) {
  const message = `${productName} ${quantity > 1 ? `x${quantity}` : ''} 已加入購物車`;
  showNotification(message, 'success');
}

// 綁定分類選單點擊事件
function bindCategoryEvents() {
  const categoryItems = document.querySelectorAll(".category-item");
  categoryItems.forEach((item) => {
    item.addEventListener("click", function () {
      // 移除所有 active 類別
      categoryItems.forEach((i) => i.classList.remove("active"));
      // 添加 active 類別到當前項目
      this.classList.add("active");

      // 獲取分類 ID
      const categoryId = this.getAttribute("data-category");
      currentCategory = categoryId;

      // 篩選商品
      filterProductsByCategory(categoryId);
    });
  });
}

// 綁定搜尋功能
function bindSearchEvents() {
  const searchInput = document.querySelector(".search-bar input");
  let searchTimeout;

  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = this.value.trim();
      filterProductsBySearch(searchTerm);
    }, 300);
  });
}

// 根據分類篩選商品
function filterProductsByCategory(categoryId) {
  let filteredProducts = products;

  if (categoryId !== "all") {
    // 根據分類 ID 篩選
    filteredProducts = products.filter((product) => {
      return product.category === categoryId;
    });
  }

  renderProducts(filteredProducts);
}

// 根據搜尋詞篩選商品
function filterProductsBySearch(searchTerm) {
  if (!searchTerm) {
    // 如果搜尋詞為空，根據當前分類顯示
    filterProductsByCategory(currentCategory);
    return;
  }

  // 先根據當前分類篩選
  let filteredProducts = products;
  if (currentCategory !== "all") {
    filteredProducts = products.filter((product) => {
      return product.category === currentCategory;
    });
  }

  // 再根據搜尋詞篩選
  filteredProducts = filteredProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  renderProducts(filteredProducts);
}

// 新增：獲取分類名稱
function getCategoryName(categoryId) {
  const categoryMap = {
    "frozen-foods": "冷凍",
    "room-temperature": "常溫",
    sauces: "醬料",
    "gift-sets": "禮盒",
    seasonal: "季節限定",
    "new-products": "新品",
    promotions: "特價",
  };
  return categoryMap[categoryId] || categoryId;
}

// 結帳功能
function checkout() {
  if (cart.length === 0) {
    showNotification("購物車是空的，請先添加商品", "error");
    return;
  }

  // 跳轉到結帳頁面
  window.location.href = "checkout.html";
}

// 顯示商品詳情模態視窗
function goToProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) {
    console.error('找不到商品:', productId);
    return;
  }
  
  showProductDetail(product);
}

// 商品詳情模態視窗相關變數
let currentModalProduct = null;
let modalQuantity = 1;

// 顯示商品詳情
function showProductDetail(product) {
  currentModalProduct = product;
  modalQuantity = 1;
  
  // 更新模態視窗內容
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalCurrentPrice').textContent = `NT$ ${product.price.toLocaleString()}`;
  
  // 處理原價顯示
  const originalPriceElement = document.getElementById('modalOriginalPrice');
  if (product.originalPrice && product.originalPrice > product.price) {
    originalPriceElement.textContent = `NT$ ${product.originalPrice.toLocaleString()}`;
    originalPriceElement.style.display = 'inline';
  } else {
    originalPriceElement.style.display = 'none';
  }
  
  // 設定商品圖片
  const productImage = document.getElementById('modalProductImage');
  if (product.image) {
    productImage.src = product.image;
    productImage.alt = product.name;
    productImage.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaaguaZguWcluePuzwvdGV4dD48L3N2Zz4=';
    };
  } else {
    productImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaaguaZguWcluePuzwvdGV4dD48L3N2Zz4=';
  }
  
  // 設定基本描述
  document.getElementById('modalProductDescription').textContent = product.description || '暫無描述';
  
  // 設定詳細說明
  const detailedDescSection = document.getElementById('detailedDescriptionSection');
  if (product.detailedDescription && product.detailedDescription.trim()) {
    document.getElementById('modalDetailedDescription').textContent = product.detailedDescription;
    detailedDescSection.style.display = 'block';
  } else {
    detailedDescSection.style.display = 'none';
  }
  
  // 設定商品規格
  const specsSection = document.getElementById('productSpecs');
  let hasSpecs = false;
  
  // 處理規格項目的顯示
  const specItems = [
    { id: 'specificationItem', contentId: 'modalSpecification', value: product.specification },
    { id: 'originItem', contentId: 'modalOrigin', value: product.origin },
    { id: 'storageMethodItem', contentId: 'modalStorageMethod', value: product.storageMethod },
    { id: 'shelfLifeItem', contentId: 'modalShelfLife', value: product.shelfLife }
  ];
  
  specItems.forEach(item => {
    const element = document.getElementById(item.id);
    const contentElement = document.getElementById(item.contentId);
    
    if (item.value && item.value.trim()) {
      contentElement.textContent = item.value;
      element.style.display = 'flex';
      hasSpecs = true;
    } else {
      contentElement.textContent = '';
      element.style.display = 'none';
    }
  });
  
  specsSection.style.display = hasSpecs ? 'block' : 'none';
  
  // 設定成分說明
  const ingredientsSection = document.getElementById('ingredientsSection');
  if (product.ingredients && product.ingredients.trim()) {
    document.getElementById('modalIngredients').textContent = product.ingredients;
    ingredientsSection.style.display = 'block';
  } else {
    ingredientsSection.style.display = 'none';
  }
  
  // 設定過敏原資訊
  const allergensSection = document.getElementById('allergensSection');
  if (product.allergens && product.allergens.trim()) {
    document.getElementById('modalAllergens').textContent = product.allergens;
    allergensSection.style.display = 'block';
  } else {
    allergensSection.style.display = 'none';
  }
  
  // 設定注意事項
  const noticeSection = document.getElementById('noticeSection');
  if (product.noticeItems && product.noticeItems.length > 0) {
    const noticeList = document.getElementById('modalNoticeList');
    noticeList.innerHTML = product.noticeItems.map(notice => `<li>${notice}</li>`).join('');
    noticeSection.style.display = 'block';
  } else {
    noticeSection.style.display = 'none';
  }
  
  // 重置數量
  document.getElementById('modalQuantity').textContent = modalQuantity;
  
  // 顯示模態視窗
  document.getElementById('productDetailModal').classList.add('show');
  document.body.style.overflow = 'hidden'; // 防止背景滾動
}

// 關閉商品詳情模態視窗
function closeProductDetail() {
  document.getElementById('productDetailModal').classList.remove('show');
  document.body.style.overflow = ''; // 恢復背景滾動
  currentModalProduct = null;
  modalQuantity = 1;
}

// 改變模態視窗中的數量
function changeModalQuantity(delta) {
  const newQuantity = modalQuantity + delta;
  if (newQuantity >= 1 && newQuantity <= 99) {
    modalQuantity = newQuantity;
    document.getElementById('modalQuantity').textContent = modalQuantity;
  }
}

// 從模態視窗加入購物車
function addToCartFromModal() {
  if (!currentModalProduct) return;
  
  // 檢查庫存
  if (currentModalProduct.stock <= 0) {
    showNotification('商品已售完', 'error');
    return;
  }
  
  // 加入購物車
  addToCart(currentModalProduct.name, currentModalProduct.price, modalQuantity);
  
  // 關閉模態視窗
  closeProductDetail();
}

// 跳轉到首頁
function goToHome() {
  window.location.href = "index.html";
}

// 跳轉到特色頁面
function goToFeatured() {
  console.log("跳轉到特色頁面");
  // window.location.href = "featured.html";
}

// 跳轉到會員頁面
function goToMember() {
  window.location.href = "member.html";
}

// 跳轉到結帳頁面
function goToCheckout() {
  // 檢查購物車是否有商品
  if (cart.length === 0) {
    showNotification('購物車是空的，請先添加商品', 'error');
    return;
  }
  
  // 跳轉到結帳頁面
  window.location.href = "checkout.html";
}

// 設置滾動隱藏功能
function setupScrollHide() {
  let lastScrollTop = 0;
  const header = document.getElementById("orderHeader");

  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // 向下滾動
      header.style.transform = "translateY(-100%)";
    } else {
      // 向上滾動
      header.style.transform = "translateY(0)";
    }

    lastScrollTop = scrollTop;
  });
}

// 點擊購物車外部關閉側邊欄
document.addEventListener("click", function (event) {
  const cartSidebar = document.getElementById("cartSidebar");
  const cartButton = document.querySelector(".nav-item.active"); // 底部導航的購物車按鈕

  if (
    cartSidebar &&
    cartSidebar.classList.contains("show") &&
    !cartSidebar.contains(event.target) &&
    cartButton &&
    !cartButton.contains(event.target)
  ) {
    cartSidebar.classList.remove("show");
  }
});
