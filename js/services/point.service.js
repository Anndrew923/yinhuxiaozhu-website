// js/services/point.service.js
// Point Service (stub) 預留擴充
const PointService = {
  addPoints: (uid, amount, meta) => {
    console.warn("PointService.addPoints 尚未實作", uid, amount, meta);
  },
  redeemPoints: (uid, amount) => {
    console.warn("PointService.redeemPoints 尚未實作", uid, amount);
  },
};

window.PointService = PointService;
