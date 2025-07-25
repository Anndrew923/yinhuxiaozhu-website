// js/services/order.service.js
// Order Service (stub) 預留擴充
const OrderService = {
  createOrder: (uid, cart, info) => {
    console.warn("OrderService.createOrder 尚未實作", uid, cart, info);
  },
  getOrders: (uid) => {
    console.warn("OrderService.getOrders 尚未實作", uid);
    return Promise.resolve([]);
  },
};

window.OrderService = OrderService;
