// 菜單頁面交互功能
document.addEventListener("DOMContentLoaded", function () {
  initMenuTabs();
});

function initMenuTabs() {
  const tabs = document.querySelectorAll(".menu-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      // 移除所有活動狀態
      tabs.forEach((t) => t.classList.remove("active"));

      // 添加當前活動狀態
      this.classList.add("active");

      // 平滑滾動到對應區域
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offset = 80; // 考慮sticky導航的高度
        const targetPosition = targetSection.offsetTop - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // 滾動時自動切換活動標籤
  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY + 100;
    const sections = document.querySelectorAll(".menu-section");

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        tabs.forEach((tab) => {
          tab.classList.remove("active");
          if (tab.getAttribute("href") === "#" + sectionId) {
            tab.classList.add("active");
          }
        });
      }
    });
  });
}
