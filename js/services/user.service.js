// js/services/user.service.js
// User Service：讀寫使用者資料
const UserService = (() => {
  const db = window.firebaseDB;

  // 檢查 Firestore 是否正確初始化
  if (!db) {
    console.error("Firebase Firestore 未初始化");
    return null;
  }

  async function getUser(uid) {
    try {
      console.log("UserService.getUser 被調用，UID:", uid);
      const doc = await db.collection("user").doc(uid).get();
      if (doc.exists) {
        console.log("文件存在，資料為:", doc.data());
        return doc.data();
      } else {
        console.log("文件不存在");
        return null;
      }
    } catch (error) {
      console.error("UserService.getUser 錯誤:", error);
      throw error;
    }
  }

  function updateUser(uid, data) {
    console.log("UserService.updateUser 被調用, UID:", uid, "資料:", data);
    return db.collection("user").doc(uid).update(data);
  }

  async function createUserDocument(uid, data) {
    console.log(
      "UserService.createUserDocument 被調用, UID:",
      uid,
      "資料:",
      data
    );
    const userData = {
      ...data,
      uid: uid,
      points: 0,
      createdAt: new Date().toISOString(),
    };
    await db.collection("user").doc(uid).set(userData);
    console.log("文件建立/覆蓋成功");
  }

  return { getUser, updateUser, createUserDocument };
})();

window.UserService = UserService;
