import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/style.css'

const savedShop = localStorage.getItem("shop");
if (savedShop) {
  try {
    const shop = JSON.parse(savedShop);
    document.title = shop.shop_name || "POS System";
  } catch (e) {
    document.title = "POS System";
  }
} else {
  document.title = "POS System";
}

createApp(App).use(router).mount('#app');
