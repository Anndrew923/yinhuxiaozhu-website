// js/services/product.service.js
// Product Service：商品管理服務
const ProductService = (() => {
  // 等待 Firebase 初始化完成
  function waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        if (window.firebaseAuth && window.firebaseDB) {
          resolve();
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  let auth, db;

  // 初始化 Firebase 實例
  async function initFirebase() {
    await waitForFirebase();
    auth = window.firebaseAuth;
    db = window.firebaseDB;
    
    if (!auth) {
      console.error("Firebase Auth 未初始化");
      return false;
    }

    if (!db) {
      console.error("Firebase Firestore 未初始化");
      return false;
    }
    
    return true;
  }

  // 商品資料結構驗證
  function validateProductData(productData) {
    const required = ['name', 'price', 'category'];
    for (const field of required) {
      if (!productData[field]) {
        throw new Error(`必填欄位 ${field} 不能為空`);
      }
    }
    
    if (typeof productData.price !== 'number' || productData.price <= 0) {
      throw new Error('價格必須是大於0的數字');
    }
    
    return true;
  }

  // 生成商品ID
  function generateProductId() {
    return 'product_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 創建商品
  async function createProduct(productData) {
    try {
      await initFirebase();
      
      // 驗證資料
      validateProductData(productData);
      
      // 生成唯一ID
      const productId = generateProductId();
      
      // 準備商品資料
      const product = {
        id: productId,
        name: productData.name.trim(),
        description: productData.description?.trim() || '',
        price: Number(productData.price),
        category: productData.category.trim(),
        image: productData.image || null,
        isAvailable: productData.isAvailable !== false, // 預設上架
        sortOrder: productData.sortOrder || 999,
        tags: productData.tags || [],
        stock: productData.stock || null,
        allergens: productData.allergens || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid || 'system'
      };

      // 儲存到 Firestore
      await db.collection('products').doc(productId).set(product);
      
      console.log('商品創建成功:', productId);
      return product;
      
    } catch (error) {
      console.error('創建商品失敗:', error);
      throw error;
    }
  }

  // 獲取所有商品
  async function getAllProducts(options = {}) {
    try {
      console.log('ProductService: 開始獲取商品列表，選項:', options);
      await initFirebase();
      console.log('ProductService: Firebase 初始化完成');
      
      let query = db.collection('products');
      console.log('ProductService: 創建查詢');
      
      // 篩選選項
      if (options.category) {
        console.log('ProductService: 添加分類篩選:', options.category);
        query = query.where('category', '==', options.category);
      }
      
      if (options.isAvailable !== undefined) {
        console.log('ProductService: 添加上架狀態篩選:', options.isAvailable);
        query = query.where('isAvailable', '==', options.isAvailable);
      }
      
      // 排序
      const orderBy = options.orderBy || 'sortOrder';
      const orderDirection = options.orderDirection || 'asc';
      console.log('ProductService: 設定排序:', orderBy, orderDirection);
      query = query.orderBy(orderBy, orderDirection);
      
      // 限制數量
      if (options.limit) {
        console.log('ProductService: 設定數量限制:', options.limit);
        query = query.limit(options.limit);
      }
      
      console.log('ProductService: 執行查詢...');
      const snapshot = await query.get();
      console.log('ProductService: 查詢完成，文檔數量:', snapshot.size);
      
      const products = [];
      
      snapshot.forEach(doc => {
        const productData = doc.data();
        console.log('ProductService: 處理商品:', doc.id, productData.name);
        products.push({
          id: doc.id,
          ...productData
        });
      });
      
      console.log('ProductService: 返回商品列表，總數:', products.length);
      return products;
      
    } catch (error) {
      console.error('ProductService: 獲取商品列表失敗:', error);
      console.error('ProductService: 錯誤詳情:', error.message);
      console.error('ProductService: 錯誤堆疊:', error.stack);
      throw error;
    }
  }

  // 獲取單個商品
  async function getProduct(productId) {
    try {
      await initFirebase();
      
      const doc = await db.collection('products').doc(productId).get();
      
      if (!doc.exists) {
        throw new Error('商品不存在');
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
      
    } catch (error) {
      console.error('獲取商品失敗:', error);
      throw error;
    }
  }

  // 更新商品
  async function updateProduct(productId, updateData) {
    try {
      await initFirebase();
      
      // 檢查商品是否存在
      const existingProduct = await getProduct(productId);
      
      // 驗證更新資料
      if (updateData.name || updateData.price || updateData.category) {
        const dataToValidate = {
          name: updateData.name || existingProduct.name,
          price: updateData.price || existingProduct.price,
          category: updateData.category || existingProduct.category
        };
        validateProductData(dataToValidate);
      }
      
      // 準備更新資料
      const updatePayload = {
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.uid || 'system'
      };
      
      // 移除不能直接更新的欄位
      delete updatePayload.id;
      delete updatePayload.createdAt;
      delete updatePayload.createdBy;
      
      // 更新商品
      await db.collection('products').doc(productId).update(updatePayload);
      
      console.log('商品更新成功:', productId);
      return await getProduct(productId);
      
    } catch (error) {
      console.error('更新商品失敗:', error);
      throw error;
    }
  }

  // 刪除商品
  async function deleteProduct(productId) {
    try {
      await initFirebase();
      
      // 檢查商品是否存在
      await getProduct(productId);
      
      // 刪除商品
      await db.collection('products').doc(productId).delete();
      
      console.log('商品刪除成功:', productId);
      return true;
      
    } catch (error) {
      console.error('刪除商品失敗:', error);
      throw error;
    }
  }

  // 上架/下架商品
  async function toggleProductAvailability(productId) {
    try {
      const product = await getProduct(productId);
      const newAvailability = !product.isAvailable;
      
      await updateProduct(productId, { 
        isAvailable: newAvailability 
      });
      
      console.log(`商品${newAvailability ? '上架' : '下架'}成功:`, productId);
      return newAvailability;
      
    } catch (error) {
      console.error('切換商品狀態失敗:', error);
      throw error;
    }
  }

  // 獲取所有分類
  async function getCategories() {
    try {
      await initFirebase();
      
      const snapshot = await db.collection('products').get();
      const categories = new Set();
      
      snapshot.forEach(doc => {
        const product = doc.data();
        if (product.category) {
          categories.add(product.category);
        }
      });
      
      return Array.from(categories).sort();
      
    } catch (error) {
      console.error('獲取分類失敗:', error);
      throw error;
    }
  }

  // 更新商品排序
  async function updateProductSort(productId, sortOrder) {
    try {
      await updateProduct(productId, { sortOrder: Number(sortOrder) });
      console.log('商品排序更新成功:', productId, sortOrder);
      return true;
    } catch (error) {
      console.error('更新商品排序失敗:', error);
      throw error;
    }
  }

  // 批量更新商品排序
  async function batchUpdateSort(sortUpdates) {
    try {
      await initFirebase();
      
      const batch = db.batch();
      
      sortUpdates.forEach(update => {
        const productRef = db.collection('products').doc(update.productId);
        batch.update(productRef, { 
          sortOrder: Number(update.sortOrder),
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser?.uid || 'system'
        });
      });
      
      await batch.commit();
      console.log('批量排序更新成功');
      return true;
      
    } catch (error) {
      console.error('批量排序更新失敗:', error);
      throw error;
    }
  }

  // ==========
  // 預留的擴展接口
  // ==========

  // 庫存管理 (未來擴展)
  async function updateStock(productId, quantity) {
    // TODO: 實現庫存管理
    console.log('庫存管理功能待實現');
  }

  // 商品統計 (未來擴展)
  async function getProductStats(productId) {
    // TODO: 實現商品統計
    console.log('商品統計功能待實現');
  }

  // 標籤管理 (未來擴展)
  async function manageTags(productId, tags) {
    // TODO: 實現標籤管理
    console.log('標籤管理功能待實現');
  }

  // 批量操作 (未來擴展)
  async function batchOperations(operations) {
    // TODO: 實現批量操作
    console.log('批量操作功能待實現');
  }

  return {
    // 核心功能
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    
    // 分類和排序
    getCategories,
    updateProductSort,
    batchUpdateSort,
    
    // 工具函數
    validateProductData,
    generateProductId,
    
    // 預留接口
    updateStock,
    getProductStats,
    manageTags,
    batchOperations
  };
})();

// 設為全域可訪問
window.ProductService = ProductService;