/**
 * 穩定版數據遷移腳本
 * 解決 Firebase 初始化超時問題
 */

const StableMigrationService = (function () {
  let db, auth;
  let isInitialized = false;

  // 更穩定的 Firebase 初始化
  async function initFirebase() {
    if (isInitialized) {
      return true;
    }

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 增加嘗試次數
      const checkInterval = 200; // 增加檢查間隔
      
      const checkFirebase = () => {
        attempts++;
        
        // 檢查 Firebase 是否可用
        if (window.firebase && window.firebase.firestore && window.firebase.auth) {
          try {
            db = window.firebase.firestore();
            auth = window.firebase.auth();
            
            // 測試連接
            db.collection('products').limit(1).get()
              .then(() => {
                isInitialized = true;
                console.log('Firebase 初始化成功');
                resolve(true);
              })
              .catch(error => {
                console.warn('Firebase 連接測試失敗，重試中...', error);
                if (attempts < maxAttempts) {
                  setTimeout(checkFirebase, checkInterval);
                } else {
                  reject(new Error('Firebase 連接失敗'));
                }
              });
          } catch (error) {
            console.warn('Firebase 初始化錯誤，重試中...', error);
            if (attempts < maxAttempts) {
              setTimeout(checkFirebase, checkInterval);
            } else {
              reject(new Error('Firebase 初始化失敗'));
            }
          }
        } else if (attempts < maxAttempts) {
          console.log(`等待 Firebase 載入... (${attempts}/${maxAttempts})`);
          setTimeout(checkFirebase, checkInterval);
        } else {
          reject(new Error('Firebase 載入超時'));
        }
      };
      
      checkFirebase();
    });
  }

  // 檢查數據狀態
  async function checkDataStatus() {
    try {
      await initFirebase();
      console.log('開始檢查數據狀態...');

      // 獲取兩個集合的數據
      const [menuItemsSnapshot, productsSnapshot] = await Promise.all([
        db.collection("menu_items").get(),
        db.collection("products").get()
      ]);

      const menuItemsCount = menuItemsSnapshot.size;
      const productsCount = productsSnapshot.size;

      console.log(`menu_items 集合: ${menuItemsCount} 個項目`);
      console.log(`products 集合: ${productsCount} 個項目`);

      // 檢查是否有重複的商品
      const menuItemIds = new Set();
      const productIds = new Set();

      menuItemsSnapshot.forEach(doc => {
        menuItemIds.add(doc.id);
      });

      productsSnapshot.forEach(doc => {
        productIds.add(doc.id);
      });

      // 找出重複的ID
      const duplicateIds = [];
      for (const id of menuItemIds) {
        if (productIds.has(id)) {
          duplicateIds.push(id);
        }
      }

      // 檢查排序字段
      let productsWithSortOrder = 0;
      let productsWithoutSortOrder = 0;

      productsSnapshot.forEach(doc => {
        const product = doc.data();
        if (product.sortOrder !== undefined && product.sortOrder !== null) {
          productsWithSortOrder++;
        } else {
          productsWithoutSortOrder++;
        }
      });

      return {
        menuItemsCount,
        productsCount,
        duplicateIds: duplicateIds.length,
        productsWithSortOrder,
        productsWithoutSortOrder,
        canMigrate: menuItemsCount > 0 && duplicateIds.length === 0
      };

    } catch (error) {
      console.error('檢查數據狀態失敗:', error);
      throw error;
    }
  }

  // 遷移 menu_items 到 products
  async function migrateMenuItemsToProducts() {
    try {
      await initFirebase();
      console.log('開始遷移 menu_items 到 products...');

      // 先檢查狀態
      const status = await checkDataStatus();
      
      if (!status.canMigrate) {
        if (status.menuItemsCount === 0) {
          return { migrated: 0, skipped: 0, errors: 0, message: '沒有找到 menu_items 數據' };
        }
        if (status.duplicateIds > 0) {
          return { migrated: 0, skipped: 0, errors: 0, message: '發現重複ID，無法遷移' };
        }
      }

      // 獲取所有 menu_items
      const menuItemsSnapshot = await db.collection("menu_items").get();
      console.log(`找到 ${menuItemsSnapshot.size} 個 menu_items`);

      if (menuItemsSnapshot.empty) {
        console.log("沒有找到 menu_items，遷移完成");
        return { migrated: 0, skipped: 0, errors: 0, message: '沒有數據需要遷移' };
      }

      let migrated = 0;
      let skipped = 0;
      let errors = 0;

      // 分批處理，避免批量操作過大
      const batchSize = 10;
      const docs = menuItemsSnapshot.docs;
      
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = db.batch();
        const batchDocs = docs.slice(i, i + batchSize);
        
        for (const doc of batchDocs) {
          try {
            const menuItem = doc.data();
            const menuItemId = doc.id;

            // 檢查是否已存在於 products 集合
            const existingProduct = await db.collection("products").doc(menuItemId).get();
            
            if (existingProduct.exists) {
              console.log(`商品 ${menuItemId} 已存在於 products 集合，跳過`);
              skipped++;
              continue;
            }

            // 轉換數據格式
            const productData = {
              id: menuItemId,
              name: menuItem.name || "未命名商品",
              price: Number(menuItem.price) || 0,
              category: menuItem.category || "未分類",
              description: menuItem.description || "",
              image: menuItem.image || null,
              status: menuItem.isAvailable !== false ? "active" : "inactive",
              sortOrder: Number(menuItem.sortOrder) || 999,
              tags: menuItem.tags || [],
              stock: menuItem.stock || 0,
              views: 0,
              sales: 0,
              createdAt: menuItem.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: menuItem.createdBy || auth.currentUser?.uid || 'system',
              migratedFrom: "menu_items"
            };

            // 添加到批量操作
            const productRef = db.collection("products").doc(menuItemId);
            batch.set(productRef, productData);

            console.log(`準備遷移商品: ${productData.name} (ID: ${menuItemId})`);
            migrated++;

          } catch (error) {
            console.error(`遷移商品 ${doc.id} 失敗:`, error);
            errors++;
          }
        }

        // 執行批量操作
        if (batchDocs.length > 0) {
          await batch.commit();
          console.log(`批量遷移完成: ${batchDocs.length} 個商品`);
        }
      }

      return { migrated, skipped, errors, message: '遷移完成' };

    } catch (error) {
      console.error("遷移失敗:", error);
      throw error;
    }
  }

  // 修復排序值
  async function fixSortOrders() {
    try {
      await initFirebase();
      console.log('開始修復商品排序值...');

      const productsSnapshot = await db.collection("products").get();
      const productsWithoutSortOrder = [];

      productsSnapshot.forEach(doc => {
        const product = doc.data();
        if (product.sortOrder === undefined || product.sortOrder === null) {
          productsWithoutSortOrder.push({
            id: doc.id,
            name: product.name
          });
        }
      });

      console.log(`找到 ${productsWithoutSortOrder.length} 個商品缺少排序值`);

      if (productsWithoutSortOrder.length === 0) {
        console.log("所有商品都有排序值，無需修復");
        return { fixed: 0, message: '無需修復' };
      }

      // 分批更新排序值
      const batchSize = 10;
      let fixed = 0;

      for (let i = 0; i < productsWithoutSortOrder.length; i += batchSize) {
        const batch = db.batch();
        const batchProducts = productsWithoutSortOrder.slice(i, i + batchSize);

        batchProducts.forEach((product, index) => {
          const productRef = db.collection("products").doc(product.id);
          const newSortOrder = (productsSnapshot.size + i + index + 1) * 10;
          batch.update(productRef, {
            sortOrder: newSortOrder,
            updatedAt: new Date().toISOString()
          });
          console.log(`修復商品 ${product.name} 排序值為: ${newSortOrder}`);
          fixed++;
        });

        await batch.commit();
        console.log(`批量修復完成: ${batchProducts.length} 個商品`);
      }

      return { fixed, message: '修復完成' };

    } catch (error) {
      console.error("修復排序值失敗:", error);
      throw error;
    }
  }

  // 清理舊數據
  async function cleanupMenuItems() {
    try {
      await initFirebase();
      console.log('開始清理 menu_items 集合...');

      const menuItemsSnapshot = await db.collection("menu_items").get();
      console.log(`找到 ${menuItemsSnapshot.size} 個 menu_items 待清理`);

      if (menuItemsSnapshot.empty) {
        console.log("沒有找到 menu_items，清理完成");
        return { deleted: 0, message: '無數據需要清理' };
      }

      // 分批刪除
      const batchSize = 10;
      const docs = menuItemsSnapshot.docs;
      let deleted = 0;

      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = db.batch();
        const batchDocs = docs.slice(i, i + batchSize);

        batchDocs.forEach(doc => {
          batch.delete(doc.ref);
          deleted++;
        });

        await batch.commit();
        console.log(`批量刪除完成: ${batchDocs.length} 個 menu_items`);
      }

      return { deleted, message: '清理完成' };

    } catch (error) {
      console.error("清理失敗:", error);
      throw error;
    }
  }

  return {
    initFirebase,
    checkDataStatus,
    migrateMenuItemsToProducts,
    fixSortOrders,
    cleanupMenuItems
  };
})();

// 將服務掛載到全域
window.StableMigrationService = StableMigrationService; 