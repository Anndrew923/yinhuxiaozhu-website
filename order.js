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
function addToCart(productName, price) {
  // 檢查商品是否已在購物車中
  const existingItem = cart.find((item) => item.name === productName);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: productName,
      price: price,
      quantity: 1,
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
  cartSidebar.classList.toggle("show");
}

// 顯示添加成功提示
function showAddToCartNotification(productName) {
  // 創建提示元素
  const notification = document.createElement("div");
  notification.className = "add-to-cart-notification";
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${productName} 已加入購物車</span>
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
    alert("購物車是空的");
    return;
  }

  // 這裡可以跳轉到結帳頁面
  console.log("跳轉到結帳頁面");
  // window.location.href = "checkout.html";
}

// 跳轉到商品詳情頁面
function goToProduct(productId) {
  console.log("跳轉到商品詳情頁面:", productId);
  // window.location.href = `product.html?id=${productId}`;
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
  const cartFab = document.querySelector(".cart-fab");

  if (
    cartSidebar.classList.contains("show") &&
    !cartSidebar.contains(event.target) &&
    !cartFab.contains(event.target)
  ) {
    cartSidebar.classList.remove("show");
  }
});
