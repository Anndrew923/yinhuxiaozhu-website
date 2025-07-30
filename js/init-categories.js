/**
 * 初始化商品分類腳本
 * 根據隱湖小竹的實際商品內容創建分類
 */

// 確保 Firebase 已初始化
if (typeof firebase === "undefined") {
  console.error("Firebase 未初始化，請先載入 Firebase SDK");
} else {
  const db = firebase.firestore();

  // 商品分類數據
  const categories = [
    {
      id: "frozen-foods",
      name: "冷凍商品",
      description: "需要冷凍保存的商品",
      order: 1,
      icon: "❄️",
      productCount: 0,
    },
    {
      id: "room-temperature",
      name: "常溫商品",
      description: "常溫保存的商品",
      order: 2,
      icon: "📦",
      productCount: 0,
    },
    {
      id: "sauces",
      name: "醬料系列",
      description: "各種調味醬料",
      order: 3,
      icon: "🥫",
      productCount: 0,
    },
    {
      id: "gift-sets",
      name: "禮盒系列",
      description: "精選禮盒組合",
      order: 4,
      icon: "🎁",
      productCount: 0,
    },
    {
      id: "seasonal",
      name: "季節限定",
      description: "季節性商品",
      order: 5,
      icon: "🌸",
      productCount: 0,
    },
    {
      id: "new-products",
      name: "新品上市",
      description: "最新推出的商品",
      order: 6,
      icon: "🆕",
      productCount: 0,
    },
    {
      id: "promotions",
      name: "特價商品",
      description: "限時優惠商品",
      order: 7,
      icon: "🏷️",
      productCount: 0,
    },
  ];

  /**
   * 初始化商品分類
   */
  async function initializeCategories() {
    try {
      console.log("開始初始化商品分類...");

      const batch = db.batch();
      let createdCount = 0;
      let skippedCount = 0;

      for (const category of categories) {
        const categoryRef = db.collection("productCategories").doc(category.id);

        // 檢查分類是否已存在
        const doc = await categoryRef.get();

        if (doc.exists) {
          console.log(`分類 "${category.name}" 已存在，跳過`);
          skippedCount++;
        } else {
          // 創建新分類
          const categoryData = {
            ...category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
          };

          batch.set(categoryRef, categoryData);
          createdCount++;
          console.log(`準備創建分類: ${category.name}`);
        }
      }

      // 執行批量寫入
      if (createdCount > 0) {
        await batch.commit();
        console.log(`✅ 成功創建 ${createdCount} 個分類`);
      }

      console.log(
        `📊 初始化完成: 創建 ${createdCount} 個，跳過 ${skippedCount} 個`
      );

      // 顯示創建的分類列表
      displayCategories();
    } catch (error) {
      console.error("初始化分類失敗:", error);
      alert("初始化分類失敗: " + error.message);
    }
  }

  /**
   * 顯示所有分類
   */
  async function displayCategories() {
    try {
      const snapshot = await db
        .collection("productCategories")
        .orderBy("order", "asc")
        .get();

      console.log("\n📋 當前所有商品分類:");
      console.log("─".repeat(50));

      snapshot.forEach((doc) => {
        const category = doc.data();
        console.log(`${category.icon} ${category.name} (${category.id})`);
        console.log(`   描述: ${category.description}`);
        console.log(`   商品數量: ${category.productCount}`);
        console.log("");
      });
    } catch (error) {
      console.error("獲取分類列表失敗:", error);
    }
  }

  /**
   * 清除所有分類（謹慎使用）
   */
  async function clearAllCategories() {
    if (!confirm("確定要刪除所有商品分類嗎？此操作無法恢復！")) {
      return;
    }

    try {
      const snapshot = await db.collection("productCategories").get();
      const batch = db.batch();

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log("✅ 所有分類已清除");
    } catch (error) {
      console.error("清除分類失敗:", error);
      alert("清除分類失敗: " + error.message);
    }
  }

  // 將函數掛載到全域，方便在瀏覽器 Console 中調用
  window.CategoryInitializer = {
    initialize: initializeCategories,
    display: displayCategories,
    clear: clearAllCategories,
    categories: categories,
  };

  console.log("🎯 商品分類初始化腳本已載入");
  console.log("使用方法:");
  console.log("- CategoryInitializer.initialize() - 初始化分類");
  console.log("- CategoryInitializer.display() - 顯示所有分類");
  console.log("- CategoryInitializer.clear() - 清除所有分類（謹慎使用）");
}
