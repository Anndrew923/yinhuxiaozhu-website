/**
 * 數據遷移腳本：將 menu_items 集合遷移到 products 集合
 * 確保前台訂餐頁面和管理員商品管理頁面使用相同的數據源
 */

const MigrationService = (function () {
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

  // 遷移 menu_items 到 products
  async function migrateMenuItemsToProducts() {
    try {
      await initFirebase();
      console.log("開始遷移 menu_items 到 products...");

      // 獲取所有 menu_items
      const menuItemsSnapshot = await db.collection("menu_items").get();
      console.log(`找到 ${menuItemsSnapshot.size} 個 menu_items`);

      if (menuItemsSnapshot.empty) {
        console.log("沒有找到 menu_items，遷移完成");
        return { migrated: 0, skipped: 0, errors: 0 };
      }

      let migrated = 0;
      let skipped = 0;
      let errors = 0;

      // 批量處理
      const batch = db.batch();

      for (const doc of menuItemsSnapshot.docs) {
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
            status: menuItem.isAvailable !== false ? "active" : "inactive", // 轉換狀態字段
            sortOrder: Number(menuItem.sortOrder) || 999,
            tags: menuItem.tags || [],
            stock: menuItem.stock || 0,
            views: 0,
            sales: 0,
            createdAt: menuItem.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: menuItem.createdBy || auth.currentUser?.uid || 'system',
            migratedFrom: "menu_items" // 標記來源
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
      if (migrated > 0) {
        await batch.commit();
        console.log(`批量遷移完成: ${migrated} 個商品`);
      }

      return { migrated, skipped, errors };

    } catch (error) {
      console.error("遷移失敗:", error);
      throw error;
    }
  }

  // 驗證遷移結果
  async function validateMigration() {
    try {
      await initFirebase();
      console.log("開始驗證遷移結果...");

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

      console.log(`重複的商品ID: ${duplicateIds.length} 個`);
      if (duplicateIds.length > 0) {
        console.log("重複ID列表:", duplicateIds);
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

      console.log(`有排序值的商品: ${productsWithSortOrder} 個`);
      console.log(`無排序值的商品: ${productsWithoutSortOrder} 個`);

      return {
        menuItemsCount,
        productsCount,
        duplicateIds: duplicateIds.length,
        productsWithSortOrder,
        productsWithoutSortOrder
      };

    } catch (error) {
      console.error("驗證失敗:", error);
      throw error;
    }
  }

  // 清理舊的 menu_items 集合（可選）
  async function cleanupMenuItems() {
    try {
      await initFirebase();
      console.log("開始清理 menu_items 集合...");

      const menuItemsSnapshot = await db.collection("menu_items").get();
      console.log(`找到 ${menuItemsSnapshot.size} 個 menu_items 待清理`);

      if (menuItemsSnapshot.empty) {
        console.log("沒有找到 menu_items，清理完成");
        return { deleted: 0 };
      }

      // 批量刪除
      const batch = db.batch();
      let deleted = 0;

      menuItemsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        deleted++;
      });

      await batch.commit();
      console.log(`清理完成: 刪除 ${deleted} 個 menu_items`);

      return { deleted };

    } catch (error) {
      console.error("清理失敗:", error);
      throw error;
    }
  }

  // 修復排序值
  async function fixSortOrders() {
    try {
      await initFirebase();
      console.log("開始修復商品排序值...");

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
        return { fixed: 0 };
      }

      // 批量更新排序值
      const batch = db.batch();
      let fixed = 0;

      productsWithoutSortOrder.forEach((product, index) => {
        const productRef = db.collection("products").doc(product.id);
        const newSortOrder = (productsSnapshot.size + index + 1) * 10;
        batch.update(productRef, {
          sortOrder: newSortOrder,
          updatedAt: new Date().toISOString()
        });
        console.log(`修復商品 ${product.name} 排序值為: ${newSortOrder}`);
        fixed++;
      });

      await batch.commit();
      console.log(`修復完成: ${fixed} 個商品`);

      return { fixed };

    } catch (error) {
      console.error("修復排序值失敗:", error);
      throw error;
    }
  }

  return {
    migrateMenuItemsToProducts,
    validateMigration,
    cleanupMenuItems,
    fixSortOrders
  };
})();

// 將服務掛載到全域
window.MigrationService = MigrationService; 