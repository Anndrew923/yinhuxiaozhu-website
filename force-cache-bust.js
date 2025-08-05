// 強制快取清除腳本
// 添加時間戳到所有CSS和JS引用
(function() {
    const timestamp = new Date().getTime();
    console.log('Force cache bust timestamp:', timestamp);
    
    // 更新所有CSS連結
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach(link => {
        if (link.href && !link.href.includes('?')) {
            link.href += '?v=' + timestamp;
        }
    });
    
    // 更新所有JS腳本
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        if (script.src && !script.src.includes('?')) {
            script.src += '?v=' + timestamp;
        }
    });
    
    console.log('Cache bust applied to', cssLinks.length + scripts.length, 'resources');
})();