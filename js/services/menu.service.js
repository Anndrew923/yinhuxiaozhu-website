/**
 * 菜單管理服務
 * 提供動態菜單的 CRUD 操作、圖片管理、幻燈片控制等功能
 */
const MenuService = (function () {
  let db, storage, auth;

  // 等待 Firebase 初始化完成
  async function initFirebase() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkFirebase = () => {
        if (Date.now() - startTime > 10000) {
          reject(new Error("Firebase 初始化超時 (10秒)"));
          return;
        }
        if (window.firebaseDB && window.firebase?.storage && window.firebaseAuth) {
          db = window.firebaseDB;
          storage = window.firebase.storage();
          auth = window.firebaseAuth;
          resolve();
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  // --- 新的 CRUD 功能 for 'menu_items' ---

  // 創建菜單項目
  async function createMenuItem(itemData) {
    try {
      await initFirebase();
      const docRef = db.collection("menu_items").doc();
      const newItem = {
        id: docRef.id,
        name: itemData.name,
        price: Number(itemData.price),
        category: itemData.category,
        description: itemData.description || "",
        image: itemData.image || null,
        isAvailable: itemData.isAvailable !== false,
        sortOrder: Number(itemData.sortOrder) || 999,
        tags: itemData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid || 'system'
      };
      await docRef.set(newItem);
      return newItem;
    } catch (error) {
      console.error("創建菜單項目失敗:", error);
      throw error;
    }
  }

  // 獲取所有菜單項目
  async function getAllMenuItems(options = {}) {
    try {
      await initFirebase();
      let query = db.collection("menu_items");

      // 檢查是否需要複雜查詢
      const needsComplexQuery = (options.category && options.isAvailable !== undefined) || 
                               (options.isAvailable !== undefined && (options.orderBy || 'sortOrder') !== 'sortOrder');

      if (needsComplexQuery) {
        // 使用簡單查詢，在記憶體中進行過濾和排序
        console.log("使用記憶體過濾模式（等待索引建立完成）");
        
        if (options.category) {
          query = query.where("category", "==", options.category);
        }
        
        const snapshot = await query.get();
        const items = [];
        snapshot.forEach((doc) => {
          const item = { id: doc.id, ...doc.data() };
          // 在記憶體中進行過濾
          if (options.isAvailable !== undefined && item.isAvailable !== options.isAvailable) {
            return;
          }
          items.push(item);
        });
        
        // 在記憶體中排序
        const orderBy = options.orderBy || 'sortOrder';
        const orderDirection = options.orderDirection || 'asc';
        items.sort((a, b) => {
          const aVal = a[orderBy] || 999;
          const bVal = b[orderBy] || 999;
          return orderDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
        
        // 應用限制
        if (options.limit) {
          return items.slice(0, options.limit);
        }
        
        return items;
      } else {
        // 使用簡單查詢
        if (options.category) {
          query = query.where("category", "==", options.category);
        }
        if (options.isAvailable !== undefined) {
          query = query.where("isAvailable", "==", options.isAvailable);
        }
        
        const orderBy = options.orderBy || 'sortOrder';
        const orderDirection = options.orderDirection || 'asc';
        query = query.orderBy(orderBy, orderDirection);

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const snapshot = await query.get();
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        return items;
      }
    } catch (error) {
      console.error("獲取所有菜單項目失敗:", error);
      
      // 如果是索引錯誤，嘗試使用記憶體過濾作為備用方案
      if (error.message && error.message.includes('index')) {
        console.log("檢測到索引錯誤，使用備用查詢方案...");
        try {
          // 備用方案：獲取所有項目，在記憶體中處理
          const snapshot = await db.collection("menu_items").get();
          const items = [];
          snapshot.forEach((doc) => {
            const item = { id: doc.id, ...doc.data() };
            
            // 在記憶體中進行過濾
            if (options.category && item.category !== options.category) {
              return;
            }
            if (options.isAvailable !== undefined && item.isAvailable !== options.isAvailable) {
              return;
            }
            items.push(item);
          });
          
          // 在記憶體中排序
          const orderBy = options.orderBy || 'sortOrder';
          const orderDirection = options.orderDirection || 'asc';
          items.sort((a, b) => {
            const aVal = a[orderBy] || 999;
            const bVal = b[orderBy] || 999;
            return orderDirection === 'asc' ? aVal - bVal : bVal - aVal;
          });
          
          // 應用限制
          if (options.limit) {
            return items.slice(0, options.limit);
          }
          
          console.log("備用查詢方案成功，載入", items.length, "個項目");
          return items;
        } catch (backupError) {
          console.error("備用查詢方案也失敗:", backupError);
        }
      }
      
      throw error;
    }
  }

  // 獲取單個菜單項目
  async function getMenuItem(itemId) {
    try {
      await initFirebase();
      const doc = await db.collection("menu_items").doc(itemId).get();
      if (!doc.exists) {
        throw new Error("菜單項目不存在");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error("獲取單個菜單項目失敗:", error);
      throw error;
    }
  }

  // 更新菜單項目
  async function updateMenuItem(itemId, updateData) {
    try {
      await initFirebase();
      const updatePayload = {
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.uid || 'system'
      };
      // 確保不更新 id
      delete updatePayload.id;
      await db.collection("menu_items").doc(itemId).update(updatePayload);
      return await getMenuItem(itemId);
    } catch (error) {
      console.error("更新菜單項目失敗:", error);
      throw error;
    }
  }

  // 刪除菜單項目
  async function deleteMenuItem(itemId) {
    try {
      await initFirebase();
      // 如果有圖片，先從 Storage 刪除
      const item = await getMenuItem(itemId);
      if (item.image && item.image.startsWith('https')) {
         try {
           const imageRef = storage.refFromURL(item.image);
           await imageRef.delete();
         } catch (storageError) {
             console.warn(`刪除菜單圖片失敗: ${storageError.message}. 可能已被刪除或路徑不符。`);
         }
      }
      await db.collection("menu_items").doc(itemId).delete();
      return true;
    } catch (error) {
      console.error("刪除菜單項目失敗:", error);
      throw error;
    }
  }
  
  // 切換上下架狀態
  async function toggleMenuItemAvailability(itemId) {
    try {
      const item = await getMenuItem(itemId);
      const newAvailability = !item.isAvailable;
      await updateMenuItem(itemId, { isAvailable: newAvailability });
      return newAvailability;
    } catch (error) {
      console.error("切換菜單項目上下架失敗:", error);
      throw error;
    }
  }

  // 獲取菜單分類
  async function getMenuCategories() {
    try {
      await initFirebase();
      const snapshot = await db.collection("menu_items").get();
      const categories = new Set();
      snapshot.forEach(doc => {
        const item = doc.data();
        if (item.category) {
          categories.add(item.category);
        }
      });
      const fixedCategories = ['麵食', '飲品'];
      // 合併固定和已存在的分類，確保固定分類總是在
      const allCategories = new Set([...fixedCategories, ...Array.from(categories)]);
      return Array.from(allCategories).sort();
    } catch (error) {
      console.error("獲取菜單分類失敗:", error);
      return ['麵食', '飲品']; // 錯誤時返回預設
    }
  }
  
  // 獲取菜單統計資料
  async function getMenuStats() {
    try {
      await initFirebase();
      const snapshot = await db.collection("menu_items").get();
      const stats = {
        totalCount: snapshot.size,
        noodlesCount: 0,
        drinksCount: 0,
      };
      snapshot.forEach(doc => {
        const item = doc.data();
        if (item.category === '麵食') {
          stats.noodlesCount++;
        } else if (item.category === '飲品') {
          stats.drinksCount++;
        }
      });
      return stats;
    } catch (error) {
      console.error("獲取菜單統計失敗:", error);
      throw { totalCount: '錯誤', noodlesCount: '錯誤', drinksCount: '錯誤' };
    }
  }

  // 上傳圖片到 Firebase Storage
  async function uploadImage(file, category = "menu_images") {
    try {
      await initFirebase();
      
      // 驗證文件
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('請選擇有效的圖片文件');
      }
      
      // 檢查文件大小 (限制為 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('圖片文件大小不能超過 10MB');
      }
      
      // 生成安全的文件名
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const fileName = `${category}/${timestamp}_${randomId}.${fileExtension}`;
      
      const storageRef = storage.ref().child(fileName);
      const snapshot = await storageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      return {
        url: downloadURL,
        path: fileName,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      console.error("圖片上傳失敗:", error);
      throw error;
    }
  }
  
  // --- 舊的幻燈片和完整菜單功能 (保留給其他頁面使用) ---
  
  // 獲取幻燈片商品
  async function getFeaturedProducts(category = null) {
    try {
      await initFirebase();
      let query = db.collection("menu_featured").where("isVisible", "==", true);
      
      if (category) {
        // 如果需要按分類過濾，使用記憶體過濾
        console.log("使用記憶體過濾模式（等待索引建立完成）");
        const snapshot = await query.get();
        const products = [];
        snapshot.forEach((doc) => {
          const product = { id: doc.id, ...doc.data() };
          if (product.category === category) {
            products.push(product);
          }
        });
        
        // 在記憶體中排序
        products.sort((a, b) => (a.order || 999) - (b.order || 999));
        return products;
      } else {
        // 簡單查詢
        query = query.orderBy("order", "asc");
        const snapshot = await query.get();
        const products = [];
        snapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
        return products;
      }
    } catch (error) {
      console.error("獲取幻燈片商品失敗:", error);
      
      // 如果是索引錯誤，提供建立索引的指引
      if (error.message && error.message.includes('index')) {
        console.error("需要建立 Firebase 索引。請查看 FIREBASE_INDEX_SETUP.md 文件");
        console.error("或點擊錯誤訊息中的連結直接建立索引");
      }
      
      throw error;
    }
  }

  // 獲取完整菜單圖片
  async function getFullMenuImage() {
    try {
      await initFirebase();
      const doc = await db.collection("menu_settings").doc("full_menu").get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      console.error("獲取完整菜單圖片失敗:", error);
      throw error;
    }
  }

  // 更新完整菜單圖片
  async function updateFullMenuImage(imageData) {
    try {
      await initFirebase();
      const data = {
        imageUrl: imageData.url,
        imagePath: imageData.path,
        updatedAt: new Date().toISOString(),
        size: imageData.size,
        type: imageData.type,
      };
      await db.collection("menu_settings").doc("full_menu").set(data, { merge: true });
      return data;
    } catch (error) {
      console.error("更新完整菜單圖片失敗:", error);
      throw error;
    }
  }
  
  // 導出所有功能
  return {
    // 新的 'menu_items' CRUD
    createMenuItem,
    getAllMenuItems,
    getMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    getMenuCategories,
    getMenuStats,

    // 通用功能
    uploadImage,
    
    // 舊的保留功能
    getFeaturedProducts,
    getFullMenuImage,
    updateFullMenuImage,
  };
})();

// 將服務掛載到全域
window.MenuService = MenuService;
