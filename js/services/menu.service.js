/**
 * 菜單管理服務
 * 提供動態菜單的 CRUD 操作、圖片管理、幻燈片控制等功能
 */
const MenuService = (function () {
  let db, storage;

  // 等待 Firebase 初始化完成
  async function initFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        if (window.firebaseDB && window.firebase?.storage) {
          db = window.firebaseDB;
          storage = window.firebase.storage();
          resolve();
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  // 獲取幻燈片商品
  async function getFeaturedProducts(category = null) {
    try {
      await initFirebase();

      let query = db
        .collection("menu_featured")
        .where("isVisible", "==", true)
        .orderBy("order", "asc");

      if (category) {
        query = query.where("category", "==", category);
      }

      const snapshot = await query.get();
      const products = [];

      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return products;
    } catch (error) {
      console.error("獲取幻燈片商品失敗:", error);
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

  // 新增/更新幻燈片商品
  async function updateFeaturedProduct(productData) {
    try {
      await initFirebase();

      const docRef = productData.id
        ? db.collection("menu_featured").doc(productData.id)
        : db.collection("menu_featured").doc();

      const data = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category, // 'drinks' or 'noodles'
        imageUrl: productData.imageUrl,
        badge: productData.badge || null,
        badgeText: productData.badgeText || null,
        isVisible: productData.isVisible !== false,
        order: parseInt(productData.order) || 0,
        updatedAt: new Date().toISOString(),
      };

      if (!productData.id) {
        data.createdAt = new Date().toISOString();
      }

      await docRef.set(data, { merge: true });

      return {
        id: docRef.id,
        ...data,
      };
    } catch (error) {
      console.error("更新幻燈片商品失敗:", error);
      throw error;
    }
  }

  // 刪除幻燈片商品
  async function deleteFeaturedProduct(productId) {
    try {
      await initFirebase();

      await db.collection("menu_featured").doc(productId).delete();
      return true;
    } catch (error) {
      console.error("刪除幻燈片商品失敗:", error);
      throw error;
    }
  }

  // 更新商品順序
  async function updateProductOrder(productId, newOrder) {
    try {
      await initFirebase();

      await db
        .collection("menu_featured")
        .doc(productId)
        .update({
          order: parseInt(newOrder),
          updatedAt: new Date().toISOString(),
        });

      return true;
    } catch (error) {
      console.error("更新商品順序失敗:", error);
      throw error;
    }
  }

  // 上傳圖片到 Firebase Storage
  async function uploadImage(file, category = "products") {
    try {
      await initFirebase();

      // 產生唯一檔名
      const fileName = `${category}/${Date.now()}_${file.name}`;
      const storageRef = storage.ref().child(fileName);

      // 上傳檔案
      const snapshot = await storageRef.put(file);

      // 獲取下載 URL
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

      await db
        .collection("menu_settings")
        .doc("full_menu")
        .set(data, { merge: true });

      return data;
    } catch (error) {
      console.error("更新完整菜單圖片失敗:", error);
      throw error;
    }
  }

  // 批量更新商品順序
  async function batchUpdateOrder(updates) {
    try {
      await initFirebase();

      const batch = db.batch();
      const timestamp = new Date().toISOString();

      updates.forEach(({ id, order }) => {
        const docRef = db.collection("menu_featured").doc(id);
        batch.update(docRef, {
          order: parseInt(order),
          updatedAt: timestamp,
        });
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("批量更新順序失敗:", error);
      throw error;
    }
  }

  // 切換商品可見性
  async function toggleProductVisibility(productId, isVisible) {
    try {
      await initFirebase();

      await db.collection("menu_featured").doc(productId).update({
        isVisible: isVisible,
        updatedAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error("切換商品可見性失敗:", error);
      throw error;
    }
  }

  // 獲取菜單統計資料
  async function getMenuStats() {
    try {
      await initFirebase();

      const [noodlesSnapshot, drinksSnapshot] = await Promise.all([
        db.collection("menu_featured").where("category", "==", "noodles").get(),
        db.collection("menu_featured").where("category", "==", "drinks").get(),
      ]);

      return {
        totalProducts: noodlesSnapshot.size + drinksSnapshot.size,
        noodlesCount: noodlesSnapshot.size,
        drinksCount: drinksSnapshot.size,
        visibleProducts: {
          noodles: noodlesSnapshot.docs.filter((doc) => doc.data().isVisible)
            .length,
          drinks: drinksSnapshot.docs.filter((doc) => doc.data().isVisible)
            .length,
        },
      };
    } catch (error) {
      console.error("獲取菜單統計失敗:", error);
      throw error;
    }
  }

  // 導出所有功能
  return {
    getFeaturedProducts,
    getFullMenuImage,
    updateFeaturedProduct,
    deleteFeaturedProduct,
    updateProductOrder,
    uploadImage,
    updateFullMenuImage,
    batchUpdateOrder,
    toggleProductVisibility,
    getMenuStats,
  };
})();

// 將服務掛載到全域
window.MenuService = MenuService;
