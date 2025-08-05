// js/services/storage.service.js
// Storage Service：檔案上傳管理服務
const StorageService = (() => {
  // 等待 Firebase 初始化完成
  function waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        if (window.firebase && window.firebase.storage) {
          resolve();
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  let storage;

  // 初始化 Firebase Storage
  async function initStorage() {
    await waitForFirebase();
    storage = firebase.storage();
    
    if (!storage) {
      console.error("Firebase Storage 未初始化");
      return false;
    }
    
    return true;
  }

  // 驗證圖片檔案
  function validateImageFile(file) {
    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('只支援 JPG、PNG、WebP 格式的圖片');
    }

    // 檢查檔案大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('圖片檔案不能超過 5MB');
    }

    return true;
  }

  // 生成唯一檔名
  function generateFileName(originalName, prefix = 'image') {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop().toLowerCase();
    return `${prefix}_${timestamp}_${randomStr}.${extension}`;
  }

  // 上傳圖片到 Firebase Storage
  async function uploadImage(file, folder = 'products', onProgress = null) {
    try {
      await initStorage();
      
      // 驗證檔案
      validateImageFile(file);
      
      // 生成檔名
      const fileName = generateFileName(file.name, 'product');
      const filePath = `${folder}/${fileName}`;
      
      // 創建 Storage 引用
      const storageRef = storage.ref(filePath);
      
      // 設定上傳 metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'originalName': file.name,
          'uploadedAt': new Date().toISOString()
        }
      };
      
      // 開始上傳
      const uploadTask = storageRef.put(file, metadata);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          
          // 進度回調
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
            console.log(`上傳進度: ${progress.toFixed(1)}%`);
          },
          
          // 錯誤回調
          (error) => {
            console.error('上傳失敗:', error);
            reject(error);
          },
          
          // 完成回調
          async () => {
            try {
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              
              const result = {
                fileName: fileName,
                filePath: filePath,
                downloadURL: downloadURL,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
              };
              
              console.log('圖片上傳成功:', result);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
      
    } catch (error) {
      console.error('上傳圖片失敗:', error);
      throw error;
    }
  }

  // 刪除圖片
  async function deleteImage(filePath) {
    try {
      await initStorage();
      
      const storageRef = storage.ref(filePath);
      await storageRef.delete();
      
      console.log('圖片刪除成功:', filePath);
      return true;
      
    } catch (error) {
      console.error('刪除圖片失敗:', error);
      throw error;
    }
  }

  // 獲取圖片下載連結
  async function getImageURL(filePath) {
    try {
      await initStorage();
      
      const storageRef = storage.ref(filePath);
      const downloadURL = await storageRef.getDownloadURL();
      
      return downloadURL;
      
    } catch (error) {
      console.error('獲取圖片連結失敗:', error);
      throw error;
    }
  }

  // 上傳多張圖片
  async function uploadMultipleImages(files, folder = 'products', onProgress = null) {
    try {
      const results = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const fileProgress = (fileIndex, progress) => {
          const overallProgress = ((fileIndex * 100) + progress) / totalFiles;
          if (onProgress) {
            onProgress(overallProgress, fileIndex + 1, totalFiles);
          }
        };
        
        const result = await uploadImage(file, folder, (progress) => {
          fileProgress(i, progress);
        });
        
        results.push(result);
      }
      
      return results;
      
    } catch (error) {
      console.error('批量上傳失敗:', error);
      throw error;
    }
  }

  // 壓縮圖片 (使用 Canvas)
  function compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // 計算新的尺寸
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // 設定 Canvas 尺寸
        canvas.width = width;
        canvas.height = height;
        
        // 繪製並壓縮
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            // 創建新的 File 物件
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            
            resolve(compressedFile);
          } else {
            reject(new Error('圖片壓縮失敗'));
          }
        }, file.type, quality);
      };
      
      img.onerror = () => reject(new Error('圖片載入失敗'));
      img.src = URL.createObjectURL(file);
    });
  }

  // 上傳前自動壓縮圖片
  async function uploadImageWithCompression(file, folder = 'products', onProgress = null) {
    try {
      // 如果圖片太大，先壓縮
      if (file.size > 1024 * 1024) { // 1MB
        console.log('圖片較大，正在壓縮...');
        file = await compressImage(file);
        console.log('壓縮完成，新大小:', (file.size / 1024).toFixed(1), 'KB');
      }
      
      return await uploadImage(file, folder, onProgress);
      
    } catch (error) {
      console.error('壓縮上傳失敗:', error);
      throw error;
    }
  }

  // ==========
  // 預留的擴展接口
  // ==========

  // 圖片編輯功能 (未來擴展)
  async function editImage(filePath, editOptions) {
    // TODO: 實現圖片編輯功能
    console.log('圖片編輯功能待實現');
  }

  // 圖片 CDN 優化 (未來擴展)
  async function getOptimizedImageURL(filePath, options = {}) {
    // TODO: 實現 CDN 優化功能
    console.log('CDN 優化功能待實現');
  }

  // 圖片安全檢查 (未來擴展)
  async function scanImageSafety(file) {
    // TODO: 實現圖片安全檢查
    console.log('圖片安全檢查功能待實現');
  }

  return {
    // 核心功能
    uploadImage,
    uploadImageWithCompression,
    deleteImage,
    getImageURL,
    uploadMultipleImages,
    
    // 工具函數
    validateImageFile,
    generateFileName,
    compressImage,
    
    // 預留接口
    editImage,
    getOptimizedImageURL,
    scanImageSafety
  };
})();

// 設為全域可訪問
window.StorageService = StorageService;