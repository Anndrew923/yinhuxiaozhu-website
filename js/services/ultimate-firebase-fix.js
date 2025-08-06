/**
 * 終極 Firebase 修復服務
 * 包含多種修復策略和自動故障排除
 */
const UltimateFirebaseFix = (function () {
    let db, auth;
    let isInitialized = false;
    let retryCount = 0;
    const maxRetries = 10;

    // 修復策略配置
    const fixStrategies = {
        // 策略 1: 基本重連
        basicReconnect: {
            name: '基本重連',
            priority: 1,
            timeout: 5000
        },
        // 策略 2: 配置重載
        configReload: {
            name: '配置重載',
            priority: 2,
            timeout: 10000
        },
        // 策略 3: SDK 重載
        sdkReload: {
            name: 'SDK 重載',
            priority: 3,
            timeout: 15000
        },
        // 策略 4: 網路重置
        networkReset: {
            name: '網路重置',
            priority: 4,
            timeout: 20000
        },
        // 策略 5: 終極修復
        ultimateFix: {
            name: '終極修復',
            priority: 5,
            timeout: 30000
        }
    };

    /**
     * 終極初始化 Firebase
     */
    async function ultimateInitFirebase() {
        if (isInitialized) return true;

        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // 大幅增加嘗試次數
            const checkInterval = 100; // 縮短檢查間隔

            const checkFirebase = () => {
                attempts++;
                
                if (window.firebase && window.firebase.firestore && window.firebase.auth) {
                    try {
                        db = window.firebase.firestore();
                        auth = window.firebase.auth();
                        
                        // 進行連接測試
                        testConnection()
                            .then(() => {
                                isInitialized = true;
                                retryCount = 0;
                                console.log('✅ 終極 Firebase 初始化成功');
                                resolve(true);
                            })
                            .catch(error => {
                                console.warn(`連接測試失敗，嘗試重試: ${error.message}`);
                                if (attempts < maxAttempts) {
                                    setTimeout(checkFirebase, checkInterval);
                                } else {
                                    reject(new Error('Firebase 連接測試失敗'));
                                }
                            });
                    } catch (error) {
                        console.warn(`Firebase 初始化錯誤: ${error.message}`);
                        if (attempts < maxAttempts) {
                            setTimeout(checkFirebase, checkInterval);
                        } else {
                            reject(new Error('Firebase 初始化失敗'));
                        }
                    }
                } else if (attempts < maxAttempts) {
                    setTimeout(checkFirebase, checkInterval);
                } else {
                    reject(new Error('Firebase SDK 載入超時'));
                }
            };

            checkFirebase();
        });
    }

    /**
     * 測試連接
     */
    async function testConnection() {
        try {
            // 測試 Firestore 連接
            const testQuery = await db.collection('test').limit(1).get();
            
            // 測試認證
            const authState = await new Promise((resolve) => {
                const unsubscribe = auth.onAuthStateChanged(user => {
                    unsubscribe();
                    resolve(user);
                });
            });

            return true;
        } catch (error) {
            throw new Error(`連接測試失敗: ${error.message}`);
        }
    }

    /**
     * 執行修復策略
     */
    async function executeFixStrategy(strategyName, options = {}) {
        const strategy = fixStrategies[strategyName];
        if (!strategy) {
            throw new Error(`未知的修復策略: ${strategyName}`);
        }

        console.log(`🔧 執行修復策略: ${strategy.name}`);

        switch (strategyName) {
            case 'basicReconnect':
                return await basicReconnectFix(options);
            case 'configReload':
                return await configReloadFix(options);
            case 'sdkReload':
                return await sdkReloadFix(options);
            case 'networkReset':
                return await networkResetFix(options);
            case 'ultimateFix':
                return await ultimateFix(options);
            default:
                throw new Error(`未實現的修復策略: ${strategyName}`);
        }
    }

    /**
     * 基本重連修復
     */
    async function basicReconnectFix(options = {}) {
        try {
            // 重置初始化狀態
            isInitialized = false;
            
            // 等待一段時間後重新初始化
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 重新初始化
            await ultimateInitFirebase();
            
            return { success: true, message: '基本重連成功' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 配置重載修復
     */
    async function configReloadFix(options = {}) {
        try {
            // 清除現有配置
            if (window.firebase && window.firebase.apps.length > 0) {
                window.firebase.apps.forEach(app => {
                    try {
                        app.delete();
                    } catch (e) {
                        console.warn('清除應用失敗:', e);
                    }
                });
            }

            // 重新載入配置腳本
            await reloadConfigScript();
            
            // 重新初始化
            await ultimateInitFirebase();
            
            return { success: true, message: '配置重載成功' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * SDK 重載修復
     */
    async function sdkReloadFix(options = {}) {
        try {
            // 移除現有的 Firebase 腳本
            const existingScripts = document.querySelectorAll('script[src*="firebase"]');
            existingScripts.forEach(script => script.remove());

            // 重新載入 Firebase SDK
            await reloadFirebaseSDK();
            
            // 重新載入配置
            await reloadConfigScript();
            
            // 重新初始化
            await ultimateInitFirebase();
            
            return { success: true, message: 'SDK 重載成功' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 網路重置修復
     */
    async function networkResetFix(options = {}) {
        try {
            // 清理快取
            await clearAllCache();
            
            // 重置網路狀態
            await resetNetworkState();
            
            // 重新載入 SDK
            await sdkReloadFix(options);
            
            return { success: true, message: '網路重置成功' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 終極修復
     */
    async function ultimateFix(options = {}) {
        try {
            console.log('🚨 開始終極修復程序...');
            
            // 1. 完全清理環境
            await completeEnvironmentCleanup();
            
            // 2. 重新載入所有資源
            await reloadAllResources();
            
            // 3. 重新初始化
            await ultimateInitFirebase();
            
            // 4. 驗證修復結果
            await validateFixResult();
            
            return { success: true, message: '終極修復成功' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 自動故障排除
     */
    async function autoTroubleshoot() {
        console.log('🔍 開始自動故障排除...');
        
        const results = [];
        
        // 按優先級執行修復策略
        const sortedStrategies = Object.entries(fixStrategies)
            .sort(([,a], [,b]) => a.priority - b.priority);

        for (const [strategyName, strategy] of sortedStrategies) {
            console.log(`嘗試策略 ${strategy.priority}: ${strategy.name}`);
            
            try {
                const result = await executeFixStrategy(strategyName);
                results.push({
                    strategy: strategyName,
                    success: result.success,
                    message: result.message || result.error
                });

                if (result.success) {
                    console.log(`✅ 策略 ${strategy.name} 成功`);
                    return {
                        success: true,
                        strategy: strategyName,
                        results: results
                    };
                } else {
                    console.log(`❌ 策略 ${strategy.name} 失敗: ${result.error}`);
                }
            } catch (error) {
                console.log(`❌ 策略 ${strategy.name} 執行錯誤: ${error.message}`);
                results.push({
                    strategy: strategyName,
                    success: false,
                    message: error.message
                });
            }

            // 等待一段時間再嘗試下一個策略
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        return {
            success: false,
            message: '所有修復策略都失敗了',
            results: results
        };
    }

    /**
     * 重新載入配置腳本
     */
    async function reloadConfigScript() {
        return new Promise((resolve, reject) => {
            // 移除現有配置腳本
            const existingConfig = document.querySelector('script[src*="firebase-config"]');
            if (existingConfig) {
                existingConfig.remove();
            }

            // 重新載入配置
            const configScript = document.createElement('script');
            configScript.src = 'js/firebase-config.js';
            configScript.onload = () => {
                console.log('✅ 配置腳本重新載入成功');
                resolve();
            };
            configScript.onerror = () => {
                reject(new Error('配置腳本載入失敗'));
            };
            document.head.appendChild(configScript);
        });
    }

    /**
     * 重新載入 Firebase SDK
     */
    async function reloadFirebaseSDK() {
        return new Promise((resolve, reject) => {
            const scripts = [
                'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
                'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js',
                'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js'
            ];

            let loadedCount = 0;
            const totalScripts = scripts.length;

            scripts.forEach((src, index) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalScripts) {
                        console.log('✅ Firebase SDK 重新載入完成');
                        resolve();
                    }
                };
                script.onerror = () => {
                    reject(new Error(`SDK 腳本載入失敗: ${src}`));
                };
                document.head.appendChild(script);
            });
        });
    }

    /**
     * 清理所有快取
     */
    async function clearAllCache() {
        try {
            // 清理 localStorage
            const keysToKeep = ['firebaseDiagnosticReport'];
            const keysToRemove = Object.keys(localStorage).filter(key => !keysToKeep.includes(key));
            keysToRemove.forEach(key => localStorage.removeItem(key));

            // 清理 sessionStorage
            sessionStorage.clear();

            // 清理 IndexedDB
            if ('indexedDB' in window) {
                const databases = await indexedDB.databases();
                databases.forEach(db => {
                    try {
                        indexedDB.deleteDatabase(db.name);
                    } catch (e) {
                        console.warn('清理 IndexedDB 失敗:', e);
                    }
                });
            }

            console.log('✅ 快取清理完成');
        } catch (error) {
            console.warn('快取清理部分失敗:', error);
        }
    }

    /**
     * 重置網路狀態
     */
    async function resetNetworkState() {
        try {
            // 測試網路連接
            const testUrls = [
                'https://www.google.com',
                'https://firebase.google.com'
            ];

            for (const url of testUrls) {
                try {
                    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
                    console.log(`✅ ${url} 網路連接正常`);
                } catch (error) {
                    console.warn(`⚠️ ${url} 網路連接異常: ${error.message}`);
                }
            }

            console.log('✅ 網路狀態重置完成');
        } catch (error) {
            console.warn('網路狀態重置失敗:', error);
        }
    }

    /**
     * 完全環境清理
     */
    async function completeEnvironmentCleanup() {
        try {
            // 清理 Firebase 實例
            if (window.firebase && window.firebase.apps.length > 0) {
                window.firebase.apps.forEach(app => {
                    try {
                        app.delete();
                    } catch (e) {
                        console.warn('清理 Firebase 應用失敗:', e);
                    }
                });
            }

            // 清理全域變數
            if (window.db) delete window.db;
            if (window.auth) delete window.auth;
            isInitialized = false;

            // 清理快取
            await clearAllCache();

            console.log('✅ 環境清理完成');
        } catch (error) {
            console.warn('環境清理部分失敗:', error);
        }
    }

    /**
     * 重新載入所有資源
     */
    async function reloadAllResources() {
        try {
            // 重新載入 Firebase SDK
            await reloadFirebaseSDK();
            
            // 重新載入配置
            await reloadConfigScript();
            
            // 等待資源載入
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('✅ 資源重新載入完成');
        } catch (error) {
            throw new Error(`資源重新載入失敗: ${error.message}`);
        }
    }

    /**
     * 驗證修復結果
     */
    async function validateFixResult() {
        try {
            // 測試基本連接
            await testConnection();
            
            // 測試資料庫操作
            const testDoc = db.collection('test').doc('validation-test');
            await testDoc.set({ timestamp: new Date(), test: true });
            await testDoc.delete();
            
            console.log('✅ 修復結果驗證成功');
        } catch (error) {
            throw new Error(`修復結果驗證失敗: ${error.message}`);
        }
    }

    /**
     * 智能重試機制
     */
    async function smartRetry(operation, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`操作失敗 (嘗試 ${attempt}/${maxRetries}): ${error.message}`);
                
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // 指數退避
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * 健康檢查
     */
    async function healthCheck() {
        try {
            await ultimateInitFirebase();
            
            const checks = [
                { name: 'Firestore 連接', test: () => db.collection('test').limit(1).get() },
                { name: '認證狀態', test: () => new Promise(resolve => auth.onAuthStateChanged(resolve)) },
                { name: '寫入權限', test: async () => {
                    const testDoc = db.collection('test').doc('health-check');
                    await testDoc.set({ timestamp: new Date() });
                    await testDoc.delete();
                }}
            ];

            const results = [];
            for (const check of checks) {
                try {
                    await check.test();
                    results.push({ name: check.name, status: 'success' });
                } catch (error) {
                    results.push({ name: check.name, status: 'error', error: error.message });
                }
            }

            const successCount = results.filter(r => r.status === 'success').length;
            const isHealthy = successCount === checks.length;

            return {
                healthy: isHealthy,
                results: results,
                successRate: successCount / checks.length
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                results: []
            };
        }
    }

    return {
        // 主要方法
        ultimateInitFirebase,
        autoTroubleshoot,
        executeFixStrategy,
        healthCheck,
        smartRetry,
        
        // 修復策略
        fixStrategies,
        
        // 工具方法
        testConnection,
        clearAllCache,
        reloadFirebaseSDK,
        reloadConfigScript
    };
})();

// 全域可用
window.UltimateFirebaseFix = UltimateFirebaseFix; 