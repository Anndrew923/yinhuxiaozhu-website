/**
 * 管理員商品管理服務
 * 提供商品的 CRUD 操作、庫存管理、分類管理等功能
 */
const AdminProductService = (function () {
  const db = firebase.firestore();

  // 獲取商品列表（支援篩選和分頁）
  async function getProducts(options = {}) {
    try {
      const {
        category = null,
        status = null,
        searchTerm = "",
        sortBy = "createdAt",
        sortOrder = "desc",
        limit = 20,
        lastDoc = null,
      } = options;

      let query = db.collection("products");

      // 篩選條件
      if (category && category !== "all") {
        query = query.where("category", "==", category);
      }

      if (status && status !== "all") {
        query = query.where("status", "==", status);
      }

      // 排序
      query = query.orderBy(sortBy, sortOrder);

      // 搜尋功能（改為客戶端搜尋，避免複雜索引需求）
      // 注意：搜尋將在客戶端進行，以簡化索引需求

      // 分頁
      if (limit) {
        query = query.limit(limit);
      }

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      let products = [];
      let lastDocument = null;

      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
        lastDocument = doc;
      });

      // 客戶端搜尋
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            (product.description &&
              product.description.toLowerCase().includes(searchLower))
        );
      }

      return {
        products,
        lastDoc: lastDocument,
        hasMore: snapshot.size === limit,
      };
    } catch (error) {
      console.error("獲取商品列表失敗:", error);
      throw error;
    }
  }

  // 獲取單一商品詳情
  async function getProduct(productId) {
    try {
      const doc = await db.collection("products").doc(productId).get();
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }
      throw new Error("商品不存在");
    } catch (error) {
      console.error("獲取商品詳情失敗:", error);
      throw error;
    }
  }

  // 創建新商品
  async function createProduct(productData) {
    try {
      const newProduct = {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: productData.status || "active",
        stock: parseInt(productData.stock) || 0,
        price: parseFloat(productData.price) || 0,
        originalPrice: parseFloat(productData.originalPrice) || 0,
        views: 0,
        sales: 0,
      };

      const docRef = await db.collection("products").add(newProduct);
      return {
        id: docRef.id,
        ...newProduct,
      };
    } catch (error) {
      console.error("創建商品失敗:", error);
      throw error;
    }
  }

  // 更新商品
  async function updateProduct(productId, updateData) {
    try {
      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

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
      console.error("更新商品失敗:", error);
      throw error;
    }
  }

  // 刪除商品
  async function deleteProduct(productId) {
    try {
      await db.collection("products").doc(productId).delete();
      return true;
    } catch (error) {
      console.error("刪除商品失敗:", error);
      throw error;
    }
  }

  // 批量更新商品狀態
  async function batchUpdateProductStatus(productIds, status) {
    try {
      const batch = db.batch();
      const updateData = {
        status: status,
        updatedAt: new Date().toISOString(),
      };

      productIds.forEach((productId) => {
        const productRef = db.collection("products").doc(productId);
        batch.update(productRef, updateData);
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("批量更新商品狀態失敗:", error);
      throw error;
    }
  }

  // 更新庫存
  async function updateStock(productId, quantity, operation = "set") {
    try {
      const productRef = db.collection("products").doc(productId);
      const product = await getProduct(productId);

      let newStock;
      if (operation === "add") {
        newStock = product.stock + quantity;
      } else if (operation === "subtract") {
        newStock = Math.max(0, product.stock - quantity);
      } else {
        newStock = quantity;
      }

      await productRef.update({
        stock: newStock,
        updatedAt: new Date().toISOString(),
      });

      // 檢查庫存警告
      await checkStockWarning(productId, newStock);

      return newStock;
    } catch (error) {
      console.error("更新庫存失敗:", error);
      throw error;
    }
  }

  // 檢查庫存警告
  async function checkStockWarning(productId, currentStock) {
    try {
      const product = await getProduct(productId);
      const warningThreshold = product.stockWarningThreshold || 10;

      if (currentStock <= warningThreshold) {
        // 創建庫存警告記錄
        await db.collection("stockWarnings").add({
          productId: productId,
          productName: product.name,
          currentStock: currentStock,
          warningThreshold: warningThreshold,
          createdAt: new Date().toISOString(),
          resolved: false,
        });

        console.warn(`庫存警告: ${product.name} 庫存不足 (${currentStock})`);
      }
    } catch (error) {
      console.error("檢查庫存警告失敗:", error);
    }
  }

  // 獲取庫存警告列表
  async function getStockWarnings(resolved = false) {
    try {
      const snapshot = await db
        .collection("stockWarnings")
        .where("resolved", "==", resolved)
        .orderBy("createdAt", "desc")
        .get();

      const warnings = [];
      snapshot.forEach((doc) => {
        warnings.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return warnings;
    } catch (error) {
      console.error("獲取庫存警告失敗:", error);
      throw error;
    }
  }

  // 解決庫存警告
  async function resolveStockWarning(warningId) {
    try {
      await db.collection("stockWarnings").doc(warningId).update({
        resolved: true,
        resolvedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("解決庫存警告失敗:", error);
      throw error;
    }
  }

  // 獲取商品分類列表
  async function getCategories() {
    try {
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

      return categories;
    } catch (error) {
      console.error("獲取商品分類失敗:", error);
      throw error;
    }
  }

  // 創建商品分類
  async function createCategory(categoryData) {
    try {
      const newCategory = {
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productCount: 0,
      };

      const docRef = await db.collection("productCategories").add(newCategory);
      return {
        id: docRef.id,
        ...newCategory,
      };
    } catch (error) {
      console.error("創建商品分類失敗:", error);
      throw error;
    }
  }

  // 更新商品分類
  async function updateCategory(categoryId, updateData) {
    try {
      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await db.collection("productCategories").doc(categoryId).update(updates);
      return true;
    } catch (error) {
      console.error("更新商品分類失敗:", error);
      throw error;
    }
  }

  // 刪除商品分類
  async function deleteCategory(categoryId) {
    try {
      // 檢查是否有商品使用此分類
      const productsSnapshot = await db
        .collection("products")
        .where("category", "==", categoryId)
        .limit(1)
        .get();

      if (!productsSnapshot.empty) {
        throw new Error("無法刪除：此分類下還有商品");
      }

      await db.collection("productCategories").doc(categoryId).delete();
      return true;
    } catch (error) {
      console.error("刪除商品分類失敗:", error);
      throw error;
    }
  }

  // 獲取商品統計數據
  async function getProductStats() {
    try {
      const [productsSnapshot, categoriesSnapshot, warningsSnapshot] =
        await Promise.all([
          db.collection("products").get(),
          db.collection("productCategories").get(),
          db.collection("stockWarnings").where("resolved", "==", false).get(),
        ]);

      let totalProducts = 0;
      let activeProducts = 0;
      let outOfStockProducts = 0;
      let lowStockProducts = 0;

      productsSnapshot.forEach((doc) => {
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
        totalCategories: categoriesSnapshot.size,
        pendingWarnings: warningsSnapshot.size,
      };
    } catch (error) {
      console.error("獲取商品統計失敗:", error);
      throw error;
    }
  }

  // 導出商品數據到 CSV
  function exportProductsToCSV(products) {
    const headers = [
      "商品ID",
      "商品名稱",
      "分類",
      "價格",
      "原價",
      "庫存",
      "狀態",
      "銷量",
      "瀏覽次數",
      "創建時間",
    ];

    const csvContent =
      headers.join(",") +
      "\n" +
      products
        .map((product) => [
          product.id,
          `"${product.name}"`,
          `"${product.categoryName || product.category}"`,
          product.price,
          product.originalPrice,
          product.stock,
          product.status === "active" ? "上架" : "下架",
          product.sales || 0,
          product.views || 0,
          new Date(product.createdAt).toLocaleDateString("zh-TW"),
        ])
        .map((row) => row.join(","))
        .join("\n");

    // 創建下載連結
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `商品列表_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    batchUpdateProductStatus,
    updateStock,
    checkStockWarning,
    getStockWarnings,
    resolveStockWarning,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getProductStats,
    exportProductsToCSV,
  };
})();

// 將服務掛載到全域
window.AdminProductService = AdminProductService;
