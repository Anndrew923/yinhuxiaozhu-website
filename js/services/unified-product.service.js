/**
 * 統一商品服務
 * 確保前台訂餐頁面和管理員商品管理頁面使用相同的數據源和排序邏輯
 */
const UnifiedProductService = (function () {
  let db, auth;

  // 等待 Firebase 初始化完成
  async function initFirebase() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkFirebase = () => {
        if (Date.now() - startTime > 10000) {
          reject(new Error("Firebase 初始化超時 (10秒)"));
          return;
        }
        if (window.firebaseDB && window.firebaseAuth) {
          db = window.firebaseDB;
          auth = window.firebaseAuth;
          resolve();
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  // 獲取商品列表（統一接口）
  async function getProducts(options = {}) {
    try {
      await initFirebase();
      
      const {
        category = null,
        status = null,
        isAvailable = null, // 兼容舊接口
        searchTerm = "",
        sortBy = "sortOrder",
        sortOrder = "asc",
        limit = null,
        lastDoc = null,
      } = options;

      console.log("UnifiedProductService: 開始獲取商品列表，選項:", options);

      let query = db.collection("products");

      // 統一狀態字段處理
      let actualStatus = status;
      if (isAvailable !== null && status === null) {
        actualStatus = isAvailable ? "active" : "inactive";
      }

      // 簡化查詢邏輯，避免複合索引問題
      // 先獲取所有商品，然後在客戶端進行篩選和排序
      console.log("UnifiedProductService: 開始查詢商品...");
      
      const snapshot = await query.get();
      console.log(`UnifiedProductService: 查詢完成，獲取到 ${snapshot.size} 個商品`);
      
      let products = [];

      snapshot.forEach((doc) => {
        const productData = doc.data();
        console.log("UnifiedProductService: 處理商品:", doc.id, productData.name, "狀態:", productData.status);
        products.push({
          id: doc.id,
          ...productData,
        });
      });

      // 客戶端篩選
      if (actualStatus && actualStatus !== "all") {
        console.log("UnifiedProductService: 按狀態篩選:", actualStatus);
        products = products.filter(product => product.status === actualStatus);
        console.log("UnifiedProductService: 篩選後商品數量:", products.length);
      }

      if (category && category !== "all") {
        console.log("UnifiedProductService: 按分類篩選:", category);
        products = products.filter(product => product.category === category);
        console.log("UnifiedProductService: 篩選後商品數量:", products.length);
      }

      // 客戶端搜尋
      if (searchTerm) {
        console.log("UnifiedProductService: 按搜尋詞篩選:", searchTerm);
        const searchLower = searchTerm.toLowerCase();
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            (product.description &&
              product.description.toLowerCase().includes(searchLower))
        );
        console.log("UnifiedProductService: 搜尋後商品數量:", products.length);
      }

      // 客戶端排序
      console.log("UnifiedProductService: 按", sortBy, sortOrder, "排序");
      products.sort((a, b) => {
        let aValue = a[sortBy] || 999;
        let bValue = b[sortBy] || 999;
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // 分頁處理
      if (limit && products.length > limit) {
        products = products.slice(0, limit);
      }

      console.log("UnifiedProductService: 最終返回商品數量:", products.length);
      
      return {
        products,
        lastDoc: lastDoc,
        hasMore: limit ? products.length === limit : false,
      };
    } catch (error) {
      console.error("UnifiedProductService: 獲取商品列表失敗:", error);
      throw error;
    }
  }

  // 獲取前台菜單商品（兼容舊接口）
  async function getMenuProducts(options = {}) {
    try {
      // 轉換參數以兼容舊接口
      const convertedOptions = {
        ...options,
        status: options.isAvailable !== undefined ? (options.isAvailable ? "active" : "inactive") : null
      };
      
      const result = await getProducts(convertedOptions);
      
      // 轉換返回格式以兼容舊接口
      return result.products.map(product => ({
        ...product,
        isAvailable: product.status === "active" // 添加兼容字段
      }));
    } catch (error) {
      console.error("UnifiedProductService: 獲取菜單商品失敗:", error);
      throw error;
    }
  }

  // 獲取單一商品詳情
  async function getProduct(productId) {
    try {
      await initFirebase();
      const doc = await db.collection("products").doc(productId).get();
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }
      throw new Error("商品不存在");
    } catch (error) {
      console.error("UnifiedProductService: 獲取商品詳情失敗:", error);
      throw error;
    }
  }

  // 創建新商品
  async function createProduct(productData) {
    try {
      await initFirebase();
      
      // 驗證必要字段
      if (!productData.name || !productData.name.trim()) {
        throw new Error("商品名稱不能為空");
      }
      
      if (!productData.price || parseFloat(productData.price) <= 0) {
        throw new Error("商品價格必須大於0");
      }

      const newProduct = {
        ...productData,
        name: productData.name.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: productData.status || productData.isAvailable !== false ? "active" : "inactive",
        stock: parseInt(productData.stock) || 0,
        price: parseFloat(productData.price) || 0,
        originalPrice: parseFloat(productData.originalPrice) || 0,
        sortOrder: parseInt(productData.sortOrder) || 999,
        views: 0,
        sales: 0,
        createdBy: auth.currentUser?.uid || 'system'
      };

      // 驗證排序值
      if (newProduct.sortOrder < 1 || newProduct.sortOrder > 9999) {
        newProduct.sortOrder = 999;
      }

      const docRef = await db.collection("products").add(newProduct);
      return {
        id: docRef.id,
        ...newProduct,
      };
    } catch (error) {
      console.error("UnifiedProductService: 創建商品失敗:", error);
      throw error;
    }
  }

  // 更新商品
  async function updateProduct(productId, updateData) {
    try {
      await initFirebase();
      
      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.uid || 'system'
      };

      // 統一狀態字段處理
      if (updateData.isAvailable !== undefined) {
        updates.status = updateData.isAvailable ? "active" : "inactive";
        delete updates.isAvailable;
      }

      // 確保數字類型正確
      if (updates.stock !== undefined) {
        updates.stock = parseInt(updates.stock) || 0;
      }
      if (updates.price !== undefined) {
        updates.price = parseFloat(updates.price) || 0;
      }
      if (updates.originalPrice !== undefined) {
        updates.originalPrice = parseFloat(updates.originalPrice) || 0;
      }

      await db.collection("products").doc(productId).update(updates);
      return await getProduct(productId);
    } catch (error) {
      console.error("UnifiedProductService: 更新商品失敗:", error);
      throw error;
    }
  }

  // 刪除商品
  async function deleteProduct(productId) {
    try {
      await initFirebase();
      await db.collection("products").doc(productId).delete();
      return true;
    } catch (error) {
      console.error("UnifiedProductService: 刪除商品失敗:", error);
      throw error;
    }
  }

  // 批量更新商品排序
  async function batchUpdateSort(sortUpdates) {
    try {
      await initFirebase();
      
      // 驗證輸入數據
      if (!Array.isArray(sortUpdates) || sortUpdates.length === 0) {
        throw new Error("無效的排序數據");
      }

      // 驗證每個排序更新
      for (const update of sortUpdates) {
        if (!update.productId || !update.sortOrder) {
          throw new Error("排序數據格式錯誤");
        }
        
        const sortOrder = Number(update.sortOrder);
        if (isNaN(sortOrder) || sortOrder < 1 || sortOrder > 9999) {
          throw new Error(`商品 ${update.productId} 的排序值無效: ${update.sortOrder}`);
        }
      }

      const batch = db.batch();

      sortUpdates.forEach((update) => {
        const productRef = db.collection("products").doc(update.productId);
        batch.update(productRef, {
          sortOrder: Number(update.sortOrder),
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser?.uid || 'system'
        });
      });

      await batch.commit();
      console.log(`UnifiedProductService: 批量更新 ${sortUpdates.length} 個商品排序`);
      return true;
    } catch (error) {
      console.error("UnifiedProductService: 批量更新商品排序失敗:", error);
      throw error;
    }
  }

  // 獲取商品分類
  async function getCategories() {
    try {
      await initFirebase();
      const snapshot = await db.collection("products").get();
      const categories = new Set();
      
      snapshot.forEach(doc => {
        const product = doc.data();
        if (product.category) {
          categories.add(product.category);
        }
      });
      
      return Array.from(categories).sort();
    } catch (error) {
      console.error("UnifiedProductService: 獲取商品分類失敗:", error);
      throw error;
    }
  }

  // 獲取商品統計數據
  async function getProductStats() {
    try {
      await initFirebase();
      const snapshot = await db.collection("products").get();

      let totalProducts = 0;
      let activeProducts = 0;
      let outOfStockProducts = 0;
      let lowStockProducts = 0;

      snapshot.forEach((doc) => {
        const product = doc.data();
        totalProducts++;

        if (product.status === "active") {
          activeProducts++;
        }

        if (product.stock === 0) {
          outOfStockProducts++;
        } else if (product.stock <= (product.stockWarningThreshold || 10)) {
          lowStockProducts++;
        }
      });

      return {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        lowStockProducts,
      };
    } catch (error) {
      console.error("UnifiedProductService: 獲取商品統計失敗:", error);
      throw error;
    }
  }

  return {
    // 核心功能
    getProducts,
    getMenuProducts, // 兼容舊接口
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    batchUpdateSort,
    
    // 輔助功能
    getCategories,
    getProductStats,
  };
})();

// 將服務掛載到全域
window.UnifiedProductService = UnifiedProductService; 